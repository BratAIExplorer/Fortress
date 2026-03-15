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

# ─── SCORING ENGINE (Market-Agnostic) ─────────────────────────────────────────

def calculate_l1(info, market="NSE", max_pts=25):
    """L1: Protection (D/E, OCF, ROCE)"""
    score = 0
    # yfinance returns debtToEquity * 100 for NSE, but usually raw for US/HK
    de_raw = info.get('debtToEquity', 999)
    de = de_raw / 100 if market == "NSE" and de_raw > 5 else de_raw
    
    roce = info.get('returnOnCapitalEmployed', 0)
    ocf = info.get('operatingCashflow', 0)
    
    # Weights for sub-components (relative to max_pts)
    de_wt = max_pts * 0.4
    roce_wt = max_pts * 0.4
    ocf_wt = max_pts * 0.2

    if de < 0.6: score += de_wt
    elif de < 1.0: score += (de_wt / 2)
    
    if roce > 0.15: score += roce_wt
    elif roce > 0.10: score += (roce_wt / 2)
    
    if ocf > 0: score += ocf_wt
    
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
    """L4: Growth Visibility (CAGR)"""
    score = 0
    rev_growth = info.get('revenueGrowth', 0)
    earnings_growth = info.get('earningsGrowth', 0)
    
    rev_wt = max_pts * 0.5
    earn_wt = max_pts * 0.5

    if rev_growth > 0.15: score += rev_wt
    elif rev_growth > 0.10: score += (rev_wt / 2)
    
    if earnings_growth > 0.15: score += earn_wt
    elif earnings_growth > 0.10: score += (earn_wt / 2)
    
    return int(score)

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
        
        category = "OFFLINE"
        if total_score >= 60:
            category = adapter.classify_price(price)
            
        return {
            "symbol": symbol,
            "price": price,
            "currency": adapter.currency,
            "l1": l1, "l2": l2, "l3": l3, "l4": l4, "l5": l5,
            "total_score": total_score,
            "category": category
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
