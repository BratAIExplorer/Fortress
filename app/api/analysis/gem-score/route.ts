import { NextRequest, NextResponse } from "next/server";
import { GemScoreResponse, TradeSignal } from "@/lib/types/trading-specialist";
import yahooFinance from 'yahoo-finance2';

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

// ─── Helper: Resolve symbol (US or NSE with .NS suffix) ───────────
async function resolveSymbol(ticker: string): Promise<{ symbol: string; currency: string }> {
  const normalized = ticker.toUpperCase().trim();
  try {
    const quote = await yahooFinance.quote(normalized);
    const currency = (quote as any).currency === 'INR' ? '₹' : '$';
    return { symbol: normalized, currency };
  } catch {
    // Try with .NS suffix for Indian stocks
    try {
      await yahooFinance.quote(`${normalized}.NS`);
      return { symbol: `${normalized}.NS`, currency: '₹' };
    } catch {
      return { symbol: normalized, currency: '$' };
    }
  }
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

// ─── Main: Calculate real GEM SCORE ────────────────────────────────
async function calculateGemScore(ticker: string): Promise<GemScoreResponse> {
  const { symbol, currency } = await resolveSymbol(ticker);

  // Fetch 2 years of historical data
  const end = new Date();
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 2);

  const [quote, historical] = await Promise.all([
    yahooFinance.quote(symbol),
    yahooFinance.historical(symbol, {
      period1: start,
      period2: end,
      interval: '1d',
    }),
  ]);

  const currentPrice = (quote as any).regularMarketPrice || 0;
  const closes = (historical as any[]).map(b => b.close).filter(c => c > 0);
  const ohlc = (historical as any[]).map(b => ({ high: b.high, low: b.low, close: b.close }));

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
    currentPrice > (quote as any).fiftyTwoWeekLow && currentPrice < (quote as any).fiftyTwoWeekHigh ? 0 : currentPrice > (quote as any).fiftyTwoWeekHigh ? 1 : -1
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
    { timeframe: 'Volatility', ema_or_sma: 'ATR(14)', value: `${currency}${atr14.toFixed(2)}`, trigger: `Stop = ${(currentPrice - atr14 * 2).toFixed(2)}`, triggerType: 'neutral' },
  ];

  const bottomLine = buildBottomLine(signals, currentPrice, sma200, currency);

  return {
    success: true,
    ticker,
    timestamp: new Date().toISOString(),
    signals,
    bottomLine,
    multiTimeframe,
  };
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");

  if (!ticker || ticker.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: "Ticker symbol required" },
      { status: 400 }
    );
  }

  const cacheKey = ticker.toUpperCase();
  const now = Date.now();

  // Check cache
  const cached = scoreCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data, { status: 200 });
  }

  try {
    const scoreData = await calculateGemScore(ticker);
    scoreCache.set(cacheKey, { data: scoreData, timestamp: now });
    return NextResponse.json(scoreData, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json(
      { success: false, ticker, error: message },
      { status: 500 }
    );
  }
}
