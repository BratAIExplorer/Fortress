/**
 * Backtest Calculation Engine
 *
 * Pure functions for calculating thesis backtest metrics
 * All functions are deterministic (same input = same output)
 *
 * Used by:
 * - Daily cron job (lib/jobs/backtest-validator.ts)
 * - Testing (fully mockable)
 *
 * Metrics:
 * - CAGR: Compound Annual Growth Rate (%)
 * - Sharpe: Risk-adjusted returns (higher = better)
 * - Max Drawdown: Largest peak-to-trough decline (%)
 * - Win Rate: % of years with positive returns (0-100)
 */

/**
 * Price data point from historical data
 */
export interface PricePoint {
  date: Date;
  price: number;
}

/**
 * Annual returns for win rate calculation
 */
interface AnnualReturn {
  year: number;
  returnPct: number;
}

/**
 * Backtest results
 */
export interface BacktestResult {
  cagr: number;
  sharpe: number;
  maxDrawdown: number;
  winRate: number;
  data: {
    startPrice: number;
    endPrice: number;
    totalReturn: number;
    stdDeviation: number;
    annualReturns: AnnualReturn[];
  };
}

/**
 * Calculate CAGR (Compound Annual Growth Rate)
 *
 * Formula: ((Ending Value / Beginning Value) ^ (1 / Years)) - 1
 *
 * @param startPrice Initial stock price
 * @param endPrice Final stock price
 * @param years Time period in years
 * @returns CAGR as decimal (e.g., 0.13 = 13%)
 */
export function calculateCAGR(startPrice: number, endPrice: number, years: number): number {
  if (startPrice <= 0 || years <= 0) return 0;

  const cagr = Math.pow(endPrice / startPrice, 1 / years) - 1;
  return Math.round(cagr * 10000) / 10000; // Round to 4 decimals
}

/**
 * Calculate Sharpe Ratio
 *
 * Formula: (Average Return - Risk Free Rate) / Standard Deviation
 * Risk-free rate assumed: 5% (India's 10Y government bond yield)
 *
 * @param returns Daily returns as decimals (e.g., 0.02 = +2%)
 * @returns Sharpe ratio (higher = better; >1.0 is good)
 */
export function calculateSharpe(returns: number[]): number {
  if (returns.length < 2) return 0;

  const riskFreeRate = 0.05 / 252; // Daily risk-free rate (trading days)

  // Average daily return
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;

  // Standard deviation of returns
  const variance =
    returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0; // No volatility = undefined Sharpe

  const sharpe = (avgReturn - riskFreeRate) / stdDev;

  // Annualize (convert daily to yearly)
  const annualizedSharpe = sharpe * Math.sqrt(252);

  return Math.round(annualizedSharpe * 1000) / 1000; // Round to 3 decimals
}

/**
 * Calculate Maximum Drawdown
 *
 * Definition: Largest peak-to-trough decline during period
 * Formula: (Trough Value - Peak Value) / Peak Value
 *
 * @param prices Array of daily closing prices
 * @returns Max drawdown as percentage (e.g., -0.25 = -25%)
 */
export function calculateMaxDrawdown(prices: number[]): number {
  if (prices.length < 2) return 0;

  let maxDrawdown = 0;
  let peak = prices[0];

  for (let i = 1; i < prices.length; i++) {
    const currentPrice = prices[i];

    if (currentPrice > peak) {
      peak = currentPrice;
    }

    const drawdown = (currentPrice - peak) / peak;
    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return Math.round(maxDrawdown * 10000) / 10000;
}

/**
 * Calculate Win Rate
 *
 * Definition: Percentage of years with positive returns
 * Useful for: Understanding consistency across market cycles
 *
 * @param prices Array of daily closing prices
 * @param period5Years Boolean to return 5-year data
 * @returns Win rate (0-1.0, e.g., 0.80 = 80%)
 */
export function calculateWinRate(prices: number[]): number {
  if (prices.length < 252) return 0; // Need at least 1 year of data

  const annualReturns = getAnnualReturns(prices);
  const positiveYears = annualReturns.filter((ret) => ret.returnPct > 0).length;

  return (positiveYears / annualReturns.length) * 100; // Return as percentage
}

/**
 * Extract annual returns from daily prices
 *
 * @param prices Array of daily closing prices
 * @returns Array of {year, returnPct}
 */
function getAnnualReturns(prices: number[]): AnnualReturn[] {
  if (prices.length < 252) return []; // Need at least 1 year

  const annualReturns: AnnualReturn[] = [];

  // Assume prices span ~5 years = ~260 trading days/year
  const daysPerYear = Math.ceil(prices.length / 5);

  for (let year = 0; year < 5; year++) {
    const startIdx = year * daysPerYear;
    const endIdx = Math.min(startIdx + daysPerYear, prices.length - 1);

    if (startIdx < prices.length - 1) {
      const startPrice = prices[startIdx];
      const endPrice = prices[endIdx];

      const returnPct = (endPrice - startPrice) / startPrice;

      annualReturns.push({
        year,
        returnPct,
      });
    }
  }

  return annualReturns;
}

/**
 * Convert prices to daily returns
 *
 * Formula: (Price[t] - Price[t-1]) / Price[t-1]
 *
 * @param prices Array of daily closing prices
 * @returns Array of daily returns as decimals
 */
export function getPriceReturns(prices: number[]): number[] {
  if (prices.length < 2) return [];

  const returns: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const dailyReturn = (prices[i] - prices[i - 1]) / prices[i - 1];
    returns.push(dailyReturn);
  }

  return returns;
}

/**
 * Complete backtest calculation
 *
 * Takes 5 years of daily prices and returns all metrics
 *
 * @param prices Array of daily closing prices (5 years ≈ 1,300 days)
 * @returns Complete BacktestResult
 */
export function calculateBacktest(prices: number[]): BacktestResult {
  if (prices.length < 252) {
    throw new Error("Need at least 1 year of price data (252+ trading days)");
  }

  const startPrice = prices[0];
  const endPrice = prices[prices.length - 1];
  const years = prices.length / 252; // Trading days to years

  // Calculate metrics
  const cagr = calculateCAGR(startPrice, endPrice, years);
  const returns = getPriceReturns(prices);
  const sharpe = calculateSharpe(returns);
  const maxDrawdown = calculateMaxDrawdown(prices);
  const winRate = calculateWinRate(prices);

  // Calculate additional data
  const totalReturn = (endPrice - startPrice) / startPrice;
  const variance =
    returns.reduce((sum, ret) => sum + Math.pow(ret - returns.reduce((a, b) => a + b) / returns.length, 2), 0) /
    returns.length;
  const stdDeviation = Math.sqrt(variance);

  return {
    cagr,
    sharpe,
    maxDrawdown,
    winRate,
    data: {
      startPrice,
      endPrice,
      totalReturn,
      stdDeviation,
      annualReturns: getAnnualReturns(prices),
    },
  };
}

/**
 * Format backtest metrics for database storage
 *
 * @param result BacktestResult from calculateBacktest()
 * @returns Object ready for database insert
 */
export function formatBacktestForDB(result: BacktestResult) {
  return {
    backtest_5yr_cagr: Math.round(result.cagr * 100),
    backtest_5yr_sharpe: Math.round(result.sharpe * 100),
    backtest_5yr_max_drawdown: Math.round(result.maxDrawdown * 100),
    backtest_5yr_win_rate: Math.round(result.winRate),
  };
}
