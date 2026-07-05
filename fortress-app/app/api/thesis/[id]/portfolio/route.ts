/**
 * POST /api/thesis/[id]/portfolio
 * Create a new portfolio/strategy based on a thesis
 *
 * Request: User conviction level + allocation method
 * Response: New strategy with holdings created
 * Used by: "Create Portfolio from Thesis" button on thesis detail page
 *
 * Integration: Creates records in strategies + strategy_holdings tables
 * (from existing Portfolio Tracker module)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { strategies, strategyHoldings } from "@/lib/db/schema";
import { getThesisStocks } from "@/lib/db/queries/thesis";
import type { CreatePortfolioFromThesisRequest } from "@/lib/types/thesis";
import { z } from "zod";

// Validation schema for request body
const CreatePortfolioSchema = z.object({
  user_conviction: z
    .number()
    .min(0)
    .max(1)
    .describe("User's personal conviction (0.0-1.0)"),
  allocation_method: z
    .enum(["EQUAL", "CONVICTION_WEIGHTED", "CUSTOM"])
    .describe("How to allocate across stocks"),
  custom_allocations: z
    .record(z.number())
    .optional()
    .describe("Custom allocations per stock (required if method=CUSTOM)"),
  name: z
    .string()
    .min(3)
    .max(100)
    .optional()
    .describe("Custom portfolio name (optional)"),
});

interface CreatePortfolioResponse {
  success: boolean;
  data?: {
    strategy_id: string;
    strategy_name: string;
    risk_tier: string;
    total_holdings: number;
    allocations: Array<{
      symbol: string;
      market: string;
      weight_pct: number;
    }>;
  };
  error?: string;
  details?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<CreatePortfolioResponse>> {
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

    // Parse request body
    const body = await request.json();
    const validation = CreatePortfolioSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          details: validation.error.issues.map((i) => i.message).join("; "),
        },
        { status: 400 }
      );
    }

    const payload = validation.data;

    // Fetch thesis stocks
    const thesisStocks = await getThesisStocks(thesisId);

    if (!thesisStocks || thesisStocks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Thesis has no stocks assigned",
        },
        { status: 422 }
      );
    }

    // Calculate allocations based on method
    let allocations: Record<string, number> = {};

    switch (payload.allocation_method) {
      case "EQUAL":
        // Equal weight: 100% / num_stocks
        const equalWeight = 100 / thesisStocks.length;
        thesisStocks.forEach((stock) => {
          allocations[stock.symbol] = equalWeight;
        });
        break;

      case "CONVICTION_WEIGHTED":
        // Weight by conviction: higher conviction = higher weight
        const totalConviction = thesisStocks.reduce((sum, s) => sum + Number(s.convictionPct), 0);
        thesisStocks.forEach((stock) => {
          const conviction = Number(stock.convictionPct);
          allocations[stock.symbol] = (conviction / totalConviction) * 100;
        });
        break;

      case "CUSTOM":
        // Use provided allocations (must match stocks)
        if (!payload.custom_allocations) {
          return NextResponse.json(
            {
              success: false,
              error: "Custom allocations required for CUSTOM method",
            },
            { status: 400 }
          );
        }
        allocations = payload.custom_allocations;

        // Validate total = 100%
        const total = Object.values(allocations).reduce((a, b) => a + b, 0);
        if (Math.abs(total - 100) > 0.1) {
          return NextResponse.json(
            {
              success: false,
              error: `Allocations must sum to 100% (got ${total.toFixed(2)}%)`,
            },
            { status: 400 }
          );
        }
        break;
    }

    // Determine risk tier based on conviction
    let riskTier = "balanced";
    if (payload.user_conviction < 0.4) riskTier = "conservative";
    if (payload.user_conviction > 0.7) riskTier = "aggressive";

    // Create strategy record
    const strategyName =
      payload.name || `Thesis-${new Date().getTime().toString().slice(-6)}`;
    const newStrategy = await db
      .insert(strategies)
      .values({
        userId: "thesis-engine", // Placeholder for non-authenticated users
        name: strategyName,
        description: `Created from thesis: ${thesisId}`,
        emoji: "📊",
        riskTier,
        totalCapitalUsd: 100000, // Default: $100k allocation
        targetMultiple: 5,
        targetHorizonYears: 10,
        isActive: true,
      })
      .returning();

    const strategy = newStrategy[0];

    // Create holdings records
    const holdingsToCreate = thesisStocks.map((stock) => ({
      strategyId: strategy.id,
      ticker: stock.symbol,
      name: stock.symbol, // TODO: enrich with company name from stocks table
      targetWeightPct: allocations[stock.symbol] || 0,
      unitsHeld: 0, // User will fill in actual units later
      avgBuyPrice: 0,
    }));

    await db.insert(strategyHoldings).values(holdingsToCreate);

    // Format response
    const responseAllocations = Object.entries(allocations)
      .filter(([_, weight]) => weight > 0)
      .map(([symbol, weight]) => {
        const stock = thesisStocks.find((s) => s.symbol === symbol);
        return {
          symbol,
          market: stock?.market || "NSE",
          weight_pct: Math.round(weight * 100) / 100,
        };
      });

    return NextResponse.json(
      {
        success: true,
        data: {
          strategy_id: strategy.id,
          strategy_name: strategy.name,
          risk_tier: strategy.riskTier,
          total_holdings: responseAllocations.length,
          allocations: responseAllocations,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/thesis/[id]/portfolio] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create portfolio",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
