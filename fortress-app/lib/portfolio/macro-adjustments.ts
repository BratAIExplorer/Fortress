import { RiskTier } from "./risk-tiers";

export interface Allocation {
  equity: number;
  fixedIncome: number;
  cash: number;
  alternatives: number;
  riskTier: RiskTier;
}

function normalized(alloc: Allocation): Allocation {
  const sum = alloc.equity + alloc.fixedIncome + alloc.cash + alloc.alternatives;
  return {
    ...alloc,
    equity: (alloc.equity / sum) * 100,
    fixedIncome: (alloc.fixedIncome / sum) * 100,
    cash: (alloc.cash / sum) * 100,
    alternatives: (alloc.alternatives / sum) * 100,
  };
}

export function adjustForMacroConditions(
  baseAllocation: Allocation,
  macro: any,
  marketSignal: any
): Allocation {
  let adjusted = { ...baseAllocation };
  
  if (macro.vixIndex.current > baseAllocation.riskTier.maxVIX) {
    adjusted.equity -= baseAllocation.riskTier.vixAdjustment;
    adjusted.cash += baseAllocation.riskTier.vixAdjustment * 0.5;
    adjusted.fixedIncome += baseAllocation.riskTier.vixAdjustment * 0.5;
  }
  
  if (macro.inflationRate.current > 4) {
    adjusted.alternatives += 5;
    adjusted.fixedIncome -= 5;
  }
  
  if (macro.bondYields.spread < 0) {
    adjusted.fixedIncome += 10;
    adjusted.equity -= 10;
  }
  
  if (marketSignal.momentum.score > 70 && marketSignal.breadth.advance_decline_ratio > 1.5) {
    adjusted.equity += 5;
    adjusted.cash -= 5;
  }
  
  if (marketSignal.breadth.advance_decline_ratio < 1) {
    adjusted.alternatives += 3;
    adjusted.equity -= 3;
  }
  
  return normalized(adjusted);
}
