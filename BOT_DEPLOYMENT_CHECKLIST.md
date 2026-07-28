# Bot Migration to VPS — Deployment Checklist

**Status:** Ready for VPS deployment  
**Date:** July 28, 2026  
**Commits:** `c1b1aae5` (bot migration) + `e88e93c4` (handover update)

---

## Pre-Deployment ✅

- [x] Bot source files copied to `bot/` directory
- [x] Python dependencies listed in `requirements.txt`
- [x] Health check script created (`bot/healthcheck.py`)
- [x] PM2 process config updated (`ecosystem.config.js`)
- [x] Environment variables documented (`.env.example`)
- [x] Deployment guide written (`BOT_DEPLOYMENT.md`)
- [x] Bot README created (`bot/README.md`)
- [x] Handover document updated (`AI_HANDOVER.html`)
- [x] All commits signed and pushed to main branch

---

## VPS Deployment Steps

### Step 1: Pull Latest Code
```bash
cd /opt/fortress
git pull origin main
```

**Expected:** Commits `c1b1aae5` and `e88e93c4` are now on VPS.

### Step 2: Set Up Python Virtual Environment
```bash
cd /opt/fortress
python3 -m venv bot/venv
source bot/venv/bin/activate
pip install --upgrade pip
pip install -r bot/requirements.txt
deactivate
```

**Expected:** No errors, all packages installed successfully.

### Step 3: Verify Database Schema
```bash
cd /opt/fortress
npm run drizzle:push
```

**Expected:** `macd_signals` table exists (safe if already exists).

### Step 4: Add Bot Environment Variables
Edit `/opt/fortress/.env.production` and add:

```bash
# MACD Bot (required)
TELEGRAM_BOT_TOKEN=<your-telegram-token>
TELEGRAM_ADMIN_ID=<your-admin-id>
FORTRESS_API_URL=https://fortressintelligence.space/api/analysis/momentum-signals
FORTRESS_CRON_SECRET=<same-as-CRON_SECRET>

# Optional (for auto-trading)
ZERODHA_API_KEY=<key>
ZERODHA_API_SECRET=<secret>
ZERODHA_CLIENT_ID=<client-id>
```

**Expected:** All REQUIRED vars are set.

### Step 5: Run Health Check
```bash
cd /opt/fortress/bot
source venv/bin/activate
python healthcheck.py
deactivate
```

**Expected output:**
```
🔍 MACD Bot Health Check

Environment Variables:
✅ All required environment variables set

Python Dependencies:
✅ All Python dependencies installed

Fortress API Connectivity:
✅ Fortress API reachable at https://fortressintelligence.space/api/analysis/momentum-signals

==================================================
✅ Bot is ready for deployment!
```

### Step 6: Build & Deploy
```bash
cd /opt/fortress
npm run build
pm2 restart all --update-env
```

**Expected:** All three processes restart (fortress-app, fortress-cron, fortress-bot).

### Step 7: Verify Bot is Running
```bash
pm2 status
```

**Expected output:**
```
┌─────────────────┬─────┬─────────┬──────┬──────┬──────────┐
│ App name        │ id  │ version │ mode │ pid  │ status   │
├─────────────────┼─────┼─────────┼──────┼──────┼──────────┤
│ fortress-app    │ 0   │ N/A     │ fork │ xxxx │ online   │
│ fortress-cron   │ 1   │ N/A     │ fork │ xxxx │ online   │
│ fortress-bot    │ 2   │ N/A     │ fork │ xxxx │ online   │ ← MUST be online
└─────────────────┴─────┴─────────┴──────┴──────┴──────────┘
```

### Step 8: Check Bot Logs
```bash
pm2 logs fortress-bot --lines 20
```

**Expected logs (if during market hours):**
```
[fortress-bot] Starting a new scan cycle...
[fortress-bot] Fetching Nifty 500 stock list from NSE...
[fortress-bot] Successfully loaded 500 symbols...
[fortress-bot] Analyzing daily stock data...
[fortress-bot] Completed scan. Active: 5. New crossovers: 2.
```

**If outside market hours:**
```
[fortress-bot] Market is closed. Idle monitoring...
```

