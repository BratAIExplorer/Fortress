# Antigravity Agent — MVP 1 Global Markets Brief

**Sprint:** Multi-market India + US expansion  
**Date:** April 2026  
**Owner:** Antigravity (Python/VPS)  
**Coordinator:** Claude Code (TypeScript/Next.js)  
**Repo:** `fortress-app/` (submodule)

---

## Mission

Wire the existing NSE scanner into the live database and extend it to support US markets. The goal: a user opens Fortress 30 and sees 30 real stocks — either Indian or American — with full scoring transparency.

**MVP 1 scope: India (NSE) + United States (NYSE/NASDAQ) only.**  
No Malaysia. No Singapore. No Hong Kong. Those come later.

---

## Context: What Already Exists

### The Scanner (`Reference/OutoftheBox/scanner.py`)
A working Python scanner that:
- Fetches NSE 500 tickers from `nifty500.csv` (with `.NS` suffix via yfinance)
- Calculates technical indicators (MACD, SMA20/50/100/200, RSI) using the `ta` library
- Filters stocks by MACD bullish + price above key MAs
- Returns a list of hits sorted by crossover date

**The gap:** It runs standalone and prints results. It does NOT write to the Postgres database.

### The Database (PostgreSQL via Drizzle ORM)
Two key tables already have `market` columns:

```sql
-- scans table
CREATE TABLE scans (
  id UUID PRIMARY KEY,
  run_at TIMESTAMP,
  status TEXT,           -- 'COMPLETED' | 'FAILED' | 'RUNNING'
  market TEXT DEFAULT 'NSE',  -- <-- THIS IS KEY
  total_scanned INTEGER,
  good_results_count INTEGER
);

-- scan_results table
CREATE TABLE scan_results (
  id UUID PRIMARY KEY,
  scan_id UUID REFERENCES scans(id),
  symbol TEXT,
  market TEXT DEFAULT 'NSE',  -- <-- THIS IS KEY
  mb_score NUMERIC,
  mb_tier TEXT,              -- 'Rocket'|'Launcher'|'Builder'|'Crawler'|'Grounded'
  total_score NUMERIC,
  price_at_scan NUMERIC,
  sector TEXT,
  category TEXT,
  -- L-criteria (pass/fail)
  l1 BOOLEAN, l2 BOOLEAN, l3 BOOLEAN, l4 BOOLEAN, l5 BOOLEAN, l6 BOOLEAN,
  -- Extra fields
  fcf_yield_pct NUMERIC,
  de_direction TEXT,
  megatrend TEXT,
  megatrend_emoji TEXT
);
```

### The API Layer (Claude Code owns this)
Claude Code will update these endpoints to filter by market:
- `GET /api/scan/results?market=NSE` — returns India stocks
- `GET /api/scan/results?market=US` — returns US stocks
- `GET /api/scan/results?market=GLOBAL` — returns top 30 blended

Antigravity just needs to write to the DB with the correct `market` field.

---

## Your Tasks (Antigravity)

### Task B1 — Create the DB Writer

Create `scanner_db_writer.py` that connects the scanner output to Postgres.

```python
# scanner_db_writer.py
import psycopg2
import uuid
from datetime import datetime
from scanner import scan_market  # existing scanner

DATABASE_URL = os.environ["DATABASE_URL"]  # from .env

def run_scan_and_save(market: str = "NSE"):
    """
    Runs the scanner for the given market and saves results to Postgres.
    market: "NSE" | "US"
    """
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    scan_id = str(uuid.uuid4())

    # 1. Insert scan record (status=RUNNING)
    cur.execute("""
        INSERT INTO scans (id, run_at, status, market, total_scanned, good_results_count)
        VALUES (%s, %s, 'RUNNING', %s, 0, 0)
    """, (scan_id, datetime.utcnow(), market))
    conn.commit()

    try:
        # 2. Run the scan
        results = scan_market(market=market)  # see Task B2

        # 3. Insert results
        good_count = 0
        for r in results:
            cur.execute("""
                INSERT INTO scan_results (
                    id, scan_id, symbol, market, mb_score, mb_tier,
                    total_score, price_at_scan, sector, category,
                    l1, l2, l3, l4, l5, l6
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                str(uuid.uuid4()), scan_id,
                r['symbol'], market,
                r.get('mb_score', 0), r.get('mb_tier', 'Grounded'),
                r.get('total_score', 0), r.get('price', 0),
                r.get('sector', 'Unknown'), r.get('category', 'STANDARD'),
                r.get('l1', False), r.get('l2', False), r.get('l3', False),
                r.get('l4', False), r.get('l5', False), r.get('l6', False)
            ))
            if r.get('category') != 'OFFLINE':
                good_count += 1

        # 4. Mark scan COMPLETED
        cur.execute("""
            UPDATE scans SET status='COMPLETED', total_scanned=%s, good_results_count=%s
            WHERE id=%s
        """, (len(results), good_count, scan_id))
        conn.commit()
        print(f"[{market}] Scan complete: {good_count} good results saved.")

    except Exception as e:
        cur.execute("UPDATE scans SET status='FAILED' WHERE id=%s", (scan_id,))
        conn.commit()
        raise e
    finally:
        cur.close()
        conn.close()
```

