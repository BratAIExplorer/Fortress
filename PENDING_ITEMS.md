# 🏰 FORTRESS INTELLIGENCE — PENDING ITEMS & ROADMAP

**Status:** 🟢 Core features live | 🟡 Session 4 database restoration in progress  
**Last Updated:** July 6, 2026  
**Current Phase:** Data Pipeline Restoration → Phase 3 Learning Engine

---

## 🚨 CRITICAL (Session 4 — In Progress)

### 1. **Database Schema Migration to VPS**
**Status:** ⏳ GitHub Actions deployment pending  
**What's needed:**
- Wait for GitHub Actions workflow to complete
- Runs: `npm run drizzle:push` on VPS (applies `scans` + `scan_results` tables)
- Validates with: `npm run db:validate`

**Checklist (Session 5):**
- [ ] GitHub Actions deployment completes successfully
- [ ] SSH into VPS: confirm `psql -d fortress -c "\dt"` shows `scans` and `scan_results` tables
- [ ] Run seed SQL: `/scratchpad/seed-scans-simple.sql` (20 stocks)
- [ ] Visit https://fortressintelligence.space/fortress-30 → Fortress 30 displays stocks
- [ ] Verify: NSE tab shows 10+ stocks, US tab shows 10+ stocks
- [ ] Monitor: `pm2 logs fortress` for errors

**Effort:** 30 min validation  
**Blocker:** None (GitHub Actions should auto-complete)

---

### 2. **Seed Sample Data to Database**
**Status:** 🟡 Script ready, pending schema creation  
**What's needed:**
- SQL file at: `/scratchpad/seed-scans-simple.sql`
- Run after schema migration: `psql -d fortress -f /scratchpad/seed-scans-simple.sql`
- Creates 20 sample stocks (10 NSE, 10 US) with scores

**Effort:** 5 min execution  
**Blocker:** Pending schema creation (drizzle:push)

---

### 3. **Verify PM2 Process Health**
**Status:** 🟡 App live but needs post-migration check  
**What's needed:**
- SSH to VPS: `pm2 logs fortress` → Check for errors
- Restart if needed: `pm2 restart fortress --update-env`
- Verify: `curl -s https://fortressintelligence.space/api/scan/results | jq .` returns JSON

**Effort:** 5 min check  
**Blocker:** None

---

## ✅ COMPLETED (Live Features)

### Phase 1: Core Allocation & Screening Engine
- ✓ Investment Genie (multi-market allocation wizard)
- ✓ Fortress 30 (stock screening with risk-based filtering)
- ✓ Portfolio Strategy Tracker (live P&L, holdings, rebalance)
- ✓ Dark Luxury UI (responsive, accessible)
- ✓ NSE Market (1,085+ candidates live)
- ✓ US Market (346+ candidates live)
- ✓ Authentication (Next Auth integration)
- ✓ Database schema (Drizzle ORM defined)
- ✓ CI/CD pipeline (GitHub Actions → VPS auto-deploy)

### Phase 2: Trading Skills Integration
- ✓ 30 Claude Code skills installed (~/.claude/skills/)
- ✓ 9 NSE technical analysis skills (RSI, MACD, Fibonacci, etc.)
- ✓ 21 equity research skills (DCF, earnings analysis, insider tracking, etc.)
- ✓ `/equity-research/research SYMBOL` command live
- ✓ SkillBrowser component (display skill analysis in UI)

### Security & Hardening
- ✓ Rate limiting on API endpoints
- ✓ CSRF protection (SameSite cookies)
- ✓ Input validation (Zod schemas)
- ✓ Error sanitization (no stack traces in client)
- ✓ API key validation (JWT tokens)
- ✓ 6/8 CRITICAL security issues fixed (June 18)

---

## ⏳ PENDING (Next Phases)

### Phase 3: Learning Engine & Personalization
**Status:** 🟡 Database schema deployed, feature development pending  
**Timeline:** July-August 2026  
**What's needed:**

1. **Feedback Collection Loop** (Week 1-2)
   - Track when users delete strategies
   - Optional "Why?" modal (collect feedback)
   - Store in `strategy_feedback` table

2. **Learning Engine** (Week 2-3)
   - Analyze feedback patterns
   - Identify which allocations work best
   - Track win rate by risk profile + market condition

3. **Personalization** (Week 3-4)
   - Adjust allocation presets based on learnings
   - "Recommended for you" suggestions
   - A/B test different allocations

**Effort:** 40-60 hours  
**Impact:** 🎯 HIGH — Core to product-market fit

