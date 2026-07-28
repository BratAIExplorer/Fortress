# MACD Bot Deployment Guide

**Status:** Production-ready for VPS deployment  
**Component:** Momentum Radar backend (read-only display for Fortress users)  
**Architecture:** Python process managed by PM2 (separate from Node.js app)

---

## Architecture Overview

```
VPS /opt/fortress/
├── app/                          (Next.js frontend)
├── lib/db/schema/momentum.ts     (macd_signals table definition)
├── app/api/analysis/momentum-signals/route.ts  (API endpoint — POST receives bot data)
├── bot/                          (NEW — Python bot process)
│   ├── macd_excel_bot.py        (Main scan loop, 5-min cycles)
│   ├── zerodha_client.py        (Broker integration)
│   ├── requirements.txt          (Python dependencies)
│   ├── healthcheck.py            (Pre-deployment verification)
│   ├── macd_bot_state.json       (Runtime state — first run creates this)
│   ├── MACD_Signals.xlsx         (Excel log — first run creates this)
│   └── nifty500_cache.csv        (Symbol cache — first run creates this)
├── ecosystem.config.js           (UPDATED — includes bot PM2 process)
└── .env.production               (UPDATED — includes bot env vars)
```

---

## Deployment Steps (VPS)

### 1. Prepare Environment Variables

Add to `.env.production` on the VPS:

```bash
# Telegram Integration (REQUIRED)
TELEGRAM_BOT_TOKEN=<your-telegram-bot-token>
TELEGRAM_ADMIN_ID=<your-admin-chat-id>

# Fortress API Integration (REQUIRED)
FORTRESS_API_URL=https://fortressintelligence.space/api/analysis/momentum-signals
FORTRESS_CRON_SECRET=<use-same-value-as-CRON_SECRET>

# Zerodha Broker (OPTIONAL — required only for auto-trading)
ZERODHA_API_KEY=<your-api-key>
ZERODHA_API_SECRET=<your-api-secret>
ZERODHA_CLIENT_ID=<your-client-id>
```

### 2. Set Up Python Virtual Environment

SSH into VPS and run:

```bash
cd /opt/fortress

# Create Python venv inside bot directory
python3 -m venv bot/venv

# Activate venv
source bot/venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r bot/requirements.txt

# Deactivate (PM2 will activate it)
deactivate
```

### 3. Verify Database Migration

The bot needs the `macd_signals` table. Check if it exists:

```bash
cd /opt/fortress
npm run drizzle:push
```

If the table already exists, this is safe (idempotent).

### 4. Run Health Check

```bash
cd /opt/fortress/bot
source venv/bin/activate
python healthcheck.py
deactivate
```

Expected output:
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

### 5. Deploy & Start Bot

The bot is already configured in `ecosystem.config.js`. Deploy normally:

```bash
cd /opt/fortress
git pull origin main
npm run build
pm2 restart all --update-env
```

This will:
- Start `fortress-app` (Node.js app on port 3000)
- Start `fortress-cron` (Scanner cron jobs)
- Start `fortress-bot` (Python bot process) ✅ NEW

### 6. Verify Bot is Running

```bash
# Check PM2 process status
pm2 status

# Expected output:
# ┌─────────────────┬─────┬─────────┬──────┬──────┬──────────┐
# │ App name        │ id  │ version │ mode │ pid  │ status   │
# ├─────────────────┼─────┼─────────┼──────┼──────┼──────────┤
# │ fortress-app    │ 0   │ N/A     │ fork │ 1234 │ online   │
# │ fortress-cron   │ 1   │ N/A     │ fork │ 5678 │ online   │
# │ fortress-bot    │ 2   │ N/A     │ fork │ 9012 │ online   │ ✅
# └─────────────────┴─────┴─────────┴──────┴──────┴──────────┘

# Watch bot logs (live)
pm2 logs fortress-bot

# Or read last 50 lines
pm2 logs fortress-bot --lines 50
```

### 7. Monitor Initial Scans

The bot runs every 5 minutes during NSE market hours (9:15 AM - 3:30 PM IST).

Check logs:
```bash
pm2 logs fortress-bot
```

Expected logs during market hours:
```
[fortress-bot] Starting a new scan cycle...
[fortress-bot] Fetching Nifty 500 stock list from NSE...
[fortress-bot] Successfully loaded 500 symbols from NSE and cached them.
[fortress-bot] Fetching live LTP for 500 symbols in parallel...
[fortress-bot] Successfully fetched live LTP for 500/500 symbols.
[fortress-bot] Downloading historical daily data for 500 symbols in chunks of 100...
[fortress-bot] Successfully downloaded history for 500/500 symbols.
[fortress-bot] Analyzing daily stock data...
[fortress-bot] Analyzing weekly stock data...
[fortress-bot] Completed scan. Active: 5. New crossovers: 2.
[fortress-bot] Successfully pushed 5 signals to Fortress Momentum Radar.
```

