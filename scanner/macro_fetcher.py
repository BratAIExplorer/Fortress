#!/usr/bin/env python3
"""
Fortress Market Pulse Fetcher
Fetches macro indicators from yfinance and prints a single JSON line to stdout.
Called by /api/macro route (POST /api/macro).
"""

import json
import sys
from datetime import date

try:
    import yfinance as yf
except ImportError:
    print(json.dumps({"error": "yfinance not installed"}))
    sys.exit(1)

TICKERS = {
    "nifty_50":     "^NSEI",
    "bank_nifty":   "^NSEBANK",
    "usd_inr":      "USDINR=X",
    "gold_usd":     "GC=F",
    "crude_oil_usd":"CL=F",
    "us_10y_yield": "^TNX",
    "cboe_vix":     "^VIX",
    "india_vix":    "^INDIAVIX",
}


def fetch_price(symbol: str) -> float | None:
    """Return the most recent closing price, or None on failure."""
    try:
        hist = yf.Ticker(symbol).history(period="5d")
        if hist.empty:
            return None
        return round(float(hist["Close"].iloc[-1]), 4)
    except Exception as e:
        sys.stderr.write(f"[macro_fetcher] {symbol}: {e}\n")
        return None


def main():
    result: dict = {"snapshot_date": date.today().isoformat()}
    for key, symbol in TICKERS.items():
        result[key] = fetch_price(symbol)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
