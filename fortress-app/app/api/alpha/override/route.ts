import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env";

// POST /api/alpha/override
// Add a manual context tag to a prediction.
// This is the "Market crashed — thesis still intact" button.
// Overrides are factored into the learning engine so the model doesn't
// penalize itself for picks that failed due to external factors.

const VALID_OVERRIDE_TYPES = [
    "market_crash_intact",       // External crash, thesis still valid
    "management_change",          // Key person risk materialized
    "sector_rotation",            // Sector headwind, not model failure
    "thesis_broken",              // Fundamental thesis was wrong
    "external_factor",            // Regulatory/geopolitical event
    "upgraded_conviction",        // New info strengthens the thesis
    "take_profit",                // Hit target, closing position
] as const;

export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== env.ADMIN_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: {
        predictionId: string;
        overrideType: string;
        notes?: string;
    };

    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body.predictionId || !body.overrideType) {
        return NextResponse.json({ error: "Missing: predictionId, overrideType" }, { status: 400 });
    }

    if (!VALID_OVERRIDE_TYPES.includes(body.overrideType as typeof VALID_OVERRIDE_TYPES[number])) {
        return NextResponse.json({
            error: `Invalid overrideType. Valid values: ${VALID_OVERRIDE_TYPES.join(", ")}`,
        }, { status: 400 });
    }

    // Verify prediction exists
    const [prediction] = await db
        .select({ id: schema.alphaPredictions.id, ticker: schema.alphaPredictions.ticker })
        .from(schema.alphaPredictions)
        .where(eq(schema.alphaPredictions.id, body.predictionId))
        .limit(1);

    if (!prediction) {
        return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
    }

    const [override] = await db
        .insert(schema.alphaOverrides)
        .values({
            predictionId: body.predictionId,
            overrideType: body.overrideType,
            notes: body.notes ?? null,
        })
        .returning();

    return NextResponse.json({
        success: true,
        overrideId: override.id,
        ticker: prediction.ticker,
        overrideType: body.overrideType,
        message: `Override recorded for ${prediction.ticker}. Learning engine will exclude this from ${body.overrideType === "thesis_broken" ? "none" : "external-factor penalty"}.`,
    });
}

// GET /api/alpha/override?predictionId=xxx
export async function GET(req: NextRequest) {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== env.ADMIN_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const predictionId = url.searchParams.get("predictionId");

    if (predictionId) {
        const overrides = await db
            .select()
            .from(schema.alphaOverrides)
            .where(eq(schema.alphaOverrides.predictionId, predictionId))
            .orderBy(schema.alphaOverrides.overrideDate);
        return NextResponse.json({ overrides: overrides.reverse() });
    }

    // Return all overrides (latest 50)
    const overrides = await db
        .select()
        .from(schema.alphaOverrides)
        .orderBy(schema.alphaOverrides.overrideDate)
        .limit(50);

    return NextResponse.json({ overrides: overrides.reverse() });
}
