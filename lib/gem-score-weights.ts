// ponytail: Adjustable GEM SCORE weights per range
// Multipliers applied to confidence scores based on historical performance
// 1.0 = baseline (no adjustment), 0.9 = -10%, 1.1 = +10%, etc.

export interface GemScoreWeights {
  "80-100%": number;
  "60-79%": number;
  "40-59%": number;
  "0-39%": number;
}

// Default weights: no adjustment (baseline)
export const DEFAULT_WEIGHTS: GemScoreWeights = {
  "80-100%": 1.0,
  "60-79%": 1.0,
  "40-59%": 1.0,
  "0-39%": 1.0,
};

// Adjusted weights (Phase 6.2): based on win rate recommendations
// These will be updated based on A/B test results
export const ADJUSTED_WEIGHTS: GemScoreWeights = {
  "80-100%": 1.0, // Adjust when enough data
  "60-79%": 1.0,
  "40-59%": 1.0,
  "0-39%": 1.0,
};

/**
 * Get the weight multiplier for a given GEM SCORE
 * Used to adjust confidence scores based on historical performance
 */
export function getWeightForScore(gemScore: number, weights: GemScoreWeights = DEFAULT_WEIGHTS): number {
  if (gemScore >= 80 && gemScore <= 100) return weights["80-100%"];
  if (gemScore >= 60 && gemScore <= 79) return weights["60-79%"];
  if (gemScore >= 40 && gemScore <= 59) return weights["40-59%"];
  return weights["0-39%"];
}

/**
 * Apply weight adjustment to a GEM SCORE confidence value
 * Clamps result to 0-100 range to maintain valid confidence
 */
export function applyWeightAdjustment(gemScore: number, multiplier: number): number {
  const adjusted = gemScore * multiplier;
  return Math.max(0, Math.min(100, adjusted));
}

/**
 * Generate adjusted weights from recommendations
 * Safe gradual rollout: max 15% adjustment per range
 */
export function generateAdjustedWeights(
  recommendations: Array<{
    range: string;
    adjustment: "UPWEIGHT" | "DOWNWEIGHT" | "MAINTAIN";
    adjustmentPct: number;
    currentWinRate?: number | null;
  }>
): GemScoreWeights {
  const weights = { ...DEFAULT_WEIGHTS };

  for (const rec of recommendations) {
    const range = rec.range as keyof GemScoreWeights;
    if (!(range in weights)) continue;

    // Safe adjustment: clamp to ±15% max
    const clampedPct = Math.max(-15, Math.min(15, rec.adjustmentPct));
    const multiplier = 1 + clampedPct / 100;

    weights[range] = parseFloat(multiplier.toFixed(2));
  }

  return weights;
}
