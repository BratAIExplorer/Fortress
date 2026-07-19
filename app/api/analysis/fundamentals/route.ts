import { NextRequest, NextResponse } from "next/server";
import { FundamentalsResponse } from "@/lib/types/trading-specialist";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

// ponytail: same 15-min in-memory cache pattern as gem-score/route.ts, no shared cache module — two call sites don't justify one yet
const cache = new Map<string, { data: FundamentalsResponse; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000;

async function resolveSymbol(ticker: string): Promise<string> {
  const normalized = ticker.toUpperCase().trim();
  try {
    await yahooFinance.quote(normalized);
    return normalized;
  } catch {
    return `${normalized}.NS`;
  }
}

async function fetchFundamentals(ticker: string): Promise<FundamentalsResponse> {
  const symbol = await resolveSymbol(ticker);

  const summary = await yahooFinance.quoteSummary(symbol, {
    modules: ["defaultKeyStatistics", "financialData", "summaryDetail", "price"],
  });

  const currency = summary.price?.currency === "INR" ? "₹" : "$";

  return {
    success: true,
    ticker,
    currency,
    trailingPE: summary.summaryDetail?.trailingPE ?? null,
    forwardPE: summary.summaryDetail?.forwardPE ?? summary.defaultKeyStatistics?.forwardPE ?? null,
    priceToBook: summary.defaultKeyStatistics?.priceToBook ?? null,
    profitMargin: summary.financialData?.profitMargins ?? null,
    revenueGrowth: summary.financialData?.revenueGrowth ?? null,
    returnOnEquity: summary.financialData?.returnOnEquity ?? null,
    dividendYield: summary.summaryDetail?.dividendYield ?? null,
    freeCashflow: summary.financialData?.freeCashflow ?? null,
    marketCap: summary.price?.marketCap ?? null,
  };
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");
  if (!ticker || ticker.trim().length === 0) {
    return NextResponse.json({ success: false, error: "Ticker symbol required" }, { status: 400 });
  }

  const cacheKey = ticker.toUpperCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data, { status: 200 });
  }

  try {
    const data = await fetchFundamentals(ticker);
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fundamentals fetch failed";
    return NextResponse.json(
      { success: false, ticker, error: message },
      { status: 500 }
    );
  }
}
