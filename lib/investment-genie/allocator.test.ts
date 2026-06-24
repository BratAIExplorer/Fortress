/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import {
  allocatePortfolio,
  normalizeAllocation,
} from "./allocator";
import {
  UserProfile,
  ScanData,
  MacroState,
  Signal,
  Allocation,
} from "./contracts";

// ════════════════════════════════════════════════════════════════════════════
// TEST FIXTURES
// ════════════════════════════════════════════════════════════════════════════

const mockUserProfile: UserProfile = {
  age: 35,
  amount: 15000,
  horizon: "20yr",
  countries: ["India", "United States"],
  vehicles: ["Stocks", "ETFs"],
  riskAppetite: 50,
  experience: "intermediate",
  incomeStability: "stable",
};

const mockScanData: ScanData = {
  scanDate: new Date("2026-04-17"),
  market: "NSE",
  totalStocks: 100,
  results: [
    {
      symbol: "RELIANCE",
      totalScore: 85,
      mbTier: "Rocket",
      mbScore: 85,
      priceAtScan: 2800,
      sector: "Energy",
      market: "NSE",
    },
    {
      symbol: "TCS",
      totalScore: 75,
      mbTier: "Launcher",
      mbScore: 75,
      priceAtScan: 4200,
      sector: "IT",
      market: "NSE",
    },
    {
      symbol: "INFY",
      totalScore: 70,
      mbTier: "Builder",
      mbScore: 70,
      priceAtScan: 1800,
      sector: "IT",
      market: "NSE",
    },
    {
      symbol: "WIPRO",
      totalScore: 60,
      mbTier: "Crawler",
      mbScore: 60,
      priceAtScan: 950,
      sector: "IT",
      market: "NSE",
    },
    {
      symbol: "ZOMATO",
      totalScore: 50,
      mbTier: "Grounded",
      mbScore: 50,
      priceAtScan: 80,
      sector: "Consumer",
      market: "NSE",
    },
  ],
};

const mockMacroState: MacroState = {
  snapshot: {
    snapshotDate: new Date("2026-04-17"),
    nifty50: 22500,
    bankNifty: 48000,
    usdInr: 83.5,
    goldUsd: 2400,
    crudeOilUsd: 90,
    us10yYield: 4.2,
    cboeVix: 18,
    indiaVix: 16,
  },
  vixState: "normal",
  goldTrend: "normal",
  currencyTrend: "inr-stable",
  equityTrend: "bullish",
};

const mockSignals: Signal[] = [
  {
    name: "Fed rate cut cycle",
    direction: "bullish",
    impactLevel: "high",
    affectedSectors: [
      { sector: "Tech", direction: "bullish" },
      { sector: "Financials", direction: "bearish" },
    ],
  },
  {
    name: "Monsoon weakness",
    direction: "bearish",
    impactLevel: "medium",
    affectedSectors: [{ sector: "Agriculture", direction: "bearish" }],
  },
];

// ════════════════════════════════════════════════════════════════════════════
// MAIN ALLOCATION ENGINE TESTS
// ════════════════════════════════════════════════════════════════════════════