### 8. Test Momentum Radar Display

Open the app in a browser:
```
https://fortressintelligence.space/momentum-radar
```

You should see:
- "Currently Active Crossovers" table with data
- Symbols, CMP, targets, stop loss, crossover recency
- Auto-updates every 5 minutes (during market hours)

---

## Operational Tasks

### Restart Bot (if needed)

```bash
pm2 restart fortress-bot --update-env
```

### Check Bot Status

```bash
pm2 status fortress-bot
```

### View Bot Logs

```bash
# Last 100 lines
pm2 logs fortress-bot --lines 100

# Watch in real-time
pm2 logs fortress-bot --nostream false
```

### Stop Bot (temporary)

```bash
pm2 stop fortress-bot
```

### Start Bot Again

```bash
pm2 start fortress-bot
```

---

## Troubleshooting

### Bot Crashes Immediately

1. Check logs:
   ```bash
   pm2 logs fortress-bot
   ```

2. Verify env vars are set:
   ```bash
   cat /opt/fortress/.env.production | grep TELEGRAM
   ```

3. Run health check:
   ```bash
   cd /opt/fortress/bot
   source venv/bin/activate
   python healthcheck.py
   ```

### No Signals Appearing in Momentum Radar

1. **During market hours?** The bot only scans 9:15 AM - 3:30 PM IST (Mon-Fri).

2. **Check if bot is running:**
   ```bash
   pm2 status fortress-bot
   ```
   Should show `online`, not `stopped` or `stopped (PM2 stopped)`.

3. **Check bot logs for errors:**
   ```bash
   pm2 logs fortress-bot --lines 50
   ```

4. **Verify database table exists:**
   ```bash
   # On VPS, connect to PostgreSQL
   psql -U postgres -d fortress -c "SELECT COUNT(*) FROM macd_signals;"
   ```

5. **Test API endpoint manually:**
   ```bash
   curl -X GET https://fortressintelligence.space/api/analysis/momentum-signals
   ```
   Should return `{"success":true,"signals":[...]}`.

### Python Dependencies Missing

```bash
cd /opt/fortress
source bot/venv/bin/activate
pip install -r bot/requirements.txt
```

### "No module named kiteconnect" Error

```bash
source bot/venv/bin/activate
pip install kiteconnect==4.1.0
```

---

## Performance & Monitoring

### Scan Cycle Duration

- **Typical:** 4-6 minutes per full cycle (500 stocks, dual timeframe)
- **Includes:** Data fetch, analysis, Excel write, Fortress API POST
- **Frequency:** Every 5 minutes during market hours
- **Next scan:** 1 minute after completion

### Resource Usage

- **CPU:** ~20-30% during scan (4 cores available)
- **Memory:** ~80-120 MB (Python venv is small)
- **Network:** ~5-10 MB per cycle (yfinance historical data)
- **Disk:** ~50 MB (Excel logs + cache)

### Logging

Logs are written to:
- **Bot process:** `/var/log/fortress/bot-out.log` (stdout)
- **Bot errors:** `/var/log/fortress/bot-error.log` (stderr)
- **PM2 process manager:** `/var/log/fortress/.pm2/` (process lifecycle)

---

## Rollback Plan

If bot is causing issues, disable it without affecting Fortress:

```bash
# Stop bot gracefully
pm2 stop fortress-bot

# Check that web app still works
curl http://localhost:3000

# If app is OK, you can safely restart bot later
pm2 restart fortress-bot
```

The bot is **isolated** — stopping it doesn't affect:
- Fortress web app (Node.js)
- Scanner cron jobs (Node.js)
- User authentication
- Portfolio tracker
- Any other features

---

## Post-Deployment Checklist

- [ ] `.env.production` updated with bot env vars
- [ ] Python venv created and dependencies installed
- [ ] Database migration ran (`npm run drizzle:push`)
- [ ] Health check passed (`python healthcheck.py`)
- [ ] PM2 process started (`pm2 restart all`)
- [ ] Bot running (check `pm2 status`)
- [ ] Logs showing successful scans
- [ ] Momentum Radar tab showing live data
- [ ] Browser can access `/momentum-radar` without errors
- [ ] No errors in Fortress app logs

---

## Support

If bot fails:
1. **Check PM2 logs:** `pm2 logs fortress-bot`
2. **Run health check:** `python bot/healthcheck.py`
3. **Restart:** `pm2 restart fortress-bot --update-env`
4. **Investigate:** Check Telegram credentials, network, Python venv

The bot is non-critical to Fortress — web app will continue functioning.
