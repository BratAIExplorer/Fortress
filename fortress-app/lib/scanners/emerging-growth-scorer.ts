/**
 * Emerging Growth Module Scorer
 *
 * Scoring: High-growth quality companies with expanding margins
 * - Growth: 25%+ revenue CAGR (30 points max)
 * - Quality: ROCE 15%+ (25 points max)
 * - Valuation: P/E 12-20 (25 points max)
 * - Margin Trend: 100+ bps expansion (20 points max)
 *
 * Target: ZEN (6.8-7.0), KAYNES (6.9-7.1), JUPITER (7.0-7.2)
 */

export interface Stock {
  symbol: string;
  name: string;
  growth_rate: number;     // 0.25 = 25% YoY growth
  roce: number;             // 0.15 = 15% ROCE
  pe_ratio: number;         // Current P/E
  margin_delta: number;     // In basis points (100 = 1%)
  market_cap_crores: number;
  sector: string;
  qs_score?: number;
}

const EMERGING_GROWTH_CONFIG = {
  // Threshold 1: P/E Range
  pe_min: 12,
  pe_max: 20,

  // Threshold 2: Growth Rate Minimum
  growth_min: 0.25,  // 25% minimum

  // Threshold 3: Quality (ROCE)
  roce_min: 0.15,    // 15% minimum

  // Threshold 4: Margin Expansion
  margin_expansion_min_bps: 100,  // 1%

  // Market cap constraints
  market_cap_min_crores: 300,
  market_cap_max_crores: 10000,

  // Minimum QS score to include
  min_qs_score: 6.5,

  // Top N to return
  top_n: 10,
};

/**
 * Calculate QS score for emerging growth stock (0-10 scale)
 * Scores: Growth (0-30) + ROCE (0-25) + P/E (0-25) + Margin (0-20) = 0-100 → 0-10
 */
export function scoreEmergingGrowth(stock: Stock): number {
  let totalPoints = 0;

  // Growth Rate Score (0-30 points max)
  // Minimum: 25% (0 points), Maximum: 40%+ (30 points)
  if (stock.growth_rate >= 0.40) {
    totalPoints += 30;
  } else if (stock.growth_rate >= 0.30) {
    totalPoints += 25;
  } else if (stock.growth_rate >= 0.25) {
    totalPoints += 20;
  }
  // Below 25% = 0 points (fail minimum threshold)

  // Quality Score - ROCE (0-25 points max)
  // Minimum: 15% (0 points), Good: 15-20% (20 pts), Best: 20%+ (25 pts)
  if (stock.roce >= 0.20) {
    totalPoints += 25;
  } else if (stock.roce >= 0.15) {
    totalPoints += 20;
  }
  // Below 15% = 0 points (fail minimum threshold)

  // Valuation Score - P/E Ratio (0-25 points max)
  // Excellent: ≤15 (25 pts), Good: 15-18 (20 pts), Fair: 18-20 (15 pts), Expensive: >20 (0 pts)
  if (stock.pe_ratio <= 15) {
    totalPoints += 25;
  } else if (stock.pe_ratio <= 18) {
    totalPoints += 20;
  } else if (stock.pe_ratio <= 20) {
    totalPoints += 15;
  }
  // Above 20 = 0 points (growth premium too high)

  // Margin Trend Score (0-20 points max)
  // Exceptional: 200+ bps (20 pts), Good: 100-200 bps (15 pts), Stable: 0-100 bps (10 pts), Negative (0 pts)
  if (stock.margin_delta >= 200) {
    totalPoints += 20;
  } else if (stock.margin_delta >= 100) {
    totalPoints += 15;
  } else if (stock.margin_delta >= 0) {
    totalPoints += 10;
  }
  // Below 0 (margin compression) = 0 points

  // Convert 0-100 points to 0-10 QS scale
  return totalPoints / 10;
}

/**
 * Filter and rank emerging growth stocks
 * Returns top 10 curated stocks scoring 6.5+ QS
 */
export function getEmergingGrowthStocks(stocks: Stock[]): Stock[] {
  return stocks
    .map(stock => ({
      ...stock,
      qs_score: scoreEmergingGrowth(stock)
    }))
    .filter(stock =>
      stock.qs_score >= EMERGING_GROWTH_CONFIG.min_qs_score &&
      stock.market_cap_crores >= EMERGING_GROWTH_CONFIG.market_cap_min_crores &&
      stock.market_cap_crores <= EMERGING_GROWTH_CONFIG.market_cap_max_crores
    )
    .sort((a, b) => (b.qs_score || 0) - (a.qs_score || 0))
    .slice(0, EMERGING_GROWTH_CONFIG.top_n);
}

/**
 * Backtest: Did this module catch stocks pre-breakout?
 *
 * TODO (Week 1, Day 2):
 * - Verify ZEN scored >6.5 on early April (before 50%+ rally)
 * - Verify KAYNES scored >6.5 on late April (before 40%+ rally)
 * - Verify JUPITER scored >6.5 on early May (before 30%+ rally)
 * - Document first occurrence date for each stock
 */
export const BACKTEST_EXPECTATIONS = {
  ZEN: {
    expected_qs: 8.5,
    expected_first_appearance: '2026-04-07',  // Early April
    actual_breakout: '2026-04-10',
  },
  KAYNES: {
    expected_qs: 9.5,
    expected_first_appearance: '2026-04-28',  // Late April
    actual_breakout: '2026-05-05',
  },
  JUPITER: {
    expected_qs: 7.5,
    expected_first_appearance: '2026-05-03',  // Early May
    actual_breakout: '2026-05-07',
  },
};
