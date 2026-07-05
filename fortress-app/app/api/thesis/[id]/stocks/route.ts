/**
 * GET /api/thesis/[id]/stocks
 * Get top 30 stocks for a thesis (without full thesis metadata)
 *
 * Response: Array of stocks ranked 1-30
 * Used by: Stock table on thesis detail page, stock selection modal
 */

import { NextRequest, NextResponse } from "next/server";
import { getThesisStocks } from "@/lib/db/queries/thesis";

interface StockData {
  rank: number;
  symbol: string;
  market: "NSE" | "US";
  valuationGapPct?: number;
  convictionPct: number;
}

interface StocksResponse {
  success: boolean;
  data?: {
    thesisId: string;
    stocks: StockData[];
  };
  error?: string;
  meta?: {
    total_stocks: number;
    fetched_at: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<StocksResponse>> {
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

    // Fetch stocks for thesis
    const stocks = await getThesisStocks(thesisId);

    if (stocks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No stocks found for this thesis",
        },
        { status: 404 }
      );
    }

    // Transform to response format
    const responseStocks: StockData[] = stocks.map((stock) => ({
      rank: stock.rankInThesis,
      symbol: stock.symbol,
      market: stock.market as "NSE" | "US",
      valuationGapPct: stock.valuationGapPct ? Number(stock.valuationGapPct) : undefined,
      convictionPct: Number(stock.convictionPct),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          thesisId,
          stocks: responseStocks,
        },
        meta: {
          total_stocks: responseStocks.length,
          fetched_at: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/thesis/[id]/stocks] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch thesis stocks",
      },
      { status: 500 }
    );
  }
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
