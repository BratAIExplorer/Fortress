# Missing Scanner Engine — Root Cause Analysis

**Status:** 🔴 BLOCKER — Fortress 30 shows "no scan data" (both India & US)  
**Root Cause:** Scanner Python engine not deployed  
**Severity:** HIGH — Breaks core feature (stock listing)  
**Date Identified:** July 6, 2026  
**Commit:** 9a84974 (workaround added)

---

## The Issue

**Symptom:**
- Fortress 30 page shows "No India scan data yet" / "No US scan data yet"
- Both market tabs empty
- No stocks display in grid

**Root Cause:**
The scan API at `app/api/scan/run/route.ts` (line 62) tries to spawn a Python process:

```typescript
const pythonBin = process.env.PYTHON_BIN ?? ".venv/bin/python3";
const pythonProcess = spawn(pythonBin, pythonArgs);
```

It expects to run: `scanner/engine.py --market NSE --weights {...}`

**But the scanner doesn't exist:**
```
scanner/
├── engine.py  ❌ MISSING
├── utils.py   ❌ MISSING
└── .venv/     ❌ MISSING
```

**Without the scanner:**
1. Spawn fails
2. No JSON events returned from Python
3. No scan_results inserted into DB
4. Fortress 30 has no data to display

---

## Why It's Missing

From git history:
- Session 5 (July 5): `.turbopackignore` added to ignore `fortress-scanner/` (symlink issue)
- Session 4: App built from root with minimal dependencies
- May: Original fortress-scanner was a nested git submodule, caused Turbopack errors

**Decision:** Nested scanner was excluded to fix CI/CD, but replacement scanner.py was never created.

---

## Impact

| Feature | Status | Why |
|---------|--------|-----|
| Fortress 30 | 🔴 Broken | No scan data |
| Investment Genie | ✅ Works | Doesn't depend on scans |
| Portfolio Tracker | ✅ Works | Uses user-entered data |
| Market Switcher | ✅ Works | Fixed in d927644 |

---

## Workaround (Temporary)

**Created:** `/api/admin/seed-scans` endpoint (commit 9a84974)

### Manual Seed via API

```bash
curl -X POST http://localhost:3000/api/admin/seed-scans
```

Response:
```json
{
  "success": true,
  "message": "Seeded 8 NSE + 8 US stocks",
  "nseScanId": "scan-nse-1720283400000",
  "usScanId": "scan-us-1720283400000"
}
```

### What It Does
- Inserts 1 completed NSE scan + 8 sample stocks (HDFC, INFY, TCS, etc.)
- Inserts 1 completed US scan + 8 sample stocks (AAPL, MSFT, NVDA, etc.)
- All stocks marked as "52W_LOW" category
- All pass L1-L6 filters (guaranteed to show)

### Result
Fortress 30 immediately displays 8 stocks per market (not real scan, but proves UI works).

---

## Real Solution Required

### Option A: Implement Python Scanner (Recommended)

Create `scanner/engine.py` that:
1. Accepts `--market NSE|US` and `--weights {...}` arguments
2. Outputs JSON events to stdout:
   ```json
   {"type": "start", "total": 2000}
   {"type": "progress", "data": {"symbol": "HDFC", "price": 2500, "l1": 75, ...}}
   {"type": "complete", "scanId": "...", "newCount": 150, "droppedCount": 3}
   ```
3. Implements scoring logic (Multi-Bagger, Protection, Momentum, Growth, etc.)
4. Sources data from yfinance or Alpha Vantage

**Effort:** 2-3 days (Python + data sourcing)

### Option B: Use External Scan Data

Replace spawn logic with:
1. Fetch pre-computed scan results from external API
2. Insert directly into scan_results table
3. Mark scan as COMPLETED

**Effort:** 1 day (wrapper + API integration)

### Option C: Use Scheduled Batch Job

Instead of on-demand scanning:
1. Run scans on cron schedule (daily, Mon-Fri)
2. Results written to DB during off-hours
3. API only reads from DB (no spawn)

**Effort:** 1-2 days (PM2 cron + DB write)

---

## Short Term (Next 24 hours)

**For Demo/Testing:**
1. Call `/api/admin/seed-scans` to populate sample data
2. Fortress 30 will display 8 stocks per market
3. All functionality testable (market switcher, filtering, etc.)

**Note:** Data is fake, but UI/UX is fully validable

---

## Long Term (Before Production)

1. **Choose solution** (A, B, or C above)
2. **Implement scanner** with real stock data
3. **Connect to cron** or on-demand trigger
4. **Validate** with real market data
5. **Monitor** scan quality (goodResultsCount >= 25)

---

## Files Affected

```
app/
├── api/
│   ├── scan/
│   │   ├── run/route.ts         ← Expects scanner/engine.py
│   │   └── results/route.ts     ← Reads scan results from DB
│   └── admin/
│       └── seed-scans/route.ts  ← WORKAROUND ENDPOINT (added 9a84974)
└── fortress-30/page.ts          ← Displays data from /api/scan/results
```

---

## Testing with Workaround

1. **Seed data:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/seed-scans
   ```

2. **Verify India scan:**
   ```bash
   curl http://localhost:3000/api/scan/results?market=NSE
   ```
   Expected: 8 stocks (HDFC, INFY, TCS, etc.)

3. **Verify US scan:**
   ```bash
   curl http://localhost:3000/api/scan/results?market=US
   ```
   Expected: 8 stocks (AAPL, MSFT, NVDA, etc.)

4. **View in UI:**
   Navigate to `/fortress-30`
   - Should show 8 stocks for each market
   - Market switcher should work ✅
   - Filtering by MB tier should work ✅

---

## Prevention

For future deployments:
1. **Include scanner in build** (Option A) OR
2. **Mock scanner for dev** (seed endpoint, like this) OR
3. **Use external data source** (Option B) with fallback seeding

---

**Next Action:** Decide on solution (A/B/C) and implement scanner before production launch.
