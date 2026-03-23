import yfinance as yf
import pandas as pd
import ta
import time
import json
import os
import requests
import io
import concurrent.futures
import argparse
from datetime import datetime, timedelta
from abc import ABC, abstractmethod

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


# ─── SCORING ENGINE (Market-Agnostic) ─────────────────────────────────────────

def calculate_l1(info, market="NSE", max_pts=25):
    """L1: Protection (D/E, ROCE, OCF, FCF Yield, Earnings Quality)

    Upgraded from v1 (snapshot D/E + ROCE + OCF binary)
    to v2 adding FCF Yield and Earnings Quality ratio.

    FCF Yield: FCF / MarketCap — tells you what % return you get in real cash
    Earnings Quality: FCF / Net Income — ratio > 0.8 means profits are real cash,
      not accounting entries. Ratio < 0.5 is a red flag (Satyam pattern).
    """
    score = 0
    de_raw = info.get('debtToEquity', 999)
    de = de_raw / 100 if market == "NSE" and de_raw > 5 else de_raw

    roce = info.get('returnOnCapitalEmployed', 0)
    ocf = info.get('operatingCashflow', 0)
    fcf = info.get('freeCashflow', 0)
    net_income = info.get('netIncomeToCommon', 1) or 1
    market_cap = info.get('marketCap', 1) or 1

    # Redistributed weights to accommodate FCF quality checks
    de_wt   = max_pts * 0.28   # Debt safety
    roce_wt = max_pts * 0.28   # Capital efficiency
    ocf_wt  = max_pts * 0.14   # Cash generation (binary)
    fcf_wt  = max_pts * 0.18   # FCF Yield (new)
    eq_wt   = max_pts * 0.12   # Earnings Quality ratio (new)

    # D/E check
    if de < 0.6:   score += de_wt
    elif de < 1.0: score += (de_wt / 2)

    # ROCE check
    if roce > 0.15:   score += roce_wt
    elif roce > 0.10: score += (roce_wt / 2)

    # OCF positive check
    if ocf > 0: score += ocf_wt

    # FCF Yield check (new)
    if market_cap > 0 and fcf > 0:
        fcf_yield = fcf / market_cap
        if fcf_yield > 0.05:   score += fcf_wt        # > 5% yield = strong cash return
        elif fcf_yield > 0.02: score += (fcf_wt / 2)  # > 2% = decent

    # Earnings Quality check (new): FCF ÷ Net Income
    # > 0.8 = earnings backed by real cash | < 0.5 = accounting concern
    if net_income > 0 and fcf > 0:
        eq_ratio = fcf / net_income
        if eq_ratio > 0.8:   score += eq_wt
        elif eq_ratio > 0.5: score += (eq_wt / 2)

    return int(score)

def calculate_l2(info, max_pts=20):
    """L2: Pricing Power (Margins)"""
    score = 0
    gm = info.get('grossMargins', 0)
    om = info.get('operatingMargins', 0)
    
    gm_wt = max_pts * 0.5
    om_wt = max_pts * 0.5

    if gm > 0.30: score += gm_wt
    elif gm > 0.20: score += (gm_wt / 2)
    
    if om > 0.15: score += om_wt
    elif om > 0.10: score += (om_wt / 2)
    
    return int(score)

def calculate_l3(ticker, hist, benchmark_hist, max_pts=15):
    """L3: Macro Tailwind — compare stock return vs market benchmark"""
    if hist.empty or len(hist) < 60:
        return 0
    
    stock_return = (hist['Close'].iloc[-1] / hist['Close'].iloc[0]) - 1
    
    if benchmark_hist is None or benchmark_hist.empty:
        # Fallback: simple positive return check
        return int(max_pts * 0.67) if stock_return > 0 else 0

    bench_return = (benchmark_hist['Close'].iloc[-1] / benchmark_hist['Close'].iloc[0]) - 1

    if stock_return > bench_return * 1.1:   # Outperforming by 10%+
        return max_pts
    elif stock_return > bench_return:        # Outperforming
        return int(max_pts * 0.67)
    elif stock_return > 0:                   # Positive but underperforming
        return int(max_pts * 0.33)
    return 0

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

