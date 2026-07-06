#!/usr/bin/env node
/**
 * Validate database schema is correctly set up.
 * Run after drizzle:push to ensure all tables exist and are accessible.
 * Exit 0 if valid, exit 1 if broken.
 * ponytail: minimal check — only verifies existence, not detailed correctness
 */

import { db, schema } from "@/lib/db/client";
import { sql } from "drizzle-orm";

async function validateSchema() {
  try {
    console.log("🔍 Validating database schema...");

    // Check critical tables exist
    const requiredTables = ["scans", "scan_results", "stocks"];
    for (const table of requiredTables) {
      const result = await db.execute(
        sql`SELECT EXISTS(
          SELECT 1 FROM information_schema.tables
          WHERE table_schema='public' AND table_name=${table}
        )`
      );
      const exists = Object.values(result[0])?.[0] === true;
      if (!exists) {
        console.error(`✗ FAIL: Table '${table}' does not exist`);
        process.exit(1);
      }
      console.log(`✓ Table '${table}' exists`);
    }

    // Try a simple query on each table
    await db.select().from(schema.scans).limit(1);
    console.log("✓ Can query scans table");

    await db.select().from(schema.scanResults).limit(1);
    console.log("✓ Can query scan_results table");

    await db.select().from(schema.stocks).limit(1);
    console.log("✓ Can query stocks table");

    console.log("\n✅ Database schema validation passed!");
    process.exit(0);
  } catch (error) {
    console.error(`\n✗ Validation failed: ${error}`);
    process.exit(1);
  }
}

validateSchema();
