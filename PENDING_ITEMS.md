# 🏰 FORTRESS INTELLIGENCE — PENDING ITEMS & ROADMAP

**Status:** 🟢 Core features live + real data scoring | Phase 2 expansion scoped  
**Last Updated:** July 20, 2026 (Session 21)  
**Current Phase:** Phase 5 (Real Data Scoring) Complete → Phase 2 Expansion (Smallcap 250 + Russell 2000) Scoped

---

## ✅ SESSION 21 COMPLETE — Real Data Scoring LIVE

### Fixed: Mock Data Crisis
- ✅ Replaced Massive-only scorer (US-only, no NSE) with `yahoo-finance2` (free, both markets)
- ✅ Removed `MASSIVE_API_KEY` dependency entirely
- ✅ Created `lib/scanners/yahoo-technical-scorer.ts` (portable, market-aware `.NS` suffix)
- ✅ Deployed to VPS: NSE 501 scanned → 480 rated, US 503 scanned → 501 rated
- ✅ Verified live: Distinct real prices (APOLLOHOSP ₹8,905, BPCL ₹317.6, etc.), not synthetic
- ✅ Commit: 8e3e1410

### Confirmed Stable
- Both markets compute REAL technical scores (RSI, SMA20/50/200, 90-day proximity, volume trend)
- Fortress 30 rankings are no longer placeholder data
- Sequential 150ms/ticker throttle works for ~500-ticker universe (~10-15 min per scan)

---

## 🔄 CURRENT STATE — What We Scan

| Market | Universe | Count | Status | Notes |
|---|---|---|---|---|
| **NSE** | Nifty 500 | ~500 | ✅ Live | Static CSV (Wayback Machine snapshot, needs refresh ~6mo) |
| **US** | S&P 500 | ~503 | ✅ Live | Dynamic CSV feed (free, reachable from VPS) |
| **NOT YET** | Nifty Smallcap 250 | ~250 | 🟡 Scoped Phase 2 | Requires concurrent fetching |
| **NOT YET** | Russell 2000 | ~2,000 | 🟡 Scoped Phase 2 | Requires concurrent fetching |
| **NOT YET** | Full NSE+BSE | ~2,781 | 🔴 Phase 3+ | Too large for current sequential model |
| **NOT YET** | Full US | ~5,400+ | 🔴 Phase 3+ | Too large for current sequential model |

---

## 🚀 PHASE 2 EXPANSION — SCOPED (Do NOT implement yet)

**Objective:** Expand scanner universe to mid-cap + small-cap tickers (~1,500 additional)  
**Rationale:** Fortress 30's thesis is "hidden gems disproportionately in mid/small-cap space"  
**Timeline:** Aug-Sep 2026 (after 1-week observation of current stability)

### What Changes
1. **Universe expansion:**
   - Add Nifty Smallcap 250 CSV feed (~250 tickers)
   - Add Russell 2000 CSV feed (~2,000 tickers)
   - Total: ~3,000 new tickers to score (vs. 1,000 today)

2. **Scorer upgrade (REQUIRED for performance):**
   - Upgrade from sequential (150ms/ticker) to concurrent batch fetching (10-20 in flight)
   - Add exponential backoff on 429 rate-limit errors (yahoo-finance2 is unofficial scraper)
   - Parallel fetching: ~5 min total (vs. 25+ min sequential)

3. **Scan frequency trade-off:**
   - NSE + US: Continue twice-daily (already ~15 min total)
   - Smallcap + Russell 2000: Once-daily (too large for twice-daily)
   - OR: Separate slow-update scan, cached for 24h

### Effort & Risk

| Task | Effort | Risk | Notes |
|---|---|---|---|
| Fetch smallcap + Russell CSV | 2 hrs | Low | Same pattern as S&P 500 |
| Implement concurrent scorer | 8-12 hrs | Medium | Need proper backoff logic, test rate limits |
| Update cron schedule | 1 hr | Low | Add a third scheduled scan |
| Rate-limit testing | 4 hrs | Medium | Yahoo-finance2 unknown limit; test in staging |
| Monitor for 1 week | N/A | Medium | Watch for silent throttling |

**Total effort:** 15-20 hours  
**Blocking:** None — can be done anytime after Phase 5 stabilizes

