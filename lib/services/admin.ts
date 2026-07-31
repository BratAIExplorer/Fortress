import { db, schema } from "@/lib/db/client";
import { eq, desc, and, gte, lte } from "drizzle-orm";

// ponytail: minimal service wrapper. Pure queries only, no auth/error handling (routes handle that).
// Extraction scope: READ-HEAVY admin queries. WRITE operations stay in routes (different error semantics).

export const adminService = {
  // Diagnostic: aggregated scan data across multiple queries
  getDiagnosticData: async () => {
    const allScans = await db
      .select()
      .from(schema.scans)
      .orderBy(desc(schema.scans.runAt))
      .limit(20);

    const usScans = await db
      .select()
      .from(schema.scans)
      .where(eq(schema.scans.market, "US"))
      .orderBy(desc(schema.scans.runAt))
      .limit(10);

    const may2Date = new Date("2026-05-02");
    const may4Date = new Date("2026-05-04");

    const recentScans = await db
      .select()
      .from(schema.scans)
      .where(and(gte(schema.scans.runAt, may2Date), lte(schema.scans.runAt, may4Date)))
      .orderBy(desc(schema.scans.runAt));

    const completedByMarket = await db
      .select({ market: schema.scans.market, count: schema.scans.id })
      .from(schema.scans)
      .where(eq(schema.scans.status, "COMPLETED"))
      .orderBy(schema.scans.market);

    return { allScans, usScans, recentScans, completedByMarket };
  },

  // Telegram subscribers: simple read
  getTelegramSubscribers: async () => {
    return db.select().from(schema.telegramSubscribers);
  },

  // Momentum status: recent MACD signals
  getMomentumStatus: async () => {
    return db.select().from(schema.macdSignals).orderBy(desc(schema.macdSignals.timestamp)).limit(50);
  },
};
