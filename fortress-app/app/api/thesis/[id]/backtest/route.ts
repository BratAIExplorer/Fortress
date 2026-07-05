/**
 * GET /api/thesis/[id]/backtest
 * Get 5-year backtest metrics for a thesis
 *
 * Response: CAGR, Sharpe ratio, max drawdown, win rate
 * Used by: Thesis detail chart, portfolio performance comparison
 * Note: These are CACHED (not calculated on demand) - calculated daily by cron job
 */

import { NextRequest, NextResponse } from "next/server";
import { getThesisValidation } from "@/lib/db/queries/thesis";
import type { BacktestMetrics } from "@/lib/types/thesis";

interface BacktestResponse {
  success: boolean;
  data?: {
    period: "5Y";
    metrics: BacktestMetrics;
    validationDate: string;
    confidence: "HIGH" | "MEDIUM" | "LOW";
    notes?: string;
  };
  error?: string;
  meta?: {
    cached: boolean;
    last_updated: string;
    age_hours: number;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<BacktestResponse>> {
  try {
    const thesisId = params.id;

    // Validate UUID
    if (!isValidUUID(thesisId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid thesis ID format",
        },
        { status: 400 }
      );
    }

    // Fetch latest validation/backtest data
    const validation = await getThesisValidation(thesisId);

    if (!validation) {
      return NextResponse.json(
        {
          success: false,
          error: "No backtest data available for this thesis",
        },
        { status: 404 }
      );
    }

    // Determine confidence based on age of data
    const ageHours = Math.floor(
      (new Date().getTime() - validation.createdAt.getTime()) / (1000 * 60 * 60)
    );

    let confidence: "HIGH" | "MEDIUM" | "LOW" = "HIGH";
    if (ageHours > 48) confidence = "MEDIUM";
    if (ageHours > 96) confidence = "LOW"; // Older than 4 days, data is stale

    const responseData = {
      period: "5Y" as const,
      metrics: {
        cagr: validation.backtest5yrCagr ? Number(validation.backtest5yrCagr) : 0,
        sharpe: validation.backtest5yrSharpe ? Number(validation.backtest5yrSharpe) : 0,
        maxDrawdown: validation.backtest5yrMaxDrawdown
          ? Number(validation.backtest5yrMaxDrawdown)
          : 0,
        winRate: validation.backtest5yrWinRate ? Number(validation.backtest5yrWinRate) : 0,
      },
      validationDate: validation.validationDate.toISOString().split("T")[0],
      confidence,
      notes: validation.notes || undefined,
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        meta: {
          cached: true, // Always true - we don't calculate on-demand
          last_updated: validation.createdAt.toISOString(),
          age_hours: ageHours,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/thesis/[id]/backtest] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch backtest data",
      },
      { status: 500 }
    );
  }
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
