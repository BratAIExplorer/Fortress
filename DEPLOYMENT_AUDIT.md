# Deployment Audit Checklist

**Purpose:** Prevent configuration bugs BEFORE they reach production. Run this immediately after each deployment.

---

## Pre-Deployment (Local)

- [ ] **Env vars complete:** `cp .env.example .env.local && diff .env.example .env.local`
  - All required vars present? (DATABASE_URL, CRON_SECRET, MASSIVE_API_KEY, etc.)
  
- [ ] **Build passes:** `npm run build` succeeds with 0 errors
  
- [ ] **Cron scheduler starts:** `CRON_SECRET=test node cron-scheduler.js` runs without crashing
  
- [ ] **No hardcoded secrets:** `grep -r "sk-\|pk-\|secret\|password" --exclude-dir=node_modules app lib` returns nothing

---

## Post-Deployment (VPS)

### 1. Process Status
```bash
pm2 list
# ✅ BOTH processes should be "online":
#    - fortress-app   (port 3000)
#    - fortress-cron  (CRON_SECRET loaded)
```

### 2. Environment Variables
```bash
# ✅ All required vars present
grep -E "^(DATABASE_URL|CRON_SECRET|MASSIVE_API_KEY|NODE_ENV)" /opt/fortress/.env.production

# ✅ Each var has a value (not empty)
grep "=" /opt/fortress/.env.production | grep -v "^#" | awk -F= '{if ($2=="") print "EMPTY: "$1}'
```

### 3. Cron Scheduler Status
```bash
# ✅ Should show "Loaded CRON_SECRET" and "started" (not ERROR)
pm2 logs fortress-cron --lines 5 | grep -E "Loaded|started|ERROR"
```

### 4. Network Connectivity
```bash
# ✅ App responds
curl -s https://fortressintelligence.space | grep -q "Fortress" && echo "✅ App live"

# ✅ API responds
curl -s https://fortressintelligence.space/api/scan/run -X GET | grep -q "error\|scanId" && echo "✅ API live"
```

### 5. Database Connectivity
```bash
# ✅ Check if app can query database (run from app container/environment)
npm run db:validate

# ✅ CRITICAL: Check PostgreSQL service is enabled to auto-start
systemctl is-enabled postgresql
# Should output: "enabled"
# If "disabled", run: systemctl enable postgresql
```

### 6. Cron Schedule Verification
```bash
# ✅ Verify cron times are correct
pm2 logs fortress-cron | grep -E "NSE|US" | head -3
# Should show:
#   NSE: Mon-Fri 11:00 UTC (4:30 AM IST)
#   US:  Mon-Fri 09:00 UTC (2:30 PM IST)
```

---

## Common Failures & Fixes

| Failure | Cause | Fix |
|---------|-------|-----|
| `fortress-cron waiting...` | Process crashed | `pm2 logs fortress-cron --err \| tail -20` to diagnose |
| `CRON_SECRET not set` | Env var missing | Add to `.env.production`: `echo 'CRON_SECRET=...' >> .env.production` |
| `Connection refused` | Database down | Check: `systemctl status postgresql` on VPS |
| `No United States scan data yet` | No scans run yet | ✅ Expected (Mon-Fri only). Wait until next scan time. |
| Nginx 502 Bad Gateway | Port mismatch | Verify: `netstat -tln \| grep 3000` shows app listening |

---

## When to Run

**Mandatory:**
- ✅ After every `git push` to main (CI/CD deployment)
- ✅ After manual VPS changes (env var updates, restarts)
- ✅ After any configuration file changes (.env, ecosystem.config.js, nginx.conf)

**Optional but recommended:**
- Every Monday before expected scan time
- Weekly health check (Friday)

---

## How to Use

```bash
# Save this to ~/deployment-check.sh on VPS
bash ~/deployment-check.sh

# Or run manually:
cd /opt/fortress

# Check all required vars are set
grep "^CRON_SECRET=" .env.production || echo "❌ CRON_SECRET missing"
grep "^DATABASE_URL=" .env.production || echo "❌ DATABASE_URL missing"

# Check both processes online
pm2 list | grep "online" | wc -l
# Should be: 2 (fortress-app + fortress-cron)
```

---

## What This Prevents

| Bug | Caught By |
|-----|-----------|
| Missing CRON_SECRET | Env var check #2 |
| Port mismatch (3001 vs 3000) | Network connectivity test #4 |
| Cron process crashed | Process status check #1 |
| Database connection broken | DB connectivity check #5 |
| Scans scheduled incorrectly | Cron schedule verification #6 |

---

**Last Updated:** July 19, 2026  
**Status:** Critical for preventing deployment bugs

