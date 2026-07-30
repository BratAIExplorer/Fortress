import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { db } from "@/lib/db";
import { macdSignalLog } from "@/lib/db/schema/momentum";
import { eq } from "drizzle-orm";
import { notifyAdminError, notifyAllSubscribers } from "@/lib/telegram-alert";

// POST — market-close job (cron-scheduler.js, 15:30 IST). For every signal
// currently "open" in macd_signal_log, fetches the live price and resolves it
// to hit_t1 / hit_t2 / stopped if a threshold was crossed, then posts a
// same-day count to Telegram. Signals that don't cross anything stay "open"
// and get re-checked on the next trading day's close.
export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const open = await db.select().from(macdSignalLog).where(eq(macdSignalLog.status, "open"));

  let hitT1 = 0;
  let hitT2 = 0;
  let stopped = 0;
  let stillOpen = 0;

  for (const row of open) {
    try {
      const quote = (await yahooFinance.quote(`${row.symbol}.NS`)) as { regularMarketPrice?: number } | null;
      const cmp = quote?.regularMarketPrice;
      if (cmp == null) {
        stillOpen++;
        continue;
      }

      const finalTarget = row.finalTargetPrice ? Number(row.finalTargetPrice) : null;
      const firstTarget = row.firstTargetPrice ? Number(row.firstTargetPrice) : null;
      const stopLoss = row.stopLossPrice ? Number(row.stopLossPrice) : null;

      let status: string | null = null;
      if (finalTarget != null && cmp >= finalTarget) status = "hit_t2";
      else if (firstTarget != null && cmp >= firstTarget) status = "hit_t1";
      else if (stopLoss != null && cmp <= stopLoss) status = "stopped";

      if (status) {
        await db
          .update(macdSignalLog)
          .set({ status, resolvedAt: new Date() })
          .where(eq(macdSignalLog.id, row.id));
        if (status === "hit_t2") hitT2++;
        else if (status === "hit_t1") hitT1++;
        else stopped++;
      } else {
        stillOpen++;
      }
    } catch {
      // Quote fetch failed for this symbol — leave it open, try again tomorrow.
      stillOpen++;
    }
  }

  const total = open.length;
  const text = `📈 *Signal Alert — EOD Summary*\n\n${total} signal(s) tracked today:\n✅ Hit final target: ${hitT2}\n🎯 Hit first target: ${hitT1}\n🛑 Stopped out: ${stopped}\n⏳ Still open: ${stillOpen}`;

  try {
    await notifyAllSubscribers(text);
  } catch (e) {
    void notifyAdminError("momentum-eod-summary notify", e);
  }

  return NextResponse.json(
    { success: true, total, hitT1, hitT2, stopped, stillOpen },
    { status: 200 }
  );
}
