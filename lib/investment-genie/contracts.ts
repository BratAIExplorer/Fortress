/**
 * Investment Genie Contracts
 * Single source of truth for all TypeScript interfaces
 * Both Antigravity and Claude Code must respect these signatures exactly
 */

// ════════════════════════════════════════════════════════════════════════════
// USER PROFILE (Input from Form)
// ════════════════════════════════════════════════════════════════════════════

export interface UserProfile {
  age: number; // 18-70
  amount: number; // USD, minimum 100
  horizon: "1yr" | "5yr" | "10yr" | "20yr" | "retirement";
  countries: ("India" | "US" | "Malaysia" | "Singapore" | "ETFs")[];
  riskAppetite: number; // 0-100 slider
  experience: "beginner" | "intermediate" | "experienced";
  incomeStability: "stable" | "variable" | "business";
}

// ════════════════════════════════════════════════════════════════════════════
// SCAN DATA (From Scanner Query)
// ════════════════════════════════════════════════════════════════════════════

export interface ScanResult {
  symbol: string;
  totalScore: number; // 0-100
  mbTier: "Rocket" | "Launcher" | "Builder" | "Crawler" | "Grounded";
  mbScore: number; // Multi-bagger score
  priceAtScan: number;
  sector: string;
  market: "NSE" | "US" | "HKEX";
  l1Pass?: boolean;
  l2Pass?: boolean;
  l3Pass?: boolean;
  l4Pass?: boolean;
  l5Pass?: boolean;
  l6Pass?: boolean;
}

export interface ScanData {
  scanDate: Date;
  market: string;
  totalStocks: number;
  results: ScanResult[];
}

// ════════════════════════════════════════════════════════════════════════════
// MACRO SNAPSHOT (From Macro Query)
// ════════════════════════════════════════════════════════════════════════════

export interface MacroSnapshot {
  snapshotDate: Date;
  nifty50: number;
  bankNifty: number;
  usdInr: number;
  goldUsd: number;
  crudeOilUsd: number;
  us10yYield: number;
  cboeVix: number;
  indiaVix: number;
}

export interface MacroState {
  snapshot: MacroSnapshot;
  vixState: "normal" | "elevated" | "extreme";
  goldTrend: "flight-to-safety" | "normal" | "overbought";
  currencyTrend: "inr-weak" | "inr-stable" | "inr-strong";
  equityTrend: "bullish" | "neutral" | "corrective";
}

// ════════════════════════════════════════════════════════════════════════════
// SIGNALS (From Intelligence Query)
// ════════════════════════════════════════════════════════════════════════════

export interface Signal {
  name: string; // E.g., "Taiwan tensions", "Fed rate cut", "Sector rotation"
  direction: "bullish" | "bearish" | "neutral";
  impactLevel: "high" | "medium" | "low";
  affectedSectors: Array<{
    sector: string;
    direction: "bullish" | "bearish" | "neutral";
  }>;
}

// ════════════════════════════════════════════════════════════════════════════
// ALLOCATION OUTPUT
// ════════════════════════════════════════════════════════════════════════════

export interface AllocationVehicle {
  ticker: string;
  weight: number; // Percentage (e.g., 22 = 22%)
  why: string; // Explanation for this allocation
}

export interface AllocationLayer {
  name: string; // E.g., "Fortress (Safe Core)"
  vehicles: AllocationVehicle[];
  why: string; // Layer description
}

export interface Allocation {
  layers: Record<string, AllocationLayer>; // fortress, growth, upside, hedge, income, swing, cash
  signals: Array<{
    signal: string;
    impact: "high" | "medium" | "low";
    action: string; // E.g., "Taiwan tensions → Reduce SOXX from 10% to 8%"
  }>;
  taxOptimization: {
    nreDemat?: string;
    w8ben?: string;
    savings?: string;
  };
  projectedReturns: {
    base: { min: number; max: number }; // CAGR percentage
    bull: { min: number; max: number };
    bear: { min: number; max: number };
  };
}

// ════════════════════════════════════════════════════════════════════════════
// API FUNCTION SIGNATURES (Antigravity must implement these exactly)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Query latest scan results for given markets
 * @param markets Array of markets (e.g., ["NSE"])
 * @returns ScanData with latest scan + top stocks
 */
export async function queryScanResults(_markets: string[]): Promise<ScanData> {
  throw new Error("Not implemented — Antigravity provides this");
}

/**
 * Query latest macro snapshot
 * @returns MacroState with derived fields (vixState, goldTrend, etc.)
 */
export async function queryMacroSnapshot(): Promise<MacroState> {
  throw new Error("Not implemented — Antigravity provides this");
}

/**
 * Query latest intelligence report
 * @returns Array of market signals
 */
export async function queryIntelligence(): Promise<Signal[]> {
  throw new Error("Not implemented — Antigravity provides this");
}

// ════════════════════════════════════════════════════════════════════════════
// MAPPER FUNCTION SIGNATURE (Claude Code implements this)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Generate personalized portfolio allocation
 * @param profile User's investment profile (from form)
 * @param scan Latest scan results (scanner query)
 * @param macro Latest macro state (macro query)
 * @param signals Market signals (intelligence query)
 * @returns Personalized Allocation recommendation
 */
export function allocatePortfolio(
  _profile: UserProfile,
  _scan: ScanData,
  _macro: MacroState,
  _signals: Signal[]
): Allocation {
  throw new Error("Not implemented — Claude Code provides this");
}
