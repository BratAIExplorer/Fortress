# Scan Data "No Data Yet" Bug — Root Cause & Fix

**Status:** FIXED (Session 27)
**Reported:** Fortress 30 page shows "No India scan data yet" despite database containing scans
**Repeats:** Yes — same root cause triggers on VPS restart or process crash
**Severity:** HIGH — breaks main feature

---

## Root Cause Chain

### Why the Bug Happens

1. **Fortress 30 page calls** `getLiveF30Stocks(30, "NSE")`
2. **That calls** `getBestScan("NSE")` to find the latest scan
3. **Query looks for scans where:**
   - `status = "COMPLETED"`
   - `market = "NSE"`
   - `goodResultsCount >= 25` (MIN_GOOD_RESULTS)
4. **If no such scan exists, returns null**
5. **Page gets empty array** → renders "No India scan data yet"

### Why getBestScan Returns Null

**Root cause #1: CRON_SECRET not set**
- Cron scheduler starts, checks `process.env.CRON_SECRET`
- If undefined: exits with `process.exit(1)` → **cron process dies**
- Next scheduled scan never runs
- Database has no recent scans

**Root cause #2: Cron process crashed silently**
- Cron runs, hits an unexpected error (network down, DB timeout)
- Error not caught → process crashes
- PM2 doesn't auto-restart (depends on config)
- No more scans until manual restart

**Root cause #3: All scans failed**
- Cron ran, but `scoreTicker()` failed for all ~500 tickers
- `goodResultsCount = 0` → falls below MIN_GOOD_RESULTS threshold
- `getBestScan` rejects it and returns null
- Shows empty state even though database has the scan

**Root cause #4: Query too strict**
- Original `getBestScan` only returned scans with `goodResultsCount >= 25`
- If last scan had 20 results (network hiccup), it's rejected
- No fallback → empty state shown
- Better: show degraded data than no data

---

## The Fix (Session 27)

### 1. Cron Resilience

**File:** `cron-scheduler.js`
**Change:** Don't exit if CRON_SECRET missing; log clearly instead

```javascript
// BEFORE: process.exit(1) if CRON_SECRET undefined
// AFTER: log error but keep running; allow manual scans via dashboard
```

**Why:** Ops can still manually trigger scans from dashboard while they fix the env var.

### 2. Defensive Fallback in getBestScan

**File:** `app/actions.ts`
**Change:** Three-tier search strategy

```typescript
// 1. Try high-quality scan (goodResultsCount >= 25)
// 2. Fall back to ANY completed scan (show degraded data)
// 3. Log CRITICAL error if no scans exist (for ops alerts)
```

**Why:** "Degraded scan > no scan" — better to show slightly stale data than empty state.

### 3. Health Check Endpoint

**File:** `app/api/health/scans/route.ts` (NEW)
**Endpoint:** `GET /api/health/scans`

**Returns:**
- `status`: HEALTHY | DEGRADED | CRITICAL
- `message`: human-readable status
- `lastScan`: details for each market
- `diagnostics`: CRON_SECRET set?, scan history

**Why:** Ops can instantly check if scan system is working without guessing.

### 4. Better Logging

**Added to getBestScan:**
- Warns when showing degraded scan (goodResultsCount < 25)
- **CRITICAL error if no scans exist** (triggers ops attention)
- Points to CRON_SECRET as likely culprit

---

## How to Prevent Repeats

### Immediate (Already Done)

1. ✅ Code no longer crashes if CRON_SECRET missing
2. ✅ Shows data even if latest scan is degraded (< 25 results)
3. ✅ Health check endpoint for monitoring

### VPS Deployment Checklist

When deploying to VPS, ensure:

```bash
# 1. Set CRON_SECRET in .env.production
CRON_SECRET="some-random-value-here"

# 2. Start cron-scheduler via PM2
pm2 start cron-scheduler.js --name fortress-cron

# 3. Verify it's running
pm2 status

# 4. Check health endpoint
curl https://fortressintelligence.space/api/health/scans
# Should return { status: "HEALTHY", ... }
```

### Monitoring (Recommended)

Add a cron job that **monitors** the scan health:

```bash
# Run every 6 hours to alert if scans stopped
0 */6 * * * curl -f https://fortressintelligence.space/api/health/scans || send_alert
```

---

## Testing the Fix

### Test 1: Verify fallback works

```bash
# Connect to production DB
psql -h <host> fortress

# Check scans exist
SELECT id, market, status, goodResultsCount, runAt
  FROM scans
  WHERE market = 'NSE'
  ORDER BY runAt DESC
  LIMIT 5;

# If goodResultsCount < 25, Fortress 30 should still show data
# (It now falls back to showing degraded scan)
```

### Test 2: Simulate cron crash

```bash
# Stop cron process
pm2 stop fortress-cron

# Visit /fortress-30?market=NSE
# Should still show last scan (degraded status in logs)

# Restart cron
pm2 start cron-scheduler.js --name fortress-cron

# Next scan should run at scheduled time
```

### Test 3: Health check

```bash
# Should return HEALTHY when cron is running
curl https://fortressintelligence.space/api/health/scans | jq .status
# "HEALTHY"

# Stop cron, wait 30 min, check again
pm2 stop fortress-cron
# After 30 min:
curl https://fortressintelligence.space/api/health/scans | jq .status
# "DEGRADED" (if no new scans)
```

---

## Why This Bug Was Repeated

1. **Root cause not documented** — when it happened, no one knew WHY
2. **Silent failures** — cron exited; no one noticed
3. **No observability** — no way to check if scans were running
4. **Too-strict query** — rejected any degraded scan, even if better than nothing

The fix addresses all four:
- ✅ Documented (this file)
- ✅ Loud failures (logs point to CRON_SECRET)
- ✅ Observability (health check endpoint)
- ✅ Graceful degradation (show any completed scan)

---

## Code Changes Summary

| File | Change | Principle |
|------|--------|-----------|
| `cron-scheduler.js` | Don't exit on missing CRON_SECRET | Resilience |
| `app/actions.ts` | Fallback to ANY completed scan | Simplicity |
| `app/api/health/scans/route.ts` | New endpoint for monitoring | Observability |

**Total:** 3 changes, ~150 LOC, zero breaking changes.

---

## Next Steps

1. **Deploy to VPS** → verify `/api/health/scans` shows HEALTHY
2. **Monitor** → check health endpoint weekly
3. **Alert** → if status = CRITICAL, restart cron-scheduler
4. **Phase 2** (optional): Auto-restart cron on exit via PM2 config

---

**Fix applied:** Session 27 (July 22, 2026)
**Test plan:** Manual verification via health endpoint + Fortress 30 page
**Build status:** ✓ 14.2s, zero errors
