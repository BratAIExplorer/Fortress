# Scanner Cron Jobs Setup Guide

## Problem
Fortress 30 pages showed "No scan data yet" because the scanner cron jobs were never set up on the VPS.

## Solution
**PM2-managed Node.js cron scheduler** that automatically runs NSE and US scans on schedule.

## What Changed

### Files Added
- `cron-scheduler.js` — Node.js cron scheduler (PM2 process)
- `.env.example` — Environment variable template

### Files Modified
- `package.json` — Added `node-cron` dependency
- `ecosystem.config.js` — Added `fortress-cron` PM2 process

## Deployment Steps

### Step 1: Local Development (Test)
```bash
npm install
npm run build
# Copy .env.example to .env.local and fill in CRON_SECRET
cp .env.example .env.local
# Edit .env.local and set:
# CRON_SECRET=your-generated-secret (use: openssl rand -base64 32)
# MASSIVE_API_KEY=your-api-key (or "test_key" for local testing)

# Start both app and cron scheduler
pm2 start ecosystem.config.js
pm2 logs fortress-cron  # watch cron logs
```

### Step 2: VPS Deployment
SSH to VPS and run:

```bash
cd /opt/fortress

# Pull latest code
git pull origin main

# Install new dependency
npm install

# Rebuild app
npm run build

# Verify CRON_SECRET is set in VPS environment
# Check: env | grep CRON_SECRET
# If missing, add to /opt/fortress/.env.production or systemd service

# Restart both processes
pm2 restart all --update-env

# Verify both are online
pm2 list
# Output should show:
# ✓ fortress-app (running)
# ✓ fortress-cron (running)

# Watch logs to confirm cron is active
pm2 logs fortress-cron
```

## Scanner Schedule

| Market | Day | Time UTC | Time IST | Cron |
|--------|-----|----------|----------|------|
| **US** | Mon-Fri | 09:00 | 2:30 PM | `0 9 * * 1-5` |
| **NSE** | Mon-Fri | 11:00 | 4:30 PM | `0 11 * * 1-5` |

**Note:** Both IST times are approximate (depends on DST). Cron is always UTC-based.

## Environment Variables Required

**CRON_SECRET** (required)
- Used to authenticate cron requests to scanner API
- Generate: `openssl rand -base64 32`
- Set in: `.env.production` or systemd environment

**MASSIVE_API_KEY** (required for real scoring)
- API key for Massive Market Data service
- If not set or empty, scanner uses sample/mock data
- Set in: `.env.production`

**SCANNER_BASE_URL** (optional)
- Default: `http://localhost:3000`
- Use if scanner needs to reach a different URL

## How It Works

1. PM2 starts `fortress-cron` process (runs `cron-scheduler.js`)
2. Node-cron library checks schedules every minute
3. At scheduled times (9:00 and 11:00 UTC weekdays), cron makes HTTP POST to:
   - `POST /api/scan/run?market=US` (or NSE)
   - Includes `x-cron-secret` header with CRON_SECRET
4. Scanner API validates secret, then runs in background
5. Results written to database, appear on Fortress 30 pages

## Testing

### Manual Trigger (Local)
```bash
# Trigger US scan manually
curl -X POST http://localhost:3000/api/scan/run \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: your-cron-secret" \
  -d '{"market":"US"}'

# Response (202 = accepted, scan running in background)
# {"scanId":"...", "status":"ACCEPTED"}
```

### Watch Database
```bash
# Connect to VPS PostgreSQL and watch scan progress
psql $DATABASE_URL -c "SELECT * FROM scans ORDER BY run_at DESC LIMIT 5;"
```

### Check PM2 Logs
```bash
# Local dev
pm2 logs fortress-cron

# VPS (via SSH)
pm2 logs fortress-cron --lines 50
```

## Troubleshooting

**"No scan data yet" still appears after deployment**
- Check CRON_SECRET is set: `env | grep CRON_SECRET`
- Verify scheduler is running: `pm2 list | grep fortress-cron`
- Watch logs: `pm2 logs fortress-cron --lines 20`
- Check if API is reachable: `curl http://localhost:3000/health` (or any page)

**Cron job ran but no results in database**
- Check MASSIVE_API_KEY is set (or set to "test_key" for sample data)
- Check scanner logs: `pm2 logs fortress-app --lines 100 | grep -i "scan\|error"`
- Verify database connection: `npm run db:validate`

**"CRON_SECRET not configured" message in logs**
- Add CRON_SECRET to `.env.production`
- Restart: `pm2 restart fortress-cron --update-env`

## Rollback

If cron causes issues:
```bash
pm2 delete fortress-cron
pm2 save
# App continues running, but scanners won't auto-run
# You can still trigger manually via admin UI
```

## Next Steps

1. **Deploy** to VPS (follow Step 2 above)
2. **Wait** for next scheduled scan (9:00 or 11:00 UTC weekday)
3. **Verify** Fortress 30 pages show data (no longer "No scan data yet")
4. **Monitor** logs weekly to ensure scans keep running
