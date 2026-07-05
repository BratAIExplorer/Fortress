export function calculateConfidence(
  macro: any,
  intelligence: any,
  allocationConsistency: number
): number {
  let confidence = 50;
  
  if (macro.riskAssessment === "low" && intelligence.sentiment?.confidence > 70) {
    confidence += 25;
  } else if (macro.riskAssessment === "high" && intelligence.sentiment?.confidence > 70) {
    confidence += 15;
  }
  
  if (intelligence.breadth?.advance_decline_ratio > 1.5) {
    confidence += 10;
  }
  
  if (allocationConsistency > 0.8) {
    confidence += 15;
  } else if (allocationConsistency < 0.5) {
    confidence -= 15;
  }
  
  return Math.min(100, Math.max(40, confidence));
}
