import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { macdSignals } from "@/lib/db/schema/momentum";
import { sql } from "drizzle-orm";
import { env } from "@/lib/env";

const STALE_AFTER_MINUTES = 20;

function isNseMarketHours(): boolean {
  const nowIst = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const day = nowIst.getDay(); // 0 Sun ... 6 Sat
  const minutes = nowIst.getHours() * 60 + nowIst.getMinutes();
  return day >= 1 && day <= 5 && minutes >= 9 * 60 + 15 && minutes <= 15 * 60 + 30;
}

// Shared-password admin view of the Momentum Radar bot's health — not tied
// to user auth (that gate is currently disabled pending Phase 3/SMTP), just
// a standalone password check for whoever needs to see bot status.
export async function POST(request: NextRequest) {
  if (!env.ADMIN_PANEL_PASSWORD) {
    return NextResponse.json(
      { success: false, error: "ADMIN_PANEL_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  const { password } = await request.json();
  if (password !== env.ADMIN_PANEL_PASSWORD) {
    return NextResponse.json(
      { success: false, error: "INVALID_PASSWORD" },
      { status: 401 }
    );
  }

  const [row] = await db
    .select({
      count: sql<number>`count(*)`,
      lastUpdated: sql<string | null>`max(${macdSignals.updatedAt})`,
    })
    .from(macdSignals);

  const lastUpdated = row?.lastUpdated ? new Date(row.lastUpdated) : null;
  const minutesSinceUpdate = lastUpdated
    ? (Date.now() - lastUpdated.getTime()) / 60000
    : null;
  const marketHours = isNseMarketHours();
  const stale =
    marketHours && (minutesSinceUpdate === null || minutesSinceUpdate > STALE_AFTER_MINUTES);

  return NextResponse.json({
    success: true,
    activeSignalCount: Number(row?.count ?? 0),
    lastUpdated: lastUpdated ? lastUpdated.toISOString() : null,
    minutesSinceUpdate: minutesSinceUpdate !== null ? Math.round(minutesSinceUpdate) : null,
    marketHoursNow: marketHours,
    stale,
    staleThresholdMinutes: STALE_AFTER_MINUTES,
  });
}
