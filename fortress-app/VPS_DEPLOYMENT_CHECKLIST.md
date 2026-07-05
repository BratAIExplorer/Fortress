# Fortress Intelligence VPS Deployment Checklist

## Pre-Deployment Verification

### Database Schema
- [x] `scans` table exists with columns: id, market, status, started_at, completed_at, duration_ms
- [x] `scan_results` table exists with 25+ columns (symbol, market, L1-L6 scores, MB score, Coffee Can score, megatrends, etc.)
- [x] Verified connection string format: `postgresql://user:pass@host:port/db`

### Code Ready
- [x] scanner.py (Engine v3) - Multi-layer scoring, MB score, Coffee Can, Auto-NLP megatrends
- [x] scanner_db_writer.py - Schema alignment, lifecycle management, error handling
- [x] run_scan.sh - Hardened shell script for cron
- [x] Reference/OutoftheBox/sp500.csv - S&P 500 components (current)
- [x] sp500_stocks.py - Backup crawler for US market data
- [x] requirements.txt - All dependencies (yfinance, psycopg2-binary, pandas, etc.)

### Frontend Ready
- [x] Investment Genie Form - Accepts NSE & US symbols
- [x] Allocation Result UI - Wired to scanner results
- [x] Fortress 30 Page - Market selector, reads from searchParams
- [x] Scanner Candidate Card - Transparency "Why Selected" panel
- [x] MarketProvider - Market state management
- [x] Type system - Market-aware contracts

---

## VPS Setup Steps

### 1. Copy Deployment Package
```bash
# On VPS
mkdir -p /opt/fortress-scanner
cp -r /path/to/Reference/OutoftheBox /opt/fortress-scanner/
cp scanner.py /opt/fortress-scanner/
cp scanner_db_writer.py /opt/fortress-scanner/
cp run_scan.sh /opt/fortress-scanner/
cp requirements.txt /opt/fortress-scanner/
chmod +x /opt/fortress-scanner/run_scan.sh
```

### 2. Set Environment Variables
```bash
# In /opt/fortress-scanner/.env
DATABASE_URL=postgresql://user:password@host:port/fortress_db
YFINANCE_TIMEOUT=30
NSE_BATCH_SIZE=50
US_BATCH_SIZE=100
SCAN_LOG_LEVEL=INFO
```

### 3. Install Python Dependencies
```bash
cd /opt/fortress-scanner
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Verify Manual Scan
```bash
# Test NSE market scan (should populate scans & scan_results tables)
python scanner_db_writer.py --market NSE

# Test US market scan
python scanner_db_writer.py --market US

# Check database for populated data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM scan_results WHERE market='NSE';"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM scan_results WHERE market='US';"
```

### 5. Configure Cron Jobs
```bash
# Edit crontab
crontab -e

# Add NSE scan (9:30 AM IST / 12:00 AM UTC)
0 0 * * 1-5 /opt/fortress-scanner/run_scan.sh NSE

# Add US scan (9:30 AM EST / 2:30 PM UTC)
30 14 * * 1-5 /opt/fortress-scanner/run_scan.sh US

# Add weekend portfolio update scan (Sunday 6 PM IST)
0 12 * * 0 /opt/fortress-scanner/run_scan.sh NSE
```

### 6. Monitor Scans
```bash
# Check scan status
psql $DATABASE_URL -c "SELECT market, status, COUNT(*) FROM scans GROUP BY market, status ORDER BY market;"

# Check last scan duration
psql $DATABASE_URL -c "SELECT market, started_at, completed_at, duration_ms FROM scans ORDER BY started_at DESC LIMIT 10;"

# Check for errors in scan_results
psql $DATABASE_URL -c "SELECT market, COUNT(*) as failed_count FROM scan_results WHERE l1_score IS NULL GROUP BY market;"
```

---

## Verification Checklist (Post-Deployment)

- [ ] Scan runs without errors (check logs)
- [ ] Database rows populated: `SELECT COUNT(*) FROM scan_results;`
- [ ] Market filtering works: NSE rows have `market='NSE'`, US rows have `market='US'`
- [ ] Scores populated: L1-L6, MB, Coffee Can all populated for each row
- [ ] Megatrends assigned: Check `megatrends` column for non-null entries
- [ ] Frontend shows data: Investment Genie loads candidates for both markets
- [ ] Fortress 30 renders: Market selector works, scores display correctly

---

## Rollback Plan

If scan fails to populate data:
1. Check DATABASE_URL in .env
2. Verify psycopg2-binary version (pip install --upgrade psycopg2-binary)
3. Check yfinance data fetch (run `python -c "import yfinance; print(yfinance.Ticker('RELIANCE.NS').info.get('longName'))"`)
4. Check database permissions (user must have INSERT on scans & scan_results)
5. Run manual scan with DEBUG logging: `python scanner_db_writer.py --market NSE --debug`

---

## Success Criteria

✅ **Beta Launch Ready** when:
1. VPS scans complete without errors
2. Database receives 100+ NSE rows with complete scoring
3. Database receives 100+ US rows with complete scoring
4. Frontend Investment Genie loads candidates from both markets
5. Fortress 30 page displays market-aware results
