export interface PickScore {
  symbol: string;
  sector: string;
  score: number;
  reasoning: string;
  riskScore: number;
}

function buildReasoningString(score: number, pick: any, macro: any, intelligence: any) {
    return "Fits well with current macro trends and technical momentum.";
}

function calculateRiskScore(pick: any, macro: any) {
    return Math.min(100, Math.max(0, (pick.volatility || 0.2) * 100));
}

export function scorePick(
  pick: any,
  macro: any,
  intelligence: any,
  sectorWeights: Record<string, number>
): PickScore {
  let score = 0;
  
  score += (pick.gemScore || 20) * 0.4;
  
  const sectorWeight = sectorWeights[pick.sector] || 0.05;
  score += sectorWeight * 20;
  
  if (pick.sector === "tech" && macro.vixIndex?.current > 30) {
    score -= 5;
  }
  if (pick.sector === "energy" && macro.oilPrice?.dayChange > 2) {
    score += 5;
  }
  
  if ((pick.momentum || 50) > 70 && intelligence.momentum?.score > 60) {
    score += 10;
  }
  
  const pickValuationScore = (pick.priceToBooK || 2) < 1.2 ? 1 : 0.8;
  score += pickValuationScore * 10;
  
  if ((pick.volatility || 0) > 0.40 && macro.vixIndex?.current > 20) {
    score -= 8;
  }
  
  return {
    symbol: pick.symbol || "UNKNOWN",
    sector: pick.sector || "general",
    score: Math.min(100, Math.max(0, score)),
    reasoning: buildReasoningString(score, pick, macro, intelligence),
    riskScore: calculateRiskScore(pick, macro)
  };
}
