#!/usr/bin/env python3
"""
Fortress Market Pulse Fetcher
Fetches macro indicators via a single batched yfinance download call.
Single batch = one HTTP request = far less likely to be rate-limited.
"""

import json
import sys
import time
from datetime import date

try:
    import yfinance as yf
except ImportError:
    print(json.dumps({"error": "yfinance not installed"}))
    sys.exit(1)

TICKER_MAP = {
    "nifty_50":      "^NSEI",
    "bank_nifty":    "^NSEBANK",
    "usd_inr":       "USDINR=X",
    "gold_usd":      "GC=F",
    "crude_oil_usd": "CL=F",
    "us_10y_yield":  "^TNX",
    "cboe_vix":      "^VIX",
    "india_vix":     "^INDIAVIX",
}

SYMBOLS = list(TICKER_MAP.values())
KEY_BY_SYMBOL = {v: k for k, v in TICKER_MAP.items()}


def fetch_all(retries: int = 3, delay: int = 10) -> dict[str, float | None]:
    """Download all tickers in one batch request. Retries on rate-limit."""
    for attempt in range(retries):
        try:
            # Single batch download — one HTTPS request for all tickers
            raw = yf.download(
                tickers=SYMBOLS,
                period="5d",
                group_by="ticker",
                auto_adjust=True,
                progress=False,
                threads=False,   # sequential to avoid hammering the API
            )

            result: dict[str, float | None] = {}
            for symbol, key in KEY_BY_SYMBOL.items():
                try:
                    # Multi-ticker download nests columns as (field, ticker)
                    if hasattr(raw.columns, "levels"):
                        prices = raw["Close"][symbol].dropna()
                    else:
                        # Single ticker fallback (shouldn't happen with multiple tickers)
                        prices = raw["Close"].dropna()

                    result[key] = round(float(prices.iloc[-1]), 4) if not prices.empty else None
                except Exception as e:
                    sys.stderr.write(f"[macro_fetcher] parse error {symbol}: {e}\n")
                    result[key] = None

            return result

        except Exception as e:
            msg = str(e)
            sys.stderr.write(f"[macro_fetcher] attempt {attempt + 1} failed: {msg}\n")
            if attempt < retries - 1:
                time.sleep(delay * (attempt + 1))

    # All retries failed — return nulls gracefully
    return {key: None for key in TICKER_MAP}


def main():
    data = fetch_all()
    output = {"snapshot_date": date.today().isoformat()}
    output.update(data)
    print(json.dumps(output))


if __name__ == "__main__":
    main()
