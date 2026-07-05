/**
 * GET /api/thesis/[id]
 * Get complete thesis detail: macro logic, top 30 stocks, backtest validation
 *
 * Response: Full thesis object with stocks + latest validation
 * Used by: Thesis detail page, thesis preview cards
 * Performance target: <200ms (latency blockade)
 */

import { NextRequest, NextResponse } from "next/server";
import { getThesisWithDetails } from "@/lib/db/queries/thesis";
import type { SectorThesisWithDetails } from "@/lib/types/thesis";

interface ThesisDetailResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    macroCatalyst: string;
    timeframeYears?: number;
    historicalCagr?: number;
    convictionScore: number;
    convictionStatus: "WORKING" | "FALTERING" | "BROKEN";
    stocks: Array<{
      symbol: string;
      market: "NSE" | "US";
      rank: number;
      valuationGapPct?: number;
      convictionPct: number;
    }>;
    latestValidation?: {
      validationDate: string;
      backtest5yrCagr?: number;
      backtest5yrSharpe?: number;
      backtest5yrMaxDrawdown?: number;
      backtest5yrWinRate?: number;
      validationStatus: "WORKING" | "FALTERING" | "BROKEN";
      notes?: string;
    };
  };
  error?: string;
  meta?: {
    fetched_at: string;
    cache_status?: "HIT" | "MISS";
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ThesisDetailResponse>> {
  const startTime = performance.now();

  try {
    const thesisId = params.id;

    // Validate UUID format
    if (!isValidUUID(thesisId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid thesis ID format",
        },
        { status: 400 }
      );
    }

    // Fetch thesis with details (includes stocks + latest validation)
    const thesis = await getThesisWithDetails(thesisId);

    if (!thesis) {
      return NextResponse.json(
        {
          success: false,
          error: "Thesis not found",
        },
        { status: 404 }
      );
    }

    // Transform to response format
    const responseData = {
      id: thesis.id,
      name: thesis.name,
      slug: thesis.slug,
      description: thesis.description,
      macroCatalyst: thesis.macroCatalyst,
      timeframeYears: thesis.timeframeYears || undefined,
      historicalCagr: thesis.historicalCagr ? Number(thesis.historicalCagr) : undefined,
      convictionScore: Number(thesis.convictionScore),
      convictionStatus: thesis.convictionStatus,
      stocks: thesis.stocks.map((stock) => ({
        symbol: stock.symbol,
        market: stock.market as "NSE" | "US",
        rank: stock.rankInThesis,
        valuationGapPct: stock.valuationGapPct ? Number(stock.valuationGapPct) : undefined,
        convictionPct: Number(stock.convictionPct),
      })),
      latestValidation: thesis.latestValidation
        ? {
            validationDate: thesis.latestValidation.validationDate.toISOString(),
            backtest5yrCagr: thesis.latestValidation.backtest5yrCagr
              ? Number(thesis.latestValidation.backtest5yrCagr)
              : undefined,
            backtest5yrSharpe: thesis.latestValidation.backtest5yrSharpe
              ? Number(thesis.latestValidation.backtest5yrSharpe)
              : undefined,
            backtest5yrMaxDrawdown: thesis.latestValidation.backtest5yrMaxDrawdown
              ? Number(thesis.latestValidation.backtest5yrMaxDrawdown)
              : undefined,
            backtest5yrWinRate: thesis.latestValidation.backtest5yrWinRate
              ? Number(thesis.latestValidation.backtest5yrWinRate)
              : undefined,
            validationStatus: thesis.latestValidation.validationStatus,
            notes: thesis.latestValidation.notes,
          }
        : undefined,
    };

    const duration = performance.now() - startTime;

    // Log if over latency threshold
    if (duration > 1000) {
      console.warn(
        `[GET /api/thesis/[id]] Latency warning: ${duration.toFixed(2)}ms (threshold: 1000ms)`
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        meta: {
          fetched_at: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/thesis/[id]] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch thesis details",
      },
      { status: 500 }
    );
  }
}

/**
 * Simple UUID validation
 * Matches standard UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
