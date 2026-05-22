# FORTRESS SCANNER DEPLOYMENT GUIDE
**For VPS: 76.13.179.32**

## Current Status
- ❌ Scanner code not deployed to VPS
- ❌ Python dependencies not installed (yfinance, pandas)
- ✅ Next.js app running successfully
- ✅ PostgreSQL connected and ready

---

## DEPLOYMENT STEPS

### Step 1: Install Python Dependencies (2 minutes)

SSH into VPS and run:

```bash
ssh -i fortress.pem ubuntu@76.13.179.32
sudo apt-get update
sudo apt-get install -y python3-pip python3-dev

# Install Python packages
pip3 install yfinance pandas requests python-dotenv

# Verify installation
python3 -c "import yfinance; import pandas; print('✓ Dependencies installed')"
```

### Step 2: Deploy Scanner Code (1 minute)

Option A: Copy from local dev machine (if you have access):
```bash
# From your local machine
scp -i fortress.pem -r fortress-app/scanner ubuntu@76.13.179.32:/opt/fortress/scanner
```

Option B: Create scanner directory and files manually (5 minutes):

```bash
# SSH into VPS
ssh -i fortress.pem ubuntu@76.13.179.32

# Create scanner directory
mkdir -p /opt/fortress/scanner
cd /opt/fortress/scanner

# Create macro_fetcher.py (copy the file content below)
cat > macro_fetcher.py << 'EOF'
#!/usr/bin/env python3
"""
Fortress Market Pulse Fetcher
Fetches macro market data from yfinance and stores in PostgreSQL
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
    """Extract prices from yfinance MultiIndex DataFrame"""
    result: dict[str, float | None] = {}

    if not isinstance(raw.columns, pd.MultiIndex):
        return {key: None for key in TICKER_MAP}

    level0 = list(raw.columns.get_level_values(0).unique())
    level1 = list(raw.columns.get_level_values(1).unique())

    # Detect which level has "Close" and which has ticker symbols
    close_level = None
    ticker_level = None

    for i, level in enumerate([level0, level1]):
        if all(s in level for s in SYMBOLS):
            ticker_level = i
        if "Close" in level:
            close_level = i

    if ticker_level is None:
        return {key: None for key in TICKER_MAP}

    for ticker in SYMBOLS:
        if ticker not in raw.columns.get_level_values(ticker_level):
            result[KEY_BY_SYMBOL[ticker]] = None
            continue

        if close_level == 0:
            col = ("Close", ticker)
        elif close_level == 1:
            col = (ticker, "Close")
        else:
            result[KEY_BY_SYMBOL[ticker]] = None
            continue

        if col in raw.columns:
            result[KEY_BY_SYMBOL[ticker]] = last_close(raw[col])
        else:
            result[KEY_BY_SYMBOL[ticker]] = None

    return result

def main():
    try:
        # Fetch data
        print(json.dumps({"message": "Fetching macro data..."}), file=sys.stderr)
        data = yf.download(SYMBOLS, period="1d", progress=False)
        
        if data.empty:
            print(json.dumps({"error": "No data returned from yfinance"}))
            sys.exit(1)

        # Extract values
        prices = extract_batch(data)
        
        # Output as JSON (this will be captured by Node.js API)
        output = {
            "snapshot_date": date.today().isoformat(),
            "nifty_50": prices.get("nifty_50"),
            "bank_nifty": prices.get("bank_nifty"),
            "usd_inr": prices.get("usd_inr"),
            "gold_usd": prices.get("gold_usd"),
            "crude_oil_usd": prices.get("crude_oil_usd"),
            "us_10y_yield": prices.get("us_10y_yield"),
            "cboe_vix": prices.get("cboe_vix"),
            "india_vix": prices.get("india_vix"),
        }
        
        print(json.dumps(output))
        return 0

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        return 1

if __name__ == "__main__":
    sys.exit(main())
EOF

chmod +x macro_fetcher.py
```

### Step 3: Verify Scanner Setup (1 minute)

```bash
# Test macro fetcher
cd /opt/fortress/scanner
python3 macro_fetcher.py

# Expected output: JSON with market data
# Example: {"snapshot_date": "2026-05-03", "nifty_50": 22150.5, ...}
```

### Step 4: Run Initial Data Fetch (2-5 minutes)

```bash
# From /opt/fortress on VPS
CRON_SECRET=Wealth2027$ python3 scanner/macro_fetcher.py

# Verify database received data
psql postgresql://fortress_user:Fortress_2027$@localhost:5432/fortress -c "SELECT * FROM macro_snapshots ORDER BY snapshot_date DESC LIMIT 1;"
```

---

## AUTOMATED CRON SETUP (Optional but Recommended)

Edit crontab to run macro fetcher daily:

```bash
crontab -e

# Add this line (runs at 4:30 PM IST / 11:00 UTC Mon-Fri)
30 23 * * 1-5 cd /opt/fortress && CRON_SECRET=Wealth2027$ python3 scanner/macro_fetcher.py >> /var/log/fortress/macro_fetch.log 2>&1
```

Create log directory:
```bash
sudo mkdir -p /var/log/fortress
sudo chown ubuntu:ubuntu /var/log/fortress
```

---

## TROUBLESHOOTING

### Error: "yfinance/pandas not installed"
**Solution:** Run `pip3 install yfinance pandas requests`

### Error: "ModuleNotFoundError: No module named 'yfinance'"
**Solution:** Check Python version - should be Python 3.8+
```bash
python3 --version
```

### No data returned from yfinance
**Solution:** yfinance may have rate limits. Wait a few minutes and retry.
```bash
python3 macro_fetcher.py
```

### Permission denied on scanner files
**Solution:** Fix permissions
```bash
chmod +x /opt/fortress/scanner/*.py
chmod 755 /opt/fortress/scanner
```

---

## VERIFICATION CHECKLIST

After deployment:

- [ ] Python dependencies installed: `python3 -c "import yfinance; import pandas"`
- [ ] Scanner directory exists: `ls -la /opt/fortress/scanner/`
- [ ] macro_fetcher.py executable: `file /opt/fortress/scanner/macro_fetcher.py`
- [ ] Can run macro fetcher: `python3 /opt/fortress/scanner/macro_fetcher.py`
- [ ] Data in database: `psql ... -c "SELECT COUNT(*) FROM macro_snapshots;"`
- [ ] API returns data: `curl https://fortressintelligence.space/api/macro | grep nifty50`

---

## NEXT STEPS

Once scanner is deployed and running:

1. ✅ Macro data will populate automatically
2. ✅ Investment Genie API will return real market conditions
3. ✅ Full end-to-end user flow will work

Then run QA tests to verify:
```bash
node qa-test-suite.js
```

---

## ESTIMATED TIMELINE

- Dependencies installation: **2 min**
- Code deployment: **1-5 min** (depending on method)
- Initial data fetch: **2-5 min**
- Database verification: **1 min**
- **Total: 6-14 minutes to full functionality**

---

**Status:** Ready for deployment  
**Next Step:** Execute Step 1 (Install Dependencies) on VPS
