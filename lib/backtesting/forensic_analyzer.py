"""
Forensic Analysis Engine for Fortress Intelligence
Purpose: Determine if a stock is good for intraday day trading
Method: Simulate "buy at open, sell at close" for 12 months, calculate win rate
Date: 2026-07-02
"""

import pandas as pd
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import List, Optional
from .base import (
    Trade,
    BacktestMetrics,
    fetch_data,
    calculate_atr,
    calculate_win_rate,
    calculate_profit_factor,
    calculate_avg_win_loss,
    calculate_max_drawdown,
    calculate_sharpe_ratio,
    calculate_total_return,
)


# ============================================================================
# FORENSIC RESULT (What the analysis outputs)
# ============================================================================

@dataclass
class ForensicResult:
    """Output of forensic analysis for one stock"""
    symbol: str
    analysis_date: str  # When the analysis ran
    period_start: str  # "2025-07-02"
    period_end: str  # "2026-07-02"
    total_trading_days: int  # How many days we simulated
    total_trades: int  # Number of buy/sell pairs
    winning_trades: int
    losing_trades: int

    # Key Metrics
    win_rate: float  # 0-1 (e.g., 0.32 = 32%)
    avg_win_pct: float  # e.g., +0.8%
    avg_loss_pct: float  # e.g., -1.2%
    profit_factor: float  # e.g., 1.5
    total_pnl_pct: float  # Total return % over period
    max_drawdown: float  # e.g., -15.5%
    sharpe_ratio: float  # Risk-adjusted return

    # Verdict
    intraday_score: float  # 0-100 (how good for day trading)
    verdict: str  # "Excellent", "Good", "Moderate", "Risky", "Avoid"
    recommendation: str  # Plain English recommendation

    # Raw data
    trades: List[Trade] = field(default_factory=list)
    metrics: Optional[BacktestMetrics] = None

    def __repr__(self):
        return (f"\n{'='*60}\n"
                f"{self.symbol} Intraday Analysis ({self.period_start} to {self.period_end})\n"
                f"{'='*60}\n"
                f"Total Trades: {self.total_trades}\n"
                f"Win Rate: {self.win_rate:.1%}\n"
                f"Avg Win: {self.avg_win_pct:+.2f}%\n"
                f"Avg Loss: {self.avg_loss_pct:+.2f}%\n"
                f"Profit Factor: {self.profit_factor:.2f}\n"
                f"Total Return: {self.total_pnl_pct:+.2f}%\n"
                f"Max Drawdown: {self.max_drawdown:.2f}%\n"
                f"Sharpe Ratio: {self.sharpe_ratio:.2f}\n"
                f"Intraday Score: {self.intraday_score:.0f}/100\n"
                f"Verdict: {self.verdict}\n"
                f"Recommendation: {self.recommendation}\n"
                f"{'='*60}\n")


# ============================================================================
# FORENSIC ANALYZER (Main Engine)
# ============================================================================

