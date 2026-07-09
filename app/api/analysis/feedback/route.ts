import { NextRequest, NextResponse } from "next/server";

// ponytail: in-memory trade log, single process
// upgrade path: persistence to strategies.trades table (Phase 4)
type TradeLog = {
  ticker: string;
  gemScore: number;
  action: "BOUGHT" | "SKIPPED" | "LOSS";
  date: string;
  result?: "WIN" | "LOSS";
};

const tradeLog: TradeLog[] = [];

export async function POST(request: NextRequest) {
  const { ticker, gemScore, action } = await request.json();

  if (!ticker || gemScore === undefined || !action) {
    return NextResponse.json(
      { success: false, error: "Missing fields: ticker, gemScore, action" },
      { status: 400 }
    );
  }

  const trade: TradeLog = {
    ticker: ticker.toUpperCase(),
    gemScore: Math.max(0, Math.min(100, gemScore)),
    action,
    date: new Date().toISOString(),
  };

  tradeLog.push(trade);

  return NextResponse.json(
    { success: true, trade },
    { status: 201 }
  );
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action");

  // Filter by action if specified
  const filtered = action ? tradeLog.filter((t) => t.action === action) : tradeLog;

  // Calculate stats by score range
  const ranges = [
    { min: 80, max: 100, label: "80-100%" },
    { min: 60, max: 79, label: "60-79%" },
    { min: 40, max: 59, label: "40-59%" },
    { min: 0, max: 39, label: "0-39%" },
  ];

  const stats = ranges.map((range) => {
    const tradesInRange = filtered.filter(
      (t) => t.gemScore >= range.min && t.gemScore <= range.max
    );
    const boughtTrades = tradesInRange.filter((t) => t.action === "BOUGHT");
    const wins = boughtTrades.filter((t) => t.result === "WIN").length;
    const winRate =
      boughtTrades.length > 0
        ? Math.round((wins / boughtTrades.length) * 100)
        : null;

    return {
      range: range.label,
      totalTrades: tradesInRange.length,
      boughtTrades: boughtTrades.length,
      wins,
      winRate,
    };
  });

  const totalTrades = filtered.length;
  const boughtCount = filtered.filter((t) => t.action === "BOUGHT").length;
  const overallWins = filtered.filter((t) => t.result === "WIN").length;
  const overallWinRate =
    boughtCount > 0 ? Math.round((overallWins / boughtCount) * 100) : null;

  return NextResponse.json(
    {
      success: true,
      totalTrades,
      boughtCount,
      overallWins,
      overallWinRate,
      byScoreRange: stats,
      trades: filtered,
    },
    { status: 200 }
  );
}
