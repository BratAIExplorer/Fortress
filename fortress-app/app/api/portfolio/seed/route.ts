import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createStrategy, upsertHoldings, getStrategiesByUserId } from "@/lib/portfolio/portfolio-queries";

// The 10X Moonshot — Plan B strategy from the founder's ETF challenge
const MOONSHOT = {
  name: "10X Moonshot",
  description: "Leveraged global ETF portfolio targeting 10x in 10 years. Core/leverage/ballast barbell.",
  emoji: "🚀",
  riskTier: "aggressive" as const,
  totalCapitalUsd: 10000,
  targetMultiple: 10,
  targetHorizonYears: 10,
};

const MOONSHOT_HOLDINGS = [
  { ticker: "SMH",  name: "VanEck Semiconductor ETF",                   targetWeightPct: 20, unitsHeld: 0, avgBuyPrice: 0 },
  { ticker: "QQQ",  name: "Invesco Nasdaq-100 ETF",                     targetWeightPct: 15, unitsHeld: 0, avgBuyPrice: 0 },
  { ticker: "INDA", name: "iShares MSCI India ETF",                     targetWeightPct: 10, unitsHeld: 0, avgBuyPrice: 0 },
  { ticker: "TQQQ", name: "ProShares UltraPro QQQ (3x Leveraged)",      targetWeightPct: 30, unitsHeld: 0, avgBuyPrice: 0 },
  { ticker: "SOXL", name: "Direxion Semiconductor Bull 3X ETF",         targetWeightPct: 15, unitsHeld: 0, avgBuyPrice: 0 },
  { ticker: "GLD",  name: "SPDR Gold Trust ETF",                        targetWeightPct: 10, unitsHeld: 0, avgBuyPrice: 0 },
];

// POST /api/portfolio/seed — seeds the 10X Moonshot strategy for the current user
// Safe to call multiple times — only seeds if user has no strategies yet
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await getStrategiesByUserId(session.user.id);
  if (existing.length > 0) {
    return NextResponse.json({
      success: true,
      message: "Already seeded — you have existing strategies",
      data: existing,
    });
  }

  const strategy = await createStrategy(session.user.id, MOONSHOT);
  await upsertHoldings(strategy.id, MOONSHOT_HOLDINGS);

  return NextResponse.json({
    success: true,
    message: "10X Moonshot strategy created",
    data: strategy,
  }, { status: 201 });
}
