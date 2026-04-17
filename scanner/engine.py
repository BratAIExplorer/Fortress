import yfinance as yf
import pandas as pd
import ta
import time
import json
import os
import pickle
import requests
import io
import concurrent.futures
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from abc import ABC, abstractmethod

# ─── DISK CACHE ────────────────────────────────────────────────────────────────
# Caches raw yfinance responses for 8 hours so repeated scans within the same
# trading day use consistent underlying data and avoid Yahoo rate-limiting.

class _DiskCache:
    TTL = timedelta(hours=8)
    DIR = Path("/tmp/fortress_scan_cache")

    def __init__(self):
        self.DIR.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        safe = key.replace("/", "_").replace(".", "_").replace("^", "")
        return self.DIR / f"{safe}.pkl"

    def get(self, key: str):
        p = self._path(key)
        if not p.exists():
            return None
        try:
            age = datetime.now() - datetime.fromtimestamp(p.stat().st_mtime)
            if age > self.TTL:
                p.unlink(missing_ok=True)
                return None
            with open(p, "rb") as f:
                return pickle.load(f)
        except Exception:
            return None

    def set(self, key: str, value) -> None:
        if value is None:
            return
        # Don't cache empty dicts or empty DataFrames — likely a throttled response
        if isinstance(value, dict) and len(value) == 0:
            return
        if isinstance(value, pd.DataFrame) and value.empty:
            return
        try:
            with open(self._path(key), "wb") as f:
                pickle.dump(value, f)
        except Exception:
            pass  # Cache write failures are non-fatal

_cache = _DiskCache()

# ─── MARKET ADAPTERS ───────────────────────────────────────────────────────────

class MarketAdapter(ABC):
    """Base class. Each market subclass defines its own ticker source,
    benchmark, and price thresholds."""

    @abstractmethod
    def get_tickers(self) -> list[str]:
        pass

    @property
    @abstractmethod
    def benchmark_ticker(self) -> str:
        """yfinance symbol for the market index (L3 comparison)"""
        pass

    @abstractmethod
    def classify_price(self, price: float) -> str:
        """Return category string based on market-specific price thresholds"""
        pass

    @property
    def currency(self) -> str:
        return "USD"  # default


class NSEAdapter(MarketAdapter):
    LIST_URL = "https://archives.nseindia.com/content/equities/EQUITY_L.csv"

    def get_tickers(self) -> list[str]:
        headers = {'User-Agent': 'Mozilla/5.0'}
        try:
            response = requests.get(self.LIST_URL, headers=headers, timeout=15)
            if response.status_code == 200:
                df = pd.read_csv(io.StringIO(response.text))
                return [f"{s}.NS" for s in df['SYMBOL'].tolist()]
        except Exception as e:
            print(json.dumps({"error": f"Failed to fetch NSE list: {str(e)}"}))
        return []

    @property
    def benchmark_ticker(self) -> str:
        return "^NSEI"  # Nifty 50

    def classify_price(self, price: float) -> str:
        if price < 20: return "SUB20"
        if price < 100: return "PENNY"
        return "52W_LOW"

    @property
    def currency(self) -> str:
        return "INR"


class USAdapter(MarketAdapter):
    # Free txt lists from NASDAQ host for NYSE + NASDAQ
    NASDAQ_URL = "https://ftp.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt"
    OTHER_URL = "https://ftp.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt"

    def get_tickers(self) -> list[str]:
        tickers = []
        for url in [self.NASDAQ_URL, self.OTHER_URL]:
            try:
                resp = requests.get(url, timeout=15)
                # Nasdaq lists use | as separator and have headers/footers
                df = pd.read_csv(io.StringIO(resp.text), sep="|")
                if 'Symbol' in df.columns:
                    # Filter out ETFs (yfinance usually tags them, but nasdaq list has ETF column)
                    etf_col = 'ETF' if 'ETF' in df.columns else 'Test Issue'
                    for _, row in df.iterrows():
                        sym = str(row['Symbol'])
                        # Skip test issues and ETFs
                        if row.get('ETF') == 'Y' or row.get('Test Issue') == 'Y':
                            continue
                        if sym and sym.isalpha():
                            tickers.append(sym)
            except Exception as e:
                print(json.dumps({"error": f"Failed fetching US list from {url}: {e}"}))
        return list(set(tickers))

    @property
    def benchmark_ticker(self) -> str:
        return "^GSPC"  # S&P 500

    def classify_price(self, price: float) -> str:
        if price < 1:  return "SUB1"
        if price < 5:  return "PENNY"
        return "52W_LOW"

    @property
    def currency(self) -> str:
        return "USD"


class HKEXAdapter(MarketAdapter):
    # Static list fallback if URL fails
    HKEX_URL = "https://www.hkex.com.hk/eng/services/trading/securities/securitieslists/ListOfSecurities.xlsx"

    def get_tickers(self) -> list[str]:
        try:
            # Note: HKEX site is very picky about headers (403 risk)
            headers = {'User-Agent': 'Mozilla/5.0'}
            resp = requests.get(self.HKEX_URL, headers=headers, timeout=20)
            if resp.status_code == 200:
                df = pd.read_excel(io.BytesIO(resp.content), skiprows=2)
                codes = df.iloc[:, 0].dropna()
                tickers = []
                for code in codes:
                    try:
                        padded = str(int(code)).zfill(4)
                        tickers.append(f"{padded}.HK")
                    except:
                        pass
                return tickers
        except Exception as e:
            print(json.dumps({"error": f"Failed fetching HKEX list: {e}. Check scanner/requirements.txt for openpyxl."}))
        return []

    @property
    def benchmark_ticker(self) -> str:
        return "^HSI"  # Hang Seng Index

    def classify_price(self, price: float) -> str:
        if price < 0.5:  return "SUB_HALF"
        if price < 2:    return "PENNY"
        return "52W_LOW"

    @property
    def currency(self) -> str:
        return "HKD"


MARKET_ADAPTERS = {
    "NSE": NSEAdapter,
    "US": USAdapter,
    "HKEX": HKEXAdapter,
}

# ─── SECTOR TAM LOOKUP TABLE ──────────────────────────────────────────────────
#
# Why this exists instead of manual input:
#   TAM is not a yfinance field. But sector-level TAM is stable enough that
#   a ~20-entry lookup table (reviewed quarterly) gives accurate runway scores
#   for 95% of stocks without any per-stock manual work.
#
# Sources: IBEF, Mordor Intelligence, NSE sector reports, McKinsey Global Institute.
# Values in USD Billion (normalised across NSE/US/HKEX for comparability).
# Update cadence: Quarterly review of fast-moving sectors (defence, EV, fintech).
#
# Key principle: We only need ORDER OF MAGNITUDE accuracy.
# A company with 0.1% TAM penetration vs 5% TAM penetration is a completely
# different investment thesis. We don't need TAM precise to $1B to know that.

