import { riskTiers } from "./risk-tiers";
import { adjustForMacroConditions } from "./macro-adjustments";
import { calculateSectorWeights } from "./sector-weights";
import { scorePick } from "./pick-scoring";
import { calculateConfidence } from "./confidence";

export function determineHorizon(macro: any, intelligence: any) {
    return "3-5 years";
}

export function buildRationale(macro: any, intelligence: any, allocation: any) {
    return "Based on your risk profile and current market conditions, this allocation aims to balance growth while mitigating downside.";
}

export function generateActions(macro: any, intelligence: any, allocation: any) {
    return ["Monitor macro VIX", "Diversify away from overvalued sectors"];
}

export function generateWarnings(macro: any, intelligence: any) {
    return ["High VIX level requires caution with tech stocks"];
}

export async function generatePortfolioRecommendation(
  input: any,
  macro: any,
  intelligence: any
) {
  // Step 1: Risk Tier
  const tierName = input.riskTolerance || "balanced";
  const tier = riskTiers[tierName] || riskTiers["balanced"];
  
  const baseAllocation = {
      equity: tier.equityAllocation,
      fixedIncome: tier.fixedIncomeAllocation,
      cash: tier.cashAllocation,
      alternatives: tier.alternatives,
      riskTier: tier
  };
  
  // Step 2: Macro Adjustments
  const allocation = adjustForMacroConditions(baseAllocation, macro, intelligence);
  
  // Step 3: Sector weighting
  const sectorWeights = calculateSectorWeights(input.sectorPreferences || [], macro, intelligence, allocation.equity);
  
  // Step 4: Pick scoring
  const mockPicks = input.recentScanResults || [
      {symbol: "RELIANCE.NS", sector: "energy", gemScore: 35, momentum: 75, priceToBooK: 1.1},
      {symbol: "INFY.NS", sector: "tech", gemScore: 30, momentum: 60, priceToBooK: 2.1},
      {symbol: "HDFCBANK.NS", sector: "finance", gemScore: 38, momentum: 80, priceToBooK: 1.5},
  ];
  const scoredPicks = mockPicks.map((p: any) => scorePick(p, macro, intelligence, sectorWeights));
  
  // Step 5: Confidence
  const confidence = calculateConfidence(macro, intelligence, 0.9);
  
  // Step 6: Assemble
  return {
    recommendation: {
      allocation: {
        equity: allocation.equity,
        fixedIncome: allocation.fixedIncome,
        cash: allocation.cash,
        alternatives: allocation.alternatives
      },
      rationale: buildRationale(macro, intelligence, allocation),
      confidence,
      timeHorizon: determineHorizon(macro, intelligence)
    },
    topPicks: scoredPicks.sort((a: any, b: any) => b.score - a.score).slice(0, 8).map((pick: any) => ({
      ...pick,
      allocationPercent: parseFloat(((allocation.equity / 100) * (pick.score / 100)).toFixed(2))
    })),
    macroContext: {
      vixLevel: macro.vixIndex?.current < 15 ? "low" : macro.vixIndex?.current < 25 ? "medium" : "high",
      marketMomentum: intelligence.momentum?.score > 60 ? "positive" : intelligence.momentum?.score > 40 ? "neutral" : "negative",
      dominantTrend: intelligence.sectorRotation?.leadingSector || "tech"
    },
    suggestedActions: generateActions(macro, intelligence, allocation),
    riskWarnings: generateWarnings(macro, intelligence)
  };
}
