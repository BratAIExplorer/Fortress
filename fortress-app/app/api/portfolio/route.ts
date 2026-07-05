import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import {
  getStrategiesByUserId,
  getHoldingsByStrategyId,
  createStrategy,
} from "@/lib/portfolio/portfolio-queries";
import { fetchLivePrices } from "@/lib/portfolio/portfolio-prices";
import { computeRebalance } from "@/lib/portfolio/rebalance";

const CreateStrategySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  emoji: z.string().optional(),
  riskTier: z.enum(["aggressive", "balanced", "conservative"]),
  totalCapitalUsd: z.number().positive(),
  targetMultiple: z.number().positive().optional(),
  targetHorizonYears: z.number().int().positive().optional(),
});

// GET /api/portfolio — all strategies for the current user with live snapshot values
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const strategies = await getStrategiesByUserId(session.user.id);

    // Fetch all tickers across all strategies in one batch call
    const allTickers = [
      ...new Set(
        (
          await Promise.all(
            strategies.map((s) => getHoldingsByStrategyId(s.id))
          )
        ).flat().map((h) => h.ticker)
      ),
    ];

    const prices = allTickers.length > 0 ? await fetchLivePrices(allTickers) : {};

    // Compute snapshot for each strategy
    const snapshots = await Promise.all(
      strategies.map(async (strategy) => {
        const holdings = await getHoldingsByStrategyId(strategy.id);
        const detail = computeRebalance(strategy, holdings, prices);
        return {
          id: strategy.id,
          name: strategy.name,
          description: strategy.description,
          emoji: strategy.emoji,
          riskTier: strategy.riskTier,
          totalCapitalUsd: strategy.totalCapitalUsd,
          targetMultiple: strategy.targetMultiple,
          targetHorizonYears: strategy.targetHorizonYears,
          totalValue: detail.totalValue,
          totalCostBasis: detail.totalCostBasis,
          totalReturnPct: detail.totalReturnPct,
          needsRebalance: detail.needsRebalance,
          holdingCount: holdings.length,
        };
      })
    );

    return NextResponse.json({ success: true, data: snapshots });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load portfolio";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/portfolio — create a new strategy (holdings added separately)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as unknown;
    const input = CreateStrategySchema.parse(body);
    const strategy = await createStrategy(session.user.id, input);
    return NextResponse.json({ success: true, data: strategy }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Failed to create strategy";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
