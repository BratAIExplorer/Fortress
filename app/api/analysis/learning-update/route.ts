import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trades, learningMetrics } from "@/lib/db/schema";
import { eq, isNull, and, gte, lte } from "drizzle-orm";

// ponytail: Auto-check trades 30 days out, mark WIN/LOSS, aggregate metrics
// Upgrade: ML-based weight adjustment (Phase 6)

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // 1. Find trades from ~30 days ago that haven't been checked yet
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const today = new Date();

    const tradesToCheck = await db
      .select()
      .from(trades)
      .where(
        and(
          gte(trades.date, thirtyDaysAgo),
          lte(trades.date, today),
          eq(trades.action, "BOUGHT"),
          isNull(trades.result)
        )
      );

    let markedCount = 0;

    // 2. For each trade, fetch current price and mark WIN/LOSS
    for (const trade of tradesToCheck) {
      if (!trade.entryPrice) continue; // Skip if no entry price

      try {
        // Fetch current price from yfinance
        const ticker = trade.ticker.includes(".")
          ? trade.ticker
          : `${trade.ticker}.NS`;

        const response = await fetch(
          `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price`
        );
        const data = await response.json();
        const currentPrice =
          data.quoteSummary?.result?.[0]?.price?.regularMarketPrice;

        if (!currentPrice) continue;

        // Compute return %
        const returnPct =
          ((currentPrice - parseFloat(trade.entryPrice)) / parseFloat(trade.entryPrice)) *
          100;

        // Mark WIN if positive, LOSS if negative
        const result = returnPct >= 0 ? "WIN" : "LOSS";

        await db
          .update(trades)
          .set({
            result,
            currentPrice: currentPrice.toString(),
            returnPct: returnPct.toString(),
            checkedAt: new Date(),
          })
          .where(eq(trades.id, trade.id));

        markedCount++;
      } catch (err) {
        // Silent fail for individual trades (network issue, delisted, etc)
        console.error(`Failed to check ${trade.ticker}:`, err);
      }
    }

    // 3. Aggregate: Calculate win rates by GEM SCORE range
    const ranges = [
      { min: 80, max: 100, label: "80-100%" },
      { min: 60, max: 79, label: "60-79%" },
      { min: 40, max: 59, label: "40-59%" },
      { min: 0, max: 39, label: "0-39%" },
    ];

    const allBoughtTrades = await db
      .select()
      .from(trades)
      .where(eq(trades.action, "BOUGHT"));

    for (const range of ranges) {
      const tradesInRange = allBoughtTrades.filter(
        (t) => t.gemScore >= range.min && t.gemScore <= range.max
      );

      const markedTrades = tradesInRange.filter((t) => t.result);
      const wins = markedTrades.filter((t) => t.result === "WIN").length;

      const winRate =
        markedTrades.length > 0
          ? (wins / markedTrades.length) * 100
          : null;

      const avgReturn =
        markedTrades.length > 0
          ? (markedTrades.reduce((sum, t) => sum + parseFloat(t.returnPct || "0"), 0) /
              markedTrades.length)
          : null;

      // Upsert learning metrics for today
      await db
        .insert(learningMetrics)
        .values({
          scoreRange: range.label,
          totalTrades: tradesInRange.length,
          markedTrades: markedTrades.length,
          winCount: wins,
          winRate: winRate ? winRate.toString() : null,
          avgReturnPct: avgReturn ? avgReturn.toString() : null,
        })
        .onConflictDoNothing();
    }

    return NextResponse.json(
      {
        success: true,
        markedCount,
        message: `Auto-checked ${markedCount} trades, updated learning metrics`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Learning update error:", error);
    return NextResponse.json(
      { success: false, error: "Learning update failed" },
      { status: 500 }
    );
  }
}
