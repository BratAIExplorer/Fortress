/**
 * Smallcap Fundamentals Fetcher — yahoo-finance2 powered (free, no API key)
 *
 * emerging-growth-scorer.ts was written against a hand-typed Stock[] and has
 * never been fed live data. This module is the missing half: it fetches the
 * fundamentals that scorer already expects, plus a liquidity read, so the
 * smallcap screen can run against a real universe.
 *
 * Deliberately does NOT modify emerging-growth-scorer.ts — it produces the
 * exact `Stock` shape that scorer already consumes.
 *
 * Honest limits of the free Yahoo feed (surfaced, not hidden):
 *  - ROCE is not published. We substitute ROE (returnOnEquity) and label it.
 *    ROE flatters leveraged companies, so a high-debt name can look better
 *    than it is. Treat `roceIsProxy: true` rows as needing a manual check.
 *  - Margin trend is derived from quarterly operating margin vs the same
 *    quarter a year earlier. Missing quarterlies yield `margin_delta: 0`.
 *  - Yahoo's India coverage is thinner than its US coverage; misses are
 *    reported per ticker rather than silently dropped.
 */
import YahooFinance from "yahoo-finance2";
import type { Stock } from "./emerging-growth-scorer";
import { screenLiquidity, type Bar, type LiquidityResult } from "./liquidity-screen";

const yahooFinance = new YahooFinance({ suppressNotices: ["ripHistorical", "yahooSurvey"] });

const HISTORY_DAYS = 40; // enough for a 20-day liquidity window plus slack
const CONCURRENCY = 8; // polite to Yahoo; ~500 tickers in a few minutes
const CRORE = 10_000_000; // 1 crore = 10 million

export interface SmallcapRow extends Stock {
  price: number;
  liquidity: LiquidityResult;
  /** true when ROCE was substituted with ROE because Yahoo does not publish ROCE */
  roceIsProxy: boolean;
  currency: string;
}

export interface FetchOutcome {
  rows: SmallcapRow[];
  failures: { symbol: string; reason: string }[];
}

/** NSE tickers need a .NS suffix on Yahoo; leave already-suffixed symbols alone. */
export function toYahooSymbol(symbol: string, market: "NSE" | "SGX" | "HKEX" = "NSE"): string {
  if (symbol.includes(".")) return symbol;
  if (market === "SGX") return `${symbol}.SI`;
  if (market === "HKEX") return `${symbol.padStart(4, "0")}.HK`;
  return `${symbol}.NS`;
}

/** Operating-margin change vs the same quarter a year ago, in basis points. */
function marginDeltaBps(quarterly: { totalRevenue?: number; operatingIncome?: number }[]): number {
  if (!quarterly || quarterly.length < 5) return 0;
  const margin = (q: { totalRevenue?: number; operatingIncome?: number }) => {
    const rev = Number(q?.totalRevenue);
    const op = Number(q?.operatingIncome);
    if (!Number.isFinite(rev) || !Number.isFinite(op) || rev <= 0) return null;
    return op / rev;
  };
  // yahoo-finance2 returns most-recent-first
  const now = margin(quarterly[0]);
  const yearAgo = margin(quarterly[4]);
  if (now === null || yearAgo === null) return 0;
  return Math.round((now - yearAgo) * 10_000);
}

async function fetchOne(
  symbol: string,
  market: "NSE" | "SGX" | "HKEX",
  targetPosition?: number
): Promise<SmallcapRow> {
  const ySym = toYahooSymbol(symbol, market);

  const [summary, chart] = await Promise.all([
    yahooFinance.quoteSummary(ySym, {
      modules: ["price", "summaryDetail", "financialData", "incomeStatementHistoryQuarterly"],
    }),
    yahooFinance.chart(ySym, {
      period1: new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000),
      interval: "1d",
    }),
  ]);

  const price = Number(summary.price?.regularMarketPrice);
  const marketCap = Number(summary.price?.marketCap);
  if (!Number.isFinite(price) || !Number.isFinite(marketCap)) {
    throw new Error("no price or market cap");
  }

  const bars: Bar[] = (chart.quotes ?? [])
    .filter((q) => Number.isFinite(q.close) && q.close !== null)
    .map((q) => ({ close: Number(q.close), volume: Number(q.volume ?? 0) }));

  const fin = summary.financialData;
  const quarterly = summary.incomeStatementHistoryQuarterly?.incomeStatementHistory ?? [];

  return {
    symbol,
    name: summary.price?.shortName ?? symbol,
    price,
    growth_rate: Number(fin?.revenueGrowth ?? 0),
    roce: Number(fin?.returnOnEquity ?? 0), // proxy — see file header
    roceIsProxy: true,
    pe_ratio: Number(summary.summaryDetail?.trailingPE ?? Number.POSITIVE_INFINITY),
    margin_delta: marginDeltaBps(quarterly as never[]),
    market_cap_crores: marketCap / CRORE,
    sector: (summary.price as { sector?: string } | undefined)?.sector ?? "Unknown",
    currency: summary.price?.currency ?? "INR",
    liquidity: screenLiquidity(bars, targetPosition),
  };
}

/** Fetch a whole universe with bounded concurrency. Never throws; misses are reported. */
export async function fetchSmallcapFundamentals(
  symbols: string[],
  opts: { market?: "NSE" | "SGX" | "HKEX"; targetPosition?: number; onProgress?: (done: number, total: number) => void } = {}
): Promise<FetchOutcome> {
  const market = opts.market ?? "NSE";
  const rows: SmallcapRow[] = [];
  const failures: { symbol: string; reason: string }[] = [];
  let done = 0;

  const queue = [...symbols];
  const worker = async () => {
    while (queue.length) {
      const symbol = queue.shift();
      if (!symbol) break;
      try {
        rows.push(await fetchOne(symbol, market, opts.targetPosition));
      } catch (err) {
        failures.push({ symbol, reason: err instanceof Error ? err.message : String(err) });
      }
      opts.onProgress?.(++done, symbols.length);
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, symbols.length) }, worker));
  return { rows, failures };
}
