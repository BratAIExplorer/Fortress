/**
 * GET /api/thesis
 * List all active theses with conviction scores
 *
 * Response: Array of thesis cards (minimal data for list view)
 * Used by: Thesis browse page, Investment Genie "learn more" links
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllTheses } from "@/lib/db/queries/thesis";
import type { SectorThesis } from "@/lib/types/thesis";

interface ThesisCard {
  id: string;
  name: string;
  slug: string;
  macroCatalyst: string;
  convictionScore: number;
  convictionStatus: "WORKING" | "FALTERING" | "BROKEN";
  historicalCagr?: number;
  timeframeYears?: number;
}

interface ThesisListResponse {
  success: boolean;
  data?: ThesisCard[];
  error?: string;
  meta?: {
    total: number;
    fetched_at: string;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<ThesisListResponse>> {
  try {
    // Fetch all active theses (ordered by conviction score descending)
    const theses = await getAllTheses();

    // Transform to card format
    const cards: ThesisCard[] = theses.map((thesis: SectorThesis) => ({
      id: thesis.id,
      name: thesis.name,
      slug: thesis.slug,
      macroCatalyst: thesis.macroCatalyst,
      convictionScore: Number(thesis.convictionScore),
      convictionStatus: thesis.convictionStatus,
      historicalCagr: thesis.historicalCagr ? Number(thesis.historicalCagr) : undefined,
      timeframeYears: thesis.timeframeYears || undefined,
    }));

    return NextResponse.json(
      {
        success: true,
        data: cards,
        meta: {
          total: cards.length,
          fetched_at: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/thesis] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch theses",
      },
      { status: 500 }
    );
  }
}
