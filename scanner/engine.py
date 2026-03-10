import yfinance as yf
import pandas as pd
import ta
import time
import json
import os
import requests
import io
import concurrent.futures
from datetime import datetime, timedelta

# Scoring Formula (Addressing Review)
# Total = 100 pts
# L1 (Protection): 25 pts (D/E, OCF, ROCE)
# L2 (Pricing Power): 20 pts (Margin stability)
# L3 (Macro): 15 pts (Relative Strength)
# L4 (Growth): 25 pts (EPS/Rev CAGR)
# L5 (Gov): 15 pts (Placeholder/Manual)

NSE_LIST_URL = "https://archives.nseindia.com/content/equities/EQUITY_L.csv"

def get_nse_tickers():
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        response = requests.get(NSE_LIST_URL, headers=headers)
        if response.status_code == 200:
            df = pd.read_csv(io.StringIO(response.text))
            symbols = [f"{s}.NS" for s in df['SYMBOL'].tolist()]
            return symbols
    except Exception as e:
        print(json.dumps({"error": f"Failed to fetch NSE list: {str(e)}"}))
    return []

def calculate_l1(info):
    """L1: Protection (25 pts)"""
    score = 0
    de = info.get('debtToEquity', 999) / 100 # yfinance returns de * 100
    roce = info.get('returnOnCapitalEmployed', 0)
    ocf = info.get('operatingCashflow', 0)
    
    if de < 0.6: score += 10
    elif de < 1.0: score += 5
    
    if roce > 0.15: score += 10
    elif roce > 0.10: score += 5
    
    if ocf > 0: score += 5
    
    return score

def calculate_l2(info):
    """L2: Pricing Power (20 pts)"""
    score = 0
    gm = info.get('grossMargins', 0)
    # Using gross margin as a proxy for pricing power
    if gm > 0.30: score += 10
    elif gm > 0.20: score += 5
    
    # Margin stability would need historical info.info which is expensive.
    # For now, using operating margin as addition
    om = info.get('operatingMargins', 0)
    if om > 0.15: score += 10
    elif om > 0.10: score += 5
    
    return score

def calculate_l3(ticker, hist):
    """L3: Macro Tailwind (15 pts)"""
    # Relative strength vs Nifty 50 (proxy)
    if hist.empty or len(hist) < 60: return 0
    
    returns_3m = (hist['Close'].iloc[-1] / hist['Close'].iloc[0]) - 1
    # Simple logic: positive return = 10 pts, outperforming proxy (not fetched yet) = +5
    score = 10 if returns_3m > 0 else 5
    return score

def calculate_l4(info):
    """L4: Growth Visibility (25 pts)"""
    score = 0
    rev_growth = info.get('revenueGrowth', 0)
    earnings_growth = info.get('earningsGrowth', 0)
    
    if rev_growth > 0.15: score += 12
    elif rev_growth > 0.10: score += 6
    
    if earnings_growth > 0.15: score += 13
    elif earnings_growth > 0.10: score += 7
    
    return score

def scan_stock(symbol):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period="3mo")
        
        l1 = calculate_l1(info)
        l2 = calculate_l2(info)
        l3 = calculate_l3(symbol, hist)
        l4 = calculate_l4(info)
        l5 = 15 # Placeholder for manual governance
        
        total_score = l1 + l2 + l3 + l4 + l5
        price = info.get('currentPrice', 0)
        
        category = "OFFLINE"
        if total_score >= 60:
            if price < 20: category = "SUB20"
            elif price < 100: category = "PENNY"
            else: category = "52W_LOW" # Default qualified bucket
            
        return {
            "symbol": symbol,
            "price": price,
            "l1": l1, "l2": l2, "l3": l3, "l4": l4, "l5": l5,
            "total_score": total_score,
            "category": category
        }
    except:
        return None

def main():
    tickers = get_nse_tickers()
    if not tickers: return
    
    # For speed in this demo/test, let's limit to Nifty 100 or something?
    # No, user wants ALL. We'll do it in batches and output progress.
    
    total = len(tickers)
    print(json.dumps({"type": "start", "total": total}))
    
    results = []
    # Using small batch for SSE demonstration
    BATCH_SIZE = 20 
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        for i in range(0, total, BATCH_SIZE):
            batch = tickers[i:i+BATCH_SIZE]
            futures = {executor.submit(scan_stock, s): s for s in batch}
            
            for future in concurrent.futures.as_completed(futures):
                res = future.result()
                if res:
                    results.append(res)
                    # Output individual result for SSE stream
                    print(json.dumps({"type": "progress", "data": res}))
            
            time.sleep(1) # Rate limit protection

    print(json.dumps({"type": "complete", "count": len(results)}))

if __name__ == "__main__":
    main()
