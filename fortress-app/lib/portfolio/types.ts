// ─── Shared types for the Portfolio Strategy Tracker ─────────────────────────

export type RiskTier = "aggressive" | "balanced" | "conservative";

export interface Strategy {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  emoji: string;
  riskTier: RiskTier;
  totalCapitalUsd: number;
  targetMultiple: number;
  targetHorizonYears: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StrategyHolding {
  id: string;
  strategyId: string;
  ticker: string;
  name: string;
  targetWeightPct: number;
  unitsHeld: number;
  avgBuyPrice: number;
}

export interface HoldingWithPrice extends StrategyHolding {
  currentPrice: number;
  currentValue: number;
  costBasis: number;
  currentWeightPct: number;
  returnPct: number;
}

export interface RebalanceAction {
  ticker: string;
  name: string;
  action: "buy" | "trim" | "hold";
  currentWeightPct: number;
  targetWeightPct: number;
  driftPct: number;
  amountUsd: number;
  units: number;
}

export interface StrategySnapshot {
  strategy: Strategy;
  totalValue: number;
  totalCostBasis: number;
  totalReturnPct: number;
  needsRebalance: boolean;
}

export interface StrategyDetail extends StrategySnapshot {
  holdings: HoldingWithPrice[];
  actions: RebalanceAction[];
}

export interface UpsertHoldingInput {
  ticker: string;
  name: string;
  targetWeightPct: number;
  unitsHeld: number;
  avgBuyPrice: number;
}