class ForensicAnalyzer:
    """
    Analyzes a stock to determine if it's good for intraday day trading.

    Method:
    1. Fetch 12 months of OHLC data
    2. For each trading day: Buy at Open, Sell at Close
    3. Calculate: Win rate, profit factor, Sharpe ratio
    4. Output: Verdict on intraday suitability

    Usage:
        analyzer = ForensicAnalyzer()
        result = analyzer.analyze_stock('HDFC.NS')
        print(result)
    """

    def __init__(self, months_back: int = 12):
        """
        Initialize the analyzer.

        Args:
            months_back: How many months of history to analyze (default 12)
        """
        self.months_back = months_back

    def analyze_stock(self, ticker: str, start_date: Optional[str] = None,
                     end_date: Optional[str] = None) -> ForensicResult:
        """
        Analyze a single stock for intraday day trading suitability.

        Args:
            ticker: Stock symbol (e.g., 'HDFC.NS', 'AAPL')
            start_date: Optional custom start date (format: '2025-07-02')
            end_date: Optional custom end date (format: '2026-07-02')

        Returns:
            ForensicResult with analysis and verdict
        """

        # Determine date range
        if end_date is None:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if start_date is None:
            end = datetime.strptime(end_date, '%Y-%m-%d')
            start = end - timedelta(days=self.months_back * 30)  # Rough estimate
            start_date = start.strftime('%Y-%m-%d')

        print(f"📊 Analyzing {ticker} ({start_date} to {end_date})...")

        # Step 1: Fetch data
        data = fetch_data(ticker, start_date, end_date)

        if data.empty:
            print(f"❌ No data found for {ticker}")
            return None

        # Step 2: Simulate intraday trades (buy open, sell close)
        trades = self._simulate_intraday_trades(ticker, data)

        if not trades:
            print(f"⚠️ No trades generated for {ticker}")
            return None

        # Step 3: Calculate metrics
        result = self._calculate_metrics(ticker, trades, start_date, end_date)

        # Step 4: Generate verdict
        result = self._generate_verdict(result)

        print(f"✅ Analysis complete: {result.verdict}")

        return result

    def _simulate_intraday_trades(self, ticker: str, data: pd.DataFrame) -> List[Trade]:
        """
        Simulate daily intraday trades: Buy at Open, Sell at Close.

        Args:
            ticker: Stock symbol
            data: OHLC DataFrame

        Returns:
            List of Trade objects
        """
        trades = []

        for date_index, (date, row) in enumerate(data.iterrows()):
            # Skip if missing data
            if pd.isna(row['open']) or pd.isna(row['close']):
                continue

            entry_price = row['open']
            exit_price = row['close']

            # Calculate P&L
            pnl_dollars = exit_price - entry_price
            return_pct = ((exit_price - entry_price) / entry_price) * 100

            # Create trade record
            trade = Trade(
                symbol=ticker,
                entry_date=date,
                exit_date=date,  # Same day (intraday)
                entry_price=entry_price,
                exit_price=exit_price,
                pnl=pnl_dollars,
                return_pct=return_pct,
                duration_hours=8.0  # Typical trading day
            )

            trades.append(trade)

        return trades

    def _calculate_metrics(self, ticker: str, trades: List[Trade],
                          start_date: str, end_date: str) -> ForensicResult:
        """
        Calculate performance metrics from trades.

        Args:
            ticker: Stock symbol
            trades: List of Trade objects
            start_date: Analysis start date
            end_date: Analysis end date

        Returns:
            ForensicResult with metrics
        """

        # Calculate basic metrics
        win_rate = calculate_win_rate(trades)
        profit_factor = calculate_profit_factor(trades)
        avg_win, avg_loss = calculate_avg_win_loss(trades)

        # Calculate equity curve (cumulative returns, properly compounded)
        # Start with $1000 account value
        equity_curve = [100.0]  # Start at $100
        for trade in trades:
            # Calculate new account value based on return percentage
            current_value = equity_curve[-1]
            new_value = current_value * (1 + trade.return_pct / 100)  # Convert % to decimal
            equity_curve.append(new_value)

        max_dd = calculate_max_drawdown(equity_curve)
        sharpe = calculate_sharpe_ratio(trades)

        # Total return
        total_return = sum([t.return_pct for t in trades])

        # Create result
        result = ForensicResult(
            symbol=ticker,
            analysis_date=datetime.now().strftime('%Y-%m-%d'),
            period_start=start_date,
            period_end=end_date,
            total_trading_days=len(trades),
            total_trades=len(trades),
            winning_trades=sum(1 for t in trades if t.pnl > 0),
            losing_trades=sum(1 for t in trades if t.pnl < 0),
            win_rate=win_rate,
            avg_win_pct=avg_win,
            avg_loss_pct=avg_loss,
            profit_factor=profit_factor,
            total_pnl_pct=total_return,
            max_drawdown=max_dd,
            sharpe_ratio=sharpe,
            intraday_score=0.0,  # Will be set in _generate_verdict
            verdict="",  # Will be set
            recommendation="",  # Will be set
            trades=trades,
        )

        return result

    def _generate_verdict(self, result: ForensicResult) -> ForensicResult:
        """
        Generate a plain-English verdict based on metrics.

        Scoring logic:
        - Win rate > 40% + Profit factor > 1.3 = EXCELLENT
        - Win rate > 35% + Profit factor > 1.2 = GOOD
        - Win rate > 30% + Profit factor > 1.0 = MODERATE
        - Win rate < 30% OR Profit factor < 1.0 = RISKY

        Args:
            result: ForensicResult with metrics

        Returns:
            ForensicResult with verdict added
        """

        win_rate = result.win_rate
        pf = result.profit_factor
        sharpe = result.sharpe_ratio

        # Calculate intraday score (0-100)
        score = 0
        score += min(win_rate * 100, 40)  # Max 40 points from win rate
        score += min(pf * 20, 40)  # Max 40 points from profit factor
        score += min(sharpe * 10, 20)  # Max 20 points from Sharpe

        result.intraday_score = max(0, min(100, score))

        # Determine verdict
        if win_rate > 0.40 and pf > 1.3 and sharpe > 1.0:
            result.verdict = "🟢 EXCELLENT"
            result.recommendation = "Outstanding for day trading. High confidence. Consider this as primary candidate."

        elif win_rate > 0.35 and pf > 1.2 and sharpe > 0.8:
            result.verdict = "🟢 GOOD"
            result.recommendation = "Very good for day trading. Reliable entry/exit patterns. Recommended."

        elif win_rate > 0.32 and pf > 1.0 and sharpe > 0.5:
            result.verdict = "🟡 MODERATE"
            result.recommendation = "Okay for day trading. Proceed with caution. Better suited for swings."

        elif win_rate > 0.28 and pf > 0.9:
            result.verdict = "🟡 RISKY"
            result.recommendation = "Risky for day trading. High volatility, inconsistent patterns. Avoid intraday."

        else:
            result.verdict = "🔴 AVOID"
            result.recommendation = "Poor for day trading. Losses outweigh wins. Use for swing trades only."

        return result

    def analyze_multiple(self, tickers: List[str]) -> List[ForensicResult]:
        """
        Analyze multiple stocks and return ranked results.

        Args:
            tickers: List of stock symbols

        Returns:
            List of ForensicResult objects, sorted by intraday_score
        """
        results = []

        for ticker in tickers:
            try:
                result = self.analyze_stock(ticker)
                if result:
                    results.append(result)
            except Exception as e:
                print(f"⚠️ Error analyzing {ticker}: {e}")
                continue

        # Sort by intraday score (highest first)
        results.sort(key=lambda x: x.intraday_score, reverse=True)

        return results

    def print_ranking(self, results: List[ForensicResult]):
        """
        Print a ranked table of results.

        Args:
            results: List of ForensicResult objects
        """
        print("\n" + "="*100)
        print(f"{'SYMBOL':<10} {'VERDICT':<20} {'WIN RATE':<12} {'PROFIT FACTOR':<15} {'SHARPE':<10} {'SCORE':<8}")
        print("="*100)

        for result in results:
            print(f"{result.symbol:<10} {result.verdict:<20} {result.win_rate:>10.1%}  "
                  f"{result.profit_factor:>13.2f}  {result.sharpe_ratio:>8.2f}  {result.intraday_score:>6.0f}/100")

        print("="*100 + "\n")


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def compare_to_fortress_average(custom_result: ForensicResult, fortress_avg_score: float) -> str:
    """
    Compare a custom stock to the Fortress average.

    Args:
        custom_result: ForensicResult for user's custom stock
        fortress_avg_score: Average intraday score of Fortress 30

    Returns:
        Comparison string
    """
    diff = custom_result.intraday_score - fortress_avg_score

    if diff > 10:
        return f"✅ BETTER: Your stock is +{diff:.0f} points above Fortress average"
    elif diff > 0:
        return f"✅ Similar: Your stock is +{diff:.0f} points above Fortress average"
    elif diff > -10:
        return f"⚠️ Slightly worse: Your stock is {diff:.0f} points below Fortress average"
    else:
        return f"❌ Worse: Your stock is {diff:.0f} points below Fortress average"
