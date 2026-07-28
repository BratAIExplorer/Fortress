# Momentum Radar Feature Backlog

**Last Updated:** July 29, 2026  
**Status:** Phase 1 Complete (Feedback Loop Infrastructure)  
**Next Phase:** Analytics & User Metrics

---

## ✅ COMPLETED (Phase 1)

### Feedback Loop Infrastructure
- [x] Database table: `bot_user_actions` (captures user decisions)
- [x] API endpoint: `POST /api/momentum/user-action` (log trades)
- [x] API endpoint: `GET /api/momentum/user-action` (retrieve history)
- [x] UI Component: `LogTradeModal` (user action form)
- [x] UI Integration: "Log Trade" buttons on Momentum Radar table
- [x] Database migration: `add_bot_user_actions.sql`
- [x] Auth validation: Trades tied to logged-in user
- [x] Error handling: Input validation + graceful failures

---

## ⏳ PHASE 2: USER ENGAGEMENT METRICS (Next Week)

### Admin Dashboard Enhancement
- [ ] **User Engagement Widget**
  - Active users viewing Momentum Radar (live count)
  - Total page views this month
  - Top signals by view count
  - Conversion rate (viewed → logged action)
  
- **Implementation:** Query `pageViews` + `liveActivity` tables, wire into `/momentum-radar/admin` page
- **Effort:** 2-3 hours
- **Blocks:** Analytics pipeline, performance optimization

### Trade Outcome Tracking
- [ ] **"Update Outcome" Modal**
  - User can mark trade as WIN/LOSS/BREAKEVEN after exit
  - Fetch existing trade from DB, populate form
  - Calculate P&L if prices entered
  - Store outcome + pnl in `bot_user_actions.outcome` and `.pnl`

- **Implementation:** New API `PUT /api/momentum/user-action/:id` + UI component
- **Effort:** 2 hours
- **Blocks:** Performance analytics

### Performance Analytics Dashboard
- [ ] **Win Rate by Signal**
  - Total trades per signal
  - Win/loss count
  - Win rate % (wins / (wins + losses))
  - Average P&L per trade
  
- **Implementation:** New API `GET /api/momentum/analytics?symbol=RELIANCE` + charts
- **Effort:** 3 hours
- **Blocks:** AI learning engine

---

## 🔄 PHASE 3: AI LEARNING ENGINE (Aug 2026)

### Confidence Scoring
- [ ] **Historical Win Rate Per Timeframe**
  - Track which timeframe (Daily/Weekly) has higher accuracy
  - Reweight MACD parameters based on empirical win rate
  
- **Implementation:** Update `bot/macd_excel_bot.py` to read outcome data from Fortress DB
- **Effort:** 4-5 hours
- **Blocks:** Multi-symbol optimization

### Trade Filtering
- [ ] **Skip Low-Confidence Signals**
  - If signal timeframe has <40% historical win rate, suppress alert
  - Only push to Telegram if confidence > threshold
  
- **Implementation:** Query `bot_user_actions` for historical outcomes during scan cycle
- **Effort:** 2 hours

### A/B Testing Framework
- [ ] **Parameter Tuning**
  - Test different MACD periods (12/26/9 vs 10/20/5)
  - Compare win rates across parameter sets
  - Auto-recommend best settings
  
- **Implementation:** Separate scan job runs parallel scans with different parameters
- **Effort:** 6-8 hours

---

## 🛠️ PHASE 4: OPERATIONAL POLISH (Aug-Sep 2026)

### Batch Trade Logging
- [ ] **Import Spreadsheet**
  - User uploads CSV of historical trades
  - Auto-fill `bot_user_actions` in bulk
  - Useful for backtesting old signals
  
- **Implementation:** New API `POST /api/momentum/bulk-import` + UI uploader
- **Effort:** 3 hours

### P&L Tracking History
- [ ] **Daily Performance Summary**
  - Pie chart: Win/Loss/Breakeven trades per day
  - Running total P&L per week
  - Sharpe ratio / Sortino ratio
  
- **Implementation:** Query `bot_user_actions`, aggregate by date
- **Effort:** 3 hours

### Export Reports
- [ ] **CSV/Excel Download**
  - User can export trade history
  - Useful for tax reporting, broker reconciliation
  
- **Implementation:** New API `GET /api/momentum/export?format=csv` + streaming response
- **Effort:** 2 hours

---

## ⚠️ KNOWN GAPS (NOT ADDRESSING YET)

### Bot Integration Gaps
- **Execution Gap:** Bot runs 100% on user's personal laptop (by design)
  - ✅ Read-only Momentum Radar tab shows signals
  - ❌ No way to trigger bot trades from web UI
  - ❌ No way to modify parameters from web UI
  - **Decision:** Keep trading private to user's Zerodha keys (compliance scope issue)
  - **Mitigation:** Admin page shows bot health + credential form (already live)

- **Data Sync Gap:** State stored in `macd_bot_state.json` on bot's disk
  - ✅ Signals pushed to Fortress DB (live table)
  - ❌ Daily P&L/trade history stays on bot's disk
  - **Decision:** Minimal scope, not critical for MVP
  - **Mitigation:** User can view P&L in bot's Excel log

### Scale Limitations
- **Scan Time:** 5-min cycle for 500 stocks (sequential fetch)
  - ❌ Cannot add Smallcap 250 + Russell 2000 without timeout
  - **Phase 2+ Solution:** Concurrent batch fetching (reduce to 2 min)
  - **Effort:** 3-4 hours

- **Rate Limits:** Yahoo Finance ~50 req/min
  - ✅ Safe at current scale (500 stocks in 4-6 min with backoff)
  - ❌ Will hit limits with Phase 2 expansion
  - **Solution:** Implement exponential backoff + local cache

---

## 📊 METRICS TO TRACK

### User Engagement
- Active users on Momentum Radar (daily)
- Trade logging rate (% of signals acted on)
- Average time before user logs trade

### Signal Quality
- Win rate by symbol (best/worst performers)
- Win rate by timeframe (Daily vs Weekly)
- Average holding period
- Correlation with market hours

### System Health
- Bot scan success rate (% of cycles completed)
- API latency (fetch → log → display)
- Error rate on trade logging
- Page load time for Momentum Radar

---

## 🚀 DEPLOYMENT CHECKLIST

### Before Phase 2 Starts
- [ ] Test bot_user_actions table on VPS
- [ ] Verify trade logging in production
- [ ] Monitor for data integrity issues (duplicates, orphans)
- [ ] User manual test: Log 3-5 trades, verify in DB

### Monitoring
- [ ] Add alerts for trade logging errors
- [ ] Add alerts for bot scan failures
- [ ] Dashboard for daily active users

---

## IMPLEMENTATION NOTES (Ponytail)

**Why minimal Phase 1?**
- Users can start logging trades immediately
- Data collection foundation in place
- No speculative features (A/B testing, auto-tuning)
- ~2 hours dev time vs 20+ hours for full analytics

**When to expand?**
- After 1 week of production data (sample size)
- After users manually verify outcomes (ground truth)
- After bot stability confirmed (no crashes, data corruption)

**Shortcuts accepted:**
- Manual outcome entry (not auto-calculated from Zerodha API)
- Snapshot trades (not audit trail of every order modification)
- No transaction costs / slippage modeling
- No portfolio weighting logic (per-symbol only)

---

**Status:** Ready for Phase 2 planning. All backlog items are either in-progress or scheduled with effort estimates.
