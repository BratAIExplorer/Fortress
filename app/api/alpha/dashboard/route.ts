import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { eq, isNotNull, sql, desc } from "drizzle-orm";
import { env } from "@/lib/env";

// GET /api/alpha/dashboard
// Returns complete data package for the performance dashboard.
// Includes: hit rates, best/worst picks, weight history, model trend.

export async function GET(req: NextRequest) {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== env.ADMIN_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Total predictions + hit rate (all-time, 90d checks)
    const allTracking = await db
        .select({
            id: schema.alphaTracking.id,
            predictionId: schema.alphaTracking.predictionId,
            checkType: schema.alphaTracking.checkType,
            returnPct: schema.alphaTracking.returnPct,
            checkDate: schema.alphaTracking.checkDate,
            ticker: schema.alphaPredictions.ticker,
            market: schema.alphaPredictions.market,
            scoreTier: schema.alphaPredictions.scoreTier,
            gemScore: schema.alphaPredictions.gemScore,
            thesis: schema.alphaPredictions.thesis,
            entryPrice: schema.alphaPredictions.entryPrice,
            currency: schema.alphaPredictions.currency,
        })
        .from(schema.alphaTracking)
        .innerJoin(
            schema.alphaPredictions,
            eq(schema.alphaTracking.predictionId, schema.alphaPredictions.id)
        )
        .where(isNotNull(schema.alphaTracking.returnPct))
        .orderBy(desc(schema.alphaTracking.checkDate));

    const tracking90d = allTracking.filter((r) => r.checkType === "90d");
    const total90d = tracking90d.length;
    const winners90d = tracking90d.filter((r) => Number(r.returnPct) > 0).length;
    const overallHitRate = total90d > 0 ? (winners90d / total90d) : null;

    // 2. Best and worst picks (90d)
    const sorted = [...tracking90d].sort(
        (a, b) => Number(b.returnPct) - Number(a.returnPct)
    );
    const topPicks = sorted.slice(0, 5).map(formatPick);
    const worstPicks = sorted.slice(-5).reverse().map(formatPick);

    // 3. Hit rate by market (90d)
    const marketGroups: Record<string, { total: number; wins: number }> = {};
    for (const r of tracking90d) {
        if (!marketGroups[r.market]) marketGroups[r.market] = { total: 0, wins: 0 };
        marketGroups[r.market].total++;
        if (Number(r.returnPct) > 0) marketGroups[r.market].wins++;
    }
    const hitRateByMarket = Object.fromEntries(
        Object.entries(marketGroups).map(([m, g]) => [
            m,
            { hitRate: g.total > 0 ? `${((g.wins / g.total) * 100).toFixed(1)}%` : "N/A", picks: g.total },
        ])
    );

    // 4. Hit rate by tier (90d)
    const tierGroups: Record<string, { total: number; wins: number }> = {};
    for (const r of tracking90d) {
        const tier = r.scoreTier ?? "Unknown";
        if (!tierGroups[tier]) tierGroups[tier] = { total: 0, wins: 0 };
        tierGroups[tier].total++;
        if (Number(r.returnPct) > 0) tierGroups[tier].wins++;
    }
    const hitRateByTier = Object.fromEntries(
        Object.entries(tierGroups).map(([t, g]) => [
            t,
            { hitRate: g.total > 0 ? `${((g.wins / g.total) * 100).toFixed(1)}%` : "N/A", picks: g.total },
        ])
    );

    // 5. Latest learning insight
    const [latestInsight] = await db
        .select()
        .from(schema.alphaInsights)
        .orderBy(desc(schema.alphaInsights.generatedAt))
        .limit(1);

    // 6. Current active weights (from latest scan or weight history)
    const [latestWeightChange] = await db
        .select()
        .from(schema.alphaWeightHistory)
        .orderBy(desc(schema.alphaWeightHistory.effectiveDate))
        .limit(1);

    const currentWeights = latestWeightChange?.newWeights as Record<string, number> | null
        ?? { undervaluation: 30, institutional: 25, fundamental: 25, momentum: 20 };

    // 7. Weight history (for trend chart)
    const weightHistory = await db
        .select({
            date: schema.alphaWeightHistory.effectiveDate,
            weights: schema.alphaWeightHistory.newWeights,
            reason: schema.alphaWeightHistory.reason,
        })
        .from(schema.alphaWeightHistory)
        .orderBy(schema.alphaWeightHistory.effectiveDate)
        .limit(20);

    // 8. Recent scans summary
    const recentScans = await db
        .select({
            id: schema.alphaScans.id,
            scanDate: schema.alphaScans.scanDate,
            markets: schema.alphaScans.markets,
            riskMode: schema.alphaScans.riskMode,
            totalPicks: schema.alphaScans.totalPicks,
        })
        .from(schema.alphaScans)
        .orderBy(desc(schema.alphaScans.scanDate))
        .limit(10);

    // 9. Pending price checks (predictions awaiting 30/60/90d check)
    const [pendingResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.alphaPredictions)
        .where(eq(schema.alphaPredictions.isActive, true));

    // 10. Average return (90d, winners only vs all)
    const returns90d = tracking90d.map((r) => Number(r.returnPct));
    const avgReturn90d = returns90d.length > 0
        ? (returns90d.reduce((a, b) => a + b, 0) / returns90d.length).toFixed(2)
        : null;

    // Model improving? Compare first 10 cycles vs last 10 cycles (by scan date)
    const allScans = await db
        .select({ id: schema.alphaScans.id, scanDate: schema.alphaScans.scanDate })
        .from(schema.alphaScans)
        .orderBy(schema.alphaScans.scanDate);

    return NextResponse.json({
        summary: {
            totalPredictions: Number(pendingResult?.count ?? 0),
            total90dChecked: total90d,
            overallHitRate: overallHitRate !== null ? `${(overallHitRate * 100).toFixed(1)}%` : "Pending (need 90 days)",
            avgReturn90d: avgReturn90d ? `${avgReturn90d}%` : "Pending",
            totalScans: allScans.length,
        },
        performance: {
            hitRateByMarket,
            hitRateByTier,
            topPicks,
            worstPicks,
        },
        model: {
            currentWeights,
            weightHistory,
            latestInsight: latestInsight
                ? {
                    cycleId: latestInsight.cycleId,
                    generatedAt: latestInsight.generatedAt,
                    overallHitRate: latestInsight.overallHitRate,
                    summary: latestInsight.summary,
                    recommendations: latestInsight.weightRecommendations,
                }
                : null,
        },
        recentScans,
    });
}

function formatPick(r: {
    ticker: string;
    market: string;
    scoreTier: string | null;
    gemScore: number | null;
    returnPct: string | null;
    checkDate: Date | null;
    entryPrice: string | null;
    currency: string | null;
    thesis: string | null;
}) {
    return {
        ticker: r.ticker,
        market: r.market,
        tier: r.scoreTier,
        gemScore: r.gemScore,
        return: r.returnPct ? `${Number(r.returnPct).toFixed(2)}%` : null,
        checkedAt: r.checkDate,
        entryPrice: r.entryPrice ? `${r.currency} ${Number(r.entryPrice).toFixed(2)}` : null,
        thesis: r.thesis,
    };
}
