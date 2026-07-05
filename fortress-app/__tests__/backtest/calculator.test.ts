/**
 * Unit Tests for Backtest Calculator
 *
 * Validates all mathematical calculations
 * Run: npm run test -- calculator.test.ts
 *
 * Critical: These tests ensure conviction scores are mathematically sound
 */

import { describe, it, expect } from "@jest/globals";
import {
  calculateCAGR,
  calculateSharpe,
  calculateMaxDrawdown,
  calculateWinRate,
  getPriceReturns,
  calculateBacktest,
  formatBacktestForDB,
} from "@/lib/backtest/calculator";

describe("Backtest Calculator", () => {
  // ========== CAGR Tests ==========

  describe("calculateCAGR", () => {
    it("should calculate CAGR correctly", () => {
      // Example: $100 → $430 in 10 years = 16.5% CAGR
      const cagr = calculateCAGR(100, 430, 10);
      expect(cagr).toBeCloseTo(0.165, 2);
    });

    it("should handle 1-year return", () => {
      // $100 → $120 in 1 year = 20% CAGR
      const cagr = calculateCAGR(100, 120, 1);
      expect(cagr).toBeCloseTo(0.2, 2);
    });

    it("should return 0 for invalid inputs", () => {
      expect(calculateCAGR(-100, 200, 5)).toBe(0);
      expect(calculateCAGR(100, 200, 0)).toBe(0);
      expect(calculateCAGR(0, 200, 5)).toBe(0);
    });

    it("should handle stock that loses value", () => {
      // $100 → $50 in 5 years = negative CAGR
      const cagr = calculateCAGR(100, 50, 5);
      expect(cagr).toBeLessThan(0);
      expect(cagr).toBeCloseTo(-0.149, 2); // ~-14.9%
    });
  });

  // ========== Sharpe Ratio Tests ==========

  describe("calculateSharpe", () => {
    it("should calculate Sharpe ratio from daily returns", () => {
      // Create sample returns: mix of positive and negative
      const returns = [
        0.01, 0.02, -0.01, 0.015, 0.005, -0.005, 0.012, 0.008, -0.002, 0.01,
      ];

      const sharpe = calculateSharpe(returns);
      expect(sharpe).toBeGreaterThan(0);
      expect(sharpe).toBeLessThan(5); // Reasonable upper bound
    });

    it("should return 0 for no volatility (all same return)", () => {
      const returns = [0.01, 0.01, 0.01, 0.01];
      const sharpe = calculateSharpe(returns);
      expect(sharpe).toBe(0);
    });

    it("should return 0 for insufficient data", () => {
      expect(calculateSharpe([])).toBe(0);
      expect(calculateSharpe([0.01])).toBe(0);
    });

    it("should favor consistent returns over volatile returns", () => {
      // Low volatility returns
      const steady = [0.001, 0.001, 0.001, 0.001, 0.001];

      // High volatility returns (same average)
      const volatile = [-0.01, 0.02, -0.01, 0.02, 0.01];

      const sharpeSteady = calculateSharpe(steady);
      const sharpeVolatile = calculateSharpe(volatile);

      // Steady returns should have higher (less negative or more positive) Sharpe
      expect(sharpeSteady).toBeGreaterThan(sharpeVolatile);
    });
  });

  // ========== Max Drawdown Tests ==========

  describe("calculateMaxDrawdown", () => {
    it("should calculate max drawdown correctly", () => {
      // Peak at 100, trough at 70, then recovery to 90
      const prices = [100, 105, 95, 70, 80, 90];

      const maxDD = calculateMaxDrawdown(prices);
      expect(maxDD).toBeCloseTo(-0.3, 2); // -30%
    });

    it("should identify peak-to-trough even if not sequential", () => {
      // Peak at 150, drops to 100 later
      const prices = [100, 150, 140, 130, 120, 100, 110];

      const maxDD = calculateMaxDrawdown(prices);
      expect(maxDD).toBeCloseTo(-0.333, 2); // -33.3%
    });

    it("should return 0 for only upward prices", () => {
      const prices = [100, 105, 110, 115, 120];
      expect(calculateMaxDrawdown(prices)).toBe(0);
    });

    it("should handle steep crash", () => {
      // Crash from 100 to 10
      const prices = [100, 50, 25, 10, 15, 20];
      const maxDD = calculateMaxDrawdown(prices);
      expect(maxDD).toBeCloseTo(-0.9, 1); // -90%
    });
  });

  // ========== Win Rate Tests ==========

  describe("calculateWinRate", () => {
    it("should calculate win rate for 5-year period", () => {
      // Create 5 years of data (260 days/year = 1300 days)
      // Years: +10%, +15%, -5%, +8%, +12%
      // Win rate: 4/5 = 80%
      const prices = createPriceData([0.1, 0.15, -0.05, 0.08, 0.12]);

      const winRate = calculateWinRate(prices);
      expect(winRate).toBeCloseTo(80, 0);
    });

    it("should return 0 for insufficient data", () => {
      const prices = [100, 105, 110]; // Only 3 days
      expect(calculateWinRate(prices)).toBe(0);
    });

    it("should be 100 for all positive years", () => {
      const prices = createPriceData([0.1, 0.1, 0.1, 0.1, 0.1]);
      expect(calculateWinRate(prices)).toBe(100);
    });

    it("should be 0 for all negative years", () => {
      const prices = createPriceData([-0.1, -0.1, -0.1, -0.1, -0.1]);
      expect(calculateWinRate(prices)).toBe(0);
    });
  });

  // ========== Price Returns Tests ==========

  describe("getPriceReturns", () => {
    it("should calculate daily returns correctly", () => {
      const prices = [100, 105, 102, 108]; // Returns: 5%, -2.86%, 5.88%

      const returns = getPriceReturns(prices);
      expect(returns.length).toBe(3);
      expect(returns[0]).toBeCloseTo(0.05, 3);
      expect(returns[1]).toBeCloseTo(-0.0286, 3);
      expect(returns[2]).toBeCloseTo(0.0588, 3);
    });

    it("should return empty array for single price", () => {
      expect(getPriceReturns([100])).toEqual([]);
    });
  });

  // ========== Integration Tests ==========

  describe("calculateBacktest", () => {
    it("should calculate all metrics together", () => {
      const prices = createPriceData([0.13, 0.13, 0.13, 0.13, 0.13]); // 13% CAGR

      const result = calculateBacktest(prices);

      expect(result.cagr).toBeCloseTo(0.13, 1);
      expect(result.sharpe).toBeGreaterThan(0);
      expect(result.maxDrawdown).toBeLessThanOrEqual(0);
      expect(result.winRate).toBeGreaterThan(0);
      expect(result.data.startPrice).toBe(100);
      expect(result.data.annualReturns.length).toBeGreaterThan(0);
    });

    it("should throw error for insufficient data", () => {
      expect(() => calculateBacktest([100, 105, 110])).toThrow(
        "Need at least 1 year of price data"
      );
    });

    it("should match real-world example", () => {
      // Healthcare thesis: 13x in 10 years
      // That's ~32.5% CAGR
      const prices = createPriceData([0.325, 0.325, 0.325, 0.325, 0.325]);

      const result = calculateBacktest(prices);
      expect(result.cagr).toBeCloseTo(0.325, 1);
    });
  });

  // ========== Database Format Tests ==========

  describe("formatBacktestForDB", () => {
    it("should format metrics for database storage", () => {
      const result = {
        cagr: 0.13,
        sharpe: 1.25,
        maxDrawdown: -0.25,
        winRate: 80,
        data: {
          startPrice: 100,
          endPrice: 430,
          totalReturn: 3.3,
          stdDeviation: 0.15,
          annualReturns: [],
        },
      };

      const formatted = formatBacktestForDB(result);

      expect(formatted.backtest_5yr_cagr).toBe(13); // 0.13 * 100
      expect(formatted.backtest_5yr_sharpe).toBe(125); // 1.25 * 100
      expect(formatted.backtest_5yr_max_drawdown).toBe(-25); // -0.25 * 100
      expect(formatted.backtest_5yr_win_rate).toBe(80);
    });
  });
});

// ========== Helper Functions ==========

/**
 * Create realistic 5-year price data from annual returns
 *
 * @param annualReturns Array of 5 annual returns (e.g., [0.13, 0.15, -0.05, 0.10, 0.12])
 * @returns Array of ~1300 daily prices
 */
function createPriceData(annualReturns: number[]): number[] {
  const prices: number[] = [100];
  const daysPerYear = 260; // Trading days
  const dailyVolatility = 0.01; // 1% daily volatility

  for (const annualReturn of annualReturns) {
    for (let day = 0; day < daysPerYear; day++) {
      // Random walk with drift toward annual target
      const dayProgress = day / daysPerYear;
      const driftPerDay = annualReturn / daysPerYear;

      // Random component
      const randomChange = (Math.random() - 0.5) * dailyVolatility;

      const lastPrice = prices[prices.length - 1];
      const newPrice = lastPrice * (1 + driftPerDay + randomChange);

      prices.push(newPrice);
    }
  }

  return prices;
}
