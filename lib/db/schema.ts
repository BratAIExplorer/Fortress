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
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
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