---

### Task B2 — Extend scanner.py to Accept a `market` Parameter

The existing `scan_market()` is hardcoded to NSE. Extend it to accept `market: str`:

```python
def scan_market(market: str = "NSE", progress_callback=None):
    if market == "NSE":
        tickers = get_nifty_500_tickers()  # existing, adds .NS suffix
    elif market == "US":
        tickers = get_sp500_tickers()       # NEW — see below
    else:
        raise ValueError(f"Unknown market: {market}")
    
    # Rest of the function is IDENTICAL — yfinance works for both
    ...
```

---

### Task B3 — Build `get_sp500_tickers()` for US

```python
def get_sp500_tickers():
    """
    Returns S&P 500 tickers. No suffix needed for US stocks.
    """
    import pandas as pd

    # Option 1: Read from local CSV (recommended for reliability)
    if os.path.exists("sp500.csv"):
        df = pd.read_csv("sp500.csv")
        return df['Symbol'].tolist()  # e.g. ['AAPL', 'MSFT', 'GOOGL', ...]

    # Option 2: Fetch from Wikipedia (free, no API key)
    url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
    df = pd.read_html(url)[0]
    tickers = df['Symbol'].str.replace('.', '-').tolist()  # BRK.B → BRK-B
    df.to_csv("sp500.csv", index=False)  # cache locally
    return tickers
```

**Generate `sp500.csv` once and commit it** alongside `nifty500.csv`.

---

### Task B4 — Currency Handling

US stocks return prices in USD. NSE stocks return prices in INR.

In the `analyze_stock()` function, the `current_price` field needs no change — just store the raw price as returned by yfinance. The frontend will display the correct currency symbol based on the `market` field.

No conversion needed. Prices stay in local currency.

---

### Task B5 — Scoring Tuning for US Market

The existing MB score uses sector-based weightings tuned for India (finance-heavy, infrastructure-heavy). US is tech-heavy.

For MVP 1, **use the same scoring logic** — don't over-engineer. Once you have 2-3 weeks of US scan data and user feedback, then tune sector weights. Ship first, tune second.

One change to make: the `analyze_stock()` function currently filters out stocks with price-based Indian market assumptions. Check for any hardcoded INR thresholds (like `price < 10` for penny stock classification) and make them market-aware:

```python
# Before (India-only hardcoded)
is_penny = current_price < 10

# After (market-aware)
is_penny = (market == "NSE" and current_price < 10) or (market == "US" and current_price < 1)
```

---

### Task B6 — Cron Jobs on VPS

Two daily cron jobs — one per market. Run after market close.

```bash
# /etc/cron.d/fortress-scanner

# NSE scan — runs at 4:30 PM IST (11:00 UTC) — 30 min after NSE close
0 11 * * 1-5 fortress /opt/fortress-scanner/run_scan.sh NSE >> /var/log/fortress/nse_scan.log 2>&1

# US scan — runs at 6:00 PM EST (23:00 UTC) — 1.5 hr after NYSE close
0 23 * * 1-5 fortress /opt/fortress-scanner/run_scan.sh US >> /var/log/fortress/us_scan.log 2>&1
```

```bash
# run_scan.sh
#!/bin/bash
MARKET=$1
cd /opt/fortress-scanner
source .env
python scanner_db_writer.py --market $MARKET
```

