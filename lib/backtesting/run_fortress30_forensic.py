"""
Batch Forensic Analysis: Run on all Fortress 30 Stocks
Purpose: Generate complete intraday ranking for all Fortress 30 stocks
Output: CSV file with rankings + JSON with detailed results
Date: 2026-07-02

USAGE:
    cd C:\Antigravity\Fortress
    python -m lib.backtesting.run_fortress30_forensic

This will:
1. Fetch all Fortress 30 stocks from database (or use seed list)
2. Analyze each one for intraday day trading suitability
3. Generate ranked CSV: best → worst for intraday trading
4. Save detailed JSON for reference
"""

import json
import csv
from typing import List
from datetime import datetime
from .forensic_analyzer import ForensicAnalyzer


# ============================================================================
# FORTRESS 30 SEED LIST
# ============================================================================
# This is a placeholder. In production, this will come from the database.
# For now, using a mix of popular NSE + US stocks that are likely in Fortress 30

FORTRESS_30_SEED = [
    # NSE (India) - Top Large Cap
    'HDFCBANK.NS',  # HDFC Bank (HDFC.NS is delisted)
    'RELIANCE.NS',
    'INFY.NS',
    'TCS.NS',
    'BAJAJFINSV.NS',
    'ICICIBANK.NS',
    'ITC.NS',
    'WIPRO.NS',
    'MARUTI.NS',
    'SUNPHARMA.NS',
    'ASIANPAINT.NS',
    'BHARTIARTL.NS',
    'KOTAKBANK.NS',
    'LT.NS',
    'AXISBANK.NS',

    # US Market - Tech/Growth
    'AAPL',
    'MSFT',
    'GOOGL',
    'AMZN',
    'TSLA',
    'NVDA',
    'META',
    'NFLX',
    'CRM',
    'ADBE',
    'INTC',
    'AMD',
    'MU',
    'AVGO',
    'QCOM',
]


def fetch_fortress_30_from_db() -> List[str]:
    """
    Fetch Fortress 30 tickers from database.

    TODO: Implement database query
    For now, returns seed list.

    Returns:
        List of ticker symbols
    """
    # TODO: Query PostgreSQL for scan_results where mb_tier = 'Rocket'
    # or similar logic to get top 30 stocks

    print("⚠️ Using seed list (database integration pending)")
    return FORTRESS_30_SEED


def run_batch_analysis(tickers: List[str], output_prefix: str = 'fortress30_forensic') -> dict:
    """
    Run forensic analysis on all stocks and generate reports.

    Args:
        tickers: List of stock symbols
        output_prefix: Prefix for output files

    Returns:
        Summary dictionary with stats
    """

    print("\n" + "="*100)
    print("FORENSIC ANALYSIS - FORTRESS 30 BATCH")
    print("="*100)
    print(f"\nAnalyzing {len(tickers)} stocks...")
    print(f"⏳ This will take 5-15 minutes depending on your connection\n")

    # Run analysis
    analyzer = ForensicAnalyzer(months_back=12)
    results = analyzer.analyze_multiple(tickers)

    if not results:
        print("❌ No results generated. Check your connection and try again.")
        return {}

    print(f"\n✅ Analysis complete. {len(results)} stocks analyzed.\n")

    # Print ranking table
    analyzer.print_ranking(results)

    # Generate reports
    summary = _generate_reports(results, output_prefix)

    return summary


