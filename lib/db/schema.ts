import { pgTable, uuid, text, numeric, integer, boolean, timestamp, date, primaryKey, jsonb, varchar, smallint, index } from "drizzle-orm/pg-core";

// 1. STOCKS TABLE (The Core Reference)
export const stocks = pgTable("stocks", {
    id: uuid("id").primaryKey().defaultRandom(),
    symbol: text("symbol").notNull().unique(),
    name: text("name").notNull(),
    sector: text("sector").notNull(),
    market: text("market").notNull().default("NSE"),
    logoUrl: text("logo_url"),
    currentPrice: numeric("current_price"),
    qualityScore: integer("quality_score"),
    marketCapCrores: numeric("market_cap_crores"),
    peRatio: numeric("pe_ratio"),
    roce5yrAvg: numeric("roce_5yr_avg"),
    debtToEquity: numeric("debt_to_equity"),
    megatrend: text("megatrend").array(),
    isActive: boolean("is_active").default(true),
    // v5 extension fields
    v5Category: text("v5_category"), // 'low' | 'penny' | 'sub_ten' | null
    tag: text("tag"),
    risk: text("risk"),
    industry: text("industry"),
    drop52w: numeric("drop_52w"),
    moat: text("moat"),
    l1: integer("l1"),
    l2: integer("l2"),
    l3: integer("l3"),
    l4: integer("l4"),
    l5: integer("l5"),
    whyDown: text("why_down"),
    whyBuy: text("why_buy"),
    pennyWhy: text("penny_why"),
    multiBaggerCase: text("multi_bagger_case"),
    killerRisk: text("killer_risk"),
    fortressNote: text("fortress_note"),
    ocf: text("ocf"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 1a. STOCKS_UNIVERSE TABLE (Master Registry for Scanner)
export const stocksUniverse = pgTable("stocks_universe", {
    id: uuid("id").primaryKey().defaultRandom(),
    symbol: text("symbol").notNull(),
    market: text("market").notNull(), // 'US' | 'NSE'
    capTier: text("cap_tier"), // 'mega' | 'large' | 'mid' | 'small'
    sector: text("sector"),
    source: text("source").notNull(), // 'SP500' | 'NASDAQ100' | 'NSE50' | 'NSE500' | 'MANUAL'
    isActive: boolean("is_active").default(true),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow(),
}, (t) => ({
    symbolMarketIdx: index("idx_universe_symbol_market").on(t.symbol, t.market),
    marketActiveIdx: index("idx_universe_market_active").on(t.market, t.isActive),
}));

// 1b. SCANS TABLE (History & Status)
export const scans = pgTable("scans", {
    id: uuid("id").primaryKey().defaultRandom(),
    runAt: timestamp("run_at", { withTimezone: true }).defaultNow(),
    status: text("status").notNull(), // 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED'
    totalScanned: integer("total_scanned"),
    durationMs: integer("duration_ms"),
    triggeredBy: text("triggered_by"), // 'MANUAL' | 'CRON'
    market: text("market").notNull().default("NSE"), // 'NSE' | 'US' | 'HKEX'
    errorMessage: text("error_message"),
    goodResultsCount: integer("good_results_count"), // non-OFFLINE results; <50 = degraded scan
});

// 1c. SCANRESULTS TABLE (Deep Snapshots)
export const scanResults = pgTable("scan_results", {
    id: uuid("id").primaryKey().defaultRandom(),
    scanId: uuid("scan_id").notNull().references(() => scans.id, { onDelete: "cascade" }),
    symbol: text("symbol").notNull(),
    priceAtScan: numeric("price_at_scan"),
    l1Pass: boolean("l1_pass"),
    l2Pass: boolean("l2_pass"),
    l3Pass: boolean("l3_pass"),
    l4Pass: boolean("l4_pass"),
    l5Pass: boolean("l5_pass"),
    l6Pass: boolean("l6_pass"),
    totalScore: integer("total_score"),
    category: text("category"), // '52W_LOW', 'PENNY', 'SUB20', 'OFFLINE'
    market: text("market").notNull().default("NSE"),
    rankInCategory: integer("rank_in_category"),
    // ── Engine v3 fields ──────────────────────────────────────────────────────
    mbScore: integer("mb_score"),               // 0-100 multi-bagger score
    mbTier: text("mb_tier"),                    // Rocket/Launcher/Builder/Crawler/Grounded
    megatrendTag: text("megatrend_tag"),         // e.g. "Defence & Aerospace"
    megatrendEmoji: text("megatrend_emoji"),     // e.g. "🛡️"
    fcfYieldPct: numeric("fcf_yield_pct"),       // FCF ÷ MarketCap × 100
    earningsQuality: numeric("earnings_quality"), // FCF ÷ NetIncome
    pegRatio: numeric("peg_ratio"),              // P/E ÷ EarningsGrowth%
    deDirection: text("de_direction"),           // "falling" | "stable" | "rising" | "unknown"
    marginDirection: text("margin_direction"),   // "expanding" | "stable" | "contracting" | "unknown"
    // ── Coffee Can fields ─────────────────────────────────────────────────────
    ccScore: integer("cc_score"),               // 0-100 (Classic/Strong/Developing/Inconsistent)
    ccTier: text("cc_tier"),                    // "Classic" | "Strong" | "Developing" | "Inconsistent"
    ccRevenueCagr: numeric("cc_revenue_cagr"),  // 4yr revenue CAGR as %
    ccYearsChecked: integer("cc_years_checked"), // how many years of data were available
}, (table) => ({
    // ponytail: indexes for Fortress 30 queries (getBestScan → scanId, then sort by mbScore)
    scanIdIdx: index("idx_scan_results_scan_id").on(table.scanId),
    mbScoreIdx: index("idx_scan_results_mb_score_desc").on(table.mbScore),
    marketIdx: index("idx_scan_results_market").on(table.market),
    symbolIdx: index("idx_scan_results_symbol").on(table.symbol),
}));


// 2. THESES TABLE (The "Why" - Educational Layer)
export const theses = pgTable("theses", {
    id: uuid("id").primaryKey().defaultRandom(),
    stockId: uuid("stock_id").notNull().references(() => stocks.id, { onDelete: "cascade" }),
    oneLiner: text("one_liner").notNull(),
    megatrend: text("megatrend").array(),
    moatSource: text("moat_source"),
    financialStrengthScore: integer("financial_strength_score"),
    investmentLogic: text("investment_logic").notNull(),
    risks: text("risks").notNull(),
    authorId: uuid("author_id"), // No FK to auth.users since we're not using Supabase Auth
    publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 3. COLLECTIONS TABLE (The Lists)
export const collections = pgTable("collections", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
});

// 4. COLLECTION_MEMBERS TABLE (Junction table)
export const collectionMembers = pgTable("collection_members", {
    collectionId: uuid("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
    stockId: uuid("stock_id").notNull().references(() => stocks.id, { onDelete: "cascade" }),
    weightConservative: numeric("weight_conservative").default("0"),
    weightBalanced: numeric("weight_balanced").default("0"),
    weightAggressive: numeric("weight_aggressive").default("0"),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
    pk: primaryKey({ columns: [table.collectionId, table.stockId] }),
}));

// 5. CHANGELOG TABLE (Transparency Engine)
export const changelog = pgTable("changelog", {
    id: uuid("id").primaryKey().defaultRandom(),
    stockId: uuid("stock_id").references(() => stocks.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id").references(() => collections.id),
    actionType: text("action_type").notNull(), // 'ENTRY', 'EXIT', 'REBALANCE', 'UPDATE'
    reason: text("reason").notNull(),
    oldWeight: numeric("old_weight"),
    newWeight: numeric("new_weight"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow(),
});

// 6. CONCEPTS TABLE (Super Learning Layer)
export const concepts = pgTable("concepts", {
    id: uuid("id").primaryKey().defaultRandom(),
    term: text("term").notNull().unique(),
    definition: text("definition").notNull(),
    category: text("category"),
    source: text("source"),
});

// ─── SOVEREIGN ALPHA LAYER ────────────────────────────────────────────────────
// The self-learning feedback loop. Every prediction tracked, scored, learned from.

// 7. ALPHA_SCANS — Each GEM SCORE scan session
export const alphaScans = pgTable("alpha_scans", {
    id: uuid("id").primaryKey().defaultRandom(),
    scanDate: timestamp("scan_date", { withTimezone: true }).defaultNow(),
    markets: text("markets").array(), // ['NSE','US','ETF','MF']
    riskMode: text("risk_mode").notNull(), // 'conservative' | 'balanced' | 'aggressive'
    totalPicks: integer("total_picks"),
    activeWeights: jsonb("active_weights"), // {undervaluation:30,institutional:25,fundamental:25,momentum:20}
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 8. ALPHA_PREDICTIONS — Every individual pick with full GEM SCORE breakdown
export const alphaPredictions = pgTable("alpha_predictions", {
    id: uuid("id").primaryKey().defaultRandom(),
    scanId: uuid("scan_id").notNull().references(() => alphaScans.id, { onDelete: "cascade" }),
    ticker: text("ticker").notNull(),
    name: text("name"),
    market: text("market").notNull(), // 'NSE' | 'US' | 'BSE' | 'ETF' | 'MF' | 'SGX' etc.
    gemScore: integer("gem_score").notNull(),
    scoreBreakdown: jsonb("score_breakdown").notNull(), // {undervaluation:24,institutional:18,fundamental:20,momentum:15}
    bonusModifiers: jsonb("bonus_modifiers"), // [{label:'promoter_buying',pts:7}]
    penaltyModifiers: jsonb("penalty_modifiers"), // [{label:'pledge',pts:-10}]
    scoreTier: text("score_tier").notNull(), // 'Diamond'|'Sapphire'|'Emerald'|'Quartz'
    entryPrice: numeric("entry_price", { precision: 14, scale: 4 }),
    entryDate: timestamp("entry_date", { withTimezone: true }).defaultNow(),
    riskTier: text("risk_tier").notNull(), // 'conservative'|'balanced'|'aggressive'
    thesis: text("thesis"),
    keyRisk: text("key_risk"),
    sector: text("sector"),
    currency: text("currency").default("USD"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 9. ALPHA_TRACKING — Price checks at 30, 60, 90 days (auto + manual)
export const alphaTracking = pgTable("alpha_tracking", {
    id: uuid("id").primaryKey().defaultRandom(),
    predictionId: uuid("prediction_id").notNull().references(() => alphaPredictions.id, { onDelete: "cascade" }),
    checkDate: timestamp("check_date", { withTimezone: true }).defaultNow(),
    checkType: text("check_type").notNull(), // '30d'|'60d'|'90d'|'manual'
    currentPrice: numeric("current_price", { precision: 14, scale: 4 }),
    returnPct: numeric("return_pct", { precision: 8, scale: 4 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 10. ALPHA_OVERRIDES — Manual context tags per pick
export const alphaOverrides = pgTable("alpha_overrides", {
    id: uuid("id").primaryKey().defaultRandom(),
    predictionId: uuid("prediction_id").notNull().references(() => alphaPredictions.id, { onDelete: "cascade" }),
    overrideDate: timestamp("override_date", { withTimezone: true }).defaultNow(),
    // 'market_crash_intact'|'management_change'|'sector_rotation'|'thesis_broken'|'external_factor'
    overrideType: text("override_type").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 11. ALPHA_INSIGHTS — Learning reports generated after 90-day review cycles
export const alphaInsights = pgTable("alpha_insights", {
    id: uuid("id").primaryKey().defaultRandom(),
    cycleId: text("cycle_id").notNull().unique(), // '2026-Q1'
    generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
    criteriaPerformance: jsonb("criteria_performance"), // {undervaluation:0.52,institutional:0.68,...}
    weightRecommendations: jsonb("weight_recommendations"), // {undervaluation:25,institutional:27,...}
    hitRateByMarket: jsonb("hit_rate_by_market"), // {NSE:0.61,US:0.55,...}
    hitRateByTier: jsonb("hit_rate_by_tier"), // {Diamond:0.78,Sapphire:0.64,...}
    totalPicksAnalyzed: integer("total_picks_analyzed"),
    overallHitRate: numeric("overall_hit_rate", { precision: 5, scale: 4 }),
    summary: text("summary"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 12. ALPHA_WEIGHT_HISTORY — Audit trail for scoring weight changes
export const alphaWeightHistory = pgTable("alpha_weight_history", {
    id: uuid("id").primaryKey().defaultRandom(),
    effectiveDate: timestamp("effective_date", { withTimezone: true }).defaultNow(),
    oldWeights: jsonb("old_weights"),
    newWeights: jsonb("new_weights"),
    reason: text("reason"),
    insightId: uuid("insight_id").references(() => alphaInsights.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 13. MACRO_SNAPSHOTS — Weekly market pulse snapshots
export const macroSnapshots = pgTable("macro_snapshots", {
    id: uuid("id").primaryKey().defaultRandom(),
    snapshotDate: date("snapshot_date").notNull().unique(),
    nifty50: numeric("nifty_50"),
    bankNifty: numeric("bank_nifty"),
    usdInr: numeric("usd_inr"),
    goldUsd: numeric("gold_usd"),
    crudeOilUsd: numeric("crude_oil_usd"),
    us10yYield: numeric("us_10y_yield"),
    cboeVix: numeric("cboe_vix"),
    indiaVix: numeric("india_vix"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow(),
});

// 14. INTELLIGENCE_REPORTS — Clarity framework output per macro snapshot
export const intelligenceReports = pgTable("intelligence_reports", {
    id: uuid("id").primaryKey().defaultRandom(),
    snapshotId: uuid("snapshot_id").references(() => macroSnapshots.id),
    snapshotDate: date("snapshot_date").notNull(),
    signals: jsonb("signals").notNull(),           // SignalEvaluation[]
    sectorImpacts: jsonb("sector_impacts").notNull(), // SectorImpact[]
    environment: jsonb("environment").notNull(),    // EnvironmentFactor[]
    summary: text("summary"),
    generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
});

// ─── INVESTMENT GENIE LAYER ───────────────────────────────────────────────────

export const investmentsGenieSessions = pgTable("investments_genie_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  riskTolerance: varchar("risk_tolerance", { length: 20 }).notNull(),
  investmentHorizon: varchar("investment_horizon", { length: 20 }).notNull(),
  sectorPreferences: text("sector_preferences").array().default([]),
  cashPosition: numeric("cash_position", { precision: 10, scale: 2 }).default("0"),
  currentExposure: jsonb("current_exposure").default('{"stocks": 0, "bonds": 0, "cash": 100, "alternatives": 0}'),
  
  recommendedAllocation: jsonb("recommended_allocation").notNull(),
  confidenceScore: smallint("confidence_score").default(50),
  rationale: text("rationale"),
  
  sessionStatus: varchar("session_status", { length: 20 }).default("completed"),
  macroContextSnapshot: jsonb("macro_context_snapshot"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  
  userId: varchar("user_id", { length: 36 }),
}, (table) => ({
  userIndex: index("idx_genie_sessions_user").on(table.userId),
}));

export const investmentsGenieRecommendations = pgTable("investments_genie_recommendations", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => investmentsGenieSessions.id, { onDelete: "cascade" }),
  
  symbol: varchar("symbol", { length: 20 }).notNull(),
  market: varchar("market", { length: 10 }).notNull(),
  sector: varchar("sector", { length: 30 }),
  companyName: varchar("company_name", { length: 100 }),
  
  allocationPercent: numeric("allocation_percent", { precision: 5, scale: 2 }).notNull(),
  pickScore: numeric("pick_score", { precision: 5, scale: 2 }).default("0"),
  riskScore: numeric("risk_score", { precision: 5, scale: 2 }).default("0"),
  reasoning: text("reasoning"),
  entryPrice: numeric("entry_price", { precision: 12, scale: 2 }),
  
  isActual: boolean("is_actual").default(false),
  actualEntryPrice: numeric("actual_entry_price", { precision: 12, scale: 2 }),
  actualQuantity: numeric("actual_quantity", { precision: 12, scale: 4 }),
  exitPrice: numeric("exit_price", { precision: 12, scale: 2 }),
  exitDate: date("exit_date"),
  
  pickStatus: varchar("pick_status", { length: 20 }).default("pending"),
  profitLoss: numeric("profit_loss", { precision: 12, scale: 2 }),
  profitLossPercent: numeric("profit_loss_percent", { precision: 5, scale: 2 }),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  sessionIdx: index("idx_genie_recs_session").on(table.sessionId),
  symbolIdx: index("idx_genie_recs_symbol").on(table.symbol),
}));

export const investmentsGenieWatchlists = pgTable("investments_genie_watchlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  market: varchar("market", { length: 10 }).notNull(),
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow(),
  alertPriceTarget: numeric("alert_price_target", { precision: 12, scale: 2 }),
  alertStopLoss: numeric("alert_stop_loss", { precision: 12, scale: 2 }),
  notes: text("notes"),
}, (table) => ({
  userIdx: index("idx_genie_watchlist_user").on(table.userId),
}));

export const investmentsGenieFeedback = pgTable("investments_genie_feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => investmentsGenieSessions.id, { onDelete: "cascade" }),
  recommendationId: uuid("recommendation_id").references(() => investmentsGenieRecommendations.id, { onDelete: "cascade" }),
  feedbackType: varchar("feedback_type", { length: 20 }).notNull(),
  rating: smallint("rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  sessionIdx: index("idx_genie_feedback_session").on(table.sessionId),
}));

export const investmentsGeniePerformance = pgTable("investments_genie_performance", {
  id: uuid("id").defaultRandom().primaryKey(),
  totalSessions: integer("total_sessions").default(0),
  totalRecommendations: integer("total_recommendations").default(0),
  executedRecommendations: integer("executed_recommendations").default(0),
  averageReturn: numeric("average_return", { precision: 5, scale: 2 }).default("0"),
  winRate: numeric("win_rate", { precision: 5, scale: 2 }).default("0"),
  bestPick: varchar("best_pick", { length: 20 }),
  worstPick: varchar("worst_pick", { length: 20 }),
  performanceByMarket: jsonb("performance_by_market").default('{"NSE": 0, "US": 0, "HK": 0}'),
  performanceBySector: jsonb("performance_by_sector").default('{}'),
  performance30d: numeric("performance_30d", { precision: 5, scale: 2 }).default("0"),
  performance90d: numeric("performance_90d", { precision: 5, scale: 2 }).default("0"),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow(),
});

// ALLOCATIONS TABLE - User saved portfolio allocations
export const allocations = pgTable(
  "allocations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),

    // User inputs
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    riskAppetite: numeric("risk_appetite", { precision: 5, scale: 2 }).notNull(), // 0-100
    horizon: varchar("horizon", { length: 50 }).notNull(), // "short", "medium", "long", "retirement"
    experience: varchar("experience", { length: 50 }).notNull(), // "beginner", "intermediate", "experienced"
    countries: jsonb("countries").notNull(), // ["United States", "India"]

    // Allocation results - stored as JSON for flexibility
    allocation: jsonb("allocation").notNull(), // Full allocation object with layers and vehicles

    // Metadata
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    savedAt: timestamp("saved_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_allocations_user_id").on(table.userId),
    createdAtIdx: index("idx_allocations_created_at").on(table.createdAt),
  })
);

// ─── PORTFOLIO STRATEGY TRACKER ──────────────────────────────────────────────

// 15. STRATEGIES — One row per investment strategy per user
export const strategies = pgTable("strategies", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  emoji: text("emoji").default("📈"),
  riskTier: text("risk_tier").notNull(), // 'aggressive' | 'balanced' | 'conservative'
  totalCapitalUsd: numeric("total_capital_usd", { precision: 14, scale: 2 }).notNull(),
  targetMultiple: numeric("target_multiple", { precision: 5, scale: 1 }).default("5"),
  targetHorizonYears: integer("target_horizon_years").default(10),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  userIdx: index("idx_strategies_user").on(table.userId),
}));

// 16. STRATEGY_HOLDINGS — Individual holdings within a strategy
export const strategyHoldings = pgTable("strategy_holdings", {
  id: uuid("id").primaryKey().defaultRandom(),
  strategyId: uuid("strategy_id").notNull().references(() => strategies.id, { onDelete: "cascade" }),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  name: text("name").notNull(),
  targetWeightPct: numeric("target_weight_pct", { precision: 5, scale: 2 }).notNull(),
  unitsHeld: numeric("units_held", { precision: 14, scale: 4 }).default("0"),
  avgBuyPrice: numeric("avg_buy_price", { precision: 14, scale: 4 }).default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  strategyIdx: index("idx_holdings_strategy").on(table.strategyId),
}));

// ─── FORTRESS THESIS ENGINE ─────────────────────────────────────────────
// Macro/sector-level thesis analysis (NEW Phase 1 - June 23, 2026)
// Note: Distinct from stock-level `theses` table (line 89) which explains individual stocks

// 17. SECTOR_THESES — Macro-level investment theses (healthcare, NBFC, commodities, etc.)
export const sectorTheses = pgTable("sector_theses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(), // "Healthcare Growth (India)"
  slug: varchar("slug", { length: 255 }).notNull().unique(), // "healthcare-growth-india"
  description: text("description"),

  // Macro drivers
  macroCatalyst: text("macro_catalyst").notNull(), // "GDP per capita inflection at $25k"
  timeframeYears: integer("timeframe_years"), // 50
  historicalCagr: numeric("historical_cagr", { precision: 5, scale: 2 }), // 13.0

  // Conviction (updated daily by cron job)
  convictionScore: numeric("conviction_score", { precision: 3, scale: 2 }).default("0.5"), // 0.0-1.0
  convictionStatus: varchar("conviction_status", { length: 20 }).default("WORKING"), // WORKING|FALTERING|BROKEN

  // Metadata
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 18. SECTOR_THESIS_STOCKS — Individual stocks in a thesis
export const sectorThesisStocks = pgTable("sector_thesis_stocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  thesisId: uuid("thesis_id").notNull().references(() => sectorTheses.id, { onDelete: "cascade" }),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  market: varchar("market", { length: 10 }).notNull(), // NSE | US

  // Ranking within this thesis
  rankInThesis: integer("rank_in_thesis").notNull(), // 1-30
  valuationGapPct: numeric("valuation_gap_pct", { precision: 5, scale: 2 }), // % discount to fair value
  convictionPct: numeric("conviction_pct", { precision: 3, scale: 2 }), // 0.0-1.0

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  thesisIdx: index("idx_thesis_stocks_thesis").on(table.thesisId),
  symbolIdx: index("idx_thesis_stocks_symbol").on(table.symbol),
}));

// 19. SECTOR_THESIS_VALIDATIONS — Backtest results (updated daily)
export const sectorThesisValidations = pgTable("sector_thesis_validations", {
  id: uuid("id").primaryKey().defaultRandom(),
  thesisId: uuid("thesis_id").notNull().references(() => sectorTheses.id, { onDelete: "cascade" }),

  // Backtest metrics (5-year historical)
  validationDate: date("validation_date").notNull(),
  backtest5yrCagr: numeric("backtest_5yr_cagr", { precision: 5, scale: 2 }),
  backtest5yrSharpe: numeric("backtest_5yr_sharpe", { precision: 5, scale: 2 }),
  backtest5yrMaxDrawdown: numeric("backtest_5yr_max_drawdown", { precision: 5, scale: 2 }),
  backtest5yrWinRate: numeric("backtest_5yr_win_rate", { precision: 5, scale: 2 }), // % of years positive

  // Status & notes
  validationStatus: varchar("validation_status", { length: 20 }).notNull(), // WORKING|FALTERING|BROKEN
  notes: text("notes"), // "Thesis on track, revenue growing 12%"

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  thesisIdx: index("idx_validations_thesis").on(table.thesisId),
  dateIdx: index("idx_validations_date").on(table.validationDate),
}));

// 20. TELEGRAM_CALLS — External Telegram recommendations (Layer 7 validation)
export const telegramCalls = pgTable("telegram_calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: varchar("source", { length: 50 }).notNull(), // "SpotOnTradingTips" | "deepakstockvipo"
  symbol: varchar("symbol", { length: 20 }).notNull(), // "HDFC" | "AAPL"
  market: varchar("market", { length: 10 }).notNull(), // "NSE" | "US"

  // Entry & Targets
  entryPrice: numeric("entry_price", { precision: 10, scale: 2 }).notNull(),
  entryDate: timestamp("entry_date", { withTimezone: true }).notNull(),
  targets: jsonb("targets").notNull(), // [288, 301, 310] — array of target prices
  stopLoss: numeric("stop_loss", { precision: 10, scale: 2 }).notNull(),

  // Metadata
  timeframe: varchar("timeframe", { length: 20 }), // "SWING" | "DAY" | "POSITIONAL"
  rationaletype: varchar("rationale_type", { length: 50 }), // "TECHNICAL" | "FUNDAMENTAL" | "GEOPOLITICAL" | "SENTIMENT"
  rationaleText: text("rationale_text"), // Optional context

  // Outcome Tracking
  status: varchar("status", { length: 20 }).default("OPEN"), // "OPEN" | "CLOSED_WIN" | "CLOSED_LOSS" | "CLOSED_SL"
  exitPrice: numeric("exit_price", { precision: 10, scale: 2 }), // Null if still open
  exitDate: timestamp("exit_date", { withTimezone: true }), // Null if still open
  returnPct: numeric("return_pct", { precision: 8, scale: 4 }), // ((exit - entry) / entry) * 100

  // Comparison to buy-and-hold
  entryBhPrice: numeric("entry_bh_price", { precision: 10, scale: 2 }), // Price at entry date
  bhReturnPct: numeric("bh_return_pct", { precision: 8, scale: 4 }), // Buy-and-hold return %

  // Risk metrics
  riskRewardRatio: numeric("risk_reward_ratio", { precision: 8, scale: 4 }), // (target - entry) / (entry - sl)
  maxDrawdownPct: numeric("max_drawdown_pct", { precision: 8, scale: 4 }), // Peak to current trough %

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  sourceIdx: index("idx_telegram_source").on(table.source),
  symbolIdx: index("idx_telegram_symbol").on(table.symbol),
  statusIdx: index("idx_telegram_status").on(table.status),
  dateIdx: index("idx_telegram_date").on(table.entryDate),
}));

// 21. TELEGRAM_METRICS — Weekly aggregated metrics (win rate, avg return, etc.)
export const telegramMetrics = pgTable("telegram_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: varchar("source", { length: 50 }).notNull(), // Which source this metric is for
  market: varchar("market", { length: 10 }), // If filtering by market (NSE|US|NULL for all)
  sector: varchar("sector", { length: 50 }), // If filtering by sector (NULL for all)

  // Aggregation period
  metricDate: date("metric_date").notNull(), // End of period (weekly: Sunday)
  metricType: varchar("metric_type", { length: 20 }).notNull(), // "WEEKLY" | "MONTHLY" | "QUARTERLY"

  // Metrics
  totalCalls: integer("total_calls").notNull(), // Total calls in period
  closedCalls: integer("closed_calls").notNull(), // Calls that hit target or SL
  winCalls: integer("win_calls").notNull(), // Calls that hit target
  winRate: numeric("win_rate", { precision: 5, scale: 2 }).notNull(), // win_calls / closed_calls * 100

  avgReturnPct: numeric("avg_return_pct", { precision: 8, scale: 4 }), // Average return % for period
  avgDrawdownPct: numeric("avg_drawdown_pct", { precision: 8, scale: 4 }), // Average max drawdown
  sharpeRatio: numeric("sharpe_ratio", { precision: 8, scale: 4 }), // Risk-adjusted return
  calmarRatio: numeric("calmar_ratio", { precision: 8, scale: 4 }), // Return / Max Drawdown

  // Comparison
  avgBhReturnPct: numeric("avg_bh_return_pct", { precision: 8, scale: 4 }), // Avg buy-and-hold return
  outperformancePct: numeric("outperformance_pct", { precision: 8, scale: 4 }), // Telegram return - BH return

  // Sector breakdown (if applicable)
  topSector: varchar("top_sector", { length: 50 }), // Sector with highest win rate
  topSectorWinRate: numeric("top_sector_win_rate", { precision: 5, scale: 2 }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  sourceIdx: index("idx_metrics_source").on(table.source),
  dateIdx: index("idx_metrics_date").on(table.metricDate),
  typeIdx: index("idx_metrics_type").on(table.metricType),
}));

// 22. TELEGRAM_VALIDATION_AUDIT — Audit log (what parsed, what failed, why)
export const telegramValidationAudit = pgTable("telegram_validation_audit", {
  id: uuid("id").primaryKey().defaultRandom(),
  exportFile: varchar("export_file", { length: 255 }).notNull(), // Which export (SpotOn|Deepak)

  // Parse result
  parseStatus: varchar("parse_status", { length: 20 }).notNull(), // "SUCCESS" | "PARTIAL" | "FAILED"
  totalMessagesRead: integer("total_messages_read").notNull(),
  callsParsed: integer("calls_parsed").notNull(),
  callsFailed: integer("calls_failed").notNull(),
  failureReasons: jsonb("failure_reasons"), // {reason: count} e.g., {"no_cmp_found": 5, "invalid_target": 2}

  // Validation
  validationNotes: text("validation_notes"), // Free-form audit notes

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 23. TRADES — Trade log for Hidden Gem Finder / Trading Specialist (Phase 3+)
// ponytail: in-memory → persisted, upgrade path ready
export const trades = pgTable("trades", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 36 }).notNull(), // DATA ISOLATION FIX
  ticker: varchar("ticker", { length: 10 }).notNull(),
  gemScore: integer("gem_score").notNull(), // 0-100
  action: varchar("action", { length: 10 }).notNull(), // BOUGHT|SKIPPED|LOSS
  result: varchar("result", { length: 10 }), // WIN|LOSS (null until marked)
  entryPrice: numeric("entry_price", { precision: 14, scale: 4 }), // USD/local currency
  currentPrice: numeric("current_price", { precision: 14, scale: 4 }), // Last checked price
  returnPct: numeric("return_pct", { precision: 8, scale: 4 }), // Computed return %
  checkedAt: timestamp("checked_at", { withTimezone: true }), // When auto-check ran
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index("idx_trades_user").on(table.userId), // DATA ISOLATION INDEX
  tickerIdx: index("idx_trades_ticker").on(table.ticker),
  dateIdx: index("idx_trades_date").on(table.date),
  resultIdx: index("idx_trades_result").on(table.result),
}));

// 24. LEARNING_METRICS — Win rates by GEM SCORE range (Phase 5)
// ponytail: daily aggregation, no backfill (fresh data only)
export const learningMetrics = pgTable("learning_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  checkDate: date("check_date").notNull().defaultNow(),
  scoreRange: varchar("score_range", { length: 10 }).notNull(), // '80-100%', '60-79%', etc.
  totalTrades: integer("total_trades").notNull().default(0),
  markedTrades: integer("marked_trades").notNull().default(0),
  winCount: integer("win_count").notNull().default(0),
  winRate: numeric("win_rate", { precision: 5, scale: 2 }), // 0-100 %
  avgReturnPct: numeric("avg_return_pct", { precision: 8, scale: 4 }), // Average return
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  checkDateIdx: index("idx_learning_date").on(table.checkDate),
  scoreRangeIdx: index("idx_learning_range").on(table.scoreRange),
}));

// Modular Schema Exports
export * from "./schema/auth";
export * from "./schema/feedback";
export * from "./schema/analytics";