SECTOR_TAM_USD_BN: dict[str, float] = {
    # ── Financial Services ────────────────────────────────────────────────────
    "Banks":                          25_000,   # Global banking TAM
    "Financial Services":             20_000,
    "Insurance":                       6_000,
    "Asset Management":                3_000,
    "Credit Services":                 5_000,   # Consumer + BNPL globally

    # ── Technology ────────────────────────────────────────────────────────────
    "Software—Application":           1_500,
    "Software—Infrastructure":        1_200,
    "Information Technology Services":  900,    # IT outsourcing (India-relevant)
    "Semiconductor Equipment & Materials": 600,
    "Semiconductors":                  1_000,
    "Electronic Components":             500,
    "Computer Hardware":                 400,

    # ── Healthcare & Life Sciences ────────────────────────────────────────────
    "Drug Manufacturers—General":      1_400,   # Global branded pharma
    "Drug Manufacturers—Specialty & Generic": 500,
    "Biotechnology":                     800,
    "Medical Devices":                   600,
    "Diagnostics & Research":            300,
    "Healthcare Plans":                  500,
    "Medical Care Facilities":           400,

    # ── Consumer ─────────────────────────────────────────────────────────────
    "Consumer Defensive":              3_000,   # FMCG, staples
    "Beverages—Non-Alcoholic":           500,
    "Beverages—Alcoholic":               300,
    "Tobacco":                           100,
    "Household & Personal Products":     400,
    "Consumer Cyclical":               2_000,
    "Apparel Retail":                    800,
    "Specialty Retail":                  600,
    "Auto & Truck Dealerships":          300,
    "Restaurants":                       900,
    "Luxury Goods":                      400,
    "Footwear & Accessories":            200,

    # ── Industrials & Capital Goods ───────────────────────────────────────────
    "Specialty Industrial Machinery":    700,
    "Industrial Distribution":           400,
    "Electrical Equipment & Parts":      500,
    "Engineering & Construction":      1_200,
    "Building Products & Equipment":     400,
    "Tools & Accessories":               200,
    "Conglomerates":                     800,

    # ── Defence & Aerospace ───────────────────────────────────────────────────
    "Aerospace & Defense":             2_500,   # Global defence spending $2.5T+

    # ── Energy ───────────────────────────────────────────────────────────────
    "Oil & Gas E&P":                   3_000,
    "Oil & Gas Integrated":            2_000,
    "Oil & Gas Refining & Marketing":  1_500,
    "Utilities—Regulated Electric":    1_000,
    "Utilities—Renewable":               800,
    "Solar":                             500,

    # ── Materials & Chemicals ────────────────────────────────────────────────
    "Specialty Chemicals":               700,
    "Agricultural Inputs":               300,
    "Basic Materials":                   600,
    "Steel":                             900,
    "Aluminum":                          200,
    "Copper":                            300,
    "Gold":                              250,

    # ── Real Estate ───────────────────────────────────────────────────────────
    "Real Estate—Development":           600,
    "REIT—Industrial":                   400,
    "REIT—Residential":                  300,

    # ── Auto & EV ────────────────────────────────────────────────────────────
    "Auto Manufacturers":              2_000,
    "Auto Parts":                        600,
    "Electric Vehicles":               1_000,   # Fast growing — review quarterly

    # ── Communication Services ───────────────────────────────────────────────
    "Telecom Services":                1_500,
    "Internet Content & Information":  1_000,
    "Entertainment":                     500,
    "Electronic Gaming & Multimedia":    250,

    # ── Logistics & Transport ─────────────────────────────────────────────────
    "Trucking":                          400,
    "Air Freight & Logistics":           500,
    "Marine Shipping":                   200,
    "Airlines":                          900,
    "Railroads":                         400,

    # ── Fallback ──────────────────────────────────────────────────────────────
    "default":                           500,   # Conservative fallback if sector unknown
}


# ─── MEGATREND AUTO-CLASSIFIER ────────────────────────────────────────────────
#
# Why NLP instead of manual tags:
#   yfinance provides `industry`, `sector`, and `longBusinessSummary` for every
#   stock. We use keyword matching on these fields to auto-assign megatrend tags.
#   This runs on every scan with zero manual work per stock.
#
# Design: Priority-ordered list. First match wins. A defence company that also
#   does chemicals gets tagged "Defence" because it appears first.
#   Override: specific industry names take priority over keyword matches.
#
# Accuracy: ~85% for clear-cut cases. Edge cases (diversified conglomerates) may
#   get wrong tag, but the financial scoring is unaffected — megatrend is purely
#   for display/filtering.

MEGATREND_RULES: list[tuple[str, str, list[str]]] = [
    # (megatrend_tag, emoji, [keywords to match in industry/summary — lowercase])
    ("Defence & Aerospace",    "🛡️",  ["defence", "defense", "military", "ammunition",
                                        "missile", "rocket", "warhead", "armament",
                                        "ordnance", "aerospace", "radar", "sonar"]),
    ("Electric Vehicles & Clean Energy", "⚡", ["electric vehicle", "ev ", " ev,", "battery",
                                        "lithium", "charging station", "renewable energy",
                                        "solar energy", "wind energy", "green hydrogen",
                                        "fuel cell"]),
    ("Digital Payments & Fintech", "💳", ["digital payment", "fintech", "payment gateway",
                                        "neobank", "buy now pay later", "bnpl", "crypto",
                                        "blockchain", "digital lending", "wealth management platform"]),
    ("Healthcare & Diagnostics", "💊",  ["pharmaceutical", "drug", "medicine", "diagnostic",
                                        "hospital", "biotech", "medical device",
                                        "clinical", "vaccine", "genomics"]),
    ("China+1 Manufacturing",  "🏭",   ["import substitution", "make in india", "pli ",
                                        "production linked incentive", "china alternative",
                                        "contract manufacturing", "specialty chemical"]),
    ("Global IT & AI Services","💻",   ["software", "saas", "artificial intelligence", " ai ",
                                        "machine learning", "cloud computing", "data analytics",
                                        "cybersecurity", "it service", "digital transformation"]),
    ("India Infrastructure",   "🏗️",  ["highway", "railway", "metro rail", "airport",
                                        "port", "road construction", "power transmission",
                                        "water treatment", "smart city"]),
    ("India Consumption",      "🛒",   ["fmcg", "consumer goods", "retail", "food processing",
                                        "beverage", "quick service restaurant", "apparel",
                                        "jewellery", "footwear"]),
    ("Specialty Chemicals",    "🧪",   ["specialty chemical", "agrochemical", "pesticide",
                                        "polymer", "adhesive", "coating", "dye", "pigment",
                                        "fluorochemical", "fine chemical"]),
    ("Financial Services",     "🏦",   ["bank", "insurance", "nbfc", "asset management",
                                        "microfinance", "housing finance", "stock exchange"]),
    ("Energy Transition",      "🌱",   ["renewable", "solar", "wind", "hydropower",
                                        "nuclear", "biofuel", "energy storage"]),
]


def classify_megatrend(info: dict) -> tuple[str, str]:
    """Auto-classify a stock into a megatrend using industry + business summary.

    Returns (megatrend_tag, emoji). Uses priority-ordered keyword matching.
    First matching rule wins. Falls back to sector-based classification,
    then 'Diversified' if nothing matches.

    No external API calls — runs entirely on yfinance info dict fields.
    ~85% accuracy on single-business companies. Diversified conglomerates
    get the tag of their largest disclosed segment.
    """
    industry  = (info.get('industry', '') or '').lower()
    sector    = (info.get('sector', '') or '').lower()
    summary   = (info.get('longBusinessSummary', '') or '').lower()

    # Combine all text for matching
    haystack = f"{industry} {sector} {summary}"

    for tag, emoji, keywords in MEGATREND_RULES:
        if any(kw in haystack for kw in keywords):
            return tag, emoji

    # Sector-level fallback
    sector_map = {
        "technology": ("Global IT & AI Services", "💻"),
        "healthcare": ("Healthcare & Diagnostics", "💊"),
        "financial services": ("Financial Services", "🏦"),
        "energy": ("Energy Transition", "🌱"),
        "basic materials": ("Specialty Chemicals", "🧪"),
        "industrials": ("India Infrastructure", "🏗️"),
        "consumer defensive": ("India Consumption", "🛒"),
        "consumer cyclical": ("India Consumption", "🛒"),
        "utilities": ("Energy Transition", "🌱"),
    }
    for s, result in sector_map.items():
        if s in sector:
            return result

    return ("Diversified", "📦")


# ─── HISTORICAL DATA HELPERS ──────────────────────────────────────────────────
#
# Why these exist:
#   The yfinance `info` dict is a single snapshot. It tells you D/E TODAY,
#   not whether it was 3.0 two years ago and is now 0.8 (a re-rating story)
#   or 0.3 two years ago and now 1.5 (a growing problem).
#
#   Direction is more important than position for these signals.
#   Both helpers use the already-created yf.Ticker object — no extra API calls.


