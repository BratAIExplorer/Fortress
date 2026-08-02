/**
 * Liquidity Screen — "Trap Detector"
 *
 * Fortress 30, Momentum Radar and GEM SCORE all rank on price signals and say
 * nothing about whether a retail investor can actually get in and out. In the
 * smallcap universe that omission is the single biggest source of real losses:
 * a stock can score 95/100 and still be untradable at any meaningful size.
 *
 * This module answers one question — "can I buy this, and can I get out?" —
 * using data the scanner already fetches (daily OHLCV). No new data source.
 *
 * Pure functions, no network. Deliberately conservative.
 */

export interface Bar {
  close: number;
  volume: number;
}

export type LiquidityTier = "LIQUID" | "TRADABLE" | "THIN" | "TRAP";

export interface LiquidityResult {
  /** Average daily traded value over the lookback, in the stock's local currency */
  avgDailyTurnover: number;
  /** Largest position we'd call safe: participation cap x average daily turnover */
  maxSafePosition: number;
  /** Days in the lookback with zero or missing volume — a hard red flag */
  zeroVolumeDays: number;
  /** Turnover of the quietest day, i.e. the worst case when you need to exit */
  worstDayTurnover: number;
  /** Estimated % of daily turnover a target position would represent */
  participationPct: number | null;
  tier: LiquidityTier;
  /** Plain-English reason, safe to show a non-technical user */
  reason: string;
  tradable: boolean;
}

export const LIQUIDITY_CONFIG = {
  lookbackDays: 20,
  /**
   * Never be more than 10% of a normal day's turnover. Above that, your own
   * order moves the price against you on the way in and traps you on the way out.
   */
  participationCap: 0.1,
  /** Turnover floors, in local currency units (INR for NSE, USD/SGD/HKD elsewhere) */
  liquidFloor: 50_000_000, // ~INR 5 crore/day — institutions present, exit is easy
  tradableFloor: 10_000_000, // ~INR 1 crore/day — fine for retail size
  thinFloor: 2_000_000, // ~INR 20 lakh/day — possible, but size down hard
  /** More than this many no-trade days in the lookback and we refuse it outright */
  maxZeroVolumeDays: 2,
};

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Score tradability from recent daily bars.
 *
 * @param bars           Daily OHLCV, oldest first. Only the last `lookbackDays` are used.
 * @param targetPosition Optional intended position size in the same currency as
 *                       the bars. When supplied, participation % is computed.
 */
export function screenLiquidity(bars: Bar[], targetPosition?: number): LiquidityResult {
  const cfg = LIQUIDITY_CONFIG;
  const window = bars.slice(-cfg.lookbackDays);

  const empty: LiquidityResult = {
    avgDailyTurnover: 0,
    maxSafePosition: 0,
    zeroVolumeDays: window.length,
    worstDayTurnover: 0,
    participationPct: null,
    tier: "TRAP",
    reason: "Not enough recent trading history to judge liquidity.",
    tradable: false,
  };

  if (window.length < cfg.lookbackDays) return empty;

  const turnovers = window.map((b) => {
    const c = Number.isFinite(b.close) ? b.close : 0;
    const v = Number.isFinite(b.volume) ? b.volume : 0;
    return c * v;
  });

  const avgDailyTurnover = mean(turnovers);
  const worstDayTurnover = Math.min(...turnovers);
  const zeroVolumeDays = turnovers.filter((t) => t <= 0).length;
  const maxSafePosition = avgDailyTurnover * cfg.participationCap;
  const participationPct =
    targetPosition && avgDailyTurnover > 0
      ? (targetPosition / avgDailyTurnover) * 100
      : null;

  // Hard rejects first — these are the ones that actually cost people money.
  if (zeroVolumeDays > cfg.maxZeroVolumeDays) {
    return {
      avgDailyTurnover,
      maxSafePosition,
      zeroVolumeDays,
      worstDayTurnover,
      participationPct,
      tier: "TRAP",
      reason: `Did not trade at all on ${zeroVolumeDays} of the last ${cfg.lookbackDays} days. On a bad day there may be no buyer.`,
      tradable: false,
    };
  }

  if (avgDailyTurnover < cfg.thinFloor) {
    return {
      avgDailyTurnover,
      maxSafePosition,
      zeroVolumeDays,
      worstDayTurnover,
      participationPct,
      tier: "TRAP",
      reason: "Daily turnover is too low to enter or exit without moving the price against you.",
      tradable: false,
    };
  }

  const tier: LiquidityTier =
    avgDailyTurnover >= cfg.liquidFloor
      ? "LIQUID"
      : avgDailyTurnover >= cfg.tradableFloor
        ? "TRADABLE"
        : "THIN";

  // Position-specific warning overrides the headline tier.
  if (participationPct !== null && participationPct > cfg.participationCap * 100) {
    return {
      avgDailyTurnover,
      maxSafePosition,
      zeroVolumeDays,
      worstDayTurnover,
      participationPct,
      tier: "THIN",
      reason: `Your intended position is ${participationPct.toFixed(1)}% of a normal day's trading. Cap it around ${Math.round(maxSafePosition).toLocaleString()} to stay under ${cfg.participationCap * 100}%.`,
      tradable: true,
    };
  }

  const reason =
    tier === "LIQUID"
      ? "Trades freely. Entering and exiting at retail size is not a problem."
      : tier === "TRADABLE"
        ? "Adequate liquidity for retail size. Use limit orders, not market orders."
        : "Thin. Buy in small pieces with limit orders and expect a slow exit.";

  return {
    avgDailyTurnover,
    maxSafePosition,
    zeroVolumeDays,
    worstDayTurnover,
    participationPct,
    tier,
    reason,
    tradable: true,
  };
}
