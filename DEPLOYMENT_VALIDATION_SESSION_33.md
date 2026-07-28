# Session 33 Deployment Validation

**Date:** July 29, 2026  
**Commit:** `2a966707` (feat: feedback loop infrastructure)  
**Status:** ✅ **READY FOR PRODUCTION**

---

## Pre-Deployment Checklist

- [x] TypeScript compiles clean (zero errors)
- [x] No breaking changes (all features additive)
- [x] Database migration is idempotent (safe to rerun)
- [x] API endpoints use existing auth middleware
- [x] UI components are fully functional
- [x] All files committed to main branch
- [x] Git push to origin/main successful

---

## VPS Deployment Steps

### 1. Connect to VPS
```bash
ssh root@76.13.179.32
```

### 2. Navigate and Pull Code
```bash
cd /opt/fortress
git pull origin main
```

**Expected output:**
```
Updating 7dd64466..2a966707
Fast-forward
 MOMENTUM_RADAR_BACKLOG.md                   | 186 +++
 AI_HANDOVER.html                            | 64 ++++
 app/api/momentum/user-action/route.ts       | 84 +++
 app/momentum-radar/page.tsx                 | 45 ++
 components/LogTradeModal.tsx                | 140 +++
 drizzle/migrations/add_bot_user_actions.sql | 23 ++
 lib/db/schema/bot-actions.ts                | 28 ++
 7 files changed, 570 insertions(+)
```

### 3. Build Next.js App
```bash
npm run build
```

**Expected output:**
```
✓ Compiled successfully in ~10-15s
✓ Checking validity of types...
```

⚠️ **NOTE:** Pre-existing build warning about missing `/admin/stocks` page is normal (unrelated to this deployment).

### 4. Create Database Table
```bash
npm run drizzle:push
```

**Expected output:**
```
drizzle-kit: Pulling schema from database...
drizzle-kit: Detected schema changes...
drizzle-kit: Applying migrations...
Applied 1 migration.
```

**Verify table was created:**
```bash
psql -d fortress -c "SELECT COUNT(*) FROM bot_user_actions;"
```

Expected: `(1 row) count: 0` (table exists, empty)

### 5. Restart PM2 Processes
```bash
pm2 restart all --update-env
```

**Expected output:**
```
[PM2] Restarting all apps...
[PM2] App [fortress-app] restarted
[PM2] App [fortress-cron] restarted
[PM2] App [fortress-bot] restarted
```

### 6. Verify Deployment
```bash
# Check all processes are online
pm2 status

# Check app logs (should have no errors)
pm2 logs fortress-app --lines 10

# Health check
curl -s http://localhost:3000 | head -20
```

---

## Post-Deployment Validation (Manual)

### Test 1: Access Momentum Radar
1. Open https://fortressintelligence.space/momentum-radar
2. Should display signals table (or "No active crossovers" if market closed)
3. Each signal row should have a "Log Trade" button

### Test 2: Log a Trade
1. Click any "Log Trade" button
2. Modal should open with form fields
3. Select "bought", fill in Qty + Entry Price
4. Click "Log Trade"
5. Modal should close

### Test 3: Verify Database Entry
```bash
psql -d fortress -c "SELECT symbol, action, quantity FROM bot_user_actions ORDER BY created_at DESC LIMIT 1;"
```

Expected output:
```
 symbol | action | quantity
--------+--------+----------
 RELIANCE | bought | 100
(1 row)
```

### Test 4: Verify API
```bash
# As authenticated user, fetch recent trades
curl -s -b "fortress-session=<YOUR_SESSION_COOKIE>" \
  https://fortressintelligence.space/api/momentum/user-action \
  | jq '.data | length'
```

Expected: `1` (or higher if more trades logged)

---

## Rollback Plan (If Issues)

If something goes wrong, rollback is instant:

```bash
# Stop bot (leaves app running)
pm2 stop fortress-bot

# OR revert to previous commit
cd /opt/fortress
git reset --hard 7dd64466
npm run build
pm2 restart all --update-env
```

---

## Success Criteria

✅ **Green Light if ALL of the following are true:**

1. PM2 status shows all 3 processes online
2. Momentum Radar page loads (signals visible or "no active" message)
3. "Log Trade" button appears on each signal
4. Modal opens when clicked
5. Test trade logged to database
6. No errors in `pm2 logs fortress-app`
7. No database connection errors
8. API endpoints respond correctly

---

## Known Limitations (Not Issues)

- Pre-existing build warning about `/admin/stocks` (unrelated)
- User engagement analytics not yet wired (Phase 2 work)
- No auto-calculation of P&L (user enters manually)
- Bot auto-trading stays private to user's laptop

---

## Support

If deployment fails:

1. Check `pm2 logs fortress-app --lines 50` for errors
2. Check database connection: `psql -d fortress -c "SELECT 1"`
3. Verify migrations: `npm run drizzle:status`
4. Check env vars: `pm2 env fortress-app | grep -i momentum`

---

**Deployment Confidence: 🟢 HIGH**

All code changes are additive (no removals), fully tested locally, and follow existing patterns. Zero risk to production.
