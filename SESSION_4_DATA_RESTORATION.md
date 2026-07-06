# Session 4: Data Pipeline Restoration (July 6, 2026)

## TL;DR

**Problem:** Fortress 30 showed "No scan data yet" because the database schema was never applied to the VPS.

**Root Cause:** CI/CD pipeline was missing the `npm run drizzle:push` step to create tables.

**Fix:** Added drizzle-kit + database migration to the deployment pipeline. GitHub Actions is now deploying with the fix.

**Result:** When deployment completes, Fortress 30 will be populated with scan data.

---

## The Bug (Holistic View)

### Why Did This Happen?

1. **May–June:** Scan schema defined in code (`lib/db/schema.ts`) but never applied to VPS database
2. **July 5:** VPS refactor changed deployment paths but forgot migrations
3. **July 6:** Code validated ✅, but database was never created ❌

### Why Was It Recurring?

- **June 16:** Fixed the UI symptom (Fortress 30 redesign) but not the root cause
- **July 6:** Full app restoration validated code compiles but skipped database checks
- **Today:** Same symptom resurfaces because the data source was never fixed

---

## The Fix

### What Changed

Three files updated, one new file created:

| File | Change |
|------|--------|
| `package.json` | Added `drizzle-kit` dependency + npm scripts |
| `drizzle.config.ts` | NEW — Configure schema paths, database connection |
| `.github/workflows/deploy.yml` | Fixed VPS path, added `npm run drizzle:push` step |
| `tsconfig.json` | Excluded drizzle config from TypeScript build |

### Key Changes in deploy.yml

**BEFORE (broken):**
```bash
cd $VPS_APP_DIR/$VPS_APP_NAME  # /opt/fortress/fortress-app (doesn't exist)
# No migration step
```

**AFTER (fixed):**
```bash
cd /opt/fortress  # Correct path
npm run drizzle:push  # Create schema in database
```

---

## Deployment Status

**Commit:** `46c5a2d`  
**Pushed:** ✅ to main  
**GitHub Actions:** 🟡 In progress  

When it finishes:
1. Code is pulled to VPS
2. `npm run drizzle:push` runs → tables created in PostgreSQL
3. PM2 restarts app
4. Fortress 30 can now retrieve scan data

---

## What Happens Next

### For Session 5 (Validation)

```bash
# On VPS, verify schema was created:
psql -d fortress -c "\dt scans"
psql -d fortress -c "\dt scan_results"

# Should show: scans, scan_results tables

# Seed sample data (SQL provided):
psql -d fortress < /path/to/seed-scans-simple.sql

# Verify Fortress 30 now shows data:
curl https://fortressintelligence.space/fortress-30
```

### The Full App Deployment Flow

1. GitHub Actions finishes this deployment
2. Next, the full Next.js app will be deployed (currently running minimal fallback)
3. All routes (Investment Genie, Portfolio, etc.) will be live
4. Scanner cron jobs can now write data to the tables

---

## Key Learnings (4 Principles Applied)

### 1. Think Before Coding
- Didn't immediately fix the UI
- Traced the database flow end-to-end
- Found the real problem: schema wasn't created

### 2. Simplicity First
- Added only what was missing: drizzle-kit + 1 config file
- No over-engineering
- No "let's redesign the entire schema" — just apply what's already defined

### 3. Surgical Changes
- One commit fixes the root cause
- No symptom patching or UI changes
- Clean diff: migrations + config

### 4. Goal-Driven Execution
- Goal: Get scan data visible in Fortress 30
- Removed the one blocker: missing schema migration
- Clear success metric: Fortress 30 shows 30+ stocks

---

## Files to Seed Data (After Deployment)

See: `scratchpad/seed-scans-simple.sql`

This script creates:
- 1 NSE scan with 10 sample Indian stocks
- 1 US scan with 10 sample US stocks

Run after `npm run drizzle:push` completes on VPS to see data immediately.

---

## Commit Message

```
fix: restore scan data pipeline - add drizzle migrations to CI/CD

- Add drizzle-kit for database schema management
- Fix CI/CD deployment path (was /opt/fortress/fortress-app, should be /opt/fortress)
- Add 'npm run drizzle:push' to deployment pipeline to apply schema to production DB
- Configure drizzle.config.ts with PostgreSQL driver and connection pooling
- Exclude drizzle config from TypeScript build to prevent type conflicts

ROOT CAUSE: Previous sessions validated code compilation but never ran database 
migrations. The scans table schema existed locally but was never applied to the VPS 
database, causing all scan data to be invisible.

This fix ensures:
1. Schema is created on VPS during deployment
2. Fortress 30 can retrieve scan data
3. Scanner cron jobs can write to scans and scanResults tables
```

---

## Next Steps

- [ ] Wait for GitHub Actions to complete
- [ ] SSH to VPS and verify tables were created: `psql -d fortress -c "\dt"`
- [ ] Run seed SQL to populate sample data
- [ ] Visit Fortress 30 and verify data displays
- [ ] Monitor PM2 logs for errors: `pm2 logs fortress`

**Status:** 🟡 Deployment in progress — Check GitHub Actions for completion
