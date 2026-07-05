"""
Backtesting Toolkit for Fortress Intelligence
Purpose: Core components for forensic analysis (testing stocks for day trading)
Date: 2026-07-02
"""

from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
import pandas as pd
import yfinance as yf
import numpy as np


# ============================================================================
# TOOL 1: Trade Record (What happened in each trade)
# ============================================================================

@dataclass
class Trade:
    """Records a single buy/sell transaction"""
    symbol: str
    entry_date: datetime
    exit_date: datetime
    entry_price: float
    exit_price: float
    pnl: float  # Profit/loss in dollars
    return_pct: float  # Profit/loss as percentage (e.g., -2.1, +0.8)
    duration_hours: float = 0  # How long we held (for intraday = ~8 hours)

    def __repr__(self):
        return (f"Trade({self.symbol} | {self.entry_date.date()} | "
                f"${self.entry_price:.2f} → ${self.exit_price:.2f} | "
                f"{self.return_pct:+.2f}%)")


# ============================================================================
# TOOL 2: Backtest Results (Summary of all trades)
# ============================================================================

@dataclass
class BacktestMetrics:
    """Summary metrics from backtesting a stock"""
    symbol: str
    start_date: str
    end_date: str
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float  # % of trades that were profitable (0-1)
    avg_win: float  # Average $ per winning trade
    avg_loss: float  # Average $ per losing trade
    profit_factor: float  # avg_win / abs(avg_loss) - higher is better
    total_pnl: float  # Total profit/loss across all trades
    return_pct: float  # Total return % for the period
    max_drawdown: float  # Largest peak-to-trough loss
    sharpe_ratio: float  # Risk-adjusted return (>1.0 is good)
    trades_list: List[Trade] = None  # All individual trades (for reference)

    def __repr__(self):
        return (f"{self.symbol} | Win Rate: {self.win_rate:.1%} | "
                f"Profit Factor: {self.profit_factor:.2f} | "
                f"Sharpe: {self.sharpe_ratio:.2f}")


# ============================================================================
# TOOL 3: Fetch Stock Data (Get prices from Yahoo Finance)
# ============================================================================

