/**
 * Technical Scorer — yahoo-finance2 powered (free, no API key)
 *
 * Replaces the Massive-only scorer: Massive has zero NSE/India coverage at
 * any price tier (confirmed against their live API), so the scanner needs a
 * single source that works for both markets. yahoo-finance2 already powers
 * real GEM SCOREs for /api/analysis/gem-score in production.
 *
 * Same schema/logic as the retired us-technical-scorer.ts (l1-l5 pass/fail,
 * mbScore 0-100, mbTier) so downstream DB writes and UI are unaffected.
 *
 * l1 → RSI not overbought (30-70 = momentum without excess)
 * l2 → Price above SMA50 (uptrend confirmed)
 * l3 → Price above SMA20 (short-term momentum positive)
 * l4 → Proximity to 90-day high (strength signal, soft weighted not binary)
 * l5 → Volume trending up (last 10-day avg > 30-day avg)
 */
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["ripHistorical"] });
const OHLCV_DAYS = 90;

export interface TechnicalScore {
  symbol: string;
  price: number;
  l1Pass: boolean;
  l2Pass: boolean;
  l3Pass: boolean;
  l4Pass: boolean;
  l5Pass: boolean;
  mbScore: number;
  mbTier: string;
  rsi: number;
  sma20: number;
  sma50: number;
  high90d: number;
  error?: string;
}

function sma(values: number[], period: number): number {
  const slice = values.slice(-period);
  if (slice.length < period) return 0;
  return slice.reduce((a, b) => a + b, 0) / period;
}

function rsi(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const delta = closes[i] - closes[i - 1];
    if (delta > 0) gains += delta;
    else losses += Math.abs(delta);
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

function mbTierFromScore(score: number): string {
  if (score >= 75) return "Rocket";
  if (score >= 55) return "Launcher";
  if (score >= 40) return "Builder";
  if (score >= 25) return "Crawler";
  return "Grounded";
}

// market decides ticker suffix: NSE tickers are bare symbols (e.g. "RELIANCE")
// per lib/scanners/universe.ts, so .NS is appended here, not upstream.
function toYahooSymbol(ticker: string, market: string): string {
  return market === "NSE" ? `${ticker}.NS` : ticker;
}

export async function scoreTicker(ticker: string, market: string): Promise<TechnicalScore> {
  const symbol = toYahooSymbol(ticker, market);
  try {
    const end = new Date();
    const start = new Date(end.getTime() - OHLCV_DAYS * 24 * 60 * 60 * 1000);

    const historical = await yahooFinance.historical(symbol, {
      period1: start,
      period2: end,
      interval: "1d",
    });

    const bars = (historical as Array<{ high: number; close: number; volume: number }>)
      .filter(b => b.close > 0);
    if (bars.length < 20) throw new Error("Insufficient data");

    const closes = bars.map(b => b.close);
    const volumes = bars.map(b => b.volume);
    const price = closes[closes.length - 1];
    const high90d = Math.max(...bars.map(b => b.high));

    const rsiVal = Math.round(rsi(closes));
    const sma20 = sma(closes, 20);
    const sma50 = sma(closes, Math.min(50, closes.length));
    const vol10 = sma(volumes, 10);
    const vol30 = sma(volumes, Math.min(30, volumes.length));

    const l1Pass = rsiVal >= 30 && rsiVal <= 70;
    const l2Pass = sma50 > 0 && price > sma50;
    const l3Pass = sma20 > 0 && price > sma20;
    const l4Pass = high90d > 0 && price >= high90d * 0.75;
    const l5Pass = vol30 > 0 && vol10 > vol30;

    const l4Proximity = high90d > 0 ? Math.max(0, Math.min(25, (price / high90d) * 25)) : 0;

    const weighted = (l1Pass ? 15 : 0) + (l2Pass ? 25 : 0) + (l3Pass ? 20 : 0)
                   + l4Proximity + (l5Pass ? 15 : 0);
    const mbScore = Math.round(weighted);

    return {
      symbol: ticker,
      price,
      l1Pass, l2Pass, l3Pass, l4Pass, l5Pass,
      mbScore,
      mbTier: mbTierFromScore(mbScore),
      rsi: rsiVal,
      sma20: Math.round(sma20 * 100) / 100,
      sma50: Math.round(sma50 * 100) / 100,
      high90d: Math.round(high90d * 100) / 100,
    };
  } catch (err) {
    return {
      symbol: ticker,
      price: 0,
      l1Pass: false, l2Pass: false, l3Pass: false, l4Pass: false, l5Pass: false,
      mbScore: 0,
      mbTier: "Grounded",
      rsi: 0, sma20: 0, sma50: 0, high90d: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
