import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Health check endpoint: returns scan system status for diagnostics
 * GET /api/health/scans
 *
 * Returns:
 * - status: HEALTHY|DEGRADED|CRITICAL
 * - message: human-readable status
 * - lastScan: {market, runAt, goodResultsCount, status}
 * - diagnostics: info for ops to debug issues
 */
export async function GET() {
  try {
    // Get last scan for each market
    const nseScans = await db
      .select()
      .from(schema.scans)
      .where(eq(schema.scans.market, "NSE"))
      .orderBy(desc(schema.scans.runAt))
      .limit(3);

    const usScans = await db
      .select()
      .from(schema.scans)
      .where(eq(schema.scans.market, "US"))
      .orderBy(desc(schema.scans.runAt))
      .limit(3);

    const lastNse = nseScans[0];
    const lastUs = usScans[0];
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // Determine overall health
    const nseStaleness = lastNse ? now - new Date(lastNse.runAt!).getTime() : Infinity;
    const usStaleness = lastUs ? now - new Date(lastUs.runAt!).getTime() : Infinity;

    let status = "HEALTHY";
    let message = "All scans running normally";

    if (!lastNse || !lastUs) {
      status = "CRITICAL";
      message = "One or both markets have no scan history — cron jobs may not be running";
    } else if (nseStaleness > ONE_DAY_MS || usStaleness > ONE_DAY_MS) {
      status = "DEGRADED";
      message = "Last scan is >24 hours old — cron jobs may have stopped";
    } else if ((lastNse?.status !== "COMPLETED" || lastNse.goodResultsCount! < 25) &&
               (lastUs?.status !== "COMPLETED" || lastUs.goodResultsCount! < 25)) {
      status = "DEGRADED";
      message = "Both markets have degraded scans (low result counts or still running)";
    }

    return NextResponse.json({
      status,
      message,
      lastScan: {
        nse: lastNse ? {
          scanId: lastNse.id,
          runAt: lastNse.runAt,
          status: lastNse.status,
          goodResultsCount: lastNse.goodResultsCount,
          staleness: nseStaleness > ONE_DAY_MS ? `${Math.round(nseStaleness / ONE_DAY_MS)}d old` : `${Math.round(nseStaleness / 60000)}m old`,
          errorMessage: lastNse.errorMessage ?? null,
        } : null,
        us: lastUs ? {
          scanId: lastUs.id,
          runAt: lastUs.runAt,
          status: lastUs.status,
          goodResultsCount: lastUs.goodResultsCount,
          staleness: usStaleness > ONE_DAY_MS ? `${Math.round(usStaleness / ONE_DAY_MS)}d old` : `${Math.round(usStaleness / 60000)}m old`,
          errorMessage: lastUs.errorMessage ?? null,
        } : null,
      },
      diagnostics: {
        cronSecretSet: !!process.env.CRON_SECRET,
        scannerBaseUrl: process.env.SCANNER_BASE_URL || "http://localhost:3000",
        nseHistory: nseScans.map(s => ({ runAt: s.runAt, status: s.status, count: s.goodResultsCount })),
        usHistory: usScans.map(s => ({ runAt: s.runAt, status: s.status, count: s.goodResultsCount })),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "CRITICAL",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
