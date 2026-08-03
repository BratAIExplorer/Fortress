import YahooFinance from "yahoo-finance2";
import { toYahooSymbol } from "@/lib/scanners/smallcap-fundamentals";
import type { FundamentalsBadge } from "@/lib/momentum/score";

export type { FundamentalsBadge } from "@/lib/momentum/score";

const yahooFinance = new YahooFinance({ suppressNotices: ["ripHistorical", "yahooSurvey"] });

// ponytail: module-level Map cache, same pattern as lib/portfolio/yfinance.ts
// (intelCache). Fundamentals move slowly, 1hr TTL is generous headroom.
const cache = new Map<string, { data: FundamentalsBadge; time: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

async function fetchOne(symbol: string): Promise<FundamentalsBadge> {
  const q = await yahooFinance.quoteSummary(toYahooSymbol(symbol), {
    modules: ["summaryDetail", "financialData"],
  });
  return {
    pe: q.summaryDetail?.trailingPE ?? null,
    debtToEquity: q.financialData?.debtToEquity ?? null,
    revGrowth: q.financialData?.revenueGrowth ?? null,
  };
}

/** Batch-fetch fundamentals for unique symbols, cached, never throws per-symbol. */
export async function fetchFundamentalsBatch(
  symbols: string[]
): Promise<Record<string, FundamentalsBadge | null>> {
  const now = Date.now();
  const unique = Array.from(new Set(symbols));
  const result: Record<string, FundamentalsBadge | null> = {};

  await Promise.all(
    unique.map(async (symbol) => {
      const cached = cache.get(symbol);
      if (cached && now - cached.time < CACHE_DURATION) {
        result[symbol] = cached.data;
        return;
      }
      try {
        const data = await fetchOne(symbol);
        cache.set(symbol, { data, time: now });
        result[symbol] = data;
      } catch {
        result[symbol] = null;
      }
    })
  );

  return result;
}
