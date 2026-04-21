import {
  UserProfile,
  ScanData,
  MacroState,
  Signal,
  Allocation,
  AllocationLayer,
  AllocationVehicle,
} from "./contracts";

// ════════════════════════════════════════════════════════════════════════════
// CORE ALLOCATION ENGINE
// ════════════════════════════════════════════════════════════════════════════

/**
 * Generate personalized portfolio allocation based on user profile and market data
 */
export function allocatePortfolio(
  profile: UserProfile,
  scan: ScanData,
  macro: MacroState,
  signals: Signal[]
): Allocation {
  // 1. Initialize base template from risk appetite
  let allocation = initializeTemplate(profile.riskAppetite);

  // 2. Apply macro adjustments
  allocation = applyMacroAdjustments(allocation, macro);

  // 3. Apply signal-driven adjustments
  allocation = applySignalAdjustments(allocation, signals);

  // 4. Filter scan results by experience level
  const investmentUniverse = filterScanByExperience(
    scan.results,
    profile.experience
  );

  // 5. Build allocation layers
  const layers = buildAllocationLayers(
    allocation,
    investmentUniverse,
    profile.countries,
    signals
  );

  // 6. Generate signal-driven actions
  const signalActions = generateSignalActions(signals, allocation);

  // 7. Calculate projections
  const projections = calculateProjections(allocation, profile.horizon);

  // 8. Build tax optimization tips
  const taxOptimization = buildTaxOptimization(profile);

  return {
    layers,
    signals: signalActions,
    taxOptimization,
    projectedReturns: projections,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 1: INITIALIZE BASE TEMPLATE
// ════════════════════════════════════════════════════════════════════════════

interface AllocationTemplate {
  fortress: number; // Safe core (US index ETFs)
  growth: number; // Growth layer (India mid-caps)
  upside: number; // Moonshots
  hedge: number; // Gold, bonds, defensive
  income: number; // Dividend stocks
  swing: number; // Tactical bets
  cash: number; // Emergency buffer
}

function initializeTemplate(riskAppetite: number): AllocationTemplate {
  // Map risk appetite (0-100) to allocation percentages
  // 0 = ultra-conservative (80% safe, 20% growth)
  // 50 = balanced (60% safe, 40% growth)
  // 100 = aggressive (40% safe, 60% growth)

  const conservatism = 100 - riskAppetite; // 0-100 inverse

  return {
    fortress: 40 + (conservatism * 0.3) / 100, // 40-49%
    growth: 25 + ((100 - conservatism) * 0.25) / 100, // 25-35%
    upside: 5 + ((100 - conservatism) * 0.1) / 100, // 5-10%
    hedge: 10 + (conservatism * 0.1) / 100, // 10-15%
    income: 10, // Fixed
    swing: 5 + ((100 - conservatism) * 0.05) / 100, // 5-7%
    cash: 5 + (conservatism * 0.05) / 100, // 5-8%
  };
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 2: APPLY MACRO ADJUSTMENTS
// ════════════════════════════════════════════════════════════════════════════

function applyMacroAdjustments(
  template: AllocationTemplate,
  macro: MacroState
): AllocationTemplate {
  let adjusted = { ...template };

  // VIX elevation: shift toward safety
  if (macro.vixState === "elevated") {
    adjusted.fortress += 5;
    adjusted.growth -= 3;
    adjusted.swing -= 2;
  } else if (macro.vixState === "extreme") {
    adjusted.fortress += 10;
    adjusted.growth -= 5;
    adjusted.upside -= 3;
    adjusted.swing -= 2;
  }

  // Gold trend: flight-to-safety
  if (macro.goldTrend === "flight-to-safety") {
    adjusted.hedge += 3;
    adjusted.swing -= 2;
    adjusted.upside -= 1;
  } else if (macro.goldTrend === "overbought") {
    adjusted.hedge -= 2;
    adjusted.growth += 1;
    adjusted.upside += 1;
  }

  // Currency trend: INR weakness
  if (macro.currencyTrend === "inr-weak") {
    adjusted.fortress += 2; // Increase US exposure
    adjusted.growth -= 2; // Reduce India exposure
  } else if (macro.currencyTrend === "inr-strong") {
    adjusted.growth += 2;
    adjusted.fortress -= 1;
  }

  // Equity trend: market sentiment
  if (macro.equityTrend === "bullish") {
    adjusted.growth += 3;
    adjusted.upside += 2;
    adjusted.cash -= 3;
  } else if (macro.equityTrend === "corrective") {
    adjusted.cash += 3;
    adjusted.upside -= 2;
    adjusted.growth -= 1;
  }

  return adjusted;
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 3: APPLY SIGNAL ADJUSTMENTS
// ════════════════════════════════════════════════════════════════════════════

function applySignalAdjustments(
  template: AllocationTemplate,
  signals: Signal[]
): AllocationTemplate {
  let adjusted = { ...template };

  for (const signal of signals) {
    if (signal.impactLevel === "high") {
      if (signal.direction === "bullish") {
        adjusted.growth += 2;
        adjusted.upside += 1;
        adjusted.cash -= 1;
      } else if (signal.direction === "bearish") {
        adjusted.cash += 2;
        adjusted.upside -= 1;
        adjusted.growth -= 1;
      }
    }
  }

  return adjusted;
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 4: FILTER SCAN RESULTS BY EXPERIENCE
// ════════════════════════════════════════════════════════════════════════════

import type { ScanResult } from "./contracts";

function filterScanByExperience(
  results: ScanResult[],
  experience: "beginner" | "intermediate" | "experienced"
): ScanResult[] {
  if (experience === "beginner") {
    return results.filter(
      (r) => r.mbTier === "Launcher" || r.mbTier === "Builder"
    );
  }

  if (experience === "intermediate") {
    return results.filter((r) => r.mbTier !== "Grounded");
  }

  return results;
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 5: BUILD ALLOCATION LAYERS
// ════════════════════════════════════════════════════════════════════════════

function buildAllocationLayers(
  template: AllocationTemplate,
  investmentUniverse: ScanResult[],
  countries: string[],
  signals: Signal[]
): Record<string, AllocationLayer> {
  const layers: Record<string, AllocationLayer> = {};

  // FORTRESS: Safe core (US index ETFs)
  layers.fortress = {
    name: "🏰 Fortress (Safe Core)",
    vehicles: [
      {
        ticker: "VOO",
        weight: template.fortress * 0.6,
        why: "S&P 500 broad market ETF. Buffett's anchor position.",
      },
      {
        ticker: "QQQ",
        weight: template.fortress * 0.25,
        why: "Nasdaq-100. Tech exposure, higher growth than VOO.",
      },
      {
        ticker: "VXUS",
        weight: template.fortress * 0.15,
        why: "US ex-international equity diversification.",
      },
    ],
    why: `${template.fortress.toFixed(1)}% safe core. US equity barbell absorbs crashes. Repatriable via NRE demat.`,
  };

  // GROWTH: India mid-caps (from scan)
  if (countries.includes("India")) {
    const growthStocks = investmentUniverse
      .filter((s) => s.market === "NSE")
      .slice(0, 5);
    const weightPerStock = growthStocks.length > 0 ? template.growth / growthStocks.length : 0;

    const growthVehicles = growthStocks.map((s) => ({
      ticker: s.symbol,
      weight: weightPerStock,
      why: `NSE ${s.sector}. MB Score: ${s.mbScore}/100. Tier: ${s.mbTier}.`,
    }));

    layers.growth = {
      name: "📈 Growth (India)",
      vehicles: growthVehicles,
      why: `${template.growth.toFixed(1)}% India mid-cap exposure. Highest growth potential. Via NRE demat.`,
    };
  }

  // UPSIDE: Moonshots (Rocket-tier stocks)
  const rocketStocks = investmentUniverse
    .filter((s) => s.mbTier === "Rocket")
    .slice(0, 3);
  const rocketWeight = rocketStocks.length > 0 ? template.upside / rocketStocks.length : 0;

  layers.upside = {
    name: "🚀 Upside (Moonshots)",
    vehicles: rocketStocks.map((s) => ({
      ticker: s.symbol,
      weight: rocketWeight,
      why: `${s.sector}. Rocket-tier (highest growth potential, highest risk).`,
    })),
    why: `${template.upside.toFixed(1)}% allocation to highest-conviction growth. Accept volatility for multi-bagger potential.`,
  };

  // HEDGE: Gold + bonds (defensive)
  layers.hedge = {
    name: "🛡️ Hedge (Defensive)",
    vehicles: [
      {
        ticker: "GLD",
        weight: template.hedge * 0.6,
        why: "Gold ETF. Flight-to-safety during crashes.",
      },
      {
        ticker: "BND",
        weight: template.hedge * 0.4,
        why: "Total bond market. Stable income, low volatility.",
      },
    ],
    why: `${template.hedge.toFixed(1)}% defensive. Negatively correlated with stocks. Protects during crisis.`,
  };

  // INCOME: Dividend aristocrats
  layers.income = {
    name: "💰 Income (Dividends)",
    vehicles: [
      {
        ticker: "SCHD",
        weight: template.income * 0.7,
        why: "US dividend aristocrats. 40+ year dividend growth history.",
      },
      {
        ticker: "DGRO",
        weight: template.income * 0.3,
        why: "Dividend growth ETF. Inflation-protected income.",
      },
    ],
    why: `${template.income.toFixed(1)}% dividend aristocrats. Steady cash flow + growth.`,
  };

  // SWING: Tactical sector bets
  const sectorSignals = signals
    .filter((s) => s.direction === "bullish" && s.impactLevel === "high")
    .flatMap((s) => s.affectedSectors);

  const swingVehicles =
    sectorSignals.length > 0 && template.swing > 0
      ? [
          {
            ticker: "XLV",
            weight: template.swing / 3,
            why: "Healthcare sector. Defensive growth.",
          },
          {
            ticker: "XLK",
            weight: template.swing / 3,
            why: "Tech sector. Secular growth trend.",
          },
          {
            ticker: "XLF",
            weight: template.swing / 3,
            why: "Financials. Cyclical benefit from rate environment.",
          },
        ]
      : [];

  layers.swing = {
    name: "⚡ Swing (Tactical)",
    vehicles: swingVehicles,
    why: `${template.swing.toFixed(1)}% tactical sector bets based on market signals. Rebalance monthly.`,
  };

  // CASH: Emergency buffer
  layers.cash = {
    name: "💵 Cash (Buffer)",
    vehicles: [
      {
        ticker: "VMFXX",
        weight: template.cash,
        why: "Money market fund. Emergency liquidity.",
      },
    ],
    why: `${template.cash.toFixed(1)}% cash. Emergency buffer + dry powder for crisis opportunism.`,
  };

  return layers;
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 6: GENERATE SIGNAL-DRIVEN ACTIONS
// ════════════════════════════════════════════════════════════════════════════

function generateSignalActions(
  signals: Signal[],
  _template: AllocationTemplate
): Array<{
  signal: string;
  impact: "high" | "medium" | "low";
  action: string;
}> {
  return signals
    .filter((s) => s.impactLevel !== "low")
    .map((signal) => {
      const affectedSectors = (signal.affectedSectors || [])
        .map((s) => s.sector)
        .join(", ");

      let action = "";
      if (signal.direction === "bullish" && signal.impactLevel === "high") {
        action = `Increase allocation to ${affectedSectors}. Example: XLK from 5% → 7%.`;
      } else if (
        signal.direction === "bearish" &&
        signal.impactLevel === "high"
      ) {
        action = `Reduce allocation to ${affectedSectors}. Example: XLF from 5% → 3%.`;
      } else if (signal.impactLevel === "medium") {
        action = `Monitor ${affectedSectors} for developing trends. Rebalance next quarter.`;
      }

      return {
        signal: signal.name,
        impact: signal.impactLevel,
        action,
      };
    });
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 7: CALCULATE PROJECTIONS
// ════════════════════════════════════════════════════════════════════════════

function calculateProjections(
  template: AllocationTemplate,
  horizon: "1yr" | "5yr" | "10yr" | "20yr" | "retirement"
): {
  base: { min: number; max: number };
  bull: { min: number; max: number };
  bear: { min: number; max: number };
} {
  const years = horizonToYears(horizon);

  const baseEquityReturn = 0.08; // 8% long-term equity CAGR
  const baseBondReturn = 0.03; // 3% long-term bond CAGR
  const equityAllocation = template.fortress + template.growth + template.upside;

  const baseReturn = (equityAllocation / 100) * baseEquityReturn + (1 - equityAllocation / 100) * baseBondReturn;
  const bullReturn = baseReturn * 1.4; // 40% better
  const bearReturn = baseReturn * 0.6; // 40% worse

  // Annualize returns
  const horizon1 = years === 0.25 ? 1.5 : years === 1 ? 1.2 : 1.1; // Higher short-term volatility
  const compound = (r: number) => (Math.pow(1 + r, years) - 1) * 100;

  return {
    base: {
      min: Math.round(compound(baseReturn * 0.8)),
      max: Math.round(compound(baseReturn * 1.2)),
    },
    bull: {
      min: Math.round(compound(bullReturn * 0.9)),
      max: Math.round(compound(bullReturn * 1.3)),
    },
    bear: {
      min: Math.round(compound(bearReturn * 0.7)),
      max: Math.round(compound(bearReturn * 1.1)),
    },
  };
}

function horizonToYears(
  horizon: "1yr" | "5yr" | "10yr" | "20yr" | "retirement"
): number {
  const horizonMap: Record<string, number> = {
    "1yr": 1,
    "5yr": 5,
    "10yr": 10,
    "20yr": 20,
    retirement: 25, // Assume 25 years to retirement
  };
  return horizonMap[horizon] || 10;
}

// ════════════════════════════════════════════════════════════════════════════
// STEP 8: BUILD TAX OPTIMIZATION
// ════════════════════════════════════════════════════════════════════════════

function buildTaxOptimization(profile: UserProfile): {
  nreDemat?: string;
  w8ben?: string;
  savings?: string;
} {
  const optimization: {
    nreDemat?: string;
    w8ben?: string;
    savings?: string;
  } = {};

  // NRE Demat: Route India allocation through NRE account
  if (profile.countries.includes("India")) {
    optimization.nreDemat =
      "Open NRE Demat account (tax-free capital gains, fully repatriable). Route all India stocks through NRE.";
  }

  // W-8BEN: Reduce US dividend withholding tax
  if (profile.countries.includes("United States")) {
    optimization.w8ben =
      "File Form W-8BEN with your US broker (15% vs 30% dividend withholding tax). Save 15% on dividends.";
  }

  // Savings: Tax-efficient strategy
  if (profile.incomeStability === "stable") {
    optimization.savings =
      "Stable income: Prioritize tax-deferred accounts (401k equivalent abroad). Max out before taxable.";
  } else if (profile.incomeStability === "variable") {
    optimization.savings =
      "Variable income: Keep 12 months emergency cash. Tax-loss harvest in down years.";
  }

  return optimization;
}

// ════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Normalize allocation weights to sum to 100%
 */
export function normalizeAllocation(layers: Record<string, AllocationLayer>): Record<string, AllocationLayer> {
  const totalWeight = Object.values(layers).reduce(
    (sum, layer) => sum + layer.vehicles.reduce((s, v) => s + v.weight, 0),
    0
  );

  if (totalWeight === 0) return layers;

  const normalized: Record<string, AllocationLayer> = {};

  for (const [key, layer] of Object.entries(layers)) {
    normalized[key] = {
      ...layer,
      vehicles: layer.vehicles.map((v) => ({
        ...v,
        weight: (v.weight / totalWeight) * 100,
      })),
    };
  }

  return normalized;
}
