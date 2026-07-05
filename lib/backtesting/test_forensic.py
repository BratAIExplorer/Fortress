"""
Quick Test: Forensic Analysis on 3 Sample Stocks
Purpose: Validate the forensic engine works before running full Fortress 30
Date: 2026-07-02

USAGE:
    cd C:\Antigravity\Fortress
    python -m lib.backtesting.test_forensic
"""

from .forensic_analyzer import ForensicAnalyzer, compare_to_fortress_average


def test_forensic_engine():
    """
    Test the forensic analyzer on 3 stocks:
    - HDFC.NS (India, high volatility, good for day trading)
    - AAPL (US, moderate volatility, okay for day trading)
    - INFY.NS (India, low volatility, probably bad for day trading)
    """

    print("\n" + "="*100)
    print("FORENSIC ANALYSIS TEST - 3 SAMPLE STOCKS")
    print("="*100 + "\n")

    # Initialize analyzer
    analyzer = ForensicAnalyzer(months_back=12)

    # Test stocks
    # Note: HDFC.NS is delisted, use HDFCBANK.NS instead
    test_tickers = ['HDFCBANK.NS', 'AAPL', 'INFY.NS']

    print("⏳ This will take 1-2 minutes (fetching 12 months of data per stock)...\n")

    # Analyze each stock
    results = analyzer.analyze_multiple(test_tickers)

    # Print results
    if results:
        print("\n" + "="*100)
        print("RESULTS SUMMARY")
        print("="*100 + "\n")

        analyzer.print_ranking(results)

        # Detailed output for each
        for result in results:
            print(result)

        # Calculate average score
        avg_score = sum([r.intraday_score for r in results]) / len(results)
        print(f"\n✅ Average Intraday Score (these 3 stocks): {avg_score:.1f}/100")
        print(f"   This will be your baseline for comparing Fortress 30 stocks.\n")

        # Save results to CSV for reference
        try:
            import csv
            csv_path = 'forensic_test_results.csv'
            with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['Symbol', 'Win Rate', 'Profit Factor', 'Sharpe Ratio', 'Score', 'Verdict'])
                for result in results:
                    # Strip emojis from verdict for CSV compatibility
                    verdict_clean = result.verdict.replace('🟢', '').replace('🟡', '').replace('🔴', '').strip()
                    writer.writerow([
                        result.symbol,
                        f"{result.win_rate:.1%}",
                        f"{result.profit_factor:.2f}",
                        f"{result.sharpe_ratio:.2f}",
                        f"{result.intraday_score:.0f}",
                        verdict_clean
                    ])
            print(f"📊 Results saved to: {csv_path}\n")
        except Exception as e:
            print(f"⚠️ Could not save CSV: {e}\n")

    else:
        print("❌ No results. Check your internet connection and try again.\n")


if __name__ == '__main__':
    test_forensic_engine()
