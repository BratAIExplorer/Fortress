/**
 * Type definitions for Fortress Thesis Engine
 * Macro/sector-level investment thesis analysis
 * Distinct from stock-level theses
 */

export type ConvictionStatus = "WORKING" | "FALTERING" | "BROKEN";
export type Market = "NSE" | "US";

/**
 * Core thesis definition
 * Represents a macro-level investment opportunity (e.g., "Healthcare Growth")
 */
export interface SectorThesis {
  id: string;
  name: string; // "Healthcare Growth (India)"
  slug: string; // "healthcare-growth-india"
  description?: string;

  // Macro drivers
  macroCatalyst: string; // "GDP per capita inflection at $25k"
  timeframeYears?: number; // 50 years
  historicalCagr?: number; // 13.0 (past 10 years)

  // Conviction (0.0 to 1.0, updated daily)
  convictionScore: number; // 0.80
  convictionStatus: ConvictionStatus; // "WORKING"

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Individual stock within a thesis
 * Top 30 stocks that execute the thesis
 */
export interface SectorThesisStock {
  id: string;
  thesisId: string;
  symbol: string; // "HDFC" or "AAPL"
  market: Market;

  rankInThesis: number; // 1-30
  valuationGapPct?: number; // % discount to fair value
  convictionPct: number; // 0.0-1.0

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Validation/backtest results for a thesis
 * Updated daily by cron job
 */
export interface SectorThesisValidation {
  id: string;
  thesisId: string;

  // 5-year backtest metrics
  validationDate: Date;
  backtest5yrCagr?: number;
  backtest5yrSharpe?: number;
  backtest5yrMaxDrawdown?: number;
  backtest5yrWinRate?: number; // % of years positive

  validationStatus: ConvictionStatus;
  notes?: string;

  createdAt: Date;
}

/**
 * Complete thesis object with stocks + validation
 * Used in API responses
 */
export interface SectorThesisWithDetails extends SectorThesis {
  stocks: SectorThesisStock[];
  latestValidation?: SectorThesisValidation;
}

/**
 * Backtest metrics summary
 */
export interface BacktestMetrics {
  cagr: number;
  sharpe: number;
  maxDrawdown: number;
  winRate: number;
  period: "5Y";
}

/**
 * API Response for thesis detail
 */
export interface ThesisDetailResponse {
  success: boolean;
  data?: SectorThesisWithDetails & { backtest: BacktestMetrics };
  error?: string;
}

/**
 * API Response for creating portfolio from thesis
 */
export interface CreatePortfolioFromThesisRequest {
  thesis_id: string;
  user_conviction: number; // 0.0-1.0 (user's personal confidence)
  allocation_method: "EQUAL" | "CONVICTION_WEIGHTED" | "CUSTOM";
  custom_allocations?: Record<string, number>; // {HDFC: 0.15, ICICI: 0.10}
}

export interface CreatePortfolioFromThesisResponse {
  success: boolean;
  portfolio?: {
    id: string;
    name: string;
    stocks: Array<{ symbol: string; weight: number }>;
    etfs: Array<{ symbol: string; weight: number }>;
    conviction: number;
  };
  error?: string;
}

/**
 * Thesis list card (for browsing)
 */
export interface ThesisCard {
  id: string;
  name: string;
  slug: string;
  macroCatalyst: string; // 1-line summary
  convictionScore: number;
  convictionStatus: ConvictionStatus;
  historicalCagr?: number;
  stockCount: number; // How many stocks in thesis
}

/**
 * Conviction scoring inputs
 * Used by daily validation cron job
 */
export interface ConvictionScoringInputs {
  macroValidation: number; // 0-1.0 (is macro thesis holding?)
  recentPerformance: number; // 0-1.0 (last quarter return positive?)
  riskProfile: number; // 0-1.0 (low risk = higher confidence)
  trendMomentum: number; // 0-1.0 (improving or declining conviction?)
  regimeAlignment: number; // 0-1.0 (thesis aligned with current market regime?)
}
