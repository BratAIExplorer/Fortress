# Scanner Verification (Post-Deployment)

**Date:** July 29, 2026  
**Context:** Deployment of Session 33 (Feedback Loop) does NOT affect scanner  
**Status:** Scanner should continue running as configured

---

## Scanner Schedule (UTC)

| Market | Time | Days | Cron |
|--------|------|------|------|
| **NSE** | 11:00 UTC | Mon-Fri | `0 11 * * 1-5` |
| **US** | 09:00 UTC | Mon-Fri | `0 9 * * 1-5` |
| **Macro** | 12:00 UTC | Sunday | `0 12 * * 0` |

**In IST (India Standard Time):**
- NSE: 4:30 PM IST (Mon-Fri)
- US: 2:30 PM IST (Mon-Fri)
- Macro: 5:30 PM IST (Sunday)

---

## Verify Scanner is Running

### On VPS, after deployment:

```bash
# Check fortress-cron process status
pm2 status | grep fortress-cron

# Should show: "online" status
```

### Check Cron Logs

```bash
# Watch cron logs in real-time
pm2 logs fortress-cron

# Or show last 50 lines
pm2 logs fortress-cron --lines 50
```

**Expected output (during scan window):**
```
[fortress-cron] 🔄 Starting NSE scan...
[fortress-cron] ✅ NSE scan accepted (ID: abc-123-def)
```

### Verify Recent Scans in Database

```bash
psql -d fortress -c "
SELECT 
  market, 
  status, 
  total_scanned, 
  good_results_count, 
  run_at 
FROM scans 
ORDER BY run_at DESC 
LIMIT 5;
"
```

**Expected output:**
```
 market | status    | total_scanned | good_results_count |         run_at         
--------+-----------+---------------+--------------------+------------------------
 NSE    | COMPLETED |           501 |                 50 | 2026-07-29 11:00:15+00
 US     | COMPLETED |           503 |                 48 | 2026-07-29 09:00:22+00
```

---

## What Changed in Session 33?

**Nothing related to the scanner:**

- ✅ Feedback loop added (new table, new API, new UI)
- ✅ Scanner cron jobs remain unchanged
- ✅ Scanner API endpoints remain unchanged
- ✅ Scanner database tables remain unchanged

**The deployment should have ZERO impact on scanner functionality.**

---

## Troubleshooting Scanner Issues

### Scanner is not running

1. **Check if `fortress-cron` process is online:**
   ```bash
   pm2 status
   ```
   If NOT online, restart:
   ```bash
   pm2 restart fortress-cron --update-env
   ```

2. **Check if CRON_SECRET is set:**
   ```bash
   pm2 env fortress-cron | grep CRON_SECRET
   ```
   If empty, add to `.env.production`:
   ```bash
   CRON_SECRET=your-secret-value
   pm2 restart fortress-cron --update-env
   ```

3. **Check if BASE_URL is correct:**
   ```bash
   pm2 env fortress-cron | grep SCANNER_BASE_URL
   ```
   Should be: `https://fortressintelligence.space` or `http://localhost:3000` (on VPS)

### Scan failed

Check logs:
```bash
pm2 logs fortress-cron --lines 100 | grep "error\|Error\|❌"
```

Common issues:
- `CRON_SECRET` doesn't match in `.env.production`
- Fortress app is down (scanner can't reach `/api/scan/run`)
- Database connection error (check PostgreSQL)

---

## Post-Deployment Checklist

- [ ] PM2 status shows `fortress-cron: online`
- [ ] Latest scan timestamp is recent (within last 24 hours during business days)
- [ ] Scans have `status: COMPLETED` (not FAILED or RUNNING)
- [ ] `good_results_count` > 0 (at least some stocks passed filters)
- [ ] `/momentum-radar` displays active signals (if any)
- [ ] No errors in `pm2 logs fortress-cron`

---

## Note

The **feedback loop feature (Session 33) does NOT trigger scans** — it only captures user actions on signals.

**Scans are still triggered by:**
1. Cron scheduler (automatic, on fixed schedule)
2. Admin dashboard (manual trigger, if enabled)

Nothing changed about these flows in Session 33.

---

**Status: 🟢 Scanner should run normally post-deployment. No action needed unless issues appear.**
