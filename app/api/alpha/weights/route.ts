import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { eq, desc } from "drizzle-orm";
import { env } from "@/lib/env";

// POST /api/alpha/weights
// Apply a weight change from the learning engine.
// This records the change in weight_history for auditing + the next scan will use new weights.
// GET /api/alpha/weights — Returns current weights + history

const DEFAULT_WEIGHTS = { undervaluation: 30, institutional: 25, fundamental: 25, momentum: 20 };

export async function GET(req: NextRequest) {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== env.ADMIN_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await db
        .select()
        .from(schema.alphaWeightHistory)
        .orderBy(desc(schema.alphaWeightHistory.effectiveDate))
        .limit(20);

    const currentWeights =
        history.length > 0
            ? (history[0].newWeights as Record<string, number>)
            : DEFAULT_WEIGHTS;

    return NextResponse.json({ currentWeights, history });
}

export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== env.ADMIN_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: {
        newWeights: Record<string, number>;
        reason: string;
        insightId?: string;
    };

    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body.newWeights || !body.reason) {
        return NextResponse.json({ error: "Missing: newWeights, reason" }, { status: 400 });
    }

    // Validate total = 100
    const total = Object.values(body.newWeights).reduce((a, b) => a + b, 0);
    if (total !== 100) {
        return NextResponse.json({
            error: `Weights must sum to 100. Got ${total}.`,
        }, { status: 400 });
    }

    // Get current weights
    const [latest] = await db
        .select()
        .from(schema.alphaWeightHistory)
        .orderBy(desc(schema.alphaWeightHistory.effectiveDate))
        .limit(1);

    const oldWeights = latest?.newWeights ?? DEFAULT_WEIGHTS;

    const [record] = await db
        .insert(schema.alphaWeightHistory)
        .values({
            oldWeights,
            newWeights: body.newWeights,
            reason: body.reason,
            insightId: body.insightId ?? null,
        })
        .returning();

    return NextResponse.json({
        success: true,
        recordId: record.id,
        oldWeights,
        newWeights: body.newWeights,
        message: "Weight change recorded. Next scan session will use these weights.",
    });
}
