import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trades } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionFromRequest, requireAuth, requireCSRFToken } from "@/lib/auth/middleware";

export async function POST(request: NextRequest) {
  try {
    // AUTH REQUIRED
    const session = requireAuth(request);

    // CSRF PROTECTION
    await requireCSRFToken(request, session);

    const { ticker, gemScore, action, entryPrice } = await request.json();

    if (!ticker || gemScore === undefined || !action) {
      return NextResponse.json(
        { success: false, error: "Missing fields: ticker, gemScore, action" },
        { status: 400 }
      );
    }

    const trade = await db
      .insert(trades)
      .values({
        userId: session.userId, // DATA ISOLATION: Store userId
        ticker: ticker.toUpperCase(),
        gemScore: Math.max(0, Math.min(100, gemScore)),
        action,
        entryPrice: entryPrice ? entryPrice.toString() : null,
        date: new Date(),
      })
      .returning();

    return NextResponse.json(
      { success: true, trade: trade[0] },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "CSRF_TOKEN_REQUIRED" || message === "INVALID_CSRF_TOKEN") {
      return NextResponse.json(
        { success: false, error: message },
        { status: 403 }
      );
    }
    if (message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // AUTH REQUIRED
    const session = requireAuth(request);

    // CSRF PROTECTION
    await requireCSRFToken(request, session);

    const { tradeId, result } = await request.json();

    if (!tradeId || !result) {
      return NextResponse.json(
        { success: false, error: "Missing fields: tradeId, result" },
        { status: 400 }
      );
    }

    // DATA ISOLATION: Verify user owns this trade
    const existingTrade = await db
      .select()
      .from(trades)
      .where(and(
        eq(trades.id, tradeId),
        eq(trades.userId, session.userId)
      ))
      .limit(1);

    if (existingTrade.length === 0) {
      return NextResponse.json(
        { success: false, error: "Trade not found or access denied" },
        { status: 403 }
      );
    }

    const updated = await db
      .update(trades)
      .set({ result, checkedAt: new Date() })
      .where(eq(trades.id, tradeId))
      .returning();

    return NextResponse.json(
      { success: true, trade: updated[0] },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "CSRF_TOKEN_REQUIRED" || message === "INVALID_CSRF_TOKEN") {
      return NextResponse.json(
        { success: false, error: message },
        { status: 403 }
      );
    }
    if (message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // AUTH REQUIRED
  const session = requireAuth(request);

  const { learningMetrics } = await import("@/lib/db/schema");

  const action = request.nextUrl.searchParams.get("action");

  // DATA ISOLATION: Only return user's trades
  const userTrades = await db
    .select()
    .from(trades)
    .where(eq(trades.userId, session.userId));

  const filtered = action
    ? userTrades.filter((t) => t.action === action)
    : userTrades;

  const ranges = [
    { min: 80, max: 100, label: "80-100%" },
    { min: 60, max: 79, label: "60-79%" },
    { min: 40, max: 59, label: "40-59%" },
    { min: 0, max: 39, label: "0-39%" },
  ];

  const stats = ranges.map((range) => {
    const tradesInRange = filtered.filter(
      (t) => t.gemScore >= range.min && t.gemScore <= range.max
    );
    const boughtTrades = tradesInRange.filter((t) => t.action === "BOUGHT");
    const wins = boughtTrades.filter((t) => t.result === "WIN").length;
    const winRate =
      boughtTrades.length > 0
        ? Math.round((wins / boughtTrades.length) * 100)
        : null;

    return {
      range: range.label,
      totalTrades: tradesInRange.length,
      boughtTrades: boughtTrades.length,
      wins,
      winRate,
    };
  });

  // Fetch learning insights (latest metrics by range)
  const insights = await db.select().from(learningMetrics);
  const latestMetrics = Array.from(
    new Map(insights.map((m) => [m.scoreRange, m])).values()
  );

  // ponytail: Calculate weight recommendations based on win rates
  // Average win rate across ranges, recommend upweighting high performers
  const avgWinRate =
    stats.length > 0
      ? stats.reduce((sum, s) => sum + (s.winRate || 0), 0) / stats.length
      : 0;

  const weightRecommendations = stats.map((s) => {
    const adjustment = (s.winRate || 0) - avgWinRate;
    return {
      range: s.range,
      currentWinRate: s.winRate,
      adjustment: adjustment > 0 ? "UPWEIGHT" : adjustment < 0 ? "DOWNWEIGHT" : "MAINTAIN",
      adjustmentPct: Math.round(adjustment),
    };
  });

  const totalTrades = filtered.length;
  const boughtCount = filtered.filter((t) => t.action === "BOUGHT").length;
  const overallWins = filtered.filter((t) => t.result === "WIN").length;
  const overallWinRate =
    boughtCount > 0 ? Math.round((overallWins / boughtCount) * 100) : null;

  return NextResponse.json(
    {
      success: true,
      totalTrades,
      boughtCount,
      overallWins,
      overallWinRate,
      byScoreRange: stats,
      learningInsights: latestMetrics,
      weightRecommendations,
      trades: filtered,
    },
    { status: 200 }
  );
}
