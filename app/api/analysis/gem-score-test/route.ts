import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trades } from "@/lib/db/schema";
import { DEFAULT_WEIGHTS, ADJUSTED_WEIGHTS, getWeightForScore, applyWeightAdjustment } from "@/lib/gem-score-weights";

/**
 * A/B test endpoint: Compare win rates using default vs adjusted weights
 * GET /api/analysis/gem-score-test
 *
 * Response: {
 *   baseline: { totalTrades, bought, winRate, avgScore },
 *   adjusted: { totalTrades, bought, winRate, avgScore },
 *   impact: { winRateDelta, recommendation }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all trades with results
    const allTrades = await db.select().from(trades);
    const markedTrades = allTrades.filter((t) => t.result); // Only trades with WIN/LOSS marked

    if (markedTrades.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No marked trades yet for A/B testing",
          baseline: { totalTrades: 0, bought: 0, winRate: null, avgScore: 0 },
          adjusted: { totalTrades: 0, bought: 0, winRate: null, avgScore: 0 },
          impact: { winRateDelta: 0, recommendation: "WAIT_FOR_DATA" },
        },
        { status: 200 }
      );
    }

    // Filter to BOUGHT trades only (what we actually track)
    const boughtTrades = markedTrades.filter((t) => t.action === "BOUGHT");

    if (boughtTrades.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No bought trades yet for comparison",
          baseline: { totalTrades: 0, bought: 0, winRate: null, avgScore: 0 },
          adjusted: { totalTrades: 0, bought: 0, winRate: null, avgScore: 0 },
          impact: { winRateDelta: 0, recommendation: "WAIT_FOR_DATA" },
        },
        { status: 200 }
      );
    }

    // Calculate baseline (no adjustment)
    const baselineWins = boughtTrades.filter((t) => t.result === "WIN").length;
    const baselineWinRate = Math.round((baselineWins / boughtTrades.length) * 100);
    const baselineAvgScore = boughtTrades.reduce((sum, t) => sum + (t.gemScore || 0), 0) / boughtTrades.length;

    // Calculate adjusted (with weight multipliers)
    let adjustedWins = 0;
    let adjustedScoreSum = 0;

    for (const trade of boughtTrades) {
      const originalScore = trade.gemScore || 0;
      const multiplier = getWeightForScore(originalScore, ADJUSTED_WEIGHTS);
      const adjustedScore = applyWeightAdjustment(originalScore, multiplier);

      // For comparison: trades that score >= 50 (adjusted) are considered "confident" buys
      // Re-evaluate if they're still "confident" after adjustment
      const wasConfident = originalScore >= 50;
      const isStillConfident = adjustedScore >= 50;

      // Only count wins if trade was marked as confident after adjustment
      if (isStillConfident && trade.result === "WIN") {
        adjustedWins++;
      }

      adjustedScoreSum += adjustedScore;
    }

    const adjustedAvgScore = adjustedScoreSum / boughtTrades.length;
    const adjustedWinRate = Math.round((adjustedWins / boughtTrades.length) * 100);

    // Calculate impact
    const winRateDelta = adjustedWinRate - baselineWinRate;
    const recommendation =
      winRateDelta > 5
        ? "APPLY_ADJUSTMENTS"
        : winRateDelta < -5
          ? "REVERT_ADJUSTMENTS"
          : "COLLECT_MORE_DATA";

    return NextResponse.json(
      {
        success: true,
        baseline: {
          totalTrades: boughtTrades.length,
          bought: boughtTrades.length,
          winRate: baselineWinRate,
          avgScore: Math.round(baselineAvgScore * 100) / 100,
          wins: baselineWins,
        },
        adjusted: {
          totalTrades: boughtTrades.length,
          bought: boughtTrades.length,
          winRate: adjustedWinRate,
          avgScore: Math.round(adjustedAvgScore * 100) / 100,
          wins: adjustedWins,
        },
        impact: {
          winRateDelta,
          avgScoreDelta: Math.round((adjustedAvgScore - baselineAvgScore) * 100) / 100,
          recommendation,
          confidence: boughtTrades.length >= 30 ? "HIGH" : "LOW",
        },
        testDetails: {
          tradesAnalyzed: boughtTrades.length,
          defaultWeights: DEFAULT_WEIGHTS,
          adjustedWeights: ADJUSTED_WEIGHTS,
          minTradesForConfidence: 30,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GEM SCORE A/B test error:", error);
    return NextResponse.json(
      { success: false, error: "A/B test failed" },
      { status: 500 }
    );
  }
}
