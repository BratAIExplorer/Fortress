#!/usr/bin/env python3
"""
Weekly Telegram Backtest Runner — Calculate metrics and generate report

This script runs weekly (Tuesday 8 AM IST) to:
1. Calculate win rate, returns, Sharpe ratio
2. Compare to buy-and-hold returns
3. Sector-level analysis
4. Generate JSON report
5. Track trends over time

Usage:
  DATABASE_URL="postgresql://..." python weekly_telegram_backtest.py
"""

import os
import sys
import json
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, List, Any
import statistics

class TelegramWeeklyBacktest:
    def __init__(self, db_url: str):
        self.db_url = db_url
        self.conn = None
        self.cursor = None
        self.run_date = datetime.now()

    def connect(self):
        try:
            self.conn = psycopg2.connect(self.db_url)
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            print("[OK] Connected to PostgreSQL")
        except Exception as e:
            print(f"[ERROR] {e}")
            sys.exit(1)

    def get_closed_calls(self, limit_days: int = 7) -> List[Dict]:
        """Get closed calls from the past N days"""
        sql = f"""
        SELECT * FROM telegram_calls
        WHERE status LIKE 'CLOSED_%'
        AND updated_at >= NOW() - INTERVAL '{limit_days} days'
        ORDER BY updated_at DESC
        """
        self.cursor.execute(sql)
        return self.cursor.fetchall()

    def get_all_tracked_calls(self) -> List[Dict]:
        """Get all tracked calls (for aggregate metrics)"""
        sql = "SELECT * FROM telegram_calls ORDER BY entry_date"
        self.cursor.execute(sql)
        return self.cursor.fetchall()

    def calculate_metrics(self, calls: List[Dict]) -> Dict[str, Any]:
        """Calculate backtest metrics"""
        if not calls:
            return {
                "total_calls": 0,
                "closed_calls": 0,
                "win_calls": 0,
                "win_rate": 0,
                "avg_return_pct": 0,
                "avg_drawdown_pct": 0,
                "sharpe_ratio": 0,
                "calmar_ratio": 0,
                "avg_bh_return_pct": 0,
                "outperformance_pct": 0
            }

        # Count calls
        closed = [c for c in calls if c['status'] and c['status'].startswith('CLOSED')]
        wins = [c for c in closed if c['status'] == 'CLOSED_WIN']

        # Returns
        returns = [float(c['return_pct']) for c in closed if c['return_pct'] is not None]
        bh_returns = [float(c['bh_return_pct']) for c in closed if c['bh_return_pct'] is not None]

        # Metrics
        total = len(calls)
        closed_count = len(closed)
        win_count = len(wins)
        win_rate = (win_count / closed_count * 100) if closed_count > 0 else 0

        avg_return = statistics.mean(returns) if returns else 0
        avg_bh_return = statistics.mean(bh_returns) if bh_returns else 0
        outperformance = avg_return - avg_bh_return

        # Drawdown (max loss)
        max_loss = min(returns) if returns else 0
        avg_drawdown = min(returns) if returns else 0

        # Sharpe ratio (simplified: return / std_dev)
        std_dev = statistics.stdev(returns) if len(returns) > 1 else 0
        sharpe = (avg_return / std_dev) if std_dev > 0 else 0

        # Calmar ratio (return / max drawdown)
        calmar = (avg_return / abs(max_loss)) if max_loss < 0 else 0

        return {
            "total_calls": total,
            "closed_calls": closed_count,
            "win_calls": win_count,
            "win_rate": round(win_rate, 2),
            "avg_return_pct": round(avg_return, 4),
            "avg_drawdown_pct": round(avg_drawdown, 4),
            "sharpe_ratio": round(sharpe, 4),
            "calmar_ratio": round(calmar, 4),
            "avg_bh_return_pct": round(avg_bh_return, 4),
            "outperformance_pct": round(outperformance, 4)
        }

    def sector_analysis(self, calls: List[Dict]) -> Dict[str, Any]:
        """Analyze by sector"""
        sectors = {}

        for call in calls:
            if call['status'] and call['status'].startswith('CLOSED'):
                # Try to infer sector from symbol (simplified)
                sector = self._infer_sector(call['symbol'], call['market'])
                if sector not in sectors:
                    sectors[sector] = {"wins": 0, "total": 0, "returns": []}

                sectors[sector]["total"] += 1
                if call['status'] == 'CLOSED_WIN':
                    sectors[sector]["wins"] += 1
                if call['return_pct']:
                    sectors[sector]["returns"].append(float(call['return_pct']))

        # Calculate sector metrics
        result = {}
        for sector, data in sectors.items():
            win_rate = (data["wins"] / data["total"] * 100) if data["total"] > 0 else 0
            avg_return = statistics.mean(data["returns"]) if data["returns"] else 0
            result[sector] = {
                "calls": data["total"],
                "win_rate": round(win_rate, 2),
                "avg_return": round(avg_return, 4)
            }

        return result

    def _infer_sector(self, symbol: str, market: str) -> str:
        """Infer sector from symbol (hardcoded for now)"""
        # NSE sectors
        nse_sectors = {
            "AXIS": "Banking", "ICICI": "Banking", "HDFC": "Banking", "SBI": "Banking",
            "INFY": "IT", "TCS": "IT", "WIPRO": "IT",
            "RELIANCE": "Oil & Gas", "ONGC": "Oil & Gas",
            "TATA": "Conglomerate",
            "BAJAJ": "Auto", "MARUTI": "Auto",
            "PHARMA": "Pharma", "CIPLA": "Pharma",
        }

        # US sectors (simplified)
        us_sectors = {
            "AAPL": "Technology", "MSFT": "Technology", "GOOGL": "Technology",
            "JPM": "Banking", "BAC": "Banking",
            "XOM": "Oil & Gas", "CVX": "Oil & Gas",
            "JNJ": "Healthcare", "PFE": "Healthcare",
        }

        sectors = nse_sectors if market == "NSE" else us_sectors
        for key, sector in sectors.items():
            if key.upper() in symbol.upper():
                return sector

        return "Other"

    def save_metrics(self, metrics: Dict, source: str = None, market: str = None):
        """Save metrics to telegram_metrics table"""
        sql = """
        INSERT INTO telegram_metrics (
            source, market, metric_date, metric_type,
            total_calls, closed_calls, win_calls, win_rate,
            avg_return_pct, avg_drawdown_pct, sharpe_ratio, calmar_ratio,
            avg_bh_return_pct, outperformance_pct
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        try:
            self.cursor.execute(sql, (
                source, market, self.run_date.date(), "WEEKLY",
                metrics["total_calls"], metrics["closed_calls"], metrics["win_calls"],
                metrics["win_rate"], metrics["avg_return_pct"], metrics["avg_drawdown_pct"],
                metrics["sharpe_ratio"], metrics["calmar_ratio"],
                metrics["avg_bh_return_pct"], metrics["outperformance_pct"]
            ))
            self.conn.commit()
        except Exception as e:
            print(f"[ERROR] Failed to save metrics: {e}")
            self.conn.rollback()

    def generate_report(self):
        """Generate weekly report"""
        print(f"\n[*] Generating weekly report for {self.run_date.strftime('%Y-%m-%d')}")

        all_calls = self.get_all_tracked_calls()
        metrics = self.calculate_metrics(all_calls)
        sectors = self.sector_analysis(all_calls)

        report = {
            "week": f"{(self.run_date - timedelta(days=7)).strftime('%Y-%m-%d')} to {self.run_date.strftime('%Y-%m-%d')}",
            "generated_at": self.run_date.isoformat(),
            "metrics": metrics,
            "by_sector": sectors,
            "top_sector": max(sectors.items(), key=lambda x: x[1]["win_rate"])[0] if sectors else "N/A",
            "status": "ACTIVE"
        }

        # Save report to file
        report_file = f"/tmp/telegram_report_{self.run_date.strftime('%Y%m%d')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)

        print(f"[OK] Report saved to {report_file}")

        # Print summary
        print(f"\n[SUMMARY - {report['week']}]")
        print(f"  Total calls: {metrics['total_calls']}")
        print(f"  Closed calls: {metrics['closed_calls']}")
        print(f"  Win rate: {metrics['win_rate']}%")
        print(f"  Avg return: {metrics['avg_return_pct']}%")
        print(f"  BH return: {metrics['avg_bh_return_pct']}%")
        print(f"  Outperformance: {metrics['outperformance_pct']}%")
        print(f"  Sharpe ratio: {metrics['sharpe_ratio']}")

        # Save metrics to database
        for source in ["SpotOnTradingTips", "deepakstockvipo"]:
            source_calls = [c for c in all_calls if c['source'] == source]
            if source_calls:
                source_metrics = self.calculate_metrics(source_calls)
                self.save_metrics(source_metrics, source=source)

        return report

    def run(self):
        """Main execution"""
        self.connect()
        report = self.generate_report()
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        return report

def main():
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("[ERROR] DATABASE_URL not set")
        sys.exit(1)

    backtest = TelegramWeeklyBacktest(db_url)
    backtest.run()

if __name__ == "__main__":
    main()