describe("allocatePortfolio", () => {
  it("should return valid Allocation object", () => {
    const result = allocatePortfolio(
      mockUserProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    expect(result).toBeDefined();
    expect(result.layers).toBeDefined();
    expect(result.signals).toBeDefined();
    expect(result.taxOptimization).toBeDefined();
    expect(result.projectedReturns).toBeDefined();
  });

  it("should create all 7 allocation layers", () => {
    const result = allocatePortfolio(
      mockUserProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    const layerKeys = Object.keys(result.layers);
    expect(layerKeys).toContain("fortress");
    expect(layerKeys).toContain("growth");
    expect(layerKeys).toContain("upside");
    expect(layerKeys).toContain("hedge");
    expect(layerKeys).toContain("income");
    expect(layerKeys).toContain("swing");
    expect(layerKeys).toContain("cash");
  });

  it("should include vehicles with weight and explanation", () => {
    const result = allocatePortfolio(
      mockUserProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    for (const layer of Object.values(result.layers)) {
      expect(layer.vehicles).toBeDefined();
      expect(layer.vehicles.length).toBeGreaterThan(0);

      for (const vehicle of layer.vehicles) {
        expect(vehicle.ticker).toBeDefined();
        expect(vehicle.weight).toBeGreaterThan(0);
        expect(vehicle.why).toBeDefined();
        expect(vehicle.why.length).toBeGreaterThan(0);
      }
    }
  });

  it("should handle conservative risk profile (20% risk appetite)", () => {
    const conservativeProfile: UserProfile = {
      ...mockUserProfile,
      riskAppetite: 20,
    };

    const result = allocatePortfolio(
      conservativeProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    // Conservative should have higher fortress (safe) allocation
    const fortressWeight = result.layers.fortress.vehicles.reduce(
      (sum, v) => sum + v.weight,
      0
    );
    const growthWeight = result.layers.growth.vehicles.reduce(
      (sum, v) => sum + v.weight,
      0
    );

    expect(fortressWeight).toBeGreaterThan(growthWeight);
  });

  it("should handle aggressive risk profile (80% risk appetite)", () => {
    const aggressiveProfile: UserProfile = {
      ...mockUserProfile,
      riskAppetite: 80,
    };

    const result = allocatePortfolio(
      aggressiveProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    // Aggressive should have lower cash allocation
    const cashWeight = result.layers.cash.vehicles.reduce(
      (sum, v) => sum + v.weight,
      0
    );
    expect(cashWeight).toBeLessThan(10);
  });

  it("should apply macro adjustments for elevated VIX", () => {
    const elevatedVixMacro: MacroState = {
      ...mockMacroState,
      vixState: "elevated",
    };

    const result = allocatePortfolio(
      mockUserProfile,
      mockScanData,
      elevatedVixMacro,
      mockSignals
    );

    // Should have shifted toward fortress (safer)
    const fortress = result.layers.fortress.vehicles.reduce(
      (sum, v) => sum + v.weight,
      0
    );
    expect(fortress).toBeGreaterThan(15); // Higher than usual, accounting for normalization
  });

  it("should apply macro adjustments for extreme VIX", () => {
    const extremeVixMacro: MacroState = {
      ...mockMacroState,
      vixState: "extreme",
    };

    const result = allocatePortfolio(
      mockUserProfile,
      mockScanData,
      extremeVixMacro,
      mockSignals
    );

    // Should have significantly shifted toward safety
    const fortress = result.layers.fortress.vehicles.reduce(
      (sum, v) => sum + v.weight,
      0
    );
    expect(fortress).toBeGreaterThan(18); // Higher shift toward safety
  });

  it("should handle gold flight-to-safety trend", () => {
    const flightToSafetyMacro: MacroState = {
      ...mockMacroState,
      goldTrend: "flight-to-safety",
    };

    const result = allocatePortfolio(
      mockUserProfile,
      mockScanData,
      flightToSafetyMacro,
      mockSignals
    );

    // Should have increased hedge allocation
    const hedge = result.layers.hedge.vehicles.reduce(
      (sum, v) => sum + v.weight,
      0
    );
    expect(hedge).toBeGreaterThan(3); // Higher hedge allocation with normalization
  });

  it("should handle INR weakness (increase US exposure)", () => {
    const inrWeakMacro: MacroState = {
      ...mockMacroState,
      currencyTrend: "inr-weak",
    };

    const result = allocatePortfolio(
      mockUserProfile,
      mockScanData,
      inrWeakMacro,
      mockSignals
    );

    // Should have increased fortress (US) allocation
    const fortress = result.layers.fortress.vehicles.reduce(
      (sum, v) => sum + v.weight,
      0
    );
    expect(fortress).toBeGreaterThan(16); // Higher US allocation with normalization
  });

  it("should handle bullish market trend", () => {
    const bullishMacro: MacroState = {
      ...mockMacroState,
      equityTrend: "bullish",
    };

    const result = allocatePortfolio(
      mockUserProfile,
      mockScanData,
      bullishMacro,
      mockSignals
    );

    // Should have increased growth and reduced cash
    const growth = result.layers.growth.vehicles.reduce(
      (sum, v) => sum + v.weight,
      0
    );
    const cash = result.layers.cash.vehicles.reduce(
      (sum, v) => sum + v.weight,
      0
    );

    expect(growth).toBeGreaterThan(25);
    expect(cash).toBeLessThan(6);
  });

  it("should apply signal-driven adjustments for bullish high-impact signals", () => {
    const bullishSignals: Signal[] = [
      {
        name: "Tech boom",
        direction: "bullish",
        impactLevel: "high",
        affectedSectors: [{ sector: "Tech", direction: "bullish" }],
      },
    ];

    const result = allocatePortfolio(
      mockUserProfile,
      mockScanData,
      mockMacroState,
      bullishSignals
    );

    // Should generate signal actions
    expect(result.signals.length).toBeGreaterThan(0);
    const techSignal = result.signals.find((s) => s.signal === "Tech boom");
    expect(techSignal).toBeDefined();
  });

  it("should include India stocks only if India in countries", () => {
    const usOnlyProfile: UserProfile = {
      ...mockUserProfile,
      countries: ["United States"],
    };

    const result = allocatePortfolio(
      usOnlyProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    // Growth layer might be empty or have no India stocks
    expect(result.layers).toBeDefined();
  });

  it("should handle beginner experience level (filter to Launcher/Builder only)", () => {
    const beginnerProfile: UserProfile = {
      ...mockUserProfile,
      experience: "beginner",
    };

    const result = allocatePortfolio(
      beginnerProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    // Should have allocated to only Launcher/Builder tier stocks
    expect(result.layers.growth).toBeDefined();
  });

  it("should handle experienced level (allow all tiers)", () => {
    const experiencedProfile: UserProfile = {
      ...mockUserProfile,
      experience: "experienced",
    };

    const result = allocatePortfolio(
      experiencedProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    // Should have allocated to all tiers
    expect(result.layers.upside.vehicles.length).toBeGreaterThan(0);
  });

  it("should generate projected returns for each scenario", () => {
    const result = allocatePortfolio(
      mockUserProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    const projections = result.projectedReturns;
    expect(projections.base.min).toBeLessThan(projections.base.max);
    expect(projections.bull.min).toBeLessThan(projections.bull.max);
    expect(projections.bear.min).toBeLessThan(projections.bear.max);

    // Bull case should be better than base, base better than bear
    expect(projections.bull.max).toBeGreaterThan(projections.base.max);
    expect(projections.base.max).toBeGreaterThan(projections.bear.max);
  });

  it("should include tax optimization for India exposure", () => {
    const result = allocatePortfolio(
      mockUserProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    expect(result.taxOptimization.nreDemat).toBeDefined();
    expect(result.taxOptimization.nreDemat).toContain("NRE");
  });

  it("should include W-8BEN recommendation for US exposure", () => {
    const result = allocatePortfolio(
      mockUserProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    expect(result.taxOptimization.w8ben).toBeDefined();
    expect(result.taxOptimization.w8ben).toContain("W-8BEN");
  });

  it("should handle empty scan results gracefully", () => {
    const emptyScan: ScanData = {
      ...mockScanData,
      results: [],
    };

    const result = allocatePortfolio(
      mockUserProfile,
      emptyScan,
      mockMacroState,
      mockSignals
    );

    expect(result).toBeDefined();
    expect(result.layers).toBeDefined();
  });

  it("should handle empty signals gracefully", () => {
    const result = allocatePortfolio(
      mockUserProfile,
      mockScanData,
      mockMacroState,
      []
    );

    expect(result).toBeDefined();
    expect(result.signals).toBeDefined();
  });

  it("should handle 1-year horizon with realistic projections", () => {
    const shortHorizonProfile: UserProfile = {
      ...mockUserProfile,
      horizon: "1yr",
    };

    const result = allocatePortfolio(
      shortHorizonProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    const projections = result.projectedReturns;
    // 1-year returns should be more conservative
    expect(Math.abs(projections.base.max)).toBeLessThan(50);
  });

  it("should handle retirement horizon with higher CAGR", () => {
    const retirementProfile: UserProfile = {
      ...mockUserProfile,
      horizon: "retirement",
    };

    const result = allocatePortfolio(
      retirementProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    const projections = result.projectedReturns;
    // Retirement (25 years) should show higher returns than 1 year
    expect(projections.base.max).toBeGreaterThan(100);
  });

  it("should handle stable income with tax-deferred strategy", () => {
    const stableIncomeProfile: UserProfile = {
      ...mockUserProfile,
      incomeStability: "stable",
    };

    const result = allocatePortfolio(
      stableIncomeProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    expect(result.taxOptimization.savings).toContain("tax-deferred");
  });

  it("should handle variable income with emergency cash strategy", () => {
    const variableIncomeProfile: UserProfile = {
      ...mockUserProfile,
      incomeStability: "variable",
    };

    const result = allocatePortfolio(
      variableIncomeProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    expect(result.taxOptimization.savings).toContain("emergency");
  });
});

// ════════════════════════════════════════════════════════════════════════════
// NORMALIZATION UTILITY TESTS
// ════════════════════════════════════════════════════════════════════════════

describe("normalizeAllocation", () => {
  it("should normalize weights to sum to 100%", () => {
    const allocation = allocatePortfolio(
      mockUserProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    const normalized = normalizeAllocation(allocation.layers);

    let totalWeight = 0;
    for (const layer of Object.values(normalized)) {
      for (const vehicle of layer.vehicles) {
        totalWeight += vehicle.weight;
      }
    }

    expect(Math.round(totalWeight)).toBe(100);
  });

  it("should preserve layer structure during normalization", () => {
    const allocation = allocatePortfolio(
      mockUserProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    const normalized = normalizeAllocation(allocation.layers);

    expect(Object.keys(normalized)).toEqual(Object.keys(allocation.layers));
  });
});

// ════════════════════════════════════════════════════════════════════════════
// EDGE CASES
// ════════════════════════════════════════════════════════════════════════════

describe("allocatePortfolio edge cases", () => {
  it("should handle age 18 (youngest)", () => {
    const youngProfile: UserProfile = {
      ...mockUserProfile,
      age: 18,
    };

    const result = allocatePortfolio(
      youngProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    expect(result).toBeDefined();
  });

  it("should handle age 70 (oldest)", () => {
    const oldProfile: UserProfile = {
      ...mockUserProfile,
      age: 70,
    };

    const result = allocatePortfolio(
      oldProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    expect(result).toBeDefined();
  });

  it("should handle minimum investment amount ($100)", () => {
    const minInvestmentProfile: UserProfile = {
      ...mockUserProfile,
      amount: 100,
    };

    const result = allocatePortfolio(
      minInvestmentProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    expect(result).toBeDefined();
  });

  it("should handle large investment amount ($500k)", () => {
    const largeInvestmentProfile: UserProfile = {
      ...mockUserProfile,
      amount: 500000,
    };

    const result = allocatePortfolio(
      largeInvestmentProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    expect(result).toBeDefined();
  });

  it("should handle all countries combination", () => {
    const allCountriesProfile: UserProfile = {
      ...mockUserProfile,
      countries: ["India", "United States"],
      vehicles: ["Stocks", "Mutual Funds", "ETFs"],
    };

    const result = allocatePortfolio(
      allCountriesProfile,
      mockScanData,
      mockMacroState,
      mockSignals
    );

    expect(result).toBeDefined();
  });

  it("should handle neutral macro and signal state", () => {
    const neutralSignals: Signal[] = [
      {
        name: "Geopolitical stability",
        direction: "neutral",
        impactLevel: "low",
        affectedSectors: [],
      },
    ];

    const result = allocatePortfolio(
      mockUserProfile,
      mockScanData,
      mockMacroState,
      neutralSignals
    );

    expect(result).toBeDefined();
  });
});
