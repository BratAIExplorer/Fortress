export interface FundamentalsBadge {
  pe: number | null;
  debtToEquity: number | null;
  revGrowth: number | null;
}

// Lower PE/D-E is better (cheaper, less leveraged); higher rev growth is better.
// Each sub-score is 1 (worst) to 5 (best); missing fields are excluded from the average.
function peScore(pe: number): number {
  if (pe <= 15) return 5;
  if (pe <= 25) return 4;
  if (pe <= 40) return 3;
  if (pe <= 60) return 2;
  return 1;
}
function debtScore(de: number): number {
  if (de <= 25) return 5;
  if (de <= 50) return 4;
  if (de <= 100) return 3;
  if (de <= 250) return 2;
  return 1;
}
function growthScore(rev: number): number {
  if (rev >= 0.4) return 5;
  if (rev >= 0.25) return 4;
  if (rev >= 0.15) return 3;
  if (rev >= 0) return 2;
  return 1;
}

/**
 * Composite 1-5 fundamentals score, averaged across whichever fields are
 * available (rounded to nearest whole number). Partial data (e.g. only PE +
 * D/E) scores on just those fields. No fields at all → null, not a fake 0.
 */
export function scoreFundamentals(f: FundamentalsBadge | null): number | null {
  if (!f) return null;
  const parts: number[] = [];
  if (f.pe != null) parts.push(peScore(f.pe));
  if (f.debtToEquity != null) parts.push(debtScore(f.debtToEquity));
  if (f.revGrowth != null) parts.push(growthScore(f.revGrowth));
  if (parts.length === 0) return null;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}