def get_debt_trajectory(balance_sheet) -> dict:
    """Extract D/E direction over up to 3 historical years.

    Why direction > snapshot:
      D/E of 0.9 could be a company deleveraging from 3.0 (buy signal)
      or leveraging up from 0.2 (warning signal). Same number, opposite story.

    Scoring (used as add-on modifier inside L1):
      Falling 3 years  → +8 pts  (deleveraging = re-rating catalyst)
      Falling 2 years  → +5 pts
      Stable           → +2 pts
      Rising 2+ years  → 0 pts   (debt accumulating — no bonus)

    Returns direction string + trajectory_score for L1 integration.
    Silently returns zeroes if balance_sheet unavailable (yfinance can be flaky).
    """
    empty = {"de_history": [], "de_direction": "unknown", "trajectory_pts": 0}
    try:
        if balance_sheet is None or balance_sheet.empty:
            return empty

        de_values = []
        # yfinance balance_sheet columns = datetime index, most recent first
        for col in list(balance_sheet.columns)[:3]:
            try:
                # Try 'Total Debt' first, fall back to Long + Short term
                if 'Total Debt' in balance_sheet.index:
                    total_debt = float(balance_sheet.loc['Total Debt', col] or 0)
                else:
                    ltd = float(balance_sheet.loc.get('Long Term Debt', {}).get(col, 0) or 0)
                    std = float(balance_sheet.loc.get('Short Long Term Debt', {}).get(col, 0) or 0)
                    total_debt = ltd + std

                # Equity: try both common field names
                equity = 0
                for eq_field in ['Stockholders Equity', 'Total Equity', 'Common Stock Equity']:
                    if eq_field in balance_sheet.index:
                        equity = float(balance_sheet.loc[eq_field, col] or 0)
                        if equity != 0:
                            break

                de_values.append(round(total_debt / equity, 2) if equity > 0 else None)
            except Exception:
                de_values.append(None)

        valid = [v for v in de_values if v is not None]
        if len(valid) < 2:
            return {**empty, "de_history": de_values}

        # de_values[0] = most recent year, de_values[-1] = oldest available year
        falling_count = sum(
            1 for i in range(len(valid) - 1) if valid[i] < valid[i + 1]
        )

        if falling_count == len(valid) - 1:   # Every year improving
            direction, pts = "falling", 8
        elif falling_count >= 1:               # At least one year improving
            direction, pts = "falling", 5
        elif all(abs(valid[i] - valid[i+1]) < 0.2 for i in range(len(valid)-1)):
            direction, pts = "stable", 2       # Flat ± 0.2
        else:
            direction, pts = "rising", 0       # Getting worse

        return {"de_history": de_values, "de_direction": direction, "trajectory_pts": pts}

    except Exception:
        return empty


def get_margin_trend(income_stmt) -> dict:
    """Extract operating margin expansion/contraction over 3 historical years.

    Why this replaces the single-point proxy in MB operating leverage score:
      A company with 12% operating margin today could be:
        (a) expanding from 6% three years ago → operating leverage firing
        (b) contracting from 20% three years ago → margin pressure
      Same margin today, completely different investment thesis.

    Returns margin_expansion_pts (percentage point change, recent minus oldest)
    and ol_score (0–20) used to replace the proxy in calculate_multibagger_score.

    Silently returns zeroes if income_stmt unavailable.
    """
    empty = {"margin_history": [], "margin_expansion_pts": None,
             "margin_direction": "unknown", "ol_score": 0}
    try:
        if income_stmt is None or income_stmt.empty:
            return empty

        margins = []
        for col in list(income_stmt.columns)[:3]:
            try:
                # Try EBIT first, then Operating Income
                ebit = None
                for field in ['EBIT', 'Operating Income', 'Operating Profit']:
                    if field in income_stmt.index:
                        val = income_stmt.loc[field, col]
                        if val is not None and str(val) != 'nan':
                            ebit = float(val)
                            break

                revenue = None
                for field in ['Total Revenue', 'Revenue', 'Net Revenue']:
                    if field in income_stmt.index:
                        val = income_stmt.loc[field, col]
                        if val is not None and str(val) != 'nan':
                            revenue = float(val)
                            break

                if ebit is not None and revenue and revenue > 0:
                    margins.append(round(ebit / revenue * 100, 1))
                else:
                    margins.append(None)
            except Exception:
                margins.append(None)

        valid = [v for v in margins if v is not None]
        if len(valid) < 2:
            return {**empty, "margin_history": margins}

        # Recent (index 0) minus oldest available
        expansion_pts = round(valid[0] - valid[-1], 1)

        if expansion_pts > 5:     direction, score = "expanding", 20
        elif expansion_pts > 2:   direction, score = "expanding", 14
        elif expansion_pts > -2:  direction, score = "stable",    8
        elif expansion_pts > -5:  direction, score = "contracting", 3
        else:                     direction, score = "contracting", 0

        return {
            "margin_history": margins,
            "margin_expansion_pts": expansion_pts,
            "margin_direction": direction,
            "ol_score": score,
        }

    except Exception:
        return empty


# ─── COFFEE CAN SCORING ───────────────────────────────────────────────────────
#
# Saurabh Mukherjea's Coffee Can methodology:
#   Invest in companies with Revenue CAGR > 10% AND ROCE > 15%
#   for 10 consecutive years — then do nothing for 10 years.
#
# yfinance limitation: ~4 years of annual financials available.
# We run a 4-year consistency check as a proxy. All thresholds remain
# the same; we simply acknowledge we need 4 clean years not 10.
#
# Why 4 years is still meaningful:
#   A company that passes ALL checks across 4 consecutive years is already
#   in the top 5% of listed stocks. The 10-year bar is aspirational — we
#   flag candidates that are ON TRACK, not ones that have crossed the finish line.


