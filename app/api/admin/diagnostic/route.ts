import { db, schema } from "@/lib/db/client";
import { eq, desc, and, gte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
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
          gte(may4Date, schema.scans.runAt)
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

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      allScans: allScans.map(s => ({
        id: s.id,
        market: s.market,
        status: s.status,
        runAt: s.runAt?.toISOString(),
        totalScanned: s.totalScanned,
        goodResultsCount: s.goodResultsCount,
        errorMessage: s.errorMessage,
      })),
      usScans: usScans.map(s => ({
        market: s.market,
        status: s.status,
        runAt: s.runAt?.toISOString(),
        goodResults: s.goodResultsCount,
        totalScanned: s.totalScanned,
      })),
      may2_3_scans: recentScans.map(s => ({
        market: s.market,
        status: s.status,
        runAt: s.runAt?.toISOString(),
        goodResults: s.goodResultsCount,
      })),
      summary: {
        totalScans: allScans.length,
        usScansCount: usScans.length,
        latestScanDate: allScans[0]?.runAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Diagnostic error:", error);
    return NextResponse.json(
      { error: String(error), timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
