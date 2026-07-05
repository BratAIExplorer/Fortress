/**
 * Migration: Add Fortress Thesis Engine (Sector-level macro analysis)
 * Date: June 23, 2026
 *
 * SURGICAL CHANGES:
 * - Add 3 new tables: sector_theses, sector_thesis_stocks, sector_thesis_validations
 * - Zero modifications to existing tables
 * - Rollback: Drop the 3 new tables (safe, no data loss)
 *
 * CONTEXT:
 * Existing `theses` table is stock-level (why buy this stock)
 * These new tables are macro/sector-level (why invest in this sector)
 * Named `sector_theses` to avoid naming collision
 */

import { pgTable, uuid, text, numeric, integer, boolean, timestamp, date, varchar, index } from "drizzle-orm/pg-core";

export async function up(db: any) {
  // Create sector_theses table
  await db.schema
    .createTable("sector_theses", (table: any) => {
      table.uuid("id").primaryKey().defaultRandom();
      table.varchar("name", 255).notNull().unique();
      table.varchar("slug", 255).notNull().unique();
      table.text("description");
      table.text("macro_catalyst").notNull();
      table.integer("timeframe_years");
      table.numeric("historical_cagr", { precision: 5, scale: 2 });
      table.numeric("conviction_score", { precision: 3, scale: 2 }).defaultTo("0.5");
      table.varchar("conviction_status", 20).defaultTo("WORKING");
      table.boolean("is_active").defaultTo(true);
      table.timestamp("created_at", { withTimezone: true }).defaultNow();
      table.timestamp("updated_at", { withTimezone: true }).defaultNow();
    })
    .ifNotExists();

  // Create sector_thesis_stocks table
  await db.schema
    .createTable("sector_thesis_stocks", (table: any) => {
      table.uuid("id").primaryKey().defaultRandom();
      table.uuid("thesis_id").notNull().references(() => "sector_theses.id").onDelete("cascade");
      table.varchar("symbol", 20).notNull();
      table.varchar("market", 10).notNull();
      table.integer("rank_in_thesis").notNull();
      table.numeric("valuation_gap_pct", { precision: 5, scale: 2 });
      table.numeric("conviction_pct", { precision: 3, scale: 2 });
      table.timestamp("created_at", { withTimezone: true }).defaultNow();
      table.timestamp("updated_at", { withTimezone: true }).defaultNow();
    })
    .ifNotExists();

  // Create indexes for sector_thesis_stocks
  await db.schema
    .raw(`
      CREATE INDEX IF NOT EXISTS idx_thesis_stocks_thesis ON sector_thesis_stocks(thesis_id);
      CREATE INDEX IF NOT EXISTS idx_thesis_stocks_symbol ON sector_thesis_stocks(symbol);
    `)
    .execute();

  // Create sector_thesis_validations table
  await db.schema
    .createTable("sector_thesis_validations", (table: any) => {
      table.uuid("id").primaryKey().defaultRandom();
      table.uuid("thesis_id").notNull().references(() => "sector_theses.id").onDelete("cascade");
      table.date("validation_date").notNull();
      table.numeric("backtest_5yr_cagr", { precision: 5, scale: 2 });
      table.numeric("backtest_5yr_sharpe", { precision: 5, scale: 2 });
      table.numeric("backtest_5yr_max_drawdown", { precision: 5, scale: 2 });
      table.numeric("backtest_5yr_win_rate", { precision: 5, scale: 2 });
      table.varchar("validation_status", 20).notNull();
      table.text("notes");
      table.timestamp("created_at", { withTimezone: true }).defaultNow();
    })
    .ifNotExists();

  // Create indexes for sector_thesis_validations
  await db.schema
    .raw(`
      CREATE INDEX IF NOT EXISTS idx_validations_thesis ON sector_thesis_validations(thesis_id);
      CREATE INDEX IF NOT EXISTS idx_validations_date ON sector_thesis_validations(validation_date);
    `)
    .execute();

  console.log("✅ Migration: Added sector_theses tables (surgical, zero breaking changes)");
}

export async function down(db: any) {
  // Rollback: Drop tables (safe because we never touch existing data)
  await db.schema.dropTable("sector_thesis_validations").ifExists();
  await db.schema.dropTable("sector_thesis_stocks").ifExists();
  await db.schema.dropTable("sector_theses").ifExists();

  console.log("✅ Rollback: Removed sector_theses tables");
}
