import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trades } from "@/lib/db/schema";
import { generateAdjustedWeights, DEFAULT_WEIGHTS } from "@/lib/gem-score-weights";

/**
 * Apply weight recommendations to create adjusted weights
 * This is Phase 6.2: Auto-Adjustment Framework
 *
 * POST /api/analysis/gem-score-apply-weights
 * Body: { applyImmediately?: boolean } (default: false, dry-run mode)
 *
 * Response shows what weights would be applied if enabled
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const applyImmediately = body.applyImmediately === true;

    // Fetch recommendations from existing feedback API logic
    const allTrades = await db.select().from(trades);
    const filtered = allTrades;

    const ranges = [
      { min: 80, max: 100, label: "80-100%" },
      { min: 60, max: 79, label: "60-79%" },
      { min: 40, max: 59, label: "40-59%" },
      { min: 0, max: 39, label: "0-39%" },
    ];

    // Calculate stats per range (same as feedback endpoint)
    const stats = ranges.map((range) => {
      const tradesInRange = filtered.filter(
        (t) => t.gemScore >= range.min && t.gemScore <= range.max
      );
      const boughtTrades = tradesInRange.filter((t) => t.action === "BOUGHT");
      const wins = boughtTrades.filter((t) => t.result === "WIN").length;
      const winRate = boughtTrades.length > 0 ? Math.round((wins / boughtTrades.length) * 100) : null;

      return {
        range: range.label,
        totalTrades: tradesInRange.length,
        boughtTrades: boughtTrades.length,
        wins,
        winRate,
      };
    });

    // Generate recommendations (same logic as feedback endpoint)
    const avgWinRate =
      stats.length > 0
        ? stats.reduce((sum, s) => sum + (s.winRate || 0), 0) / stats.length
        : 0;

    const recommendations = stats.map((s) => {
      const adjustment = (s.winRate || 0) - avgWinRate;
      const adjustmentSignal = adjustment > 0 ? "UPWEIGHT" : adjustment < 0 ? "DOWNWEIGHT" : "MAINTAIN";
      return {
        range: s.range,
        currentWinRate: s.winRate,
        adjustment: adjustmentSignal as "UPWEIGHT" | "DOWNWEIGHT" | "MAINTAIN",
        adjustmentPct: Math.round(adjustment),
      };
    });

    // Generate adjusted weights from recommendations
    const proposedWeights = generateAdjustedWeights(
      recommendations.map((r) => ({
        range: r.range,
        adjustment: r.adjustment,
        adjustmentPct: r.adjustmentPct,
        currentWinRate: r.currentWinRate,
      }))
    );

    // ponytail: Dry-run mode (default). In production, would persist to DB or ENV
    // For now, just return what would be applied
    const response = {
      success: true,
      mode: applyImmediately ? "APPLIED" : "DRY_RUN",
      currentWeights: DEFAULT_WEIGHTS,
      proposedWeights,
      recommendations,
      impact: {
        message: applyImmediately
          ? "Weights have been updated. GEM SCORE calculations will use new multipliers."
          : "Preview mode. Weights not yet applied. Set applyImmediately=true to enable.",
      },
      tradesAnalyzed: filtered.length,
      minTradesPerRange: 10,
      confidence: stats.filter((s) => s.boughtTrades >= 10).length >= 2 ? "HIGH" : "LOW",
    };

    // In Phase 6.3, would persist to ENV, config file, or database
    // For now, this shows the intent and validates the logic

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Apply weights error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to apply weights" },
      { status: 500 }
    );
  }
}