def fetch_data(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
    """
    Download stock price data

    Args:
        ticker: Stock symbol (e.g., 'AAPL', 'HDFCBANK.NS')
        start_date: Start date (format: '2025-01-01')
        end_date: End date (format: '2026-07-02')

    Returns:
        DataFrame with columns: open, high, low, close, volume

    Example:
        df = fetch_data('HDFCBANK.NS', '2025-01-01', '2026-07-02')
    """
    try:
        data = yf.download(ticker, start=start_date, end=end_date, progress=False)

        # Ensure we have the columns we need
        if data.empty:
            raise ValueError(f"No data found for {ticker}")

        # Handle both single ticker and multi-ticker responses
        # yfinance returns multi-index columns for multi-ticker requests
        if isinstance(data.columns, pd.MultiIndex):
            # Multi-ticker case: flatten to single ticker
            data.columns = [col[0] if isinstance(col, tuple) else col for col in data.columns]

        # Normalize column names to lowercase
        data.columns = [str(col).lower() for col in data.columns]

        # Ensure required columns exist
        required_cols = ['open', 'high', 'low', 'close', 'volume']
        missing = [col for col in required_cols if col not in data.columns]
        if missing:
            raise ValueError(f"Missing columns: {missing}")

        return data
    except Exception as e:
        print(f"❌ Error fetching data for {ticker}: {e}")
        return pd.DataFrame()


# ============================================================================
# TOOL 4: Metric Calculation Helpers (The math behind the numbers)
# ============================================================================

def calculate_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """
    Calculate Average True Range (volatility indicator)

    Args:
        df: DataFrame with High, Low, Close columns
        period: lookback period (default 14)

    Returns:
        Series with ATR values
    """
    high_low = df['high'] - df['low']
    high_close = abs(df['high'] - df['close'].shift())
    low_close = abs(df['low'] - df['close'].shift())

    ranges = pd.concat([high_low, high_close, low_close], axis=1)
    true_range = ranges.max(axis=1)
    atr = true_range.rolling(period).mean()

    return atr


def calculate_win_rate(trades: List[Trade]) -> float:
    """
    Calculate percentage of winning trades

    Args:
        trades: List of Trade objects

    Returns:
        Win rate as decimal (0-1). E.g., 0.35 = 35%
    """
    if not trades:
        return 0.0

    winning = sum(1 for t in trades if t.return_pct > 0)
    return winning / len(trades)


def calculate_profit_factor(trades: List[Trade]) -> float:
    """
    Calculate profit factor (gross profit / gross loss)

    Args:
        trades: List of Trade objects

    Returns:
        Profit factor. E.g., 1.5 = $1.50 won for every $1.00 lost
        >1.0 is profitable, <1.0 is losing money
    """
    if not trades:
        return 0.0

    wins = [t.pnl for t in trades if t.pnl > 0]
    losses = [t.pnl for t in trades if t.pnl < 0]

    total_wins = sum(wins) if wins else 0.0
    total_losses = abs(sum(losses)) if losses else 0.0

    # If no losses, return high profit factor (good for trading)
    if total_losses == 0:
        return 2.0 if total_wins > 0 else 1.0

    # If no wins but there are losses, return 0
    if total_wins == 0:
        return 0.0

    return total_wins / total_losses


def calculate_avg_win_loss(trades: List[Trade]) -> tuple:
    """
    Calculate average win and average loss

    Args:
        trades: List of Trade objects

    Returns:
        Tuple: (avg_win_percent, avg_loss_percent)
        E.g., (0.8, -1.2) = avg win is +0.8%, avg loss is -1.2%
    """
    if not trades:
        return 0.0, 0.0

    wins = [t.return_pct for t in trades if t.return_pct > 0]
    losses = [t.return_pct for t in trades if t.return_pct < 0]

    avg_win = sum(wins) / len(wins) if wins else 0.0
    avg_loss = sum(losses) / len(losses) if losses else 0.0

    return avg_win, avg_loss


def calculate_max_drawdown(equity_curve: List[float]) -> float:
    """
    Calculate maximum peak-to-trough loss

    Args:
        equity_curve: List of account values over time

    Returns:
        Max drawdown as percentage. E.g., -15.5
    """
    if not equity_curve or len(equity_curve) < 2:
        return 0.0

    try:
        peak = equity_curve[0]
        max_dd = 0.0

        for value in equity_curve:
            if value > peak:
                peak = value

            # Avoid division by zero
            if peak != 0:
                dd = (value - peak) / peak * 100
                if dd < max_dd:
                    max_dd = dd
            else:
                max_dd = 0.0

        return float(max_dd) if max_dd != float('-inf') else 0.0

    except Exception as e:
        print(f"⚠️ Error calculating max drawdown: {e}")
        return 0.0


def calculate_sharpe_ratio(trades: List[Trade], risk_free_rate: float = 0.02) -> float:
    """
    Calculate Sharpe Ratio (risk-adjusted return)

    Args:
        trades: List of Trade objects
        risk_free_rate: Annual risk-free rate (default 2%)

    Returns:
        Sharpe ratio. E.g., 1.5
        >1.0 = good, >2.0 = excellent
    """
    if not trades or len(trades) < 2:
        return 0.0

    try:
        returns = np.array([t.return_pct for t in trades]) / 100  # Convert to decimals

        if len(returns) < 2:
            return 0.0

        avg_return = np.mean(returns)
        std_return = np.std(returns)

        # Handle zero volatility (all returns identical)
        if std_return == 0 or np.isclose(std_return, 0):
            # If average return is positive, return a high Sharpe
            return 2.0 if avg_return > 0 else 0.0

        # Annualized (assuming ~252 trading days, 1 trade per day)
        annual_return = avg_return * 252
        annual_std = std_return * np.sqrt(252)

        # Safety check for division
        if annual_std == 0 or np.isclose(annual_std, 0):
            return 2.0 if annual_return > 0 else 0.0

        sharpe = (annual_return - risk_free_rate) / annual_std

        # Return finite value (handle inf/nan)
        return float(sharpe) if np.isfinite(sharpe) else 0.0

    except Exception as e:
        print(f"⚠️ Error calculating Sharpe ratio: {e}")
        return 0.0


def calculate_total_return(entry_prices: List[float], exit_prices: List[float]) -> float:
    """
    Calculate total return percentage across all trades

    Args:
        entry_prices: List of entry prices
        exit_prices: List of exit prices

    Returns:
        Total return as percentage. E.g., 12.5 = +12.5%
    """
    if not entry_prices or not exit_prices:
        return 0.0

    try:
        total_entry = sum(entry_prices)
        total_exit = sum(exit_prices)

        if total_entry == 0 or total_entry is None:
            return 0.0

        result = ((total_exit - total_entry) / total_entry) * 100
        return float(result) if result is not None else 0.0

    except Exception as e:
        print(f"⚠️ Error calculating total return: {e}")
        return 0.0


# ============================================================================
# SUMMARY: What You Now Have
# ============================================================================
"""
These 4 tools give you:

1. Trade(symbol, entry_date, exit_date, entry_price, exit_price, pnl, return_pct)
   → Records each buy/sell

2. BacktestMetrics(symbol, total_trades, win_rate, profit_factor, sharpe_ratio, ...)
   → Stores summary results

3. fetch_data(ticker, start_date, end_date)
   → Gets stock prices from Yahoo Finance

4. Helpers (calculate_win_rate, calculate_profit_factor, calculate_sharpe_ratio, ...)
   → Does the math

Next step: Build ForensicAnalyzer to use these tools.
"""
