import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { env } from "@/lib/env";

// POST /api/alpha/scan
// Records a complete scan session + all predictions from the Hidden Gem Hunter skill.
// Called by the upgraded skill after every scan run.
// Auth: ADMIN_SECRET header

export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== env.ADMIN_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: {
        markets: string[];
        riskMode: string;
        activeWeights: Record<string, number>;
        predictions: Array<{
            ticker: string;
            name?: string;
            market: string;
            gemScore: number;
            scoreBreakdown: Record<string, number>;
            bonusModifiers?: Array<{ label: string; pts: number }>;
            penaltyModifiers?: Array<{ label: string; pts: number }>;
            scoreTier: string;
            entryPrice?: number;
            riskTier: string;
            thesis?: string;
            keyRisk?: string;
            sector?: string;
            currency?: string;
        }>;
    };

    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.markets || !body.riskMode || !body.predictions) {
        return NextResponse.json({ error: "Missing required fields: markets, riskMode, predictions" }, { status: 400 });
    }

    // Validate riskMode
    if (!["conservative", "balanced", "aggressive"].includes(body.riskMode)) {
        return NextResponse.json({ error: "riskMode must be conservative | balanced | aggressive" }, { status: 400 });
    }

    // 1. Create the scan session record
    const [scan] = await db
        .insert(schema.alphaScans)
        .values({
            markets: body.markets,
            riskMode: body.riskMode,
            totalPicks: body.predictions.length,
            activeWeights: body.activeWeights,
        })
        .returning();

    // 2. Insert all predictions for this scan
    if (body.predictions.length > 0) {
        await db.insert(schema.alphaPredictions).values(
            body.predictions.map((p) => ({
                scanId: scan.id,
                ticker: p.ticker,
                name: p.name ?? null,
                market: p.market,
                gemScore: p.gemScore,
                scoreBreakdown: p.scoreBreakdown,
                bonusModifiers: p.bonusModifiers ?? null,
                penaltyModifiers: p.penaltyModifiers ?? null,
                scoreTier: p.scoreTier,
                entryPrice: p.entryPrice?.toString() ?? null,
                riskTier: p.riskTier,
                thesis: p.thesis ?? null,
                keyRisk: p.keyRisk ?? null,
                sector: p.sector ?? null,
                currency: p.currency ?? "USD",
            }))
        );
    }

    return NextResponse.json({
        success: true,
        scanId: scan.id,
        picksRecorded: body.predictions.length,
        message: `Scan recorded. ${body.predictions.length} predictions stored. Price tracking will begin at 30/60/90 days.`,
    });
}

// GET /api/alpha/scan — List recent scans
export async function GET(req: NextRequest) {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== env.ADMIN_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scans = await db
        .select()
        .from(schema.alphaScans)
        .orderBy(schema.alphaScans.scanDate)
        .limit(20);

    // Return in reverse order (newest first)
    return NextResponse.json({ scans: scans.reverse() });
}
