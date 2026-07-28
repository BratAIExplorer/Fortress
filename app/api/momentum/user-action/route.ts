import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { botUserActions } from "@/lib/db/schema/bot-actions";
import { requireAuth } from "@/lib/auth/middleware";
import { eq, desc } from "drizzle-orm";

// POST: Log a user action on a signal (bought/skipped/sold)
export async function POST(request: NextRequest) {
  try {
    const session = requireAuth(request);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { symbol, timeframe, action, quantity, entryPrice, exitPrice, outcome, pnl, notes } = body;

    if (!symbol || !timeframe || !action) {
      return NextResponse.json(
        { error: "Missing required fields: symbol, timeframe, action" },
        { status: 400 }
      );
    }

    if (!["bought", "skipped", "sold"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be: bought, skipped, or sold" },
        { status: 400 }
      );
    }

    // Insert user action
    const result = await db
      .insert(botUserActions)
      .values({
        userId: session.userId,
        symbol,
        timeframe,
        action,
        quantity: quantity ? parseInt(quantity) : null,
        entryPrice: entryPrice ? entryPrice.toString() : null,
        exitPrice: exitPrice ? exitPrice.toString() : null,
        outcome: outcome || null,
        pnl: pnl ? pnl.toString() : null,
        notes: notes || null,
      })
      .returning();

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error logging user action:", error);
    return NextResponse.json(
      { error: "Failed to log action" },
      { status: 500 }
    );
  }
}

// GET: Retrieve user's recent actions (for dashboard)
export async function GET(request: NextRequest) {
  try {
    const session = requireAuth(request);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const actions = await db
      .select()
      .from(botUserActions)
      .where(eq(botUserActions.userId, session.userId))
      .orderBy(desc(botUserActions.createdAt))
      .limit(100);

    return NextResponse.json({ success: true, data: actions });
  } catch (error) {
    console.error("Error fetching user actions:", error);
    return NextResponse.json(
      { error: "Failed to fetch actions" },
      { status: 500 }
    );
  }
}
