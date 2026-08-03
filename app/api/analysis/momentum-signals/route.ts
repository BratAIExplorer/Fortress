import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { macdSignals, macdSignalLog } from "@/lib/db/schema/momentum";
import { and, eq } from "drizzle-orm";
import { notifyAdminError } from "@/lib/telegram-alert";
import { fetchFundamentalsBatch } from "@/lib/momentum/fundamentals";

// GET — read-only feed for the Momentum Radar tab.
// ponytail: sign-in/trial gating is disabled until auth+SMTP is fixed (see
// CLAUDE.md Phase 3 backlog). Re-add the requireAuth + trial-window check
// (git history has it) once that's done.
export async function GET(_request: NextRequest) {
  const signals = await db.select().from(macdSignals);
  const lastUpdated = signals.reduce<string | null>((latest, s) => {
    const iso = new Date(s.updatedAt).toISOString();
    return !latest || iso > latest ? iso : latest;
  }, null);

  // Fundamentals are a nice-to-have overlay — a Yahoo hiccup here shouldn't
  // block the signal table itself from rendering.
  let fundamentals: Record<string, { pe: number | null; debtToEquity: number | null; revGrowth: number | null } | null> = {};
  try {
    fundamentals = await fetchFundamentalsBatch(signals.map((s) => s.symbol));
  } catch (e) {
    console.error("[momentum-signals] fundamentals fetch failed:", e);
  }
  const enriched = signals.map((s) => ({ ...s, fundamentals: fundamentals[s.symbol] ?? null }));

  return NextResponse.json({ success: true, signals: enriched, lastUpdated }, { status: 200 });
}

// POST — ingest from the standalone MACD bot (Equity_The-Final-chapter).
// Shared-secret auth, matching the existing x-cron-secret pattern used by
// /api/scan/ai-run. Replaces the full snapshot every call, mirroring the
// bot's own "Currently Active" sheet semantics (not an append-only log).
export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { success: false, error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const items = Array.isArray(body?.signals) ? body.signals : [];

  try {
    await db.transaction(async (tx) => {
      await tx.delete(macdSignals);
      if (items.length > 0) {
        await tx.insert(macdSignals).values(
          items.map((item: Record<string, unknown>) => ({
            timeframe: String(item.timeframe ?? ""),
            symbol: String(item.symbol ?? ""),
            cmp: String(item.cmp ?? "0"),
            crossoverDate: String(item.crossoverDate ?? ""),
            daysSinceCrossover: Number(item.daysSinceCrossover ?? 0),
            quantity: Number(item.quantity ?? 0),
            investedAmount: String(item.investedAmount ?? "0"),
            firstTargetPrice: item.firstTargetPrice != null ? String(item.firstTargetPrice) : null,
            firstTargetEma: item.firstTargetEma != null ? String(item.firstTargetEma) : null,
            finalTargetPrice: item.finalTargetPrice != null ? String(item.finalTargetPrice) : null,
            finalTargetEma: item.finalTargetEma != null ? String(item.finalTargetEma) : null,
            stopLossPrice: item.stopLossPrice != null ? String(item.stopLossPrice) : null,
            stopLossEma: item.stopLossEma != null ? String(item.stopLossEma) : null,
            riskAmount: item.riskAmount != null ? String(item.riskAmount) : null,
          }))
        );
      }
    });
  } catch (e) {
    console.error("[momentum-signals] insert failed:", e);
    void notifyAdminError(`momentum-signals POST (${items.length} signals)`, e);
    return NextResponse.json({ success: false, error: "INSERT_FAILED" }, { status: 500 });
  }

  // Log any symbol+timeframe not already open, so the EOD job has a durable
  // row to resolve later — macd_signals itself gets wiped next cycle.
  try {
    for (const item of items as Record<string, unknown>[]) {
      const timeframe = String(item.timeframe ?? "");
      const symbol = String(item.symbol ?? "");
      if (!timeframe || !symbol) continue;

      const existing = await db
        .select({ id: macdSignalLog.id })
        .from(macdSignalLog)
        .where(
          and(
            eq(macdSignalLog.symbol, symbol),
            eq(macdSignalLog.timeframe, timeframe),
            eq(macdSignalLog.status, "open")
          )
        )
        .limit(1);
      if (existing.length > 0) continue;

      await db.insert(macdSignalLog).values({
        timeframe,
        symbol,
        entryCmp: String(item.cmp ?? "0"),
        firstTargetPrice: item.firstTargetPrice != null ? String(item.firstTargetPrice) : null,
        finalTargetPrice: item.finalTargetPrice != null ? String(item.finalTargetPrice) : null,
        stopLossPrice: item.stopLossPrice != null ? String(item.stopLossPrice) : null,
      });
    }
  } catch (e) {
    console.error("[momentum-signals] signal log insert failed:", e);
    void notifyAdminError("momentum-signals signal log insert", e);
  }

  return NextResponse.json({ success: true, count: items.length }, { status: 200 });
}
