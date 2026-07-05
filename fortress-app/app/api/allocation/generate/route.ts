/**
 * POST /api/allocation/generate
 *
 * Investment Genie: Generate allocation + enrich with TSYS conviction
 *
 * NEW: Integrates with multi-sector TSYS
 * - Fetches related theses
 * - Shows conviction scores
 * - Provides rebalance suggestions
 */

import { NextRequest, NextResponse } from "next/server";
import { enrichAllocationWithTSYS } from "@/lib/integrations/tsys-allocation-helper";
import { z } from "zod";

const AllocationRequestSchema = z.object({
  riskTolerance: z.enum(["conservative", "balanced", "aggressive"]),
  investmentHorizon: z.enum(["short", "medium", "long"]),
  countries: z.array(z.enum(["United States", "India"])).min(1),
});

interface AllocationResponse {
  success: boolean;
  data?: {
    allocation: Record<string, number>;
    relatedTheses: Array<{
      sector: string;
      conviction: number;
      status: string;
      reason: string;
    }>;
    qualityScore: number;
    suggestions: string[];
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<AllocationResponse>> {
  try {
    const body = await request.json();

    // Validate input
    const validation = AllocationRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
        },
        { status: 400 }
      );
    }

    const { riskTolerance, investmentHorizon, countries } = validation.data;

    // Generate base allocation (existing logic)
    const allocation = generateBaseAllocation(riskTolerance, countries);

    // NEW: Enrich with TSYS conviction
    const enrichedContext = await enrichAllocationWithTSYS(allocation);

    return NextResponse.json(
      {
        success: true,
        data: {
          allocation: enrichedContext.allocation,
          relatedTheses: enrichedContext.relatedTheses,
          qualityScore: enrichedContext.qualityScore,
          suggestions: enrichedContext.suggestions,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/allocation/generate] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate allocation",
      },
      { status: 500 }
    );
  }
}

/**
 * Generate base allocation (existing Investment Genie logic)
 */
function generateBaseAllocation(
  riskTolerance: string,
  countries: string[]
): Record<string, number> {
  const allocations: Record<string, Record<string, number>> = {
    conservative: { NSE: 30, US: 70 },
    balanced: { NSE: 50, US: 50 },
    aggressive: { NSE: 70, US: 30 },
  };

  return allocations[riskTolerance] || { NSE: 50, US: 50 };
}