---

## The Interface Contract (Database)

Claude Code reads from the DB. Antigravity writes to the DB. This is the only shared interface:

| Field | NSE Value | US Value |
|-------|-----------|----------|
| `scans.market` | `"NSE"` | `"US"` |
| `scan_results.market` | `"NSE"` | `"US"` |
| `scan_results.symbol` | `"HDFC.NS"` or just `"HDFC"` — confirm with Claude | `"AAPL"` |
| `scan_results.category` | `"STANDARD"` \| `"OFFLINE"` | Same |
| `scan_results.price_at_scan` | INR (e.g. 1642.50) | USD (e.g. 211.45) |

**IMPORTANT:** For `symbol`, decide with Claude Code whether to store with or without the `.NS` suffix. Claude Code will strip or add suffixes for display. Recommendation: store WITHOUT suffix (`HDFC`, not `HDFC.NS`) so the UI doesn't have to strip it.

---

## Definition of Done

MVP 1 is complete when:

- [ ] NSE daily scan runs at 4:30 PM IST, writes ≥50 results with `market="NSE"`
- [ ] US daily scan runs at 6:00 PM EST, writes ≥50 results with `market="US"`
- [ ] Both scans have `status="COMPLETED"` in the `scans` table
- [ ] `scan_results` rows have correct `market` field, `symbol`, `mb_score`, `mb_tier`, `price_at_scan`
- [ ] Claude Code confirms Fortress 30 shows India stocks when `?market=NSE` and US stocks when `?market=US`

---

## Files to Create

```
Reference/OutoftheBox/
  scanner_db_writer.py    ← NEW (Task B1)
  sp500_stocks.py         ← NEW (Task B3)
  sp500.csv               ← NEW (generate once, commit)
  run_scan.sh             ← NEW (Task B6)
  scanner.py              ← MODIFY (Task B2 + B5)
```

---

## Questions for Claude Code

Before starting B5, confirm:
1. Should `scan_results.symbol` store `HDFC` or `HDFC.NS`?
2. What is the minimum `good_results_count` threshold for a scan to appear in Fortress 30? (currently 50 — check `app/api/scan/results/route.ts` line 8)
3. What sectors should US stocks map to? (Claude Code owns the UI sector labels)

---

## DO NOT build

- Do not build a frontend — Claude Code owns everything in `fortress-app/`
- Do not modify `lib/db/schema.ts` — that's Claude Code's file
- Do not add new database tables — the schema already has what's needed
- Do not add Singapore, Hong Kong, or Malaysia yet — that's Phase 2

---

## Answers from Claude Code

1. **Symbol format:** Store WITHOUT suffix — `HDFC` not `HDFC.NS`, `AAPL` not `AAPL`. The frontend strips `.NS`/`.BO` on display already.
2. **Minimum good_results_count:** 50 — confirmed in `app/api/scan/results/route.ts:8`
3. **US sectors:** Use the same sector strings as yfinance returns (Technology, Healthcare, Financial Services, etc.). The frontend renders whatever string is in the DB.

---

## Backlog (Phase 2 — after MVP 1 ships)

### Fallback Data Sources
yfinance is an unofficial scraper and can be rate-limited or blocked without notice. Design the scanner so data sources are swappable per market.

**Architecture pattern to implement in Phase 2:**
```python
SOURCES = {
    "NSE": ["yfinance", "nsepython", "alpha_vantage"],
    "US":  ["yfinance", "alpha_vantage", "polygon"],
}

def fetch_stock_data(ticker, market):
    for source_name in SOURCES[market]:
        try:
            return ADAPTERS[source_name].fetch(ticker)
        except Exception:
            continue  # try next source
    return None  # all failed → mark OFFLINE
```

**Fallback sources by market:**
| Market | Primary | Fallback 1 | Fallback 2 |
|--------|---------|------------|------------|
| NSE | yfinance | nsepython | Alpha Vantage |
| US | yfinance | Alpha Vantage | Polygon.io |

**For MVP 1:** Do NOT build the fallback layer yet. Use yfinance only. Wrap all yfinance calls in try/except and mark stocks as OFFLINE on failure. The adapter pattern comes in Phase 2.

---

*Last updated: April 2026 | Claude Code + Antigravity parallel development*
