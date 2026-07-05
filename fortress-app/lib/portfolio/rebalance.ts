import type { StrategyHolding, HoldingWithPrice, RebalanceAction, StrategyDetail, Strategy } from "./types";

// Trigger a rebalance recommendation when drift exceeds this threshold
const DRIFT_THRESHOLD_PCT = 5;

/**
 * Pure function — no side effects, fully unit-testable.
 * Given holdings with live prices, computes current weights, return,
 * and buy/trim actions needed to snap back to target weights.
 */
export function computeRebalance(
  strategy: Strategy,
  holdings: StrategyHolding[],
  prices: Record<string, number>
): StrategyDetail {
  // 1. Attach live prices and compute current values
  const withValues: HoldingWithPrice[] = holdings.map((h) => {
    const currentPrice = prices[h.ticker] ?? 0;
    const currentValue = h.unitsHeld * currentPrice;
    const costBasis = h.unitsHeld * h.avgBuyPrice;
    return {
      ...h,
      currentPrice,
      currentValue,
      costBasis,
      currentWeightPct: 0, // computed after sum
      returnPct: costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0,
    };
  });

  // 2. Aggregate portfolio totals
  const totalValue = withValues.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCostBasis = withValues.reduce((sum, h) => sum + h.costBasis, 0);
  const totalReturnPct =
    totalCostBasis > 0 ? ((totalValue - totalCostBasis) / totalCostBasis) * 100 : 0;

  // 3. Compute current weight % for each holding
  const withWeights: HoldingWithPrice[] = withValues.map((h) => ({
    ...h,
    currentWeightPct: totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0,
  }));

  // 4. Compute buy / trim actions
  const actions: RebalanceAction[] = withWeights.map((h) => {
    const drift = h.currentWeightPct - h.targetWeightPct;
    const targetValue = (h.targetWeightPct / 100) * totalValue;
    const delta = targetValue - h.currentValue; // positive = buy, negative = trim
    const absAmount = Math.abs(delta);
    const units = h.currentPrice > 0 ? absAmount / h.currentPrice : 0;

    let action: "buy" | "trim" | "hold" = "hold";
    if (Math.abs(drift) >= DRIFT_THRESHOLD_PCT) {
      action = delta > 0 ? "buy" : "trim";
    }

    return {
      ticker: h.ticker,
      name: h.name,
      action,
      currentWeightPct: h.currentWeightPct,
      targetWeightPct: h.targetWeightPct,
      driftPct: drift,
      amountUsd: absAmount,
      units,
    };
  });

  const needsRebalance = actions.some((a) => a.action !== "hold");

  return {
    strategy,
    totalValue,
    totalCostBasis,
    totalReturnPct,
    needsRebalance,
    holdings: withWeights,
    actions,
  };
}
