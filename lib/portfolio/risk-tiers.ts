export interface RiskTier {
  equityAllocation: number;
  fixedIncomeAllocation: number;
  cashAllocation: number;
  alternatives: number;
  maxVIX: number;
  pickCount: number;
  vixAdjustment: number;
}

export const riskTiers: Record<string, RiskTier> = {
  conservative: {
    equityAllocation: 40,
    fixedIncomeAllocation: 50,
    cashAllocation: 10,
    alternatives: 0,
    maxVIX: 25,
    pickCount: 5,
    vixAdjustment: -10
  },
  balanced: {
    equityAllocation: 60,
    fixedIncomeAllocation: 30,
    cashAllocation: 10,
    alternatives: 0,
    maxVIX: 30,
    pickCount: 8,
    vixAdjustment: -5
  },
  aggressive: {
    equityAllocation: 80,
    fixedIncomeAllocation: 10,
    cashAllocation: 5,
    alternatives: 5,
    maxVIX: 40,
    pickCount: 12,
    vixAdjustment: 0
  }
};