### When to Start
✅ After 1-week observation (watch for stability issues, rate-limit hits)  
✅ Once confirmed: no regressions, consistent scoring, cron runs on schedule  
❌ Do NOT start before 1 week of stability

---

## 🔄 ONGOING — Phase 5 Observation Period (NEXT 1 WEEK)

**What to watch:**
- Do both scans (NSE + US) complete on schedule? (11:00 UTC + 09:00 UTC weekdays)
- Any silent rate-limit hits? (check `/api/analysis/gem-score` logs for yfinance errors)
- Fortress 30 rankings stable day-to-day? (or wild swings in scores?)
- PM2 memory growth or crashes? (yahoo-finance2 is more memory-intensive than Massive API calls)

**If problems appear:**
- Increase per-ticker delay (150ms → 200ms)
- Add jitter to delay (random ±50ms)
- Reduce batch size if/when Phase 2 implements concurrency
- Switch to Financial Modeling Prep or Alpha Vantage free tier (backup API)

---

## ✅ PHASE 2X (Parallel) — Macro Snapshot Data Fetcher COMPLETE

**Objective:** Populate the empty Macro Snapshot page with weekly market context (indices, currency, commodities, risk gauges)  
**Status:** ✅ IMPLEMENTED & SCHEDULED  
**Timeline:** Anytime (independent of Phase 2)  
**Effort:** 2 hours (lazy Node.js inline approach vs. 4-6 Python subprocess)

### What's Built ✅
- ✅ UI page at `/macro` (ready to display fetched data)
- ✅ API endpoint `POST /api/macro` (accepts direct JSON + x-cron-secret header) — refactored to accept direct POST instead of subprocess
- ✅ Database table `macroSnapshots` (stores weekly snapshots with upsert on date)
- ✅ Fetcher logic inlined into `cron-scheduler.js` (no subprocess needed)
- ✅ Weekly cron schedule (every Sunday 12:00 UTC / 5:30 PM IST)

### Implementation Details
1. **Lazy approach:** Added `fetchYahooPrice()` + `runMacroSnapshot()` to `cron-scheduler.js`
   - Uses Yahoo Finance free API (same as rest of app)
   - Parallel fetches (Promise.all could be used, but sequential is fine for 8 metrics)
   - Graceful null handling (missing data → null in DB)

2. **Cron schedule added:** Sunday 12:00 UTC (`0 12 * * 0`)
   - Follows same pattern as NSE/US scans
   - Includes x-cron-secret validation

3. **Endpoint refactored:** `app/api/macro/route.ts`
   - Removed subprocess spawning (unnecessary complexity)
   - Now accepts direct JSON POST body
   - Upserts to DB by `snapshot_date` (prevents duplicates)
   - Returns 201 on success

### Data Format
```json
{
  "snapshot_date": "2026-07-21",
  "nifty_50": 24500.25,
  "bank_nifty": 52300.50,
  "usd_inr": 83.45,
  "gold_usd": 2350.75,
  "crude_oil_usd": 78.50,
  "us_10y_yield": 4.15,
  "cboe_vix": 14.5,
  "india_vix": 16.2
}
```

### Ponytail Principles Applied ✅
- **Think Before Coding:** Understood existing setup (cron-scheduler pattern, endpoint expectations)
- **Simplicity First:** Inlined fetcher into Node.js (no Python subprocess, no new dependencies)
- **Surgical Changes:** 2 files (cron-scheduler.js, macro/route.ts), ~60 LOC added
- **Goal-Driven:** /macro page now has scheduled weekly data feed

### Next Steps
- Deploy with `npm run build && pm2 restart all`
- Monitor first Sunday run (July 27) for any fetch failures
- If Yahoo Finance hits rate limits, add retry logic or switch to alternative (Alpha Vantage, FMP)

---

## ⏳ FUTURE PHASES (DO NOT START YET)

### Phase 3: Learning Engine & Personalization (Aug-Sep 2026)
**Status:** 🔴 Not started  
**Effort:** 40-60 hours

1. Track user trade feedback (buy/skip/loss actions already logged)
2. Analyze win rate by GEM SCORE range
3. Adjust allocation presets based on learnings
4. A/B test allocations vs. benchmarks

**Blocker:** None (Phase 4.0 trade persistence ready)

