import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { macdSignals } from "@/lib/db/schema/momentum";

// GET — read-only feed for the Momentum Radar tab.
// ponytail: sign-in/trial gating is disabled until auth+SMTP is fixed (see
// CLAUDE.md Phase 3 backlog). Re-add the requireAuth + trial-window check
// (git history has it) once that's done.
export async function GET(_request: NextRequest) {
  const signals = await db.select().from(macdSignals);

  return NextResponse.json({ success: true, signals }, { status: 200 });
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

  return NextResponse.json({ success: true, count: items.length }, { status: 200 });
}
