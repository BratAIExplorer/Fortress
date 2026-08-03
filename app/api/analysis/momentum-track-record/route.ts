import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { macdSignalLog } from "@/lib/db/schema/momentum";

// GET — read-only win-rate summary for the Momentum Radar tab, built from
// macd_signal_log (already populated by the EOD resolver cron). Aggregates
// in JS rather than SQL GROUP BY — table is small (per-signal rows, not
// per-tick), so a plain SELECT + reduce is simpler and enough.
export async function GET(_request: NextRequest) {
  const rows = await db.select().from(macdSignalLog);

  function summarize(subset: typeof rows) {
    const resolved = subset.filter((r) => r.status !== "open");
    const hitT1 = subset.filter((r) => r.status === "hit_t1").length;
    const hitT2 = subset.filter((r) => r.status === "hit_t2").length;
    const stopped = subset.filter((r) => r.status === "stopped").length;
    const open = subset.filter((r) => r.status === "open").length;
    const wins = hitT1 + hitT2;
    const winRate = resolved.length > 0 ? wins / resolved.length : null;

    const daysToResolve = resolved
      .filter((r) => r.resolvedAt)
      .map((r) => (new Date(r.resolvedAt as Date).getTime() - new Date(r.firstSeenAt).getTime()) / 86_400_000);
    const avgDaysToResolve =
      daysToResolve.length > 0 ? daysToResolve.reduce((a, b) => a + b, 0) / daysToResolve.length : null;

    return {
      total: subset.length,
      open,
      hitT1,
      hitT2,
      stopped,
      resolved: resolved.length,
      winRate,
      avgDaysToResolve,
    };
  }

  return NextResponse.json(
    {
      success: true,
      overall: summarize(rows),
      daily: summarize(rows.filter((r) => r.timeframe === "Daily")),
      weekly: summarize(rows.filter((r) => r.timeframe === "Weekly")),
    },
    { status: 200 }
  );
}