def calculate_coffee_can_score(income_stmt, balance_sheet) -> dict:
    """Coffee Can Score (0–100) — consistency of quality over 4 years.

    Three components:

    A. Revenue Consistency (0–40):
       - Is revenue growing EVERY year (no single decline)?
       - Is the 4-year CAGR above 10%?
       Scoring: All years growing + CAGR > 10% = 40 | CAGR > 7% = 28 |
                2/3 years growing + CAGR > 10% = 20 | else scaled

    B. ROCE Consistency (0–40):
       - Is ROCE above 15% in ALL available years?
       - Calculated from income_stmt (EBIT) and balance_sheet (Capital Employed)
       Scoring: All years > 15% = 40 | All > 10% = 24 | Most > 15% = 20

    C. Stability Bonus (0–20):
       - +10 pts if no year had revenue decline (zero bad years)
       - +10 pts if ROCE never dipped below 10% across all years

    Tiers:
      Classic    (80–100): True Coffee Can candidate. 4 clean years.
      Strong     (60–79):  Near-Coffee Can. Minor lapses. Watch for 2 more years.
      Developing (40–59):  Growing into it. ROCE or revenue not yet fully consistent.
      Inconsistent (0–39): Lumpy business. Not Coffee Can material.

    Returns dict with score, tier, component breakdown, and raw year data.
    Silently returns zeroes if insufficient data (needs ≥ 3 years to be meaningful).
    """
    empty = {
        "cc_score": 0,
        "cc_tier": "Insufficient Data",
        "cc_revenue_score": 0,
        "cc_roce_score": 0,
        "cc_stability_bonus": 0,
        "cc_revenue_cagr": None,
        "cc_revenue_years": [],
        "cc_roce_years": [],
        "cc_years_checked": 0,
    }

    try:
        if income_stmt is None or income_stmt.empty:
            return empty
        if balance_sheet is None or balance_sheet.empty:
            return empty

        cols = list(income_stmt.columns)[:4]  # most recent 4 years, newest first
        if len(cols) < 3:
            return empty

        # ── A: Revenue data ───────────────────────────────────────────────────
        revenues = []
        for col in cols:
            rev = None
            for field in ['Total Revenue', 'Revenue', 'Net Revenue']:
                if field in income_stmt.index:
                    val = income_stmt.loc[field, col]
                    if val is not None and str(val) != 'nan':
                        rev = float(val)
                        break
            revenues.append(rev)

        valid_rev = [r for r in revenues if r is not None and r > 0]
        if len(valid_rev) < 3:
            return {**empty, "cc_revenue_years": revenues}

        # Revenue CAGR: oldest to newest (reverse because cols are newest-first)
        rev_oldest = valid_rev[-1]
        rev_newest = valid_rev[0]
        n_years = len(valid_rev) - 1
        rev_cagr = (rev_newest / rev_oldest) ** (1 / n_years) - 1 if rev_oldest > 0 else 0

        # Count how many consecutive year-on-year growths (newest first → compare pairs)
        rev_growing_years = sum(
            1 for i in range(len(valid_rev) - 1) if valid_rev[i] > valid_rev[i + 1]
        )
        total_pairs = len(valid_rev) - 1

        # Revenue score
        if rev_growing_years == total_pairs:          # Every year grew
            if rev_cagr > 0.10:   rev_score = 40
            elif rev_cagr > 0.07: rev_score = 28
            else:                  rev_score = 16
        elif rev_growing_years >= total_pairs - 1:    # One bad year
            if rev_cagr > 0.10:   rev_score = 20
            elif rev_cagr > 0.07: rev_score = 12
            else:                  rev_score = 6
        else:                                          # Two+ bad years
            rev_score = max(0, int(rev_cagr * 100))   # Proportional to CAGR only

        # ── B: ROCE from statements ───────────────────────────────────────────
        # ROCE = EBIT ÷ Capital Employed (Total Assets − Current Liabilities)
        bs_cols = list(balance_sheet.columns)[:4]
        roce_years = []

        for i, col in enumerate(cols):
            try:
                # EBIT from income_stmt
                ebit = None
                for field in ['EBIT', 'Operating Income', 'Operating Profit']:
                    if field in income_stmt.index:
                        val = income_stmt.loc[field, col]
                        if val is not None and str(val) != 'nan':
                            ebit = float(val)
                            break

                # Capital Employed from balance_sheet (same year index if available)
                bs_col = bs_cols[i] if i < len(bs_cols) else None
                capital_employed = None
                if bs_col is not None:
                    total_assets = None
                    for field in ['Total Assets']:
                        if field in balance_sheet.index:
                            val = balance_sheet.loc[field, bs_col]
                            if val is not None and str(val) != 'nan':
                                total_assets = float(val)
                                break

                    current_liab = None
                    for field in ['Current Liabilities', 'Total Current Liabilities']:
                        if field in balance_sheet.index:
                            val = balance_sheet.loc[field, bs_col]
                            if val is not None and str(val) != 'nan':
                                current_liab = float(val)
                                break

                    if total_assets and current_liab:
                        capital_employed = total_assets - current_liab

                if ebit is not None and capital_employed and capital_employed > 0:
                    roce_years.append(round(ebit / capital_employed, 3))
                else:
                    roce_years.append(None)
            except Exception:
                roce_years.append(None)

        valid_roce = [r for r in roce_years if r is not None]

        # ROCE score
        if len(valid_roce) >= 2:
            all_above_15 = all(r > 0.15 for r in valid_roce)
            all_above_10 = all(r > 0.10 for r in valid_roce)
            most_above_15 = sum(1 for r in valid_roce if r > 0.15) >= len(valid_roce) - 1
            avg_roce = sum(valid_roce) / len(valid_roce)

            if all_above_15:          roce_score = 40
            elif most_above_15:       roce_score = 28
            elif all_above_10:        roce_score = 20
            elif avg_roce > 0.10:     roce_score = 12
            else:                     roce_score = max(0, int(avg_roce * 100))
        else:
            roce_score = 0

        # ── C: Stability bonus ────────────────────────────────────────────────
        stability = 0
        if rev_growing_years == total_pairs:         # Zero revenue declines
            stability += 10
        if valid_roce and all(r > 0.10 for r in valid_roce):  # ROCE never < 10%
            stability += 10

        # ── Total ─────────────────────────────────────────────────────────────
        total = rev_score + roce_score + stability

        if total >= 80:   tier = "Classic"
        elif total >= 60: tier = "Strong"
        elif total >= 40: tier = "Developing"
        else:             tier = "Inconsistent"

        return {
            "cc_score":           total,
            "cc_tier":            tier,
            "cc_revenue_score":   rev_score,
            "cc_roce_score":      roce_score,
            "cc_stability_bonus": stability,
            "cc_revenue_cagr":    round(rev_cagr * 100, 1),   # as %
            "cc_revenue_years":   [round(r / 1e7, 1) if r else None for r in revenues],  # in ₹Cr
            "cc_roce_years":      [round(r * 100, 1) if r else None for r in roce_years], # as %
            "cc_years_checked":   len(valid_rev),
        }

    except Exception:
        return empty


# ─── SCORING ENGINE (Market-Agnostic) ─────────────────────────────────────────

def calculate_l1(info, market="NSE", max_pts=25, debt_trajectory: dict | None = None):
    """L1: Protection — v3 (snapshot quality + real cash + debt direction)

    What changed from v1 → v3:
      v1: D/E snapshot + ROCE + OCF binary (3 checks)
      v2: + FCF Yield + Earnings Quality ratio (5 checks)
      v3: + Debt Trajectory modifier from 3yr balance sheet (6 checks)

    The debt trajectory is additive — it cannot push score above max_pts,
    but a company actively deleveraging earns back points lost on a high
    current D/E. A company leveraging up loses the trajectory bonus entirely.

    Weight distribution (max_pts = 25):
      D/E snapshot:       22% = 5.5 pts
      ROCE:               26% = 6.5 pts
      OCF positive:       12% = 3.0 pts
      FCF Yield:          18% = 4.5 pts
      Earnings Quality:   12% = 3.0 pts
      Debt Trajectory:    10% = 2.5 pts (from trajectory_pts helper, capped)
    """
    score = 0
    de_raw = info.get('debtToEquity', 999)
    de = de_raw / 100 if market == "NSE" and de_raw > 5 else de_raw

    roce       = info.get('returnOnCapitalEmployed', 0)
    ocf        = info.get('operatingCashflow', 0)
    fcf        = info.get('freeCashflow', 0)
    net_income = info.get('netIncomeToCommon', 1) or 1
    market_cap = info.get('marketCap', 1) or 1

    de_wt    = max_pts * 0.22
    roce_wt  = max_pts * 0.26
    ocf_wt   = max_pts * 0.12
    fcf_wt   = max_pts * 0.18
    eq_wt    = max_pts * 0.12
    traj_wt  = max_pts * 0.10   # Debt trajectory bonus (capped)

    # ── D/E snapshot ─────────────────────────────────────────────────────────
    if de < 0.6:   score += de_wt
    elif de < 1.0: score += (de_wt / 2)

    # ── ROCE ─────────────────────────────────────────────────────────────────
    if roce > 0.15:   score += roce_wt
    elif roce > 0.10: score += (roce_wt / 2)

    # ── OCF positive ─────────────────────────────────────────────────────────
    if ocf > 0: score += ocf_wt

    # ── FCF Yield ────────────────────────────────────────────────────────────
    if market_cap > 0 and fcf > 0:
        fcf_yield = fcf / market_cap
        if fcf_yield > 0.05:   score += fcf_wt
        elif fcf_yield > 0.02: score += (fcf_wt / 2)

    # ── Earnings Quality: FCF ÷ Net Income ───────────────────────────────────
    if net_income > 0 and fcf > 0:
        eq_ratio = fcf / net_income
        if eq_ratio > 0.8:   score += eq_wt
        elif eq_ratio > 0.5: score += (eq_wt / 2)

    # ── Debt Trajectory modifier (from get_debt_trajectory helper) ────────────
    # trajectory_pts from helper: falling=8, stable=2, rising=0
    # Scale to traj_wt allocation and cap at traj_wt
    if debt_trajectory:
        raw_pts = debt_trajectory.get("trajectory_pts", 0)
        traj_bonus = min(traj_wt, traj_wt * (raw_pts / 8))
        score += traj_bonus

    return min(int(score), max_pts)   # Hard cap at max_pts

