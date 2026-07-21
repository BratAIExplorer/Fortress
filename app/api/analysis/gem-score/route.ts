import { NextRequest, NextResponse } from "next/server";
import { GemScoreResponse, TradeSignal } from "@/lib/types/trading-specialist";
import YahooFinance from 'yahoo-finance2';

// Suppress historical notices for NSE/LSE tickers
const yahooFinance = new YahooFinance({
  suppressNotices: ['ripHistorical']
});

// In-memory cache: { symbol: { data, timestamp } }
const scoreCache = new Map<string, { data: GemScoreResponse; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// ─── Helper: Math functions ───────────────────────────────────────
function sma(closes: number[], period: number): number {
  if (closes.length < period) return closes[closes.length - 1] || 0;
  const sum = closes.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

function ema(closes: number[], period: number): number {
  if (closes.length < period) return closes[closes.length - 1] || 0;
  const k = 2 / (period + 1);
  let ema = closes[0];
  for (let i = 1; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
  }
  return ema;
}

function rsi(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  return 100 - (100 / (1 + avgGain / avgLoss));
}

function atr(ohlc: Array<{ high: number; low: number; close: number }>, period = 14): number {
  if (ohlc.length < period) return 0;
  const trs = ohlc.map((bar, i) => {
    if (i === 0) return bar.high - bar.low;
    const tr1 = bar.high - bar.low;
    const tr2 = Math.abs(bar.high - ohlc[i - 1].close);
    const tr3 = Math.abs(bar.low - ohlc[i - 1].close);
    return Math.max(tr1, tr2, tr3);
  });
  const sum = trs.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

// ─── Helper: Resolve symbol (US, NSE .NS, LSE .L) ───────────────────
// ponytail: Validate quote response has working data; accept symbol only if
// historical() will likely succeed (check currency, not just existence)
async function resolveSymbol(ticker: string): Promise<{ symbol: string; currency: string }> {
  const normalized = ticker.toUpperCase().trim();
  console.log(`[resolveSymbol] Attempting to resolve: ${normalized}`);

  // Try bare symbol first (US stocks, most common)
  try {
    const quote = await yahooFinance.quote(normalized);
    const price = (quote as any).regularMarketPrice;
    if (price !== undefined && price !== null) {
      const currency = (quote as any).currency === 'INR' ? '₹' : '$';
      console.log(`[resolveSymbol] ✓ ${normalized}: price=${price}, currency=${currency}`);
      return { symbol: normalized, currency };
    }
    console.log(`[resolveSymbol] ${normalized}: quote returned but no price`);
  } catch (e) {
    const err = (e as Error).message;
    console.log(`[resolveSymbol] ${normalized} error: ${err.substring(0, 100)}`);
  }

  // Try .NS for Indian stocks (Nifty)
  try {
    const quote = await yahooFinance.quote(`${normalized}.NS`);
    const price = (quote as any).regularMarketPrice;
    if (price !== undefined && price !== null) {
      console.log(`[resolveSymbol] ✓ ${normalized}.NS: price=${price}, currency=₹`);
      return { symbol: `${normalized}.NS`, currency: '₹' };
    }
    console.log(`[resolveSymbol] ${normalized}.NS: quote returned but no price`);
  } catch (e) {
    const err = (e as Error).message;
    console.log(`[resolveSymbol] ${normalized}.NS error: ${err.substring(0, 100)}`);
  }

  // Try .L for LSE (London Stock Exchange) — Ireland ETFs, UK stocks
  try {
    const quote = await yahooFinance.quote(`${normalized}.L`);
    const price = (quote as any).regularMarketPrice;
    if (price !== undefined && price !== null) {
      console.log(`[resolveSymbol] ✓ ${normalized}.L: price=${price}, currency=£`);
      return { symbol: `${normalized}.L`, currency: '£' };
    }
    console.log(`[resolveSymbol] ${normalized}.L: quote returned but no price`);
  } catch (e) {
    const err = (e as Error).message;
    console.log(`[resolveSymbol] ${normalized}.L error: ${err.substring(0, 100)}`);
  }

  // Fallback: return bare symbol with $ (last resort)
  console.log(`[resolveSymbol] ⚠ Fallback: returning bare ${normalized} with currency $`);
  return { symbol: normalized, currency: '$' };
}

// ─── Helper: Build a single TradeSignal ───────────────────────────
function buildSignal(
  timeframe: 'intraday' | 'shortTerm' | 'longTerm',
  metric1: number, // 1 = bullish, 0 = neutral, -1 = bearish
  metric2: number,
  rsiValue?: number
): TradeSignal {
  const sum = metric1 + metric2;
  let direction: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  let label = 'NEUTRAL';

  if (sum >= 1.5) direction = 'bullish';
  else if (sum <= -1.5) direction = 'bearish';

  // Label based on timeframe and direction
  if (timeframe === 'intraday') {
    label =
      direction === 'bullish'
        ? rsiValue && rsiValue > 70
          ? 'OVERBOUGHT (Entry on dip)'
          : 'MOMENTUM ALIGNED'
        : direction === 'bearish'
          ? 'PULLBACK WARNING'
          : 'CONSOLIDATING';
  } else if (timeframe === 'shortTerm') {
    label =
      direction === 'bullish'
        ? 'RALLY SETUP'
        : direction === 'bearish'
          ? 'BREAKOUT RISK'
          : 'SIDEWAYS';
  } else {
    label =
      direction === 'bullish'
        ? 'STRUCTURAL BUY'
        : direction === 'bearish'
          ? 'CAUTION'
          : 'WATCH';
  }

  // Confidence: base 50 + 15 per metric + RSI extremity
  let confidence = 50;
  if (metric1 !== 0) confidence += 15;
  if (metric2 !== 0) confidence += 15;
  if (rsiValue && (rsiValue > 70 || rsiValue < 30)) confidence += 10;
  confidence = Math.min(confidence, 95);

  return { timeframe, direction, label, confidence };
}

// ─── Helper: Build plain-English Bottom Line ──────────────────────
function buildBottomLine(
  signals: TradeSignal[],
  currentPrice: number,
  sma200: number,
  currency: string
): { headline: string; body: string; sentiment: 'bullish' | 'bearish' | 'neutral' } {
  const dominant = signals.sort((a, b) => b.confidence - a.confidence)[0];
  const priceVsMA200 = currentPrice > sma200 ? 'above' : 'below';
  const priceStr = `${currency}${currentPrice.toFixed(2)}`;
  const ma200Str = `${currency}${sma200.toFixed(2)}`;

  const sentiments: Record<string, string> = {
    'MOMENTUM ALIGNED': 'Price momentum is aligned with the trend. Short-term buyers in control.',
    'RALLY SETUP': 'Consolidation phase ending. Setup for a rally within the medium term.',
    'STRUCTURAL BUY': `Price is ${priceVsMA200} the 200-SMA (${ma200Str}). Strong structural support holding.`,
    'OVERBOUGHT (Entry on dip)': 'RSI showing extremity. Wait for a pullback to enter.',
    'CONSOLIDATING': 'Price is consolidating. No clear direction yet — wait for a break.',
    'BREAKOUT RISK': 'Price may test support soon. Monitor for breaks.',
    'PULLBACK WARNING': 'Short-term momentum is waning. Expect a pullback.',
  };

  const headline =
    dominant?.label === 'STRUCTURAL BUY'
      ? `Trading ${priceStr} — ${priceVsMA200} 200-day MA`
      : `${dominant?.label} (Confidence ${dominant?.confidence}%)`;

  const body =
    sentiments[dominant?.label || ''] ||
    `Current price: ${priceStr}. 200-SMA: ${ma200Str}. Monitor the setup.`;

  const sentiment: 'bullish' | 'bearish' | 'neutral' = (dominant?.direction || 'neutral') as 'bullish' | 'bearish' | 'neutral';

  return {
    headline,
    body,
    sentiment,
  };
}

// ─── Helper: Build chart data (last 60 days) ─────────────────────
function buildChartData(
  historical: any[],
  closes: number[]
): Array<{ date: string; close: number; sma50: number; sma200: number }> {
  const last60Days = Math.min(60, closes.length);
  const startIdx = closes.length - last60Days;
  return historical.slice(-last60Days).map((bar, idx) => {
    const upToIdx = startIdx + idx + 1;
    return {
      date: new Date(bar.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      close: bar.close,
      sma50: sma(closes.slice(0, upToIdx), 50),
      sma200: sma(closes.slice(0, upToIdx), 200),
    };
  });
}

// ─── Main: Calculate real GEM SCORE ────────────────────────────────
async function calculateGemScore(ticker: string): Promise<GemScoreResponse> {
  const { symbol, currency } = await resolveSymbol(ticker);
  console.log(`[calculateGemScore] Resolved ${ticker} → ${symbol} (currency: ${currency})`);

  // Fetch 2 years of historical data
  const end = new Date();
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 2);

  console.log(`[calculateGemScore] Fetching data for ${symbol} from ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`);

  let quote, historical;
  try {
    [quote, historical] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.historical(symbol, {
        period1: start,
        period2: end,
        interval: '1d',
      }),
    ]);
    console.log(`[calculateGemScore] ✓ Quote: price=${(quote as any).regularMarketPrice}, historical rows=${(historical as any[]).length}`);
  } catch (e) {
    console.log(`[calculateGemScore] ✗ API call failed:`, (e as Error).message);
    throw e;
  }

  const currentPrice = (quote as any).regularMarketPrice || 0;
  // ponytail: Filter out null/partial data from LSE/NSE (yahoo-finance2 issue with these markets)
  // Keep only rows where close has a valid price
  const bars = (historical as any[]).filter(b => b.close && b.close > 0 && b.high && b.low);
  const closes = bars.map(b => b.close);
  const ohlc = bars.map(b => ({ high: b.high, low: b.low, close: b.close }));

  // Graceful fallback: insufficient data
  if (closes.length < 21) {
    return {
      success: true,
      ticker,
      timestamp: new Date().toISOString(),
      signals: [
        { timeframe: 'intraday', direction: 'neutral', label: 'INSUFFICIENT DATA', confidence: 40 },
        { timeframe: 'shortTerm', direction: 'neutral', label: 'INSUFFICIENT DATA', confidence: 40 },
        { timeframe: 'longTerm', direction: 'neutral', label: 'INSUFFICIENT DATA', confidence: 40 },
      ],
      bottomLine: {
        headline: 'Not enough historical data',
        body: 'Trading history is too short for reliable technical analysis.',
        sentiment: 'neutral',
      },
      multiTimeframe: [],
    };
  }

  // Calculate indicators
  const ema21 = ema(closes, 21);
  const sma50 = sma(closes, 50);
  const sma200 = closes.length >= 200 ? sma(closes, 200) : sma(closes, Math.min(closes.length, 100));
  const rsi14 = rsi(closes, 14);
  const atr14 = atr(ohlc, 14);

  // 90-day high/low (recent strength signal, not 52-week)
  const high90d = closes.length >= 90 ? Math.max(...closes.slice(-90)) : Math.max(...closes);
  const low90d = closes.length >= 90 ? Math.min(...closes.slice(-90)) : Math.min(...closes);

  // Momentum (20-day % change)
  const momentum20d = closes.length >= 20 ? ((closes[closes.length - 1] - closes[closes.length - 20]) / closes[closes.length - 20]) * 100 : 0;

  // Build signals: 1 = bullish, 0 = neutral, -1 = bearish
  const intraday = buildSignal(
    'intraday',
    currentPrice > ema21 ? 1 : -1,
    rsi14 > 70 ? 1 : rsi14 < 30 ? -1 : 0,
    rsi14
  );

  const shortTerm = buildSignal(
    'shortTerm',
    currentPrice > sma50 ? 1 : -1,
    momentum20d > 2 ? 1 : momentum20d < -2 ? -1 : 0
  );

  const longTerm = buildSignal(
    'longTerm',
    currentPrice > sma200 ? 1 : -1,
    currentPrice > high90d ? 1 : currentPrice < low90d ? -1 : 0
  );

  const signals = [intraday, shortTerm, longTerm];

  // Multi-timeframe entries
  const multiTimeframe: Array<{
    timeframe: string;
    ema_or_sma: string;
    value: string;
    trigger: string;
    triggerType: 'bullish' | 'neutral' | 'bearish';
  }> = [
    { timeframe: 'Daily', ema_or_sma: 'EMA(21)', value: `${currency}${ema21.toFixed(2)}`, trigger: currentPrice > ema21 ? '↑ Above EMA' : '↓ Below EMA', triggerType: currentPrice > ema21 ? 'bullish' : 'bearish' },
    { timeframe: 'Weekly', ema_or_sma: 'SMA(50)', value: `${currency}${sma50.toFixed(2)}`, trigger: currentPrice > sma50 ? 'Above SMA' : 'Below SMA', triggerType: currentPrice > sma50 ? 'bullish' : 'bearish' },
    { timeframe: 'Monthly', ema_or_sma: 'SMA(200)', value: `${currency}${sma200.toFixed(2)}`, trigger: currentPrice > sma200 ? 'Strong support' : 'Weak', triggerType: currentPrice > sma200 ? 'bullish' : 'bearish' },
    { timeframe: 'Range', ema_or_sma: '90d High/Low', value: `${currency}${high90d.toFixed(2)} / ${currency}${low90d.toFixed(2)}`, trigger: currentPrice > high90d ? '↑ Above range' : currentPrice < low90d ? '↓ Below range' : 'In range', triggerType: currentPrice > high90d ? 'bullish' : currentPrice < low90d ? 'bearish' : 'neutral' },
    { timeframe: 'Volatility', ema_or_sma: 'ATR(14)', value: `${currency}${atr14.toFixed(2)}`, trigger: `Stop = ${(currentPrice - atr14 * 2).toFixed(2)}`, triggerType: 'neutral' },
  ];

  const bottomLine = buildBottomLine(signals, currentPrice, sma200, currency);
  const chartData = buildChartData(historical as any[], closes);

  return {
    success: true,
    ticker,
    timestamp: new Date().toISOString(),
    signals,
    bottomLine,
    multiTimeframe,
    chartData,
  };
}

async function getScore(ticker: string): Promise<GemScoreResponse> {
  const cacheKey = ticker.toUpperCase();
  const now = Date.now();

  const cached = scoreCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const scoreData = await calculateGemScore(ticker);
  scoreCache.set(cacheKey, { data: scoreData, timestamp: now });
  return scoreData;
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");
  const tickersParam = request.nextUrl.searchParams.get("tickers");

  // Batch mode: ?tickers=DASH,PLTR,SPOT
  if (tickersParam) {
    const tickers = tickersParam.split(",").map(t => t.trim()).filter(Boolean);
    const results = await Promise.all(
      tickers.map(async t => {
        try {
          return await getScore(t);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Analysis failed";
          return { success: false, ticker: t, error: message } as GemScoreResponse;
        }
      })
    );
    return NextResponse.json({ results }, { status: 200 });
  }

  if (!ticker || ticker.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: "Ticker symbol required" },
      { status: 400 }
    );
  }

  try {
    const scoreData = await getScore(ticker);
    return NextResponse.json(scoreData, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json(
      { success: false, ticker, error: message },
      { status: 500 }
    );
  }
}