---

### Phase 4: Analytics & Real-Time Alerts (Sep 2026)
**Status:** 🔴 Not started  
**Effort:** 30-40 hours

1. Performance dashboard (returns vs. benchmarks, drawdown analysis)
2. Drift alerts (rebalance when >5%)
3. Price move notifications (±10%)
4. Portfolio beta + sector concentration warnings

**Blocker:** None

---

### Phase 3+: Full Listed Universe (Oct 2026+)
**Status:** 🔴 Not started  
**Effort:** 50+ hours

**DO NOT START UNTIL Phase 2 (smallcap expansion) is stable for 2+ weeks.**

1. Separate scraper tier (async job queue, not cron)
2. Local caching + fallback to previous scan on rate limit
3. Slow-update scan (weekly or daily, not twice-daily)
4. Fallback data source (FMP, Alpha Vantage, Finnhub)

**Reason:** Full universe is 7,500+ tickers — sequential at 150ms/ticker = 18+ hours. Even with concurrency, needs infrastructure to handle partial failures gracefully.

---

## 🛠️ INFRASTRUCTURE TASKS (ONGOING)

### Monitoring & Health
- ✅ Postgres auto-restart on crash (systemd override.conf, Session 20)
- ✅ Last-scan timestamps on UI (shows staleness immediately)
- ✅ Distinct DB-outage banner (vs. "scan hasn't run yet")
- 🟡 External uptime monitoring (UptimeRobot pinging `/api/scan/results`)
- 🟡 Slow-query logging (identify DB bottlenecks)
- 🟡 Rate-limit tracking (log every 429 from yfinance, alert if >5% of scans)

### Deployment & Validation
- ✅ DEPLOYMENT_AUDIT.md with 6 critical post-deploy checks (all passing)
- ✅ Env-sync automation (`cp .env.production .next/standalone/.env.production` on deploy)
- 🟡 Automated backups (PostgreSQL daily snapshots to S3)
- 🟡 Schema version tracking (auto-detect schema drift)

---

## 📋 QUICK REFERENCE — What NOT to Do (Yet)

❌ **Expand to 7,500+ NSE+BSE or 5,400+ US** — that's Phase 3+, needs concurrency + fallback layer  
❌ **Add more scoring indicators** (MACD, Bollinger Bands) — Phase 4, after Phase 2 stabilizes  
❌ **Implement learning engine** — Phase 3, after Phase 5 observation complete  
❌ **Switch data sources** (Massive, FMP, Alpha Vantage) — don't; yahoo-finance2 is free and working  
❌ **Increase scan frequency** — stay 2x/day; any faster risks rate-limit hitting  
✅ **Macro Snapshot fetcher (Phase 2X)** — Low priority, can start anytime (independent, 4-6 hrs)  

---

## ✅ WHAT IS READY NOW (If needed)

✅ **Phase 2 micro-task:** Grab the Nifty Smallcap 250 CSV from any public source (5 min)  
✅ **Phase 2 micro-task:** Grab the Russell 2000 CSV from any public source (5 min)  
✅ **Phase 2 micro-task:** Concurrent scorer POC (test 10-ticker batch with 100ms jitter, 2 hrs)  
✅ **Phase 2X micro-task:** Macro Snapshot fetcher (implement scanner/macro_fetcher.py, 4-6 hrs) — independent of Phase 2, can start anytime  

---

## 🎯 SESSION 21 SUMMARY

| Item | Status | Notes |
|---|---|---|
| Real data scoring | ✅ DONE | yahoo-finance2 live, Massive removed |
| NSE + US scans | ✅ DONE | 480 + 501 real ratings per run |
| Fortress 30 rankings | ✅ REAL | No more synthetic data |
| 1-week stability watch | 🟡 ACTIVE | Monitor until ~July 27 |
| Phase 2 concurrency | 🟡 SCOPED | Start after stability confirmed |
| Phase 2X (Macro fetcher) | 🔴 GAP FOUND | Endpoint built, Python script missing; added to backlog |
| Phase 3+ (full universe) | 🔴 NOT YET | Blocked on Phase 2 completion |

---

**Owner:** Bharat Samant  
**Next Review:** ~July 27, 2026 (post-observation decision: proceed with Phase 2?)