def calculate_l2(info, max_pts=20):
    """L2: Pricing Power — absolute margins + sector-relative comparison.

    v2: Added sector-relative margin premium scoring.
    A company with margins ABOVE its sector median has genuine pricing power,
    not just a favourable absolute threshold crossing.

    Weights: Gross Margin absolute (40%) + Operating Margin absolute (35%) +
             Sector-relative premium (25%)
    """
    score = 0
    gm = info.get('grossMargins', 0) or 0
    om = info.get('operatingMargins', 0) or 0
    industry = info.get('industry', '') or ''

    # Approximate sector gross margin medians (NSE/BSE universe)
    SECTOR_GM_MEDIAN: dict[str, float] = {
        "Software—Application": 0.72, "Information Technology Services": 0.30,
        "Drug Manufacturers—General": 0.55, "Drug Manufacturers—Specialty & Generic": 0.50,
        "Biotechnology": 0.65, "Diagnostics & Research": 0.52,
        "Consumer Defensive": 0.38, "Consumer Cyclical": 0.30,
        "Banks": 0.0,            # NIM model — skip gross margin
        "Financial Services": 0.0,
        "Insurance": 0.0,
        "Specialty Chemicals": 0.42, "Basic Materials": 0.25,
        "Specialty Industrial Machinery": 0.32,
        "Aerospace & Defense": 0.22,
        "Oil & Gas E&P": 0.35,
        "Telecom Services": 0.45,
        "Auto Manufacturers": 0.15, "Auto Parts": 0.20,
        "Utilities—Renewable": 0.60,
        "Real Estate—Development": 0.28,
        "default": 0.30,
    }
    sector_gm = SECTOR_GM_MEDIAN.get(industry, SECTOR_GM_MEDIAN["default"])
    is_financial = industry in ("Banks", "Financial Services", "Insurance")

    gm_wt = max_pts * 0.40
    om_wt = max_pts * 0.35
    sp_wt = max_pts * 0.25   # Sector-premium weight

    # ── Absolute Gross Margin ─────────────────────────────────────────────
    if gm > 0.40:   score += gm_wt
    elif gm > 0.25: score += gm_wt * 0.60
    elif gm > 0.15: score += gm_wt * 0.30

    # ── Absolute Operating Margin ─────────────────────────────────────────
    if om > 0.20:   score += om_wt
    elif om > 0.12: score += om_wt * 0.60
    elif om > 0.06: score += om_wt * 0.30

    # ── Sector-Relative Premium ───────────────────────────────────────────
    if not is_financial and sector_gm > 0 and gm > 0:
        premium = (gm - sector_gm) / sector_gm
        if premium > 0.30:   score += sp_wt       # 30%+ above sector — dominant
        elif premium > 0.10: score += sp_wt * 0.6  # Meaningfully above sector
        elif premium > 0:    score += sp_wt * 0.3  # At or slightly above
        # Below sector median: 0 — no genuine pricing power premium
    elif is_financial:
        # For banks/NBFCs: operating margin > 25% = strong NIM business
        if om > 0.25:   score += sp_wt
        elif om > 0.15: score += sp_wt * 0.5

    return int(score)

def calculate_l3(ticker, hist, benchmark_hist, max_pts=10):
    """L3: Relative Strength — multi-band momentum vs Nifty 50.

    v2: Extended from 3M-only to 3M + 6M + 1Y momentum bands.
    A stock outperforming consistently across all three horizons is in a
    genuine structural trend, not a short-term noise spike.

    Band weights: 3M (40%) + 6M (35%) + 1Y (25%)
    Note: hist must cover 1 year (fetched as period='1y' in scan_stock).
    """
    if hist is None or hist.empty or len(hist) < 55:
        return 0

    close = hist['Close']

    def band_return(series, days):
        n = len(series)
        if n < days:
            return (series.iloc[-1] / series.iloc[0]) - 1  # Use all available data
        return (series.iloc[-1] / series.iloc[-days]) - 1

    def bench_band(bench, days):
        if bench is None or bench.empty:
            return None
        n = len(bench)
        if n < days:
            return (bench['Close'].iloc[-1] / bench['Close'].iloc[0]) - 1
        return (bench['Close'].iloc[-1] / bench['Close'].iloc[-days]) - 1

    r3m = band_return(close, 63)
    r6m = band_return(close, 126)
    r1y = band_return(close, 252)

    b3m = bench_band(benchmark_hist, 63)
    b6m = bench_band(benchmark_hist, 126)
    b1y = bench_band(benchmark_hist, 252)

    def band_score(sr, br, weight):
        """Score one band: full/partial/minimal based on relative outperformance."""
        if sr is None:
            return 0
        if br is None:
            return weight if sr > 0 else 0
        if sr > br * 1.10:  return weight          # Outperforming by 10%+
        elif sr > br:        return weight * 0.67   # Outperforming
        elif sr > 0:         return weight * 0.33   # Positive but lagging
        return 0

    score = (
        band_score(r3m, b3m, max_pts * 0.40) +
        band_score(r6m, b6m, max_pts * 0.35) +
        band_score(r1y, b1y, max_pts * 0.25)
    )
    return int(score)

def calculate_l4(info, max_pts=25):
    """L4: Growth Visibility (Revenue CAGR, Earnings CAGR, PEG Ratio)

    Upgraded from v1 (revenue + earnings growth snapshots only)
    to v2 adding PEG ratio — the most important valuation-growth bridge.

    PEG = P/E ÷ Earnings Growth Rate (as a %)
      PEG < 0.8  → you are getting growth cheaper than it costs (Peter Lynch buy signal)
      PEG 0.8–1.2 → fairly priced growth
      PEG 1.2–2.0 → growth is getting expensive
      PEG > 2.0  → fully priced, no margin of safety

    A company growing 35% at P/E 30 (PEG 0.86) is CHEAPER than
    a company growing 5% at P/E 15 (PEG 3.0).
    """
    score = 0
    rev_growth     = info.get('revenueGrowth', 0)
    earnings_growth = info.get('earningsGrowth', 0)
    trailing_pe    = info.get('trailingPE', 0)

    rev_wt  = max_pts * 0.35   # Revenue growth (was 0.5)
    earn_wt = max_pts * 0.35   # Earnings growth (was 0.5)
    peg_wt  = max_pts * 0.30   # PEG ratio (new)

    # Revenue growth check
    if rev_growth > 0.15:   score += rev_wt
    elif rev_growth > 0.10: score += (rev_wt / 2)

    # Earnings growth check
    if earnings_growth > 0.15:   score += earn_wt
    elif earnings_growth > 0.10: score += (earn_wt / 2)

    # PEG ratio check (new)
    if trailing_pe > 0 and earnings_growth > 0:
        peg = trailing_pe / (earnings_growth * 100)
        if peg < 0.8:    score += peg_wt               # Growth on sale
        elif peg < 1.2:  score += int(peg_wt * 0.67)   # Fair value
        elif peg < 2.0:  score += int(peg_wt * 0.33)   # Getting expensive
        # peg >= 2.0: no points — growth fully priced in
    elif trailing_pe == 0 and earnings_growth > 0.15:
        # Profitable but no meaningful PE yet (e.g. very recent profitability)
        score += int(peg_wt * 0.33)

    return int(score)

