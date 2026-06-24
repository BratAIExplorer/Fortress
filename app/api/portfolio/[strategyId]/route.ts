import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStrategyById, getHoldingsByStrategyId } from "@/lib/portfolio/portfolio-queries";
import { fetchLivePrices } from "@/lib/portfolio/portfolio-prices";
import { computeRebalance } from "@/lib/portfolio/rebalance";

// GET /api/portfolio/[strategyId] — full detail with live prices + rebalance actions
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ strategyId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { strategyId } = await params;
    const strategy = await getStrategyById(strategyId, session.user.id);

    if (!strategy) {
      return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
    }

    const holdings = await getHoldingsByStrategyId(strategyId);
    const tickers = holdings.map((h) => h.ticker);
    const prices = tickers.length > 0 ? await fetchLivePrices(tickers) : {};
    const detail = computeRebalance(strategy, holdings, prices);

    return NextResponse.json({ success: true, data: detail });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load strategy";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
