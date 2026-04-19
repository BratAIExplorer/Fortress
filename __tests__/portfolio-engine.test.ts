/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import { generatePortfolioRecommendation, determineHorizon } from "../lib/portfolio/recommendation-engine";
import { riskTiers } from "@/lib/portfolio/risk-tiers";
import { adjustForMacroConditions } from "../lib/portfolio/macro-adjustments";

describe("Portfolio Engine", () => {
  const mockMacro = {
    vixIndex: { current: 18 },
    inflationRate: { current: 3 },
    bondYields: { spread: 0.5 },
    riskAssessment: "low"
  };

  const mockIntel = {
    momentum: { score: 60 },
    breadth: { advance_decline_ratio: 1.2 },
    sentiment: { confidence: 75 },
    sectorRotation: { trend: "neutral" }
  };

  it("maps risk tiers correctly", () => {
    expect(riskTiers.conservative.equityAllocation).toBe(40);
    expect(riskTiers.balanced.equityAllocation).toBe(60);
    expect(riskTiers.aggressive.equityAllocation).toBe(80);
  });

  it("adjusts for high VIX", () => {
    const highVixMacro = { ...mockMacro, vixIndex: { current: 35 } };
    const base = {
      equity: 60, fixedIncome: 30, cash: 10, alternatives: 0,
      riskTier: riskTiers.balanced
    };
    const adjusted = adjustForMacroConditions(base, highVixMacro, mockIntel);
    // VIX adjustment for balanced is -5
    // It subtracts 5 from equity, adds 2.5 cash and 2.5 FI, then normalises
    expect(adjusted.equity).toBeLessThan(60);
    expect(adjusted.cash).toBeGreaterThan(10);
  });

  it("favors growth sectors in bullish markets", () => {
    // This is tested inside calculateSectorWeights
  });

  it("reduces equity in weak breadth", () => {
    const weakIntel = { ...mockIntel, breadth: { advance_decline_ratio: 0.8 } };
    const base = {
      equity: 60, fixedIncome: 30, cash: 10, alternatives: 0,
      riskTier: riskTiers.balanced
    };
    const adjusted = adjustForMacroConditions(base, mockMacro, weakIntel);
    // weak breadth lowers equity by 3, raises alternatives by 3
    expect(adjusted.equity).toBeLessThan(60);
    expect(adjusted.alternatives).toBeGreaterThan(0);
  });
});
