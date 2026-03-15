#!/usr/bin/env python3
"""
Fortress Intelligence — Alpha Price Tracker
Cron job: runs daily, checks the API for pending 30/60/90d price checks,
fetches current prices via yfinance, and posts results back.

Setup (VPS):
  1. Set FORTRESS_API_URL and ADMIN_SECRET env vars (or edit defaults below)
  2. Add to crontab: 0 8 * * * /usr/bin/python3 /opt/fortress/scanner/price_tracker.py >> /var/log/fortress-tracker.log 2>&1
"""

import os
import sys
import json
import time
import logging
import requests
import yfinance as yf
from datetime import datetime

# ─── Config ──────────────────────────────────────────────────────────────────
API_BASE = os.environ.get("FORTRESS_API_URL", "http://localhost:3000")
ADMIN_SECRET = os.environ.get("ADMIN_SECRET", "")
RATE_LIMIT_DELAY = 1.5  # seconds between yfinance calls

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("price_tracker")

# ─── Market-to-yfinance suffix map ───────────────────────────────────────────
# Handles the different ticker formats across markets
MARKET_SUFFIX = {
    "NSE": ".NS",
    "BSE": ".BO",
    "SGX": ".SI",
    "IDX": ".JK",
    "BURSA": ".KL",
    "SET": ".BK",
    "US": "",     # No suffix needed for US stocks
    "ETF": "",    # ETFs usually US-listed
    "MF": None,   # Mutual funds — skip yfinance, price from screener.in (future)
}


def get_auth_headers() -> dict:
    if not ADMIN_SECRET:
        log.error("ADMIN_SECRET not set. Export it before running.")
        sys.exit(1)
    return {"x-admin-secret": ADMIN_SECRET, "Content-Type": "application/json"}


def fetch_pending_checks() -> list:
    """Ask the API which predictions are due for price checks."""
    url = f"{API_BASE}/api/alpha/track?pending=true"
    try:
        resp = requests.get(url, headers=get_auth_headers(), timeout=15)
        resp.raise_for_status()
        data = resp.json()
        return data.get("pending", [])
    except Exception as e:
        log.error(f"Failed to fetch pending checks: {e}")
        return []


def get_current_price(ticker: str, market: str) -> float | None:
    """Fetch current price from yfinance. Returns None on failure."""
    suffix = MARKET_SUFFIX.get(market.upper())

    if suffix is None:
        log.info(f"Skipping {ticker} ({market}) — no yfinance support for this market.")
        return None

    yf_ticker = ticker + suffix if not ticker.endswith(suffix) else ticker

    try:
        t = yf.Ticker(yf_ticker)
        info = t.info

        # Try multiple price fields — yfinance is inconsistent across markets
        price = (
            info.get("currentPrice")
            or info.get("regularMarketPrice")
            or info.get("previousClose")
            or info.get("navPrice")  # For ETFs
        )

        if price and price > 0:
            return float(price)

        # Fallback: use recent history
        hist = t.history(period="2d")
        if not hist.empty:
            return float(hist["Close"].iloc[-1])

        log.warning(f"No price data for {yf_ticker}")
        return None
    except Exception as e:
        log.warning(f"yfinance error for {yf_ticker}: {e}")
        return None


def post_price_check(prediction_id: str, check_type: str, current_price: float) -> bool:
    """Post a price check result to the API."""
    url = f"{API_BASE}/api/alpha/track"
    payload = {
        "predictionId": prediction_id,
        "checkType": check_type,
        "currentPrice": current_price,
    }
    try:
        resp = requests.post(url, json=payload, headers=get_auth_headers(), timeout=15)
        resp.raise_for_status()
        result = resp.json()
        return result.get("success", False)
    except Exception as e:
        log.error(f"Failed to post price check for {prediction_id}: {e}")
        return False


def run():
    log.info("=== Fortress Alpha Price Tracker starting ===")
    log.info(f"API: {API_BASE}")

    pending = fetch_pending_checks()
    log.info(f"Pending checks: {len(pending)}")

    if not pending:
        log.info("Nothing to track today. Exiting.")
        return

    success_count = 0
    skip_count = 0
    fail_count = 0

    for check in pending:
        prediction_id = check["predictionId"]
        ticker = check["ticker"]
        market = check["market"]
        check_type = check["checkType"]

        log.info(f"Checking {ticker} ({market}) — {check_type}")

        price = get_current_price(ticker, market)

        if price is None:
            log.warning(f"  → Skipped (no price)")
            skip_count += 1
            time.sleep(RATE_LIMIT_DELAY)
            continue

        ok = post_price_check(prediction_id, check_type, price)

        if ok:
            entry_price = float(check.get("entryPrice") or 0)
            return_pct = ((price - entry_price) / entry_price * 100) if entry_price > 0 else 0
            log.info(f"  → Price: {price:.4f} | Return: {return_pct:+.2f}% | ✓")
            success_count += 1
        else:
            log.error(f"  → Failed to record")
            fail_count += 1

        time.sleep(RATE_LIMIT_DELAY)

    log.info(f"=== Done: {success_count} recorded, {skip_count} skipped, {fail_count} failed ===")

    # Trigger learning report if we just completed a 90-day check batch
    ninety_day_count = sum(1 for c in pending if c["checkType"] == "90d")
    if ninety_day_count >= 5:
        log.info(f"Completed {ninety_day_count} 90-day checks. Triggering learning report...")
        try:
            resp = requests.post(
                f"{API_BASE}/api/alpha/learn",
                json={},
                headers=get_auth_headers(),
                timeout=30,
            )
            result = resp.json()
            if result.get("success"):
                log.info(f"Learning report generated. Hit rate: {result.get('overallHitRate', 'N/A')}")
                log.info(f"Summary: {result.get('summary', '')}")
            else:
                log.warning(f"Learning report: {result.get('error', 'Unknown error')}")
        except Exception as e:
            log.error(f"Failed to trigger learning report: {e}")


if __name__ == "__main__":
    run()