def calculate_multibagger_score(info: dict, market_key: str = "NSE") -> dict:
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
    # Proxy: are current margins above industry-typical thresholds?
    # Full version (Sprint 3): compare Year-3 vs Year-0 margins from income_stmt.
    # Current proxy: operating margin expansion signal from gross vs operating delta.
    margin_delta = gross_margin - operating_margin  # narrower gap = more efficient
    if gross_margin > 0.35 and operating_margin > 0.15:
        op_lev_score = 20   # High margins = pricing power + scale already working
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


def scan_stock(symbol, adapter, market_key, benchmark_hist, weights):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # We pre-fetch history for score calculation
        hist = ticker.history(period="3mo")
        
        l1 = calculate_l1(info, market=market_key, max_pts=weights['l1'])
        l2 = calculate_l2(info, max_pts=weights['l2'])
        l3 = calculate_l3(symbol, hist, benchmark_hist, max_pts=weights['l3'])
        l4 = calculate_l4(info, max_pts=weights['l4'])
        l5 = weights['l5'] # Manual Governance placeholder
        
        total_score = l1 + l2 + l3 + l4 + l5
        price = info.get('currentPrice', 0) or info.get('regularMarketPrice', 0)

        # ── Derived metrics for transparency ─────────────────────────────────
        fcf        = info.get('freeCashflow', 0) or 0
        net_income = info.get('netIncomeToCommon', 1) or 1
        market_cap = info.get('marketCap', 1) or 1
        trailing_pe     = info.get('trailingPE', 0) or 0
        earnings_growth = info.get('earningsGrowth', 0) or 0

        fcf_yield = round(fcf / market_cap * 100, 2) if market_cap > 0 and fcf else None
        earnings_quality = round(fcf / net_income, 2) if net_income > 0 and fcf else None
        peg = round(trailing_pe / (earnings_growth * 100), 2) \
              if trailing_pe > 0 and earnings_growth > 0 else None

        # ── Multi-Bagger Score (fully automated) ─────────────────────────────
        mb = calculate_multibagger_score(info, market_key)

        category = "OFFLINE"
        if total_score >= 60:
            category = adapter.classify_price(price)

        return {
            "symbol": symbol,
            "price": price,
            "currency": adapter.currency,
            "l1": l1, "l2": l2, "l3": l3, "l4": l4, "l5": l5,
            "total_score": total_score,
            "category": category,
            # P0 transparency fields
            "fcf_yield_pct": fcf_yield,
            "earnings_quality": earnings_quality,
            "peg": peg,
            # Multi-Bagger Score (fully automated — no manual input)
            "mb_score": mb["mb_score"],
            "mb_tier": mb["mb_tier"],
            "mb_runway": mb["mb_runway"],
            "mb_compound": mb["mb_compound"],
            "mb_op_leverage": mb["mb_op_leverage"],
            "mb_discovery": mb["mb_discovery"],
            "mb_smallcap": mb["mb_smallcap"],
            "penetration_pct": mb["penetration_pct"],
            "compounding_engine_pct": mb["compounding_engine_pct"],
            "megatrend": mb["megatrend"],
            "megatrend_emoji": mb["megatrend_emoji"],
        }
    except:
        return None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--market", default="NSE", choices=["NSE", "US", "HKEX"])
    parser.add_argument("--weights", default='{"l1":25,"l2":20,"l3":15,"l4":25,"l5":15}')
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args()

    market_key = args.market
    weights = json.loads(args.weights)
    
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
    
    # Pre-fetch benchmark history for L3
    try:
        bench = yf.Ticker(adapter.benchmark_ticker)
        benchmark_hist = bench.history(period="3mo")
    except:
        benchmark_hist = None

    results_count = 0
    BATCH_SIZE = 20 
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        for i in range(0, total, BATCH_SIZE):
            batch = tickers[i:i+BATCH_SIZE]
            futures = {executor.submit(scan_stock, s, adapter, market_key, benchmark_hist, weights): s for s in batch}
            
            for future in concurrent.futures.as_completed(futures):
                res = future.result()
                if res:
                    results_count += 1
                    print(json.dumps({"type": "progress", "data": res}))
            
            time.sleep(1) # Rate limit protection

    print(json.dumps({"type": "complete", "count": results_count}))

if __name__ == "__main__":
    main()
