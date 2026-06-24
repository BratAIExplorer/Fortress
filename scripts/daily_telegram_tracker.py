#!/usr/bin/env python3
"""
Daily Telegram Call Tracker — Fetch prices and update call outcomes

This script runs daily (8 PM IST) to:
1. Fetch current prices for all open calls
2. Determine if calls hit targets or SL
3. Calculate returns for closed calls
4. Log all activity

Usage:
  DATABASE_URL="postgresql://..." python daily_telegram_tracker.py
"""

import os
import sys
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import yfinance as yf
from typing import Optional, Dict, Any
import json

class TelegramDailyTracker:
    def __init__(self, db_url: str):
        self.db_url = db_url
        self.conn = None
        self.cursor = None
        self.log = {
            "run_date": datetime.now().isoformat(),
            "calls_updated": 0,
            "calls_closed": 0,
            "prices_fetched": 0,
            "errors": []
        }

    def connect(self):
        """Connect to PostgreSQL"""
        try:
            self.conn = psycopg2.connect(self.db_url)
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            print("[OK] Connected to PostgreSQL")
        except Exception as e:
            print(f"[ERROR] {e}")
            sys.exit(1)

    def get_open_calls(self):
        """Fetch all open calls from database"""
        sql = "SELECT * FROM telegram_calls WHERE status = 'OPEN' ORDER BY entry_date DESC"
        self.cursor.execute(sql)
        return self.cursor.fetchall()

    def fetch_price(self, symbol: str, market: str) -> Optional[float]:
        """Fetch current price for a symbol"""
        try:
            # Add market suffix for NSE
            ticker = f"{symbol}.NS" if market == "NSE" else symbol

            data = yf.download(ticker, period="1d", progress=False)
            if data.empty:
                self.log["errors"].append(f"No data for {ticker}")
                return None

            price = float(data['Close'].iloc[-1])
            self.log["prices_fetched"] += 1
            return price

        except Exception as e:
            self.log["errors"].append(f"Price fetch error for {symbol}: {e}")
            return None

    def check_call_outcome(self, call: Dict[str, Any], current_price: float) -> tuple:
        """
        Determine call status based on current price
        Returns: (status, exit_price, return_pct)
        """
        targets = json.loads(call['targets']) if isinstance(call['targets'], str) else call['targets']
        entry = float(call['entry_price'])
        sl = float(call['stop_loss'])

        # Check if hit target (any target counts as win)
        if current_price >= min(targets):
            status = "CLOSED_WIN"
            exit_price = current_price
            return_pct = ((current_price - entry) / entry) * 100

        # Check if hit stop loss
        elif current_price <= sl:
            status = "CLOSED_LOSS"
            exit_price = current_price
            return_pct = ((current_price - entry) / entry) * 100

        # Still open
        else:
            status = "OPEN"
            exit_price = None
            return_pct = None

        return status, exit_price, return_pct

    def update_call(self, call_id: str, status: str, exit_price: Optional[float],
                   return_pct: Optional[float], bh_price: Optional[float], bh_return: Optional[float]):
        """Update call in database"""
        sql = """
        UPDATE telegram_calls
        SET status = %s, exit_price = %s, return_pct = %s,
            entry_bh_price = %s, bh_return_pct = %s, updated_at = NOW()
        WHERE id = %s
        """

        try:
            self.cursor.execute(sql, (status, exit_price, return_pct, bh_price, bh_return, call_id))
            self.conn.commit()
            self.log["calls_updated"] += 1
            if status.startswith("CLOSED"):
                self.log["calls_closed"] += 1
        except Exception as e:
            self.log["errors"].append(f"Update error for {call_id}: {e}")
            self.conn.rollback()

    def get_bh_price(self, symbol: str, market: str, entry_date: str) -> Optional[float]:
        """Get buy-and-hold price at entry date"""
        try:
            ticker = f"{symbol}.NS" if market == "NSE" else symbol
            # Fetch price from entry date (or closest date)
            data = yf.download(ticker, start=entry_date, period="1d", progress=False)

            if data.empty:
                return None

            return float(data['Close'].iloc[0])
        except:
            return None

    def run(self):
        """Main execution"""
        self.connect()
        print(f"[*] Daily Telegram Tracker started at {self.log['run_date']}")

        calls = self.get_open_calls()
        print(f"[*] Processing {len(calls)} open calls...")

        for call in calls:
            # Fetch current price
            price = self.fetch_price(call['symbol'], call['market'])
            if not price:
                continue

            # Check if call should be closed
            status, exit_price, return_pct = self.check_call_outcome(call, price)

            # Get buy-and-hold price if not already set
            bh_price = call['entry_bh_price']
            if not bh_price:
                bh_price = self.get_bh_price(call['symbol'], call['market'], call['entry_date'])

            # Calculate BH return
            bh_return = None
            if bh_price:
                entry = float(call['entry_price'])
                bh_return = ((price - bh_price) / bh_price) * 100

            # Update database
            self.update_call(
                call['id'], status, exit_price, return_pct,
                bh_price, bh_return
            )

            print(f"  {call['symbol']}: {status} (price={price}, return={return_pct:.1f}% vs BH={bh_return:.1f}%)" if bh_return else f"  {call['symbol']}: {status}")

        # Print summary
        print(f"\n[SUMMARY]")
        print(f"  Calls updated: {self.log['calls_updated']}")
        print(f"  Calls closed: {self.log['calls_closed']}")
        print(f"  Prices fetched: {self.log['prices_fetched']}")
        if self.log['errors']:
            print(f"  Errors: {len(self.log['errors'])}")

        # Close connection
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()

def main():
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("[ERROR] DATABASE_URL not set")
        sys.exit(1)

    tracker = TelegramDailyTracker(db_url)
    tracker.run()

if __name__ == "__main__":
    main()