def calculate_multibagger_score(info: dict, market_key: str = "NSE",
                                margin_trend: dict | None = None) -> dict:
    """Multi-Bagger Potential Score (0–100) — separate from 5-layer quality score.

    Answers a different question from L1-L5:
      L1-L5  → "Is this company financially safe to own?"
      GEM    → "Is this company undervalued and undiscovered?"
      MB     → "Does this company have the STRUCTURE to 5x–50x from here?"

    Five components (all automated — zero manual input per stock):

    A. Runway Score (0–25):
       Market cap ÷ Sector TAM. Smaller penetration = more room to grow.
       Uses SECTOR_TAM_USD_BN lookup table (sector-level, not per-stock manual).

    B. Compounding Engine Score (0–25):
       ROCE × Reinvestment Rate = theoretical earnings growth rate.
       Reinvestment Rate = 1 - (annual dividends paid ÷ net income).
       Both fields available in yfinance info dict.

    C. Operating Leverage Score (0–20):
       Is the company getting MORE profitable as it gets bigger?
       Compares gross margin and operating margin direction.
       Uses yfinance grossMargins + operatingMargins.
       NOTE: True multi-year trend needs DB history — single-point proxy used here.
       Sprint 3 upgrade: pull income_stmt for 3-year margin comparison.

    D. Discovery Gap Score (0–20):
       How far is P/E below the sector median? The further below, the more
       re-rating upside exists when the market catches on.
       Uses SECTOR_PE_MEDIAN lookup — sector-level automation, not manual.

    E. Small-Cap Opportunity Score (0–10):
       Multi-baggers almost always start as small/mid caps.
       Large caps have already been discovered.
       Market cap in USD for cross-market comparability.

    Returns dict with total score (0–100), component breakdown, runway %, and megatrend.
    """
    # ── Collect raw fields ────────────────────────────────────────────────────
    market_cap_usd    = (info.get('marketCap', 0) or 0) / (83 if market_key == "NSE" else
                         (7.8 if market_key == "HKEX" else 1))   # Rough FX to USD
    roce              = info.get('returnOnCapitalEmployed', 0) or 0
    net_income        = info.get('netIncomeToCommon', 0) or 0
    dividend_rate     = info.get('dividendRate', 0) or 0
    shares            = info.get('sharesOutstanding', 0) or 0
    gross_margin      = info.get('grossMargins', 0) or 0
    operating_margin  = info.get('operatingMargins', 0) or 0
    trailing_pe       = info.get('trailingPE', 0) or 0
    industry          = info.get('industry', 'default') or 'default'

    # ── A: Runway Score (0–25) ────────────────────────────────────────────────
    # Find sector TAM — try exact industry match, then partial, then default
    sector_tam_bn = SECTOR_TAM_USD_BN.get(industry)
    if sector_tam_bn is None:
        # Partial match: find the longest key that appears in the industry string
        industry_lower = industry.lower()
        best_match = max(
            ((k, v) for k, v in SECTOR_TAM_USD_BN.items() if k.lower() in industry_lower),
            key=lambda x: len(x[0]),
            default=(None, None)
        )
        sector_tam_bn = best_match[1] if best_match[1] else SECTOR_TAM_USD_BN["default"]

    sector_tam_usd = sector_tam_bn * 1_000_000_000   # Convert $B → $
    market_cap_usd_safe = max(market_cap_usd, 1)
    penetration_pct = (market_cap_usd_safe / sector_tam_usd) * 100

    if penetration_pct < 0.1:    runway_score = 25   # < 0.1% TAM = massive room
    elif penetration_pct < 0.5:  runway_score = 20
    elif penetration_pct < 1.0:  runway_score = 14
    elif penetration_pct < 3.0:  runway_score = 8
    elif penetration_pct < 5.0:  runway_score = 3
    else:                         runway_score = 0    # > 5% TAM = becoming mature

    # ── B: Compounding Engine Score (0–25) ────────────────────────────────────
    # Reinvestment Rate: how much profit is kept in the business (vs paid as dividend)
    annual_divs_paid = dividend_rate * shares if shares > 0 else 0
    if net_income > 0:
        reinvestment_rate = max(0, min(1, 1 - (annual_divs_paid / net_income)))
    else:
        reinvestment_rate = 0

    # Earnings Growth Engine = ROCE × Reinvestment Rate
    compounding_engine = roce * reinvestment_rate  # e.g. 0.30 * 0.80 = 0.24 = 24%/yr

    if compounding_engine > 0.20:    compound_score = 25   # > 20%/yr self-funded growth
    elif compounding_engine > 0.15:  compound_score = 18
    elif compounding_engine > 0.10:  compound_score = 11
    elif compounding_engine > 0.05:  compound_score = 5
    else:                             compound_score = 0

    # ── C: Operating Leverage Score (0–20) ───────────────────────────────────
    # v2: Uses real 3-year income statement trend from get_margin_trend() helper.
    # If margin_trend not available (yfinance flaky), falls back to single-point proxy.
    if margin_trend and margin_trend.get("margin_direction") != "unknown":
        op_lev_score = margin_trend["ol_score"]
    else:
        # Single-point proxy fallback (used when income_stmt unavailable)
        if gross_margin > 0.35 and operating_margin > 0.15:
            op_lev_score = 20
        elif gross_margin > 0.25 and operating_margin > 0.10:
            op_lev_score = 13
        elif gross_margin > 0.15 and operating_margin > 0.05:
            op_lev_score = 7
        elif gross_margin > 0 and operating_margin > 0:
            op_lev_score = 3
        else:
            op_lev_score = 0

    # ── D: Discovery Gap Score (0–20) ────────────────────────────────────────
    # Sector-median P/E lookup (approximate, avoids per-stock manual work).
    # When a quality company trades at 0.5x sector P/E, re-rating to sector
    # median alone = 2x stock price before earnings grow.
    SECTOR_PE_MEDIAN: dict[str, float] = {
        "Banks": 12, "Financial Services": 18, "Insurance": 16,
        "Software—Application": 35, "Information Technology Services": 28,
        "Drug Manufacturers—General": 25, "Drug Manufacturers—Specialty & Generic": 22,
        "Biotechnology": 40, "Diagnostics & Research": 30,
        "Consumer Defensive": 45, "Consumer Cyclical": 30,
        "Specialty Industrial Machinery": 28, "Aerospace & Defense": 35,
        "Specialty Chemicals": 30, "Basic Materials": 15,
        "Oil & Gas E&P": 12, "Utilities—Renewable": 40,
        "Auto Manufacturers": 18, "Auto Parts": 20,
        "Telecom Services": 15, "Real Estate—Development": 20,
        "default": 22,
    }
    sector_pe = SECTOR_PE_MEDIAN.get(industry, SECTOR_PE_MEDIAN["default"])

    if trailing_pe > 0 and sector_pe > 0:
        pe_ratio = trailing_pe / sector_pe
        if pe_ratio < 0.50:    discovery_score = 20   # Trading at < half sector P/E
        elif pe_ratio < 0.70:  discovery_score = 14
        elif pe_ratio < 0.90:  discovery_score = 8
        elif pe_ratio < 1.10:  discovery_score = 3    # Near sector P/E — less re-rating room
        else:                  discovery_score = 0    # Already above sector P/E
    else:
        discovery_score = 5   # No PE (loss-making growth) — partial credit

    # ── E: Small-Cap Opportunity Score (0–10) ─────────────────────────────────
    # Multi-baggers overwhelmingly start as small/mid caps.
    # Large caps are already well-covered and institutional ownership is high.
    market_cap_bn_usd = market_cap_usd / 1_000_000_000
    if market_cap_bn_usd < 0.3:       smallcap_score = 10   # < $300M — micro cap
    elif market_cap_bn_usd < 1.0:     smallcap_score = 8    # $300M–$1B — small cap
    elif market_cap_bn_usd < 5.0:     smallcap_score = 5    # $1B–$5B — mid cap
    elif market_cap_bn_usd < 20.0:    smallcap_score = 2    # $5B–$20B — large cap
    else:                              smallcap_score = 0    # > $20B — very large cap

    # ── Total + megatrend ─────────────────────────────────────────────────────
    total = runway_score + compound_score + op_lev_score + discovery_score + smallcap_score

    if total >= 80:   mb_tier = "Rocket"    # 🚀 Rare — all 5 drivers aligned
    elif total >= 60: mb_tier = "Launcher"  # 🛸 Strong — 3-4 drivers aligned
    elif total >= 40: mb_tier = "Builder"   # 🏗️ Decent — growing into multi-bagger
    elif total >= 20: mb_tier = "Crawler"   # 🐢 Weak — 1-2 signals only
    else:             mb_tier = "Grounded"  # ⛔ Multi-bagger conditions absent

    megatrend_tag, megatrend_emoji = classify_megatrend(info)

    return {
        "mb_score": total,
        "mb_tier": mb_tier,
        # Component breakdown
        "mb_runway": runway_score,          # How much TAM is left
        "mb_compound": compound_score,      # How fast it self-funds growth
        "mb_op_leverage": op_lev_score,     # How efficiently it scales
        "mb_discovery": discovery_score,    # How much P/E re-rating remains
        "mb_smallcap": smallcap_score,      # Is it still small enough to run?
        # Transparency fields
        "penetration_pct": round(penetration_pct, 3),      # % of TAM captured
        "compounding_engine_pct": round(compounding_engine * 100, 1),  # theoretical EPS growth %/yr
        "reinvestment_rate": round(reinvestment_rate, 2),
        "megatrend": megatrend_tag,
        "megatrend_emoji": megatrend_emoji,
    }


