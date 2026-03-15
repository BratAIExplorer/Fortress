import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { eq, and } from "drizzle-orm";
import { env } from "@/lib/env";

// POST /api/alpha/track
// Records a price check result for a specific prediction.
// Called by the price_tracker.py cron job (30/60/90 day automated checks).
// Also used for manual price checks.

export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== env.ADMIN_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: {
        predictionId: string;
        checkType: string; // '30d' | '60d' | '90d' | 'manual'
        currentPrice: number;
    };

    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body.predictionId || !body.checkType || body.currentPrice == null) {
        return NextResponse.json({ error: "Missing: predictionId, checkType, currentPrice" }, { status: 400 });
    }

    // Fetch the prediction to get entry price
    const [prediction] = await db
        .select()
        .from(schema.alphaPredictions)
        .where(eq(schema.alphaPredictions.id, body.predictionId))
        .limit(1);

    if (!prediction) {
        return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
    }

    const entryPrice = Number(prediction.entryPrice);
    const returnPct = entryPrice > 0
        ? ((body.currentPrice - entryPrice) / entryPrice) * 100
        : 0;

    const [tracking] = await db
        .insert(schema.alphaTracking)
        .values({
            predictionId: body.predictionId,
            checkType: body.checkType,
            currentPrice: body.currentPrice.toString(),
            returnPct: returnPct.toFixed(4),
        })
        .returning();

    return NextResponse.json({
        success: true,
        trackingId: tracking.id,
        ticker: prediction.ticker,
        checkType: body.checkType,
        entryPrice,
        currentPrice: body.currentPrice,
        returnPct: Number(returnPct.toFixed(2)),
    });
}

// GET /api/alpha/track?pending=true
// Returns predictions that are due for a price check (30/60/90 days)
// Used by price_tracker.py to know WHAT to fetch
export async function GET(req: NextRequest) {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== env.ADMIN_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const pending = url.searchParams.get("pending") === "true";

    if (!pending) {
        // Return all tracking records
        const records = await db
            .select()
            .from(schema.alphaTracking)
            .orderBy(schema.alphaTracking.checkDate)
            .limit(100);
        return NextResponse.json({ records: records.reverse() });
    }

    // Find predictions due for a check that don't yet have one
    // 30-day: entry_date + 30 days <= now AND no 30d record
    // 60-day: entry_date + 60 days <= now AND no 60d record
    // 90-day: entry_date + 90 days <= now AND no 90d record
    const now = new Date();

    // Get all active predictions
    const predictions = await db
        .select({
            id: schema.alphaPredictions.id,
            ticker: schema.alphaPredictions.ticker,
            market: schema.alphaPredictions.market,
            currency: schema.alphaPredictions.currency,
            entryDate: schema.alphaPredictions.entryDate,
            entryPrice: schema.alphaPredictions.entryPrice,
            scoreTier: schema.alphaPredictions.scoreTier,
            gemScore: schema.alphaPredictions.gemScore,
        })
        .from(schema.alphaPredictions)
        .where(eq(schema.alphaPredictions.isActive, true));

    // For each prediction, check which time windows are due
    const pendingChecks: Array<{
        predictionId: string;
        ticker: string;
        market: string;
        currency: string;
        checkType: string;
        entryPrice: string | null;
        dueDate: string;
    }> = [];

    for (const pred of predictions) {
        if (!pred.entryDate) continue;

        const entry = new Date(pred.entryDate);
        const checks = [
            { type: "30d", days: 30 },
            { type: "60d", days: 60 },
            { type: "90d", days: 90 },
        ];

        for (const check of checks) {
            const dueDate = new Date(entry.getTime() + check.days * 24 * 60 * 60 * 1000);
            if (dueDate <= now) {
                // Check if this check already exists
                const existing = await db
                    .select({ id: schema.alphaTracking.id })
                    .from(schema.alphaTracking)
                    .where(
                        and(
                            eq(schema.alphaTracking.predictionId, pred.id),
                            eq(schema.alphaTracking.checkType, check.type)
                        )
                    )
                    .limit(1);

                if (existing.length === 0) {
                    pendingChecks.push({
                        predictionId: pred.id,
                        ticker: pred.ticker,
                        market: pred.market,
                        currency: pred.currency ?? "USD",
                        checkType: check.type,
                        entryPrice: pred.entryPrice,
                        dueDate: dueDate.toISOString(),
                    });
                }
            }
        }
    }

    return NextResponse.json({
        pendingCount: pendingChecks.length,
        pending: pendingChecks,
    });
}
