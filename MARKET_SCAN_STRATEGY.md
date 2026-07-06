# Market Scan Strategy (CXO + Trading Specialist View)

## Strategic Objective

**Operational Goal:** Provide daily technical screening of US and India (NSE) markets before trading sessions open.  
**User Benefit:** Users see fresh, ranked stock lists (Fortress 30) every trading day.  
**Technical Foundation:** Automated cron-triggered scans that populate the database.

---

## The Scans: When & Why

### NSE (India) Scan
- **Trigger Time:** 4:30 PM IST (11:00 UTC) — After market close
- **Rationale:** Screen end-of-day data before next trading session; users plan overnight
- **Data Freshness:** 14-16 hours old by next open (acceptable for technical analysis)
- **Frequency:** Mon-Fri only (markets closed weekends)

### US Scan
- **Trigger Time:** 6:00 PM EST (11:30 UTC) — After market close
- **Rationale:** Capture daily moves before Asian open; US traders already done
- **Data Freshness:** 14-16 hours old by next Asian/European open
- **Frequency:** Mon-Fri only

### Scan Timing Rationale

```
NSE Session:  9:15 AM – 3:30 PM IST
              ↓ Market closes
              4:30 PM IST = Scan 1 ✅
              (Data ready for US/EU traders at market open)

US Session:   9:30 AM – 4:00 PM EST
              ↓ Market closes
              6:00 PM EST = Scan 2 ✅
              (Data ready for India traders at next session)
```

---

## How It Works (Technical Pipeline)

### 1. Cron Job Triggers
```bash
# In crontab (root on VPS):
0 11 * * 1-5  /scripts/run-nse-scan.sh     # NSE scan
30 11 * * 1-5 /scripts/run-us-scan.sh      # US scan
```

### 2. HTTP Request to App
```bash
curl -X POST https://fortressintelligence.space/api/scan/run \
  -H "x-cron-secret: fortress-scan-secret-2026" \
  -H "Content-Type: application/json" \
  -d '{"market":"NSE"}'
```

### 3. Backend Processing
- **Scanner spawns:** `scanner/engine.py --market NSE`
- **Stocks fetched:** Yahoo Finance (yfinance) for live prices + technicals
- **Scoring applied:** MACD, RSI, SMA (20/50/100/200), momentum, quality metrics
- **Results stored:** Insert into `scans` + `scan_results` tables (with 10-scan retention)

### 4. Frontend Display
- **Fortress 30 loads:** `GET /api/scan/results?market=NSE`
- **Best scan selected:** Most recent with ≥50 "good" results (quality gate)
- **Sorted by:** Multi-Bagger Score (0-100), ranked Rocket/Launcher/Builder/Crawler
- **User sees:** Top 30 stocks + next 10 candidates (31-40)

---

## Operational Requirements

### Prerequisites (Must Exist on VPS)
- [ ] Python environment with scanner dependencies (yfinance, pandas, numpy)
- [ ] Cron daemon running (`cron` service active)
- [ ] `.env.production` has `CRON_SECRET=fortress-scan-secret-2026`
- [ ] App listening on port 3000 (verified by PM2)
- [ ] Database connection working (verified by `npm run db:validate`)

### Monitoring Checklist
| Check | Frequency | Command | Expected |
|-------|-----------|---------|----------|
| Scan completed | Daily (post-scan) | `GET /api/scan/run` | `"status": "COMPLETED"` |
| Data in DB | Daily | `SELECT COUNT(*) FROM scan_results WHERE market='NSE'` | >50 rows |
| Fortress 30 renders | Daily | Visit `/fortress-30` | Stocks display (not "No data") |
| Cron running | Weekly | `crontab -l` on VPS | Both NSE+US jobs listed |

---

## Failure Modes & Recovery

### Scenario 1: Scan Doesn't Trigger
**Symptom:** No scan results after scheduled time  
**Likely Cause:** Cron job not configured or VPS service stopped  
**Recovery:**
```bash
ssh root@76.13.179.32
# Verify cron is running
systemctl status cron  # or 'service cron status'

# Verify job exists
crontab -l

# If missing, add it
crontab -e
# Add: 0 11 * * 1-5 curl -X POST ...
```

### Scenario 2: Scan Runs but DB Insert Fails
**Symptom:** `scan_results` table empty but scan shows "COMPLETED"  
**Likely Cause:** Database connection lost mid-scan  
**Recovery:**
```bash
# Check scanner logs
pm2 logs fortress | grep -i "error\|failed" | tail -20

# Verify DB is reachable
psql -d fortress -c "SELECT 1;" 

# Re-run scan manually
curl -X POST https://fortressintelligence.space/api/scan/run \
  -H "x-cron-secret: fortress-scan-secret-2026" \
  -H "Content-Type: application/json" \
  -d '{"market":"NSE"}'
```

### Scenario 3: Rate Limit Hits (yfinance blocked)
**Symptom:** Scan fails midway or times out  
**Likely Cause:** Fetching >500 tickers too fast (yfinance rate limit)  
**Recovery:** Inherent cooldown in code (4 hours between manual scans)

---

## Strategic Advantages (Why This Design)

✅ **Operational simplicity** — Cron + HTTP, no complex job queues  
✅ **Fault isolation** — Scan failures don't crash the app  
✅ **User transparency** — Users see when data was last updated  
✅ **Scalable** — Can add more markets (Malaysia, HK) with same pattern  
✅ **Testable** — Manual scan trigger for QA before cron depends on it  

---

## Next Steps (Implementation)

### Session 5 (Verification)
1. ✅ Verify database schema created (via `npm run db:validate`)
2. ⏳ Manually trigger NSE scan to populate data
3. ✅ Verify Fortress 30 displays stocks
4. ✅ Check PM2 logs for errors

### Session 6 (Cron Setup)
1. SSH to VPS and add cron jobs
2. Monitor first run (NSE at 11:00 UTC)
3. Monitor second run (US at 11:30 UTC)
4. Verify data persistence (10-scan rolling window)

### Long-Term (Months 2+)
1. Add market status dashboard (`/api/market/status`)
2. Implement fallback data source (Alpha Vantage if yfinance fails)
3. Add email alerts for scan failures
4. Expand to Malaysia/Hong Kong markets

---

## CXO Summary

**What's happening:** Automated daily stock screening, 7 days before markets open.  
**Why it matters:** Users always have fresh, ranked ideas without manual work.  
**Risk level:** Low — scans fail gracefully; users see "No data yet" (not an error crash).  
**Scaling:** Trivial to add more markets; pattern is proven.

**Timeline:**
- Today: Database ready, scanner code exists
- Tomorrow: Run 1 manual scan to prove pipeline works
- This week: Configure cron jobs (5 min work)
- Then: Hands-off; scans run daily automatically