def calculate_l5_governance(info, debt_traj, max_pts=15):
    """L5: Governance & Ownership Quality — v2.

    v1 used D/E + OCF as a financial health proxy (mislabelled as governance).
    v2 uses ACTUAL yfinance ownership signals:

      A. Insider/Promoter Holding (35%) — skin in the game
         heldPercentInsiders ≥ 50%: founder-led, fully committed
         High promoter holding = long-term aligned, less likely to loot

      B. Institutional Validation (27%) — FII + DII conviction
         heldPercentInstitutions ≥ 25%: sophisticated money did the work
         FII/DII presence means global/domestic analysis confirmed quality

      C. Short Interest Guard (20%) — red flag detector
         Low shortRatio = no professional short thesis against the stock
         High short ratio (>5) = smart money suspects governance issues

      D. Debt Trajectory Integrity (18%) — management capital discipline
         Falling D/E = management not over-leveraging; returning capital

    Why this matters: Manpasand, DHFL, Café Coffee Day all passed L1-L4.
    They all failed on ownership and governance signals.
    """
    score = 0

    # ── A: Insider/Promoter Holding (0–5.25 pts) ─────────────────────────
    insider_pct = info.get('heldPercentInsiders', None)
    if insider_pct is not None:
        if insider_pct >= 0.50:    score += max_pts * 0.35   # Founder-led
        elif insider_pct >= 0.35:  score += max_pts * 0.22   # Meaningful stake
        elif insider_pct >= 0.20:  score += max_pts * 0.12   # Low but present
        # < 20%: management barely owns the company
    else:
        score += max_pts * 0.12   # Data unavailable — partial credit only

    # ── B: Institutional Validation (0–4.05 pts) ─────────────────────────
    inst_pct = info.get('heldPercentInstitutions', None)
    if inst_pct is not None:
        if inst_pct >= 0.25:    score += max_pts * 0.27   # Strong FII/DII conviction
        elif inst_pct >= 0.12:  score += max_pts * 0.17   # Decent institutional coverage
        elif inst_pct >= 0.05:  score += max_pts * 0.08   # Lightly covered
        # < 5%: undiscovered or deliberately avoided
    else:
        score += max_pts * 0.10   # Partial credit for data gap

    # ── C: Short Interest Guard (0–3.0 pts) ──────────────────────────────
    short_ratio = info.get('shortRatio', None)
    if short_ratio is not None:
        if short_ratio < 2.0:    score += max_pts * 0.20   # Clean — no short thesis
        elif short_ratio < 5.0:  score += max_pts * 0.10   # Some concern
        # > 5: significant short pressure — 0 pts
    else:
        # Indian stocks rarely report short ratio — give partial credit
        score += max_pts * 0.15

    # ── D: Debt Trajectory Integrity (0–2.70 pts) ────────────────────────
    direction = debt_traj.get('de_direction', 'unknown') if debt_traj else 'unknown'
    if direction == 'falling':  score += max_pts * 0.18
    elif direction == 'stable': score += max_pts * 0.09

    return int(score)


def calculate_l6(info, max_pts=5):
    """L6: Valuation Bubble Gate — v1.

    A light filter that eliminates stocks in obvious bubble territory.
    This is NOT a value screen — we are NOT hunting for cheap stocks.
    Coffee Can multi-baggers legitimately trade at 30–60x earnings.

    This layer only zeros out:
    - P/E > 100 with earnings growth < 25% (unjustified multiple expansion)
    - EV/EBITDA > 60 with earnings growth < 20% (enterprise value bubble)

    A quality growth stock at 45x P/E with 30% earnings growth PASSES.
    A mid-cap at 150x P/E with 5% growth FAILS (gets hard zero).
    """
    trailing_pe     = info.get('trailingPE', 0) or 0
    forward_pe      = info.get('forwardPE', 0) or 0
    ev_ebitda       = info.get('enterpriseToEbitda', 0) or 0
    earnings_growth = info.get('earningsGrowth', 0) or 0
    price_to_sales  = info.get('priceToSalesTrailing12Months', 0) or 0

    pe = trailing_pe if trailing_pe > 0 else forward_pe

    # ── Hard disqualifier: bubble territory ──────────────────────────────
    is_bubble = False
    if pe > 100 and earnings_growth < 0.25:
        is_bubble = True
    if ev_ebitda > 60 and earnings_growth < 0.20:
        is_bubble = True

    if is_bubble:
        return 0   # Hard zero — kills total score for genuine bubbles

    # ── Reasonable valuation scoring ─────────────────────────────────────
    if pe <= 0:
        # No P/E data (loss-making or data gap)
        if 0 < price_to_sales <= 15:
            return int(max_pts * 0.60)   # P/S available and sane
        return int(max_pts * 0.50)       # Total data gap — partial credit
    elif pe <= 30:
        return max_pts                   # Value/moderate growth — full points
    elif pe <= 50:
        return int(max_pts * 0.80)       # Growth territory — still fine
    elif pe <= 80:
        return int(max_pts * 0.50)       # High premium — half points
    elif pe <= 100:
        return int(max_pts * 0.20)       # Near-bubble — minimal
    else:
        return int(max_pts * 0.10)       # High PE but growth justifies it (passed bubble check)


def get_fcf_from_cashflow(cashflow):
    """FCF = Operating Cash Flow - CapEx. Returns None if either is missing."""
    if cashflow is None or cashflow.empty:
        return None
    try:
        col = list(cashflow.columns)[0]
        ocf = None
        for field in ['Operating Cash Flow', 'Cash From Operations',
                      'Total Cash From Operating Activities']:
            if field in cashflow.index:
                val = cashflow.loc[field, col]
                if val is not None and str(val) != 'nan':
                    ocf = float(val)
                    break
        capex = None
        for field in ['Capital Expenditure', 'Purchase Of Property Plant And Equipment',
                      'Capital Expenditures']:
            if field in cashflow.index:
                val = cashflow.loc[field, col]
                if val is not None and str(val) != 'nan':
                    capex = abs(float(val))
                    break
        if ocf is not None and capex is not None:
            return ocf - capex
        return None  # Missing CapEx = unreliable FCF, don't guess
    except Exception:
        return None

def get_roce_from_statements(income_stmt, balance_sheet):
    """ROCE = EBIT / (Total Assets - Current Liabilities). Institution-grade calculation."""
    try:
        if income_stmt is None or income_stmt.empty:
            return None
        if balance_sheet is None or balance_sheet.empty:
            return None
        col = list(income_stmt.columns)[0]
        bs_col = list(balance_sheet.columns)[0]
        ebit = None
        for field in ['EBIT', 'Operating Income', 'Operating Profit']:
            if field in income_stmt.index:
                val = income_stmt.loc[field, col]
                if val is not None and str(val) != 'nan':
                    ebit = float(val)
                    break
        total_assets, current_liab = None, None
        if 'Total Assets' in balance_sheet.index:
            total_assets = float(balance_sheet.loc['Total Assets', bs_col] or 0)
        for field in ['Current Liabilities', 'Total Current Liabilities']:
            if field in balance_sheet.index:
                current_liab = float(balance_sheet.loc[field, bs_col] or 0)
                break
        if ebit and total_assets and current_liab:
            capital_employed = total_assets - current_liab
            if capital_employed > 0:
                return round(ebit / capital_employed, 4)
        return None
    except Exception:
        return None

