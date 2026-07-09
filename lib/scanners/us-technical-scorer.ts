/**
 * US Technical Scorer — Massive Market Data powered
 *
 * Pulls 90-day daily OHLCV from Massive.com and derives MB-compatible
 * technical scores. Produces the same schema as the Python scanner
 * (l1-l5 pass/fail, mbScore 0-100, mbTier) but from price/volume only.
 *
 * l1 → RSI not overbought (RSI < 70, ideally 40-65 = momentum without excess)
 * l2 → Price above SMA50 (uptrend confirmed)
 * l3 → Price above SMA20 (short-term momentum positive)
 * l4 → Proximity to 90-day high (strength signal, soft weighted not binary)
 * l5 → Volume trending up (last 10-day avg > 30-day avg)
 *
 * Note: L4 uses weighted scoring on proximity to 90-day high rather than hard gate,
 * avoiding cliff effects where stocks just below threshold penalized equally to weak performers.
 */

const MASSIVE_BASE = "https://api.massive.com";
const OHLCV_DAYS   = 90;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OHLCVBar {
  t: number;  // timestamp ms
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface TechnicalScore {
  symbol:    string;
  price:     number;
  l1Pass:    boolean;  // RSI in healthy range
  l2Pass:    boolean;  // above SMA50
  l3Pass:    boolean;  // above SMA20
  l4Pass:    boolean;  // proximity to 90-day high (weighted, not binary)
  l5Pass:    boolean;  // volume momentum positive
  mbScore:   number;   // 0-100
  mbTier:    string;   // Rocket | Launcher | Builder | Crawler | Grounded
  rsi:       number;
  sma20:     number;
  sma50:     number;
  high90d:   number;   // 90-day high (from recent 90d OHLCV data)
  error?:    string;
}

// ── Calculations ──────────────────────────────────────────────────────────────

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

// ── OHLCV fetch ───────────────────────────────────────────────────────────────
// ⚠️  Rate limit risk: Massive Market Data enforces 5 calls/min limit
// Scanner cron must throttle requests or implement exponential backoff to avoid
// silent partial results (some tickers fail, others succeed, scan incompleteness hidden)

async function fetchOHLCV(ticker: string, apiKey: string): Promise<OHLCVBar[]> {
  const to   = new Date();
  const from = new Date(Date.now() - OHLCV_DAYS * 24 * 60 * 60 * 1000);
  const fmt  = (d: Date) => d.toISOString().split("T")[0];

  const url = `${MASSIVE_BASE}/v2/aggs/ticker/${ticker}/range/1/day/${fmt(from)}/${fmt(to)}?adjusted=true&sort=asc&limit=120`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) throw new Error(`Massive ${res.status} for ${ticker}`);

  const json = await res.json() as {
    results?: { t: number; o: number; h: number; l: number; c: number; v: number }[];
    status?: string;
  };

  if (!json.results || json.results.length === 0) return [];
  return json.results.map(r => ({ t: r.t, o: r.o, h: r.h, l: r.l, c: r.c, v: r.v }));
}

// ── Scorer ────────────────────────────────────────────────────────────────────

export async function scoreTicker(ticker: string, apiKey: string): Promise<TechnicalScore> {
  try {
    const bars   = await fetchOHLCV(ticker, apiKey);
    if (bars.length < 20) throw new Error("Insufficient data");

    const closes  = bars.map(b => b.c);
    const volumes = bars.map(b => b.v);
    const price   = closes[closes.length - 1];
    const high90d = Math.max(...bars.map(b => b.h));

    const rsiVal  = Math.round(rsi(closes));
    const sma20   = sma(closes, 20);
    const sma50   = sma(closes, Math.min(50, closes.length));
    const vol10   = sma(volumes, 10);
    const vol30   = sma(volumes, Math.min(30, volumes.length));

    const l1Pass = rsiVal >= 30 && rsiVal <= 70;
    const l2Pass = sma50 > 0 && price > sma50;
    const l3Pass = sma20 > 0 && price > sma20;
    const l4Pass = high90d > 0 && price >= high90d * 0.75;
    const l5Pass = vol30 > 0 && vol10 > vol30;

    // L4 soft-weighted: proximity to 90-day high (0-25 points, continuous)
    // Avoids cliff effect where price missing threshold by 1% gets same score as deep drawdown
    const l4Proximity = high90d > 0 ? Math.max(0, Math.min(25, (price / high90d) * 25)) : 0;

    const passes  = [l1Pass, l2Pass, l3Pass, l4Pass, l5Pass].filter(Boolean).length;
    // Weight: l2 (trend) and l4 (90d proximity) are key drivers
    const weighted = (l1Pass ? 15 : 0) + (l2Pass ? 25 : 0) + (l3Pass ? 20 : 0)
                   + l4Proximity + (l5Pass ? 15 : 0);
    const mbScore  = Math.round(weighted);

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