---

### Phase 3+: Advanced Analytics & Monitoring
**Status:** 🔴 Not started  
**Timeline:** August-September 2026  
**What's needed:**

1. **Performance Dashboard**
   - Track portfolio returns vs. benchmarks
   - Historical P&L charts
   - Drawdown analysis
   - Volatility metrics

2. **Real-Time Alerts**
   - Notify when drift > 5% (rebalance trigger)
   - Alert on major price moves (±10%)
   - Daily market summary email

3. **Risk Monitoring**
   - Portfolio beta calculation
   - Sector concentration warnings
   - Currency exposure analysis (USD vs INR)

**Effort:** 30-40 hours  
**Impact:** 🎯 HIGH — Engagement + retention

---

### Phase 4: Market Expansion
**Status:** 🔴 Not started  
**Timeline:** Q3 2026  
**What's needed:**

1. **New Markets**
   - Malaysia (KLSE)
   - Singapore (SGX)
   - Hong Kong (HKEX)

2. **Data Infrastructure**
   - Adapter pattern for data sources (yfinance → Alpha Vantage → Polygon)
   - Caching layer for rate limiting
   - Real-time WebSocket feed (optional)

3. **UI Updates**
   - Market selector in Fortress 30
   - Regional allocation presets
   - Currency conversion display

**Effort:** 50-70 hours  
**Impact:** 🎯 MEDIUM — Geographic diversification

---

## 🛠️ INFRASTRUCTURE TASKS

### VPS & Deployment
- **Ongoing:** Monitor PM2 health, disk space, database size
- **TODO:** Set up automated backups (PostgreSQL daily snapshots)
- **TODO:** Configure CloudFlare analytics (traffic, security events)
- **TODO:** Add health check endpoint (`/api/health` → DB ping)

### Database
- **TODO:** Create indexes on frequently queried columns (in progress)
- **TODO:** Set up query logging (slow query threshold: 500ms)
- **TODO:** Implement row-level security (per-user data isolation)

### Monitoring
- **TODO:** Sentry integration (error tracking)
- **TODO:** New Relic or Datadog (APM)
- **TODO:** PagerDuty integration (on-call alerts)

---

## 📋 QUICK PRIORITY MATRIX

| Item | Impact | Effort | Timeline | Status |
|------|--------|--------|----------|--------|
| Database migration verification | 🔴 CRITICAL | 30 min | Session 5 (July 6) | 🟡 In Progress |
| Seed sample data | 🔴 CRITICAL | 5 min | Session 5 (July 6) | 🟡 Ready to run |
| PM2 health check | 🔴 CRITICAL | 5 min | Session 5 (July 6) | ⏳ Pending |
| Phase 3 feedback loop | 🟢 HIGH | 40-60 hrs | July-August | 🔴 Not started |
| Real-time alerts | 🟢 HIGH | 30-40 hrs | August | 🔴 Not started |
| Market expansion | 🟡 MEDIUM | 50-70 hrs | Q3 2026 | 🔴 Not started |
| Advanced analytics | 🟡 MEDIUM | 30-40 hrs | August | 🔴 Not started |
| Infrastructure (backups, monitoring) | 🟡 MEDIUM | 20-30 hrs | Ongoing | 🔴 Not started |

---

## 🎯 SESSION 5 IMMEDIATE ACTIONS

**Before any new feature work:**

1. ✅ Confirm GitHub Actions deployment complete
2. ✅ Verify database schema exists on VPS
3. ✅ Seed 20 stocks
4. ✅ Test Fortress 30 displays data
5. ✅ Check PM2 logs for errors

**Once verified:**
- Begin Phase 3 feedback loop development
- OR investigate pending cron jobs for scanners

---

## 🤔 OPEN QUESTIONS

1. **Should we add email digests?** (Daily top 5 picks)
   - Low effort (2-3 hrs), medium engagement impact
   - Requires user email preferences + SendGrid integration
   - Recommendation: Add in Phase 3.1 (after feedback loop)

2. **When to enable user watchlists?** (Save favorite stocks)
   - Medium effort (4-6 hrs), high engagement
   - Requires user auth + database table
   - Recommendation: Add in Phase 3 (post-feedback loop)

3. **Should Phase 4 (market expansion) include crypto?**
   - Not currently planned (too volatile for conservative allocations)
   - Can revisit Q4 2026 if user demand

---

**Last Updated:** July 6, 2026  
**Owner:** Bharat Samant  
**Next Review:** Session 5 (post-migration validation)