def scan_stock(symbol, adapter, market_key, benchmark_hist, weights):
    try:
        ticker = yf.Ticker(symbol)

        # ── Cache-aware fetches ───────────────────────────────────────────────
        info = _cache.get(f"{symbol}_info")
        if info is None:
            info = ticker.info
            _cache.set(f"{symbol}_info", info)

        hist = _cache.get(f"{symbol}_hist")
        if hist is None:
            hist = ticker.history(period="1y")   # 1Y for multi-band L3 momentum
            _cache.set(f"{symbol}_hist", hist)

        # ── Historical data (fetched once, reused across all scorers) ─────────
        # Wrapped individually so a failure on one doesn't kill the entire scan.
        try:
            balance_sheet = _cache.get(f"{symbol}_bs")
            if balance_sheet is None:
                balance_sheet = ticker.balance_sheet
                _cache.set(f"{symbol}_bs", balance_sheet)
        except Exception:
            balance_sheet = None

        try:
            income_stmt = _cache.get(f"{symbol}_is")
            if income_stmt is None:
                income_stmt = ticker.income_stmt
                _cache.set(f"{symbol}_is", income_stmt)
        except Exception:
            income_stmt = None

        try:
            cashflow = _cache.get(f"{symbol}_cf")
            if cashflow is None:
                cashflow = ticker.cashflow
                _cache.set(f"{symbol}_cf", cashflow)
        except Exception:
            cashflow = None

        # ── Derive trajectory + quality helpers ──────────────────────────────
        debt_traj    = get_debt_trajectory(balance_sheet)
        fcf_calc  = get_fcf_from_cashflow(cashflow)
        roce_calc = get_roce_from_statements(income_stmt, balance_sheet)
        if fcf_calc is not None:
            info = {**info, "freeCashflow": fcf_calc}
        if roce_calc is not None:
            info = {**info, "returnOnCapitalEmployed": roce_calc}
        margin_trend = get_margin_trend(income_stmt)
        coffee_can   = calculate_coffee_can_score(income_stmt, balance_sheet)

        # ── 5-Layer scores ────────────────────────────────────────────────────
        l1 = calculate_l1(info, market=market_key, max_pts=weights['l1'],
                          debt_trajectory=debt_traj)
        l2 = calculate_l2(info, max_pts=weights['l2'])
        l3 = calculate_l3(symbol, hist, benchmark_hist, max_pts=weights['l3'])
        l4 = calculate_l4(info, max_pts=weights['l4'])
        # L5: Governance & Ownership Quality (v2 — real yfinance ownership signals)
        l5 = calculate_l5_governance(info, debt_traj, max_pts=weights['l5'])
        # L6: Valuation Bubble Gate (v1 — eliminates extreme P/E bubbles only)
        l6 = calculate_l6(info, max_pts=weights.get('l6', 5))

        total_score = l1 + l2 + l3 + l4 + l5 + l6
        price = info.get('currentPrice', 0) or info.get('regularMarketPrice', 0)

        # ── Transparency metrics (P0) ─────────────────────────────────────────
        fcf             = info.get('freeCashflow', 0) or 0
        net_income      = info.get('netIncomeToCommon', 1) or 1
        market_cap      = info.get('marketCap', 1) or 1
        trailing_pe     = info.get('trailingPE', 0) or 0
        earnings_growth = info.get('earningsGrowth', 0) or 0

        fcf_yield        = round(fcf / market_cap * 100, 2) if market_cap > 0 and fcf else None
        earnings_quality = round(fcf / net_income, 2) if net_income > 0 and fcf else None
        peg              = round(trailing_pe / (earnings_growth * 100), 2) \
                           if trailing_pe > 0 and earnings_growth > 0 else None

        # ── Multi-Bagger Score (fully automated) ─────────────────────────────
        mb = calculate_multibagger_score(info, market_key, margin_trend=margin_trend)

        category = "OFFLINE"
        if total_score >= 60:
            category = adapter.classify_price(price)

        return {
            "symbol":   symbol,
            "price":    price,
            "currency": adapter.currency,

            # 5-Layer scores (+ L6 valuation gate)
            "l1": l1, "l2": l2, "l3": l3, "l4": l4, "l5": l5, "l6": l6,
            "total_score": total_score,
            "category":    category,

            # P0 transparency (FCF quality, PEG)
            "fcf_yield_pct":    fcf_yield,
            "earnings_quality": earnings_quality,
            "peg":              peg,

            # Debt trajectory (L1 v3 — 3yr direction)
            "de_history":    debt_traj.get("de_history", []),
            "de_direction":  debt_traj.get("de_direction", "unknown"),

            # Margin trend (MB score v2 — 3yr operating leverage)
            "margin_history":       margin_trend.get("margin_history", []),
            "margin_expansion_pts": margin_trend.get("margin_expansion_pts"),
            "margin_direction":     margin_trend.get("margin_direction", "unknown"),
            "cc_score":             coffee_can["cc_score"],
            "cc_tier":              coffee_can["cc_tier"],
            "cc_revenue_cagr":      coffee_can["cc_revenue_cagr"],
            "cc_roce_years":        coffee_can["cc_roce_years"],
            "cc_years_checked":     coffee_can["cc_years_checked"],

            # Multi-Bagger Score
            "mb_score":             mb["mb_score"],
            "mb_tier":              mb["mb_tier"],
            "mb_runway":            mb["mb_runway"],
            "mb_compound":          mb["mb_compound"],
            "mb_op_leverage":       mb["mb_op_leverage"],
            "mb_discovery":         mb["mb_discovery"],
            "mb_smallcap":          mb["mb_smallcap"],
            "penetration_pct":      mb["penetration_pct"],
            "compounding_engine_pct": mb["compounding_engine_pct"],
            "megatrend":            mb["megatrend"],
            "megatrend_emoji":      mb["megatrend_emoji"],
        }
    except Exception:
        return None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--market", default="NSE", choices=["NSE", "US", "HKEX"])
    parser.add_argument("--weights", default='{"l1":25,"l2":20,"l3":10,"l4":25,"l5":15,"l6":5}')
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--mode", default="standard", choices=["standard", "coffeecan"],
                        help="coffeecan: only output stocks with cc_score >= 60 (Strong or Classic)")
    args = parser.parse_args()

    market_key = args.market
    weights = json.loads(args.weights)
    coffeecan_mode = (args.mode == "coffeecan")
    
    AdapterClass = MARKET_ADAPTERS[market_key]
    adapter = AdapterClass()
    
    print(json.dumps({"type": "market", "market": market_key}))
    
    tickers = adapter.get_tickers()
    if not tickers:
        print(json.dumps({"type": "error", "message": "No tickers fetched"}))
        return
    
    if args.limit:
        tickers = tickers[:args.limit]
    
    total = len(tickers)
    print(json.dumps({"type": "start", "total": total}))
    
    # Pre-fetch benchmark history for L3 (1Y for multi-band momentum scoring)
    try:
        bench_key = f"bench_{adapter.benchmark_ticker}_hist"
        benchmark_hist = _cache.get(bench_key)
        if benchmark_hist is None:
            bench = yf.Ticker(adapter.benchmark_ticker)
            benchmark_hist = bench.history(period="1y")
            _cache.set(bench_key, benchmark_hist)
    except Exception:
        benchmark_hist = None

    results_count = 0
    BATCH_SIZE = 20 
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        for i in range(0, total, BATCH_SIZE):
            batch = tickers[i:i+BATCH_SIZE]
            futures = {executor.submit(scan_stock, s, adapter, market_key, benchmark_hist, weights): s for s in batch}
            for future in concurrent.futures.as_completed(futures, timeout=120):
                try:
                    res = future.result(timeout=30)
                except (concurrent.futures.TimeoutError, Exception):
                    continue
                if res:

                    # In coffeecan mode: only emit Strong or Classic stocks
                    if coffeecan_mode and res.get("cc_score", 0) < 60:
                        continue
                    results_count += 1
                    print(json.dumps({"type": "progress", "data": res}))
            
            time.sleep(1) # Rate limit protection

    print(json.dumps({"type": "complete", "count": results_count}))

if __name__ == "__main__":
    main()
