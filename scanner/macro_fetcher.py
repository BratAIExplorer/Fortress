#!/usr/bin/env python3
"""
Fortress Market Pulse Fetcher
Handles yfinance 1.x MultiIndex column structure changes.
"""

import json
import sys
import time
from datetime import date

try:
    import yfinance as yf
    import pandas as pd
except ImportError:
    print(json.dumps({"error": "yfinance/pandas not installed"}))
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


def last_close(series: pd.Series) -> float | None:
    s = series.dropna()
    return round(float(s.iloc[-1]), 4) if not s.empty else None


def extract_batch(raw: pd.DataFrame) -> dict[str, float | None]:
    """Handle both (Price, Ticker) and (Ticker, Price) MultiIndex layouts."""
    result: dict[str, float | None] = {}

    if not isinstance(raw.columns, pd.MultiIndex):
        # Single ticker — shouldn't happen with multiple inputs
        return {key: None for key in TICKER_MAP}

    level0 = list(raw.columns.get_level_values(0).unique())
    level1 = list(raw.columns.get_level_values(1).unique())

    # Determine which axis holds the price field and which holds the ticker
    close_variants = ["Close", "close", "Adj Close"]

    if any(c in level0 for c in close_variants):
        # Layout: (Price, Ticker) — standard yfinance < 1.x
        close_col = next(c for c in close_variants if c in level0)
        for symbol, key in KEY_BY_SYMBOL.items():
            try:
                result[key] = last_close(raw[close_col][symbol])
            except Exception:
                result[key] = None

    elif any(c in level1 for c in close_variants):
        # Layout: (Ticker, Price) — yfinance 1.x default
        close_col = next(c for c in close_variants if c in level1)
        for symbol, key in KEY_BY_SYMBOL.items():
            try:
                result[key] = last_close(raw[symbol][close_col])
            except Exception:
                result[key] = None
    else:
        sys.stderr.write(f"[macro_fetcher] unknown column layout: {raw.columns[:6].tolist()}\n")
        result = {key: None for key in TICKER_MAP}

    return result


def fetch_individual(symbol: str) -> float | None:
    """Fallback: single ticker fetch."""
    try:
        hist = yf.Ticker(symbol).history(period="5d")
        if not hist.empty:
            return last_close(hist["Close"])
    except Exception as e:
        sys.stderr.write(f"[macro_fetcher] individual {symbol}: {e}\n")
    return None


def fetch_all(retries: int = 2, delay: int = 8) -> dict[str, float | None]:
    for attempt in range(retries):
        try:
            raw = yf.download(
                tickers=SYMBOLS,
                period="5d",
                group_by="ticker",
                auto_adjust=True,
                progress=False,
                threads=False,
            )
            if not raw.empty:
                result = extract_batch(raw)
                # Fill any remaining nulls with individual fetches
                for symbol, key in KEY_BY_SYMBOL.items():
                    if result.get(key) is None:
                        result[key] = fetch_individual(symbol)
                return result
        except Exception as e:
            sys.stderr.write(f"[macro_fetcher] batch attempt {attempt + 1}: {e}\n")
            if attempt < retries - 1:
                time.sleep(delay)

    # Fallback: all individual
    return {key: fetch_individual(symbol) for symbol, key in KEY_BY_SYMBOL.items()}


def main():
    data = fetch_all()
    output = {"snapshot_date": date.today().isoformat()}
    output.update(data)
    print(json.dumps(output))


if __name__ == "__main__":
    main()
