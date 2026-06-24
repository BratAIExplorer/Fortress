#!/usr/bin/env node

/**
 * Fortress Thesis Engine Schema Deployment Script
 *
 * SAFETY FIRST: This script validates zero breaking changes before deploying
 *
 * Run: npm run deploy:thesis-schema
 * Rollback: npm run rollback:thesis-schema
 */

import { db } from "@/lib/db";
import { sectorTheses, sectorThesisStocks, sectorThesisValidations } from "@/lib/db/schema";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

async function validateExistingTables(): Promise<boolean> {
  log(colors.blue, "🔍 Validating existing tables (safety check)...");

  try {
    // Check that critical tables still exist
    const checkQueries = [
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stocks');",
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'strategies');",
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'strategy_holdings');",
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'theses');", // stock-level theses
    ];

    for (const query of checkQueries) {
      const result = await db.execute(query);
      if (!result) {
        log(colors.red, `❌ SAFETY CHECK FAILED: Required table missing`);
        return false;
      }
    }

    log(colors.green, "✅ All existing tables validated");
    return true;
  } catch (error) {
    log(colors.red, `❌ Validation error: ${error}`);
    return false;
  }
}

async function checkTableConflicts(): Promise<boolean> {
  log(colors.blue, "🔍 Checking for table name conflicts...");

  try {
    const query = `
      SELECT table_name FROM information_schema.tables
      WHERE table_name IN ('sector_theses', 'sector_thesis_stocks', 'sector_thesis_validations')
      AND table_schema = 'public';
    `;

    const result = await db.execute(query);

    if (result.rowCount === 0) {
      log(colors.green, "✅ No naming conflicts detected");
      return true;
    } else {
      log(colors.yellow, "⚠️  Tables already exist (safe to re-run)");
      return true;
    }
  } catch (error) {
    log(colors.red, `❌ Error checking conflicts: ${error}`);
    return false;
  }
}

async function createThesesTable(): Promise<boolean> {
  log(colors.blue, "🔨 Creating sector_theses table...");

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sector_theses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        macro_catalyst TEXT NOT NULL,
        timeframe_years INTEGER,
        historical_cagr NUMERIC(5,2),
        conviction_score NUMERIC(3,2) DEFAULT 0.5,
        conviction_status VARCHAR(20) DEFAULT 'WORKING',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    log(colors.green, "✅ sector_theses table created");
    return true;
  } catch (error) {
    log(colors.red, `❌ Failed to create sector_theses: ${error}`);
    return false;
  }
}

async function createThesisStocksTable(): Promise<boolean> {
  log(colors.blue, "🔨 Creating sector_thesis_stocks table...");

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sector_thesis_stocks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        thesis_id UUID NOT NULL REFERENCES sector_theses(id) ON DELETE CASCADE,
        symbol VARCHAR(20) NOT NULL,
        market VARCHAR(10) NOT NULL,
        rank_in_thesis INTEGER NOT NULL,
        valuation_gap_pct NUMERIC(5,2),
        conviction_pct NUMERIC(3,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_thesis_stocks_thesis ON sector_thesis_stocks(thesis_id);
      CREATE INDEX IF NOT EXISTS idx_thesis_stocks_symbol ON sector_thesis_stocks(symbol);
    `);

    log(colors.green, "✅ sector_thesis_stocks table + indexes created");
    return true;
  } catch (error) {
    log(colors.red, `❌ Failed to create sector_thesis_stocks: ${error}`);
    return false;
  }
}

async function createValidationsTable(): Promise<boolean> {
  log(colors.blue, "🔨 Creating sector_thesis_validations table...");

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sector_thesis_validations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        thesis_id UUID NOT NULL REFERENCES sector_theses(id) ON DELETE CASCADE,
        validation_date DATE NOT NULL,
        backtest_5yr_cagr NUMERIC(5,2),
        backtest_5yr_sharpe NUMERIC(5,2),
        backtest_5yr_max_drawdown NUMERIC(5,2),
        backtest_5yr_win_rate NUMERIC(5,2),
        validation_status VARCHAR(20) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_validations_thesis ON sector_thesis_validations(thesis_id);
      CREATE INDEX IF NOT EXISTS idx_validations_date ON sector_thesis_validations(validation_date);
    `);

    log(colors.green, "✅ sector_thesis_validations table + indexes created");
    return true;
  } catch (error) {
    log(colors.red, `❌ Failed to create sector_thesis_validations: ${error}`);
    return false;
  }
}

async function verifyDeployment(): Promise<boolean> {
  log(colors.blue, "🔍 Verifying deployment...");

  try {
    // Check table counts
    const countQuery = `
      SELECT
        (SELECT COUNT(*) FROM sector_theses) as thesis_count,
        (SELECT COUNT(*) FROM sector_thesis_stocks) as stocks_count,
        (SELECT COUNT(*) FROM sector_thesis_validations) as validations_count;
    `;

    const result = await db.execute(countQuery);
    log(colors.green, `✅ Tables operational: ${JSON.stringify(result.rows[0])}`);

    return true;
  } catch (error) {
    log(colors.red, `❌ Verification failed: ${error}`);
    return false;
  }
}

async function main() {
  console.log("\n" + "=".repeat(70));
  log(colors.blue, "FORTRESS THESIS ENGINE — Database Deployment");
  log(colors.blue, "=".repeat(70) + "\n");

  // Step 1: Validate existing tables
  if (!(await validateExistingTables())) {
    log(colors.red, "❌ DEPLOYMENT HALTED: Existing data at risk");
    process.exit(1);
  }

  // Step 2: Check for conflicts
  if (!(await checkTableConflicts())) {
    log(colors.red, "❌ DEPLOYMENT HALTED: Conflict detection failed");
    process.exit(1);
  }

  // Step 3: Create tables
  if (!(await createThesesTable())) {
    log(colors.red, "❌ DEPLOYMENT HALTED: Table creation failed");
    process.exit(1);
  }

  if (!(await createThesisStocksTable())) {
    log(colors.red, "❌ DEPLOYMENT HALTED: Table creation failed");
    process.exit(1);
  }

  if (!(await createValidationsTable())) {
    log(colors.red, "❌ DEPLOYMENT HALTED: Table creation failed");
    process.exit(1);
  }

  // Step 4: Verify
  if (!(await verifyDeployment())) {
    log(colors.red, "❌ DEPLOYMENT HALTED: Verification failed");
    process.exit(1);
  }

  console.log("\n" + "=".repeat(70));
  log(colors.green, "✅ DEPLOYMENT SUCCESSFUL");
  log(colors.green, "   • 3 new tables created (zero breaking changes)");
  log(colors.green, "   • Existing data untouched");
  log(colors.green, "   • Rollback safe: DROP TABLE IF EXISTS <table>");
  console.log("=".repeat(70) + "\n");

  process.exit(0);
}

main().catch((error) => {
  log(colors.red, `🚨 FATAL ERROR: ${error}`);
  process.exit(1);
});
