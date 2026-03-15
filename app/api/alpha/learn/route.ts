import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { eq, and, isNotNull, sql } from "drizzle-orm";
import { env } from "@/lib/env";

// POST /api/alpha/learn
// Generates a Learning Report by analyzing all 90-day tracking records.
// This is the brain of the self-correction loop.
// Run manually or auto-triggered by the cron job after each 90-day cycle.

// GET /api/alpha/learn — Returns the latest insight (and optionally history)

const EXTERNAL_OVERRIDES = ["market_crash_intact", "sector_rotation", "external_factor"];

type ScoreBreakdown = {
    undervaluation?: number;
    institutional?: number;
    fundamental?: number;
    momentum?: number;
    [key: string]: number | undefined;
};

export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== env.ADMIN_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const cycleId = body.cycleId || generateCycleId();

    // Get all 90-day tracking records
    const trackingRecords = await db
        .select({
            trackingId: schema.alphaTracking.id,
            predictionId: schema.alphaTracking.predictionId,
            returnPct: schema.alphaTracking.returnPct,
            checkType: schema.alphaTracking.checkType,
            ticker: schema.alphaPredictions.ticker,
            market: schema.alphaPredictions.market,
            scoreTier: schema.alphaPredictions.scoreTier,
            scoreBreakdown: schema.alphaPredictions.scoreBreakdown,
            gemScore: schema.alphaPredictions.gemScore,
        })
        .from(schema.alphaTracking)
        .innerJoin(
            schema.alphaPredictions,
            eq(schema.alphaTracking.predictionId, schema.alphaPredictions.id)
        )
        .where(
            and(
                eq(schema.alphaTracking.checkType, "90d"),
                isNotNull(schema.alphaTracking.returnPct)
            )
        );

    if (trackingRecords.length === 0) {
        return NextResponse.json({
            error: "No 90-day tracking records found yet. Run scans and wait 90 days.",
            tip: "In the meantime, 30d and 60d records are accumulating.",
        }, { status: 422 });
    }

    // Get overrides to exclude external-factor failures
    const overrides = await db
        .select()
        .from(schema.alphaOverrides)
        .where(
            sql`${schema.alphaOverrides.overrideType} = ANY(${EXTERNAL_OVERRIDES})`
        );

    const externalFactorPredictions = new Set(overrides.map((o) => o.predictionId));

    // Filter: only count picks WITHOUT external-factor overrides as "fair game"
    const fairGameRecords = trackingRecords.filter(
        (r) => !externalFactorPredictions.has(r.predictionId)
    );

    // ── Analysis ────────────────────────────────────────────────────────────────

    const totalAnalyzed = fairGameRecords.length;
    const winners = fairGameRecords.filter((r) => Number(r.returnPct) > 0);
    const overallHitRate = totalAnalyzed > 0 ? winners.length / totalAnalyzed : 0;

    // Hit rate by market
    const marketGroups = groupBy(fairGameRecords, (r) => r.market);
    const hitRateByMarket: Record<string, number> = {};
    for (const [market, records] of Object.entries(marketGroups)) {
        const wins = records.filter((r) => Number(r.returnPct) > 0).length;
        hitRateByMarket[market] = records.length > 0 ? wins / records.length : 0;
    }

    // Hit rate by tier
    const tierGroups = groupBy(fairGameRecords, (r) => r.scoreTier ?? "Unknown");
    const hitRateByTier: Record<string, number> = {};
    for (const [tier, records] of Object.entries(tierGroups)) {
        const wins = records.filter((r) => Number(r.returnPct) > 0).length;
        hitRateByTier[tier] = records.length > 0 ? wins / records.length : 0;
    }

    // Criteria correlation: for each criterion, compare avg score of winners vs losers
    const criteriaKeys = ["undervaluation", "institutional", "fundamental", "momentum"];
    const criteriaPerformance: Record<string, number> = {};

    for (const key of criteriaKeys) {
        const withScore = fairGameRecords.filter((r) => {
            const bd = r.scoreBreakdown as ScoreBreakdown | null;
            return bd && typeof bd[key] === "number";
        });

        if (withScore.length === 0) continue;

        // Median score for winners vs losers
        const winnerScores = withScore
            .filter((r) => Number(r.returnPct) > 0)
            .map((r) => (r.scoreBreakdown as ScoreBreakdown)[key] ?? 0);
        const loserScores = withScore
            .filter((r) => Number(r.returnPct) <= 0)
            .map((r) => (r.scoreBreakdown as ScoreBreakdown)[key] ?? 0);

        const winnerAvg = avg(winnerScores);
        const loserAvg = avg(loserScores);

        // Predictive power: how well does high score on this criterion predict a win?
        // Score: (winnerAvg - loserAvg) / maxPossible
        const maxPossible = key === "undervaluation" ? 30 : 25;
        criteriaPerformance[key] = (winnerAvg - loserAvg) / maxPossible;
    }

    // ── Weight Recommendations ───────────────────────────────────────────────────
    // Normalize predictive power scores and map to new weights (total = 100)
    const currentWeights = { undervaluation: 30, institutional: 25, fundamental: 25, momentum: 20 };
    const weightRecommendations = recommendWeights(criteriaPerformance, currentWeights);

    // ── Summary ──────────────────────────────────────────────────────────────────
    const bestMarket = Object.entries(hitRateByMarket).sort((a, b) => b[1] - a[1])[0];
    const bestCriteria = Object.entries(criteriaPerformance).sort((a, b) => b[1] - a[1])[0];
    const strongestTier = Object.entries(hitRateByTier).sort((a, b) => b[1] - a[1])[0];

    const summary = buildSummary({
        overallHitRate,
        totalAnalyzed,
        bestMarket,
        bestCriteria,
        strongestTier,
        weightRecommendations,
        currentWeights,
    });

    // ── Store insight ────────────────────────────────────────────────────────────
    // Upsert by cycleId (idempotent — re-running is safe)
    await db
        .delete(schema.alphaInsights)
        .where(eq(schema.alphaInsights.cycleId, cycleId));

    const [insight] = await db
        .insert(schema.alphaInsights)
        .values({
            cycleId,
            criteriaPerformance,
            weightRecommendations,
            hitRateByMarket,
            hitRateByTier,
            totalPicksAnalyzed: totalAnalyzed,
            overallHitRate: overallHitRate.toFixed(4),
            summary,
        })
        .returning();

    return NextResponse.json({
        success: true,
        insightId: insight.id,
        cycleId,
        overallHitRate: `${(overallHitRate * 100).toFixed(1)}%`,
        totalAnalyzed,
        criteriaPerformance,
        weightRecommendations,
        hitRateByMarket: formatPcts(hitRateByMarket),
        hitRateByTier: formatPcts(hitRateByTier),
        summary,
        action: "Apply the weightRecommendations to your next scan by updating the active weights via POST /api/alpha/weights",
    });
}

