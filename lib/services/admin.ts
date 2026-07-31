import { db, schema } from "@/lib/db/client";
import { eq, desc, and, gte, lte } from "drizzle-orm";

// ponytail: minimal service wrapper. No error handling here (route catches), no retries, no logging.
// Add those when we need them across multiple callers.

const getDiagnosticData = async () => {
  // Get all scans, ordered by date descending
  const allScans = await db
    .select()
    .from(schema.scans)
    .orderBy(desc(schema.scans.runAt))
    .limit(20);

  // Get only US market scans
  const usScans = await db
    .select()
    .from(schema.scans)
    .where(eq(schema.scans.market, "US"))
    .orderBy(desc(schema.scans.runAt))
    .limit(10);

  // Get scans for May 2-3, 2026
  const may2Date = new Date("2026-05-02");
  const may4Date = new Date("2026-05-04");

  const recentScans = await db
    .select()
    .from(schema.scans)
    .where(
      and(
        gte(schema.scans.runAt, may2Date),
        lte(schema.scans.runAt, may4Date)
      )
    )
    .orderBy(desc(schema.scans.runAt));

  // Get completed scans by market
  const completedByMarket = await db
    .select({
      market: schema.scans.market,
      count: schema.scans.id,
    })
    .from(schema.scans)
    .where(eq(schema.scans.status, "COMPLETED"))
    .orderBy(schema.scans.market);

  return {
    allScans,
    usScans,
    recentScans,
    completedByMarket,
  };
};

export const adminService = {
  getDiagnosticData,
};
