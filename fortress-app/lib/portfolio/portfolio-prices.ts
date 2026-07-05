import yahooFinance from "yahoo-finance2";

// 5-minute cache — fresh enough for a portfolio tracker
const cache = new Map<string, { price: number; time: number }>();
const CACHE_MS = 5 * 60 * 1000;

/**
 * Fetches live prices for a list of tickers.
 * Cached per ticker for 5 minutes to avoid rate-limiting.
 * Returns 0 for any ticker that fails to fetch.
 */
export async function fetchLivePrices(
  tickers: string[]
): Promise<Record<string, number>> {
  const now = Date.now();
  const stale = tickers.filter((t) => {
    const hit = cache.get(t);
    return !hit || now - hit.time > CACHE_MS;
  });

  if (stale.length > 0) {
    const results = await Promise.allSettled(
      stale.map((t) => yahooFinance.quote(t))
    );
    results.forEach((res, i) => {
      if (res.status === "fulfilled") {
        const price = (res.value as { regularMarketPrice?: number } | null)?.regularMarketPrice;
        if (price) cache.set(stale[i], { price, time: now });
      }
    });
  }

  return Object.fromEntries(
    tickers.map((t) => [t, cache.get(t)?.price ?? 0])
  );
}