export async function GET(req: NextRequest) {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== env.ADMIN_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const insights = await db
        .select()
        .from(schema.alphaInsights)
        .orderBy(schema.alphaInsights.generatedAt)
        .limit(10);

    return NextResponse.json({ insights: insights.reverse() });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
    return arr.reduce((acc, item) => {
        const k = key(item);
        (acc[k] = acc[k] || []).push(item);
        return acc;
    }, {} as Record<string, T[]>);
}

function avg(nums: number[]): number {
    return nums.length === 0 ? 0 : nums.reduce((a, b) => a + b, 0) / nums.length;
}

function recommendWeights(
    criteriaPerformance: Record<string, number>,
    currentWeights: Record<string, number>
): Record<string, number> {
    // Minimum and maximum weight per criterion to avoid extremes
    const MIN_WEIGHT = 10;
    const MAX_WEIGHT = 40;
    const TOTAL = 100;

    const keys = Object.keys(currentWeights);

    // Scale predictive power (can be negative) to positive adjustment factors
    const minPerf = Math.min(...Object.values(criteriaPerformance));
    const adjusted = Object.fromEntries(
        keys.map((k) => [k, (criteriaPerformance[k] ?? 0) - minPerf + 0.1])
    );
    const total = Object.values(adjusted).reduce((a, b) => a + b, 0);

    // Compute raw new weights
    const raw = Object.fromEntries(
        keys.map((k) => [k, Math.round((adjusted[k] / total) * TOTAL)])
    );

    // Clamp to [MIN_WEIGHT, MAX_WEIGHT]
    const clamped = Object.fromEntries(
        keys.map((k) => [k, Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, raw[k]))])
    );

    // Fix rounding: ensure sum = 100
    const sum = Object.values(clamped).reduce((a, b) => a + b, 0);
    const diff = TOTAL - sum;
    const sortedKeys = keys.sort(
        (a, b) => (criteriaPerformance[b] ?? 0) - (criteriaPerformance[a] ?? 0)
    );
    clamped[sortedKeys[0]] = (clamped[sortedKeys[0]] ?? 0) + diff;

    // Don't move weights more than ±8 points from current in a single cycle
    return Object.fromEntries(
        keys.map((k) => [
            k,
            Math.max(currentWeights[k] - 8, Math.min(currentWeights[k] + 8, clamped[k])),
        ])
    );
}

function buildSummary(data: {
    overallHitRate: number;
    totalAnalyzed: number;
    bestMarket?: [string, number];
    bestCriteria?: [string, number];
    strongestTier?: [string, number];
    weightRecommendations: Record<string, number>;
    currentWeights: Record<string, number>;
}): string {
    const hitPct = (data.overallHitRate * 100).toFixed(1);
    const lines = [
        `Cycle analyzed ${data.totalAnalyzed} predictions at 90 days. Overall hit rate: ${hitPct}%.`,
    ];

    if (data.bestMarket) {
        lines.push(
            `Strongest market: ${data.bestMarket[0]} (${(data.bestMarket[1] * 100).toFixed(1)}% hit rate).`
        );
    }
    if (data.bestCriteria) {
        lines.push(
            `Most predictive criterion: ${data.bestCriteria[0]} (predictive power score: ${data.bestCriteria[1].toFixed(3)}).`
        );
    }
    if (data.strongestTier) {
        lines.push(
            `Strongest tier: ${data.strongestTier[0]} (${(data.strongestTier[1] * 100).toFixed(1)}% win rate).`
        );
    }

    const weightChanges = Object.entries(data.weightRecommendations)
        .map(([k, v]) => {
            const old = data.currentWeights[k] ?? 0;
            const delta = v - old;
            return delta !== 0
                ? `${k}: ${old} → ${v} (${delta > 0 ? "+" : ""}${delta})`
                : null;
        })
        .filter(Boolean);

    if (weightChanges.length > 0) {
        lines.push(`Recommended weight adjustments: ${weightChanges.join(", ")}.`);
    } else {
        lines.push("Current weights are well-calibrated. No adjustments recommended.");
    }

    return lines.join(" ");
}

function formatPcts(obj: Record<string, number>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, `${(v * 100).toFixed(1)}%`])
    );
}

function generateCycleId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    return `${year}-Q${quarter}`;
}
