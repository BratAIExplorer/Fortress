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
const DAILY_LOOKBACK_DAYS = 400; // Stabilizes EMA 200
const WEEKLY_LOOKBACK_DAYS = 5 * 365; // Stabilizes Weekly EMA 200

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
  // MACD Crossover fields
  macdStatus?: string | null;
  macdTarget1?: number | null;
  macdTarget2?: number | null;
  macdStopLoss?: number | null;
  macdQty?: number | null;
  macdInvested?: number | null;
  macdRisk?: number | null;
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

function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length === 0) return [];
  const emas: number[] = new Array(prices.length);
  emas[0] = prices[0];
  const multiplier = 2 / (period + 1);
  for (let i = 1; i < prices.length; i++) {
    emas[i] = prices[i] * multiplier + emas[i - 1] * (1 - multiplier);
  }
  return emas;
}

function calculateMACD(prices: number[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const ema12 = calculateEMA(prices, fastPeriod);
  const ema26 = calculateEMA(prices, slowPeriod);
  
  const macdLine: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    macdLine.push(ema12[i] - ema26[i]);
  }
  
  const signalLine = calculateEMA(macdLine, signalPeriod);
  
  return { macdLine, signalLine };
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
    const startDaily = new Date(end.getTime() - DAILY_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
    const startWeekly = new Date(end.getTime() - WEEKLY_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

    const [historicalDaily, historicalWeekly] = await Promise.all([
      yahooFinance.historical(symbol, {
        period1: startDaily,
        period2: end,
        interval: "1d",
      }),
      yahooFinance.historical(symbol, {
        period1: startWeekly,
        period2: end,
        interval: "1wk",
      }).catch(() => [])
    ]);

    const barsDaily = (historicalDaily as Array<{ high: number; close: number; volume: number }>)
      .filter(b => b.close > 0);
    const barsWeekly = (historicalWeekly as Array<{ high: number; close: number; volume: number }>)
      .filter(b => b.close > 0);

    if (barsDaily.length < 20) throw new Error("Insufficient daily data");

    const closesDaily = barsDaily.map(b => b.close);
    const volumes = barsDaily.map(b => b.volume);
    const price = closesDaily[closesDaily.length - 1];
    const high90d = Math.max(...barsDaily.slice(-90).map(b => b.high));

    const rsiVal = Math.round(rsi(closesDaily));
    const sma20 = sma(closesDaily, 20);
    const sma50 = sma(closesDaily, Math.min(50, closesDaily.length));
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

    // ─── MACD CROSSOVER CALCULATIONS ───
    let macdStatus: string | null = null;
    let macdTarget1: number | null = null;
    let macdTarget2: number | null = null;
    let macdStopLoss: number | null = null;
    let macdQty: number | null = null;
    let macdInvested: number | null = null;
    let macdRisk: number | null = null;

    // Daily scan crossover logic
    if (closesDaily.length >= 200) {
      const dailyEMA200 = calculateEMA(closesDaily, 200);
      const dailyEMA50 = calculateEMA(closesDaily, 50);
      
      const lastDailyEMA200 = dailyEMA200[dailyEMA200.length - 1];
      const lastDailyEMA50 = dailyEMA50[dailyEMA50.length - 1];

      // Daily Trend Filter (Price > 200 EMA AND 50 EMA > 200 EMA)
      if (price > lastDailyEMA200 && lastDailyEMA50 > lastDailyEMA200) {
        const { macdLine, signalLine } = calculateMACD(closesDaily);
        const n = macdLine.length;
        if (n >= 3) {
          const crossoverToday = (macdLine[n - 1] > signalLine[n - 1]) && (macdLine[n - 2] <= signalLine[n - 2]);
          const crossoverYesterday = (macdLine[n - 2] > signalLine[n - 2]) && (macdLine[n - 3] <= signalLine[n - 3]);
          const isBullishToday = macdLine[n - 1] > signalLine[n - 1];

          if (isBullishToday && (crossoverToday || crossoverYesterday)) {
            macdStatus = "Daily Bullish";
            
            // Calculate Targets & Stop Loss based on Daily EMAs
            const dailyEMA20 = calculateEMA(closesDaily, 20)[closesDaily.length - 1];
            const dailyEMA100 = calculateEMA(closesDaily, 100)[closesDaily.length - 1];
            const dailyEMA150 = calculateEMA(closesDaily, 150)[closesDaily.length - 1];

            const emas = {
              "EMA 20": dailyEMA20,
              "EMA 50": lastDailyEMA50,
              "EMA 100": dailyEMA100,
              "EMA 150": dailyEMA150,
              "EMA 200": lastDailyEMA200,
            };

            const targets = Object.entries(emas).filter(([_, v]) => v > price);
            const supports = Object.entries(emas).filter(([_, v]) => v < price);

            if (targets.length > 0) {
              macdTarget1 = Math.min(...targets.map(([_, v]) => v));
              macdTarget2 = Math.max(...targets.map(([_, v]) => v));
            } else {
              macdTarget1 = price * 1.05;
              macdTarget2 = price * 1.15;
            }

            if (supports.length > 0) {
              macdStopLoss = Math.max(...supports.map(([_, v]) => v));
            } else {
              macdStopLoss = price * 0.95;
            }
          }
        }
      }
    }

    // Weekly scan crossover logic (runs if Daily is not triggered)
    if (!macdStatus && barsWeekly.length >= 200) {
      const closesWeekly = barsWeekly.map(b => b.close);
      const weeklyEMA200 = calculateEMA(closesWeekly, 200);
      const weeklyEMA50 = calculateEMA(closesWeekly, 50);

      const lastWeeklyEMA200 = weeklyEMA200[weeklyEMA200.length - 1];
      const lastWeeklyEMA50 = weeklyEMA50[weeklyEMA50.length - 1];

      // Weekly Trend Filter
      if (price > lastWeeklyEMA200 && lastWeeklyEMA50 > lastWeeklyEMA200) {
        const { macdLine, signalLine } = calculateMACD(closesWeekly);
        const n = macdLine.length;
        if (n >= 3) {
          const crossoverThisWeek = (macdLine[n - 1] > signalLine[n - 1]) && (macdLine[n - 2] <= signalLine[n - 2]);
          const crossoverLastWeek = (macdLine[n - 2] > signalLine[n - 2]) && (macdLine[n - 3] <= signalLine[n - 3]);
          const isBullishThisWeek = macdLine[n - 1] > signalLine[n - 1];

          if (isBullishThisWeek && (crossoverThisWeek || crossoverLastWeek)) {
            macdStatus = "Weekly Bullish";

            // Calculate Targets & Stop Loss based on Weekly EMAs
            const weeklyEMA20 = calculateEMA(closesWeekly, 20)[closesWeekly.length - 1];
            const weeklyEMA100 = calculateEMA(closesWeekly, 100)[closesWeekly.length - 1];
            const weeklyEMA150 = calculateEMA(closesWeekly, 150)[closesWeekly.length - 1];

            const emas = {
              "Weekly EMA 20": weeklyEMA20,
              "Weekly EMA 50": lastWeeklyEMA50,
              "Weekly EMA 100": weeklyEMA100,
              "Weekly EMA 150": weeklyEMA150,
              "Weekly EMA 200": lastWeeklyEMA200,
            };

            const targets = Object.entries(emas).filter(([_, v]) => v > price);
            const supports = Object.entries(emas).filter(([_, v]) => v < price);

            if (targets.length > 0) {
              macdTarget1 = Math.min(...targets.map(([_, v]) => v));
              macdTarget2 = Math.max(...targets.map(([_, v]) => v));
            } else {
              macdTarget1 = price * 1.05;
              macdTarget2 = price * 1.15;
            }

            if (supports.length > 0) {
              macdStopLoss = Math.max(...supports.map(([_, v]) => v));
            } else {
              macdStopLoss = price * 0.95;
            }
          }
        }
      }
    }

    // Sizing & Capital Allocation Sizing
    if (macdStatus && price > 0) {
      const capital = 25000;
      macdQty = Math.floor(capital / price);
      if (macdQty > 0) {
        macdInvested = macdQty * price;
        if (macdStopLoss) {
          macdRisk = (price - macdStopLoss) * macdQty;
        }
      } else {
        macdStatus = null;
        macdTarget1 = null;
        macdTarget2 = null;
        macdStopLoss = null;
        macdQty = null;
        macdInvested = null;
        macdRisk = null;
      }
    }

    // Formatting decimal precision
    if (macdTarget1) macdTarget1 = Math.round(macdTarget1 * 100) / 100;
    if (macdTarget2) macdTarget2 = Math.round(macdTarget2 * 100) / 100;
    if (macdStopLoss) macdStopLoss = Math.round(macdStopLoss * 100) / 100;
    if (macdInvested) macdInvested = Math.round(macdInvested * 100) / 100;
    if (macdRisk) macdRisk = Math.round(macdRisk * 100) / 100;

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
      macdStatus,
      macdTarget1,
      macdTarget2,
      macdStopLoss,
      macdQty,
      macdInvested,
      macdRisk
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
