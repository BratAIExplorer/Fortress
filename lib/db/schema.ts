import { pgTable, uuid, text, numeric, integer, boolean, timestamp, primaryKey, jsonb } from "drizzle-orm/pg-core";

// 1. STOCKS TABLE (The Core Reference)
export const stocks = pgTable("stocks", {
    id: uuid("id").primaryKey().defaultRandom(),
    symbol: text("symbol").notNull().unique(),
    name: text("name").notNull(),
    sector: text("sector").notNull(),
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
});


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
