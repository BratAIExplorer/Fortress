import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { getStrategyById, upsertHoldings } from "@/lib/portfolio/portfolio-queries";

const HoldingSchema = z.object({
  ticker: z.string().min(1).max(20).toUpperCase(),
  name: z.string().min(1).max(200),
  targetWeightPct: z.number().min(0).max(100),
  unitsHeld: z.number().min(0),
  avgBuyPrice: z.number().min(0),
});

const UpsertSchema = z.object({
  holdings: z.array(HoldingSchema).min(1),
});

// PUT /api/portfolio/[strategyId]/holdings — replace all holdings for a strategy
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ strategyId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { strategyId } = await params;

    // Verify ownership before mutating
    const strategy = await getStrategyById(strategyId, session.user.id);
    if (!strategy) {
      return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
    }

    const body = await req.json() as unknown;
    const { holdings } = UpsertSchema.parse(body);

    // Validate weights sum to ~100%
    const totalWeight = holdings.reduce((sum, h) => sum + h.targetWeightPct, 0);
    if (Math.abs(totalWeight - 100) > 1) {
      return NextResponse.json(
        { success: false, error: `Target weights must sum to 100% (got ${totalWeight.toFixed(1)}%)` },
        { status: 400 }
      );
    }

    const updated = await upsertHoldings(strategyId, holdings);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Failed to update holdings";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