def _generate_reports(results, output_prefix: str) -> dict:
    """
    Save results to CSV and JSON files.

    Args:
        results: List of ForensicResult objects
        output_prefix: Prefix for filenames

    Returns:
        Summary dictionary
    """

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    csv_filename = f'{output_prefix}_ranking_{timestamp}.csv'
    json_filename = f'{output_prefix}_detailed_{timestamp}.json'

    # 1. CSV Report (for quick view)
    try:
        with open(csv_filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                'Rank', 'Symbol', 'Win Rate', 'Avg Win %', 'Avg Loss %',
                'Profit Factor', 'Sharpe Ratio', 'Max Drawdown %', 'Score', 'Verdict'
            ])

            for rank, result in enumerate(results, 1):
                # Strip emojis from verdict for CSV compatibility
                verdict_clean = result.verdict.replace('🟢', '').replace('🟡', '').replace('🔴', '').strip()
                writer.writerow([
                    rank,
                    result.symbol,
                    f"{result.win_rate:.1%}",
                    f"{result.avg_win_pct:+.2f}",
                    f"{result.avg_loss_pct:+.2f}",
                    f"{result.profit_factor:.2f}",
                    f"{result.sharpe_ratio:.2f}",
                    f"{result.max_drawdown:.2f}",
                    f"{result.intraday_score:.0f}",
                    verdict_clean
                ])

        print(f"📊 CSV Report: {csv_filename}")
    except Exception as e:
        print(f"❌ Error saving CSV: {e}")

    # 2. JSON Report (for detailed reference)
    try:
        json_data = {
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'total_stocks': len(results),
                'period': '12 months',
            },
            'rankings': []
        }

        for rank, result in enumerate(results, 1):
            json_data['rankings'].append({
                'rank': rank,
                'symbol': result.symbol,
                'metrics': {
                    'total_trades': result.total_trades,
                    'win_rate': round(result.win_rate, 4),
                    'winning_trades': result.winning_trades,
                    'losing_trades': result.losing_trades,
                    'avg_win_pct': round(result.avg_win_pct, 2),
                    'avg_loss_pct': round(result.avg_loss_pct, 2),
                    'profit_factor': round(result.profit_factor, 2),
                    'total_pnl_pct': round(result.total_pnl_pct, 2),
                    'max_drawdown_pct': round(result.max_drawdown, 2),
                    'sharpe_ratio': round(result.sharpe_ratio, 2),
                    'intraday_score': round(result.intraday_score, 0),
                },
                'verdict': result.verdict,
                'recommendation': result.recommendation,
                'period': f"{result.period_start} to {result.period_end}",
            })

        with open(json_filename, 'w') as f:
            json.dump(json_data, f, indent=2)

        print(f"📋 JSON Report: {json_filename}")
    except Exception as e:
        print(f"❌ Error saving JSON: {e}")

    # 3. Summary Stats
    summary = {
        'total_analyzed': len(results),
        'excellent_count': sum(1 for r in results if '🟢 EXCELLENT' in r.verdict),
        'good_count': sum(1 for r in results if '🟢 GOOD' in r.verdict),
        'moderate_count': sum(1 for r in results if '🟡 MODERATE' in r.verdict),
        'risky_count': sum(1 for r in results if '🟡 RISKY' in r.verdict),
        'avoid_count': sum(1 for r in results if '🔴 AVOID' in r.verdict),
        'avg_score': sum([r.intraday_score for r in results]) / len(results),
        'csv_file': csv_filename,
        'json_file': json_filename,
    }

    # Print summary
    print("\n" + "="*100)
    print("SUMMARY")
    print("="*100)
    print(f"Total Stocks Analyzed: {summary['total_analyzed']}")
    print(f"  🟢 Excellent: {summary['excellent_count']}")
    print(f"  🟢 Good: {summary['good_count']}")
    print(f"  🟡 Moderate: {summary['moderate_count']}")
    print(f"  🟡 Risky: {summary['risky_count']}")
    print(f"  🔴 Avoid: {summary['avoid_count']}")
    print(f"\nAverage Intraday Score: {summary['avg_score']:.1f}/100")
    print("="*100 + "\n")

    return summary


def main():
    """Main entry point"""
    # Get Fortress 30 (or seed list for now)
    tickers = fetch_fortress_30_from_db()

    # Run analysis
    summary = run_batch_analysis(tickers)

    # Report files created
    if summary:
        print(f"✅ All reports generated successfully!")
        print(f"\n📁 Files created:")
        print(f"   - {summary['csv_file']}")
        print(f"   - {summary['json_file']}")
        print(f"\n💡 Next step: Open the CSV file to see ranked list of stocks.")
        print(f"   Best for day trading are at the top (highest intraday score).\n")


if __name__ == '__main__':
    main()
