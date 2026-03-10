import { pgTable, uuid, text, numeric, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";

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
    rankInCategory: integer("rank_in_category"),
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
