import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authUser } from "@/lib/db/schema/auth";
import { macdSignals } from "@/lib/db/schema/momentum";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/middleware";

const TRIAL_DAYS = 30;

// GET — read-only feed for the Momentum Radar tab. Gated: signed-in users
// only, and only within the 30-day trial window unless subscriptionStatus
// is "active".
export async function GET(request: NextRequest) {
  let session;
  try {
    session = requireAuth(request);
  } catch {
    return NextResponse.json(
      { success: false, error: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  const userRows = await db
    .select({
      createdAt: authUser.createdAt,
      subscriptionStatus: authUser.subscriptionStatus,
    })
    .from(authUser)
    .where(eq(authUser.id, session.userId))
    .limit(1);

  const user = userRows[0];
  if (!user) {
    return NextResponse.json(
      { success: false, error: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  const trialDaysElapsed =
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const trialExpired = trialDaysElapsed > TRIAL_DAYS;

  if (trialExpired && user.subscriptionStatus !== "active") {
    return NextResponse.json(
      { success: false, error: "TRIAL_EXPIRED", trialDays: TRIAL_DAYS },
      { status: 402 }
    );
  }

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