### Step 9: Test Momentum Radar
Open in browser: `https://fortressintelligence.space/momentum-radar`

**Expected:**
- Page loads without errors
- If market is open AND bot has run: Shows signal table with symbols, prices, targets, stop losses
- If market is closed: Shows "No active crossovers" (normal)

### Step 10: Test Admin Panel
Open in browser: `https://fortressintelligence.space/momentum-radar/admin`

**Expected:**
- Password prompt appears
- After entering password (same as `x-cron-secret`):
  - Bot status shows "Healthy" or "Stale" (depending on last push)
  - Active signals count displays
  - Credential form is accessible

---

## Rollback Plan (If Needed)

If bot causes issues:

```bash
# Stop bot gracefully (does NOT affect Fortress app)
pm2 stop fortress-bot

# Verify app still works
curl http://localhost:3000 

# Restart bot when ready
pm2 restart fortress-bot --update-env
```

**Impact:** Only Momentum Radar will be unavailable. All other Fortress features continue working.

---

## Post-Deployment Monitoring

### Daily Checks (5-min)
```bash
pm2 status
pm2 logs fortress-bot --lines 20
```

### Weekly Checks
- [ ] Bot process still online (`pm2 status`)
- [ ] No crash loops in logs (`pm2 logs fortress-bot`)
- [ ] Momentum Radar showing live data
- [ ] Nifty 500 cache refreshed (auto, first scan of week)

### Alerts to Watch
- **Bot offline:** `pm2 status` shows `stopped` or `errored`
- **High memory:** Process using >200 MB (leaking memory)
- **API errors:** Logs show repeated "Cannot reach Fortress API" (network issue)
- **Missing credentials:** Bot crashes with "TELEGRAM_BOT_TOKEN not set"

---

## Known Limitations

1. **Python + Node.js on Same Machine**
   - Both run as separate processes (no conflict)
   - Bot is isolated from app (crashes don't affect each other)

2. **Scan Cycle Duration**
   - Takes 4-6 minutes for 500 stocks (dual timeframe)
   - Scans every 5 minutes → minimal overlap, but possible during slow runs
   - Workaround (Phase 2): Concurrent batch fetching to reduce to <3 min

3. **Rate Limiting**
   - Yahoo Finance allows ~50 requests per minute
   - Current design: sequential fetch, safe for 500 stocks
   - Workaround: Implement backoff if rate-limited

4. **Excel Log File**
   - If Excel is open on VPS, bot writes to fallback file
   - Workaround: Keep Excel closed on VPS (it's just a log)

---

## What NOT to Do

❌ **Don't** manually stop/restart bot without PM2 (it will keep crashing)  
❌ **Don't** edit `.env.production` and restart only fortress-bot (other processes may need vars too)  
❌ **Don't** run bot on personal laptop AND VPS simultaneously (duplicate scans, signal conflicts)  
❌ **Don't** delete `macd_bot_state.json` (loses crossover alert history)  

---

## Support

**Issue: Bot keeps crashing**
1. Check logs: `pm2 logs fortress-bot`
2. Look for error message (e.g., "ModuleNotFoundError", "Missing env var")
3. Run health check: `python bot/healthcheck.py`
4. Restart: `pm2 restart fortress-bot --update-env`

**Issue: No signals in Momentum Radar**
1. Is it market hours? (9:15-15:30 IST, Mon-Fri)
2. Is bot running? (`pm2 status`)
3. Did bot scan recently? (`pm2 logs fortress-bot`)
4. Are there signals in DB? `psql -d fortress -c "SELECT COUNT(*) FROM macd_signals;"`

**Issue: Admin page shows "Stale"**
- Bot hasn't pushed data in >20 minutes during market hours
- Check logs: `pm2 logs fortress-bot --lines 50`
- Verify Fortress API is reachable: `curl https://fortressintelligence.space/api/analysis/momentum-signals`

---

## Success Criteria

✅ All steps 1-10 complete without errors  
✅ Bot process shows `online` in PM2 status  
✅ Logs show successful scan (or idle if after hours)  
✅ Momentum Radar page loads  
✅ Admin panel accessible and shows bot status  
✅ No errors in Fortress app logs  

**If all checkmarks are green, deployment is successful!** 🎉
