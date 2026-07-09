# CLAUDE.md — Fortress Intelligence Project Context

**Project:** Fortress Intelligence — Multi-market investment allocation & stock screening  
**Owner:** Bharat Samant (bharatsamant@gmail.com)  
**Status:** 🟢 LIVE & PHASE 2.1 COMPLETE (July 8, 2026 Session 11)  
**Live App:** https://fortressintelligence.space (app live via PM2 + Nginx)  
**Production VPS:** 76.13.179.32 (port 3000 via PM2, Nginx proxy active)  
**Latest:** Session 11: Real GEM SCORE calculation deployed (Phase 2.1). All tickers return live technical analysis. Committed (db0a0e7e). Live on production.  
**GitHub:** https://github.com/BratAIExplorer/Fortress  
**Deploy Status:** 🟢 Live — Real GEM SCORE working at `/api/analysis/gem-score?ticker=AAPL`.

---

## 🎯 PROJECT MISSION

Build a user-friendly investment portfolio allocation engine with real-time stock screening across US and India (NSE) markets. Users select their risk profile, receive AI-optimized allocation percentages, and browse curated stock lists (Fortress 30) for each market.

---

## 📦 WHAT EXISTS TODAY

### ✅ Features (LIVE)

**Investment Genie**
- Multi-market portfolio allocation form with 3-step progressive onboarding wizard
- Dynamic live barbell split risk preview
- AI-powered risk-based allocation (US % / India %)
- Result summary with allocation breakdown
- ✨ **NEW (May 26):** "Approve & Add to Portfolio" button → Creates strategy from allocation with live holdings
- Optional "Save for Later" for users who just want to review without tracking

**Fortress 30** _(Enhanced June 16, 2026 — World-Class UI/UX Redesign)_
- ✨ **Working Risk-Based Filtering:** Conservative/Balanced/Aggressive buttons now actually filter stocks (was completely broken)
- ✨ **Sticky Filter Controls:** Risk buttons always visible (no scrolling required)
- ✨ **Premium Design:** Color-coded profiles, smooth animations, backdrop blur, gradient text
- Safe Core filtering (dividend-quality, low debt, positive FCF)
- Growth filtering (momentum, margin expansion)
- Progressive disclosure (show/hide runners-up 31-40)
- US Market: 346 candidates live
- India (NSE): 1,085+ candidates live

**Portfolio Strategy Tracker** _(added May 23, 2026 | Enhanced May 26, 2026)_
- `/portfolio` — Strategy cards + live P&L summary + SkillBrowser
- `/portfolio/[id]` — Holdings table, rebalance actions (Buy/Trim/Hold), blood rule
- `/portfolio/[id]/edit` — Holdings editor: enter IBKR share counts + avg buy prices
- `/portfolio/rebalance-schedule` — Quarterly countdown, 5-step protocol, blood rule
- Seed endpoint: one-click creates 10X Moonshot strategy (SMH/QQQ/TQQQ/SOXL/INDA/GLD)
- Live prices via yahoo-finance2 with 5-min in-memory cache
- 5% drift threshold triggers rebalance alerts
- ✨ **NEW (May 26):** Edit/Delete buttons on strategy cards with optional feedback modal
- ✨ **NEW (May 26):** Investment Genie → Portfolio integration (create strategies from allocations)
- Optional feedback collection on strategy deletion (Phase 3 learning engine)
- **Requires VPS migration:** `npm run drizzle:push` to create `strategies` + `strategy_holdings` tables

**Hidden Gem Finder** _(NEW — July 7, 2026 Session 10 | AI Trading Specialist)_
- ✨ **NEW:** `/trading-specialist` — Personal AI trading specialist for stock analysis
- **LIVE PHASE 2.1:** Real GEM SCORE calculation (ALL tickers, not just AAPL/HDFC)
- Single ticker search (AAPL, TSLA, MSFT, HDFC, any symbol with yfinance data)
- Real-time technical indicators: EMA(21), SMA(50/200), RSI(14), ATR(14), momentum
- Strategy signals: Intraday / Short-term (1–6M) / Long-term (1Y+) with real confidence scoring
- The Bottom Line: Plain-English actionable insights based on computed metrics
- Multi-timeframe panel: Live EMA/SMA triggers, ATR stops, support/resistance levels
- NSE support: Automatic .NS suffix detection, currency display (₹ for India, $ for US)
- Cache: 15-min in-memory TTL, <100ms repeat queries
- Tab navigation: Technical Analysis / Fundamental Core / Multi-Asset Options (framework ready)
- Chart placeholder ready for Recharts/D3 integration (Phase 2)
- Fully responsive, dark mode, accessible
- Navbar integration: Advanced Tools dropdown + mobile menu

**Design & UX**
- Dark Luxury theme (modern, professional, accessible)
- Fully responsive (desktop, tablet, mobile)
- Dynamic interactive canvas line charts with hover year-by-year tooltips
- Native SVG score ring title disclosures

### 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16.1.6, TypeScript, TailwindCSS |
| **Backend** | Next.js API routes |
| **Database** | PostgreSQL (Supabase compatible) |
| **Data Sources** | yfinance (Yahoo Finance), NSE APIs |
| **Deployment** | Docker, PM2, Nginx, GitHub Actions CI/CD |
| **VPS** | Ubuntu 22.04, custom reverse proxy |

---

## 📁 KEY FILES & RESPONSIBILITIES

### Core Application (`fortress-app/`)
- `/app` — Next.js pages & routes (Investment Genie, Fortress 30)
- `/components` — React UI components
- `/lib/db` — Drizzle ORM schema & database layer
- `/public` — Static assets
- `ecosystem.config.js` — PM2 production config
- `start.sh` — Production startup script

### Database Schema (PostgreSQL)
**`scans` table** — Scan run metadata
- `id` (UUID), `run_at` (timestamp), `status` (RUNNING|COMPLETED|FAILED)
- `market` (NSE|US) — Key field for multi-market support
- `total_scanned`, `good_results_count`

**`scan_results` table** — Individual stock results
- `id`, `scan_id`, `symbol` (e.g., HDFC, AAPL)
- `market` (NSE|US), `mb_score`, `mb_tier` (Rocket|Launcher|Builder|Crawler|Grounded)
- `price_at_scan` (local currency), `sector`, `category`
- **Criteria flags:** l1, l2, l3, l4, l5, l6 (Boolean pass/fail)

**`stocks` table** — Master stock registry (pre-populated, indexed)
**`sectors` table** — Market structure

### Scanner (Python — Phase 2 TODO)
- `Reference/OutoftheBox/scanner.py` — Market data fetching & technical analysis
- MACD, SMA (20/50/100/200), RSI indicators
- Stock filtering & ranking logic
- **TODO:** scanner_db_writer.py (write results to Postgres)

### Documentation
- `README.md` — Quick start & overview
- `PROJECT_STATUS_REPORT.md` — Current state & blockers
- `ANTIGRAVITY_MVP1_GLOBAL_BRIEF.md` — Full technical specs for data layer
- `ROADMAP.md` — Feature priorities & timeline
- `HANDOVER_*.md` — Development notes & architecture decisions

---

## 📊 CURRENT STATE (July 8, 2026 — Phase 2.1 Complete)

### ✅ PHASE 2.1: REAL GEM SCORE LIVE (July 8, 2026)
- **Real calculation:** G (Growth via SMA200) + E (Equity via SMA50) + M (Momentum via EMA21+RSI14)
- **Data source:** yfinance2 v3.15.4 (quote + historical OHLC)
- **All tickers:** AAPL, TSLA, MSFT, HDFC, GOOGL, any symbol with market data
- **Signals generated dynamically:** Intraday (EMA21+RSI), Short-term (SMA50+momentum), Long-term (SMA200+52wk range)
- **NSE auto-detect:** .NS suffix, ₹ currency for India stocks
- **Cache:** In-memory 15-min TTL, <100ms warm hits, <2s cold fetches
- **Graceful fallbacks:** Insufficient data → neutral signals (not 500 errors), delisted/missing → success:false with error
- **Build:** ✓ TypeScript zero errors, route optimized for ~120 LOC
- **API endpoint:** `GET /api/analysis/gem-score?ticker=AAPL` returns `{success, ticker, signals[], bottomLine, multiTimeframe[]}`
- **Testing:** AAPL/TSLA/HDFC verified returning different real signals (not mock labels)
- **Deployment:** Commit db0a0e7e, live on VPS production

### ✅ WORKING
- **Production** stable and live on port 3000 (PM2)
- **Database** PostgreSQL `fortress` fully operational with 27 tables, 200K+ rows
- **NSE market** live with 1,085+ stock candidates, real-time API responses
- **US market** screening & data updates running (9:30 AM EST daily, Mon-Fri)
- **Investment Genie** form-to-results flow 100% functional (auto-submit active)
- **Fortress 30** ✨ REDESIGNED (June 16) — Risk-based filtering now working + premium UI
- **Portfolio Tracker** — all routes live, strategies + holdings tables operational
- **Security Hardening** ✅ COMPLETE (June 18) — 6 of 8 CRITICAL issues fixed, 2 frameworks ready
  - Fixed: Dangerous email linking, error sanitization, API key validation
  - Frameworks: Financial verification gates, 7-year audit logging
  - Applied to: 13 critical routes (rate limiting, CSRF, input validation)
- **CI/CD** GitHub Actions → VPS automated deployment working flawlessly
- **TypeScript build** — zero errors (latest commit: 6e4d93d)

### 🆕 FORTRESS 30 REDESIGN (June 16, 2026)
**Critical Bugs Fixed:**
- ✅ Risk filtering — Conservative/Balanced/Aggressive buttons now actually filter stocks (was non-functional)
- ✅ Navigation scrolling — Sticky filter header keeps controls always visible

**Design Improvements:**
- Color-coded risk profiles (emerald/blue/amber)
- Smooth animations & filter transitions
- Progressive disclosure (show/hide runners-up)
- Better visual hierarchy & information architecture
- Premium feel with backdrop blur, gradients, animations

**Technical:**
- New `Fortress30Client` component (265 lines)
- `filterStocksByRisk()` function with proper logic
- useMemo optimization for filtering performance
- All Tailwind classes static (no dynamic generation)
- Zero TypeScript errors
- Comprehensive documentation in `FORTRESS_30_REDESIGN.md`

### 🆕 PORTFOLIO STRATEGY TRACKER (May 23, 2026)
Full end-to-end feature shipped and pushed to GitHub (awaiting VPS `drizzle:push`):

**New database tables** (run `npm run drizzle:push` on VPS to activate):
- `strategies` — user's investment strategies (name, risk tier, target multiple, horizon)
- `strategy_holdings` — holdings per strategy (ticker, target weight %, units, avg buy price)

**New API routes:**
- `GET/POST /api/portfolio` — list all strategies with live snapshots / create strategy
- `GET /api/portfolio/[id]` — strategy detail with live prices + rebalance actions
- `PUT /api/portfolio/[id]/holdings` — upsert all holdings for a strategy
- `POST /api/portfolio/seed` — idempotent: creates 10X Moonshot if no strategies exist

**New pages:**
- `/portfolio` — overview: strategy cards, P&L summary bar, SkillBrowser
- `/portfolio/[id]` — detail: holdings table, weight bars, return %, rebalance actions
- `/portfolio/[id]/edit` — holdings editor: enter IBKR units + avg buy price per ticker
- `/portfolio/rebalance-schedule` — quarterly countdown, 5-step protocol, blood rule

**New components:**
- `StrategyCard` — card with metrics, progress bar toward target multiple, rebalance badge
- `HoldingsTable` — weight bars (5% drift = amber alert), return %, action badges
- `RebalanceSummary` — Buy/Trim/Hold list with $ amounts + "Mark as Rebalanced" button
- `HoldingsEditor` — inline table with number inputs, live cost basis preview
- `SeedButton` — client component for one-click 10X Moonshot seed
- `SkillResult` — renders skill analysis output (summary, signals, recommendation)

**10X Moonshot seed data** (personal $10K challenge strategy):
- SMH 20%, QQQ 15%, TQQQ 30%, SOXL 15%, INDA 10%, GLD 10%

**Build fixes applied May 23:**
- Installed `@radix-ui/react-select` (was missing, broke SkillBrowser Select)
- Created `SkillResult` component (was imported but never created)
- Fixed `schema-feedback.ts`: removed broken `users` FK, use `varchar userId` instead
- Fixed Zod `.errors` → `.issues` (v3 API) in two portfolio API routes
- Fixed yahoo-finance2 type cast for `regularMarketPrice`

### 🆕 TRADING SKILLS INSTALLED (May 21, 2026)
- **30 Claude Code skills** live in `~/.claude/skills/` — zero config needed
- **9 NSE skills** — `nse-trading-toolkit`, `rsi-divergence`, `multi-timeframe-analysis`, `fibonacci-trading`, `position-sizing`, `stop-loss-strategies`, `trailing-stops`, `risk-reward-ratio`, `nse-technical-analysis`
- **21 InvestSkill** — DCF, Piotroski F-Score, earnings call analysis, insider tracking, sector rotation, full institutional reports
- **Equity Research command** — `/equity-research/research SYMBOL` → buy/sell rec with price target
- **Source repos** → `C:/Antigravity/trading-repos/`
- **Integration plan** → `TRADING_INTEGRATION_PLAN.md`

### 🆕 VPS REWORK & DEPLOYMENT (July 5, 2026) — ✅ COMPLETE
**Status:** 🟢 APP LIVE at https://fortressintelligence.space  
**Duration:** 4 hours | **Root Cause:** Turbopack symlink issue + nested git repos + branch mismatch  
**Solution:** Minimal Node.js server deployed (fallback), .turbopackignore/.gitignore fixes committed

**What Happened:**
- 502 Bad Gateway on VPS — app wouldn't start
- Turbopack build error: "Symlink fortress-scanner/venv/bin/python is invalid"
- Root causes:
  1. Nested git repos (`/opt/fortress/` AND `/opt/fortress/fortress-app/`)
  2. master branch (CI/CD fixes) missing app code → app code on origin/main
  3. Historical fortress-scanner symlink in git metadata (broken Python scanner integration)
  4. Multiple package-lock.json files confusing npm workspace resolution

**Fixes Applied:**
1. ✅ Created `.turbopackignore` + `.gitignore` exclusions (committed to main)
2. ✅ Deleted nested `fortress-app/` directory structure
3. ✅ Consolidated work at `/opt/fortress/` root
4. ✅ Deployed minimal Node.js server (instant, zero build errors)
5. ✅ Validated live deployment through HTTPS

**Files Changed:**
- `.turbopackignore` (NEW) — Tells Turbopack to ignore fortress-scanner, venv, build artifacts
- `.gitignore` (NEW) — Prevents commits of build byproducts
- `server.js` (VPS ONLY) — Minimal fallback HTTP server
- `ecosystem.config.js` (UPDATED) — PM2 process config

**Deployment:**
- Commit 1bfded9 pushed to origin/main
- VPS checkout: `dd22087` (same commit)
- PM2 status: ✅ online (PID 272049, 51.9 MB, 0 restarts)
- Health check: ✅ HTTPS responding with 200 status

**Session 1 Complete (July 5, 2:30 PM UTC):**
- ✅ App live on minimal server (zero build errors)
- ✅ CI/CD pipeline fixed
- ✅ Config files prepared for full app (package.json, next.config.js, tsconfig.json)
- ✅ Next.js 15 proven working (Turbopack issues eliminated)
- ⏳ Full restoration pending: 50+ dependencies need installation + testing

**Session 2 (Next):**
1. Install complete dependency tree (traceable from import failures)
2. Build full Next.js app locally
3. Push to main → GitHub Actions auto-deploys
4. Verify Fortress 30 + Portfolio routes live
5. See [FULL_APP_RESTORATION_PATH.md](FULL_APP_RESTORATION_PATH.md) for exact checklist
6. See [july_5_complete_vps_rework.md](../memory/july_5_complete_vps_rework.md) for full technical details

### ⏳ BACKLOG (MONTH 2+)
- **Investment Genie Feedback Loop** (Track user allocations over time, learn preferences) — Phase 3
- **Advanced analytics** (Performance tracking, recommendation engine) — Phase 3
- **Expanded markets** (Malaysia, Singapore, Hong Kong — Phase 2)

---

## 📋 PENDING ITEMS & ROADMAP

**Detailed breakdown:** See [PENDING_ITEMS.md](PENDING_ITEMS.md)

### ✅ Session 10 Complete (July 7, 2026)
1. ✅ Hidden Gem Finder built & tested (commit 609b689d)
2. ✅ Trading specialist tab live at `/trading-specialist`
3. ✅ Navbar integration complete (Advanced Tools dropdown + mobile)
4. ✅ API endpoint ready: `/api/analysis/gem-score?ticker=AAPL`
5. ✅ Scalable architecture for Phase 2 (mock → real calculation)

### ✅ Session 11 Complete (July 8, 2026) — Phase 2.1 LIVE
1. ✅ **Real GEM SCORE Calculation** — Live (G/E/M signals from EMA/SMA/RSI/ATR)
2. ✅ All tickers work (AAPL, TSLA, MSFT, HDFC, any with yfinance data)
3. ✅ NSE auto-detect (.NS suffix, ₹ currency)
4. ✅ Caching (15-min TTL, <100ms warm)
5. ✅ Graceful fallbacks (insufficient data → neutral, not 500 errors)
6. ✅ Commit db0a0e7e, deployed to production

### Phase 2 Remaining Critical Path (Next Week)
1. **Chart Integration** — Recharts/D3 for technical analysis rendering (multi-timeframe)
2. **Broker Sync** — IBKR credentials capture + holdings import
3. **Database Persistence** — Analysis history to PostgreSQL `analyses` table
4. **Advanced Indicators** — MACD, Bollinger Bands, volume divergence
5. **Fundamental Core Tab** — Real P/E, growth rates, insider trading signals

### Upcoming Phases
- **Phase 2+ (July-Aug):** Trading specialist enhancements + learning engine
- **Phase 3 (Aug-Sep):** Investment Genie feedback loop + personalization
- **Phase 3+ (Sep-Oct):** Advanced analytics + real-time alerts
- **Phase 4 (Q4 2026):** Market expansion (Malaysia, Singapore, Hong Kong)

---

## 🛠 HOW TO WORK WITH THIS PROJECT

### Your Working Style
- **Non-technical preference:** Focus on high-level context, clear summaries, documentation
- **Hands-off approach:** I handle technical details and implementation legwork
- **Standards-first:** Follow best practices in docs, code quality, communication
- **Skill-based:** Use available skills for content generation, architecture, analysis

### When You Need Help
**Ask me for:**
- Documentation audits & updates
- Architecture reviews & design decisions
- Code implementation & debugging
- Feature planning & roadmap prioritization
- Database design & schema validation
- CI/CD & deployment troubleshooting

**I'll avoid:**
- Vague technical jargon without explanation
- Overwhelming you with implementation details
- Multi-step processes without clear context
- Changes without confirming intent first

### How I'll Respond
- **Brief intro** — What the work is
- **Clear next steps** — What you need to do (if anything)
- **Concise explanations** — Context without overload
- **Links & files** — Direct access to what matters
- **Questions when unsure** — Never assume your intent

---

## 🔗 INTEGRATION POINTS

### Database Connection
- **Local dev:** Add `DATABASE_URL=postgresql://...` to `.env.local`
- **Production:** VPS PostgreSQL (internal, accessed via SOCKET)
- **Schema:** Managed via Drizzle ORM in `lib/db/schema.ts`

### API Endpoints (Investment Genie)
- `POST /api/allocation/generate` — Generate portfolio allocation
- Input: Risk profile, markets selected
- Output: Allocation percentages, fund recommendations

### API Endpoints (Fortress 30)
- `GET /api/scan/results?market=NSE` — India stocks
- `GET /api/scan/results?market=US` — US stocks
- `GET /api/scan/results?market=GLOBAL` — Top 30 blended

### API Endpoints (Portfolio Strategy Tracker)
- `GET /api/portfolio` — all strategies with live price snapshots
- `POST /api/portfolio` — create new strategy (now accepts optional holdings)
- `GET /api/portfolio/[id]` — strategy detail + holdings + rebalance actions
- `PUT /api/portfolio/[id]/holdings` — upsert holdings (units, avg buy price)
- `DELETE /api/portfolio/[id]` — soft-delete strategy with optional feedback
- `POST /api/portfolio/seed` — idempotent seed for 10X Moonshot strategy

### API Endpoints (Hidden Gem Finder)
- `GET /api/analysis/gem-score?ticker=AAPL` — Analyze single ticker
- Input: ticker symbol (AAPL, HDFC, etc.)
- Output: GEM SCORE signals, bottom line, multi-timeframe data
- Phase 2 ready: Mock data → real GEM SCORE calculation (swappable)

### Market Data Sources
- **US:** yfinance (Yahoo Finance API wrapper)
- **NSE:** yfinance with `.NS` suffix, NSE APIs (in setup)
- **Fallback strategy:** To be implemented in Phase 2 (Alpha Vantage, Polygon.io)

---

## 🚀 DEPLOYMENT & OPERATIONS

### Production Deployment
```bash
git push origin main
# → GitHub Actions triggers build → test → deploy → restart PM2
```

### Local Development
```bash
npm install
cp .env.example .env.local
# Add DATABASE_URL=postgresql://...
npm run dev
# Open http://localhost:3000
```

### Cron Jobs (VPS) — Automatic Daily Scans
- **NSE Scan:** Mon-Fri **4:30 PM IST (11:00 UTC)** → `/api/scan/ai-run?market=NSE`
- **US Scan:** Mon-Fri **6:00 PM IST (12:30 UTC)** → `/api/scan/ai-run?market=US`
- Both trigger TypeScript scanner via HTTP (no Python required)
- Logs: `/var/log/fortress_nse_scan.log` and `/var/log/fortress_us_scan.log`
- Auth: `x-cron-secret: fortress-scan-secret-2026` header

### Monitoring
- **App:** Nginx reverse proxy + PM2 process monitoring
- **DB:** PostgreSQL health checks
- **Scans:** Cron job logs + scan status in DB (`scans.status`)
- **Errors:** GitHub Actions CI/CD notifications

---

## 📋 KNOWN ISSUES & NOTES

### ✅ RESOLVED (May 23)
- TypeScript build errors: zero errors — `@radix-ui/react-select` installed, `SkillResult` created, `schema-feedback.ts` FK fixed, Zod `.issues`, yahoo-finance2 type cast
- `schema-feedback.ts` Phase 3 tables: removed broken `users` FK reference (table doesn't exist — NextAuth uses `authUser`)

### ✅ RESOLVED (May 21)
- Database connection issue (wrong password in .env.local) — **FIXED**
- Production 502 errors — **FIXED**
- Port mapping (was 3001, now 3000) — **CORRECTED**

### Design Decisions
- **Symbol format:** Store without suffix (HDFC, not HDFC.NS) — UI strips for display
- **Currency:** Store local currency (INR for NSE, USD for US) — no conversion
- **Minimum results:** 50 good stocks per scan required to show in Fortress 30
- **Scoring:** Same MB score logic for both markets (tune US weights in Month 2 after feedback)

### Future Considerations
- **Fallback data sources:** Phase 2 will implement adapter pattern for yfinance → Alpha Vantage → Polygon.io
- **Rate limiting:** Consider caching layer if scanner hits API limits
- **User data:** No personal data stored today (allocation form is stateless) — feedback loop will change this

---

## 📅 ROADMAP SUMMARY

### NOW (v0.5.5 — July 6, 2026) — DEPLOYMENT READY
- ✅ Investment Genie (multi-market allocation wizard)
- ✅ Fortress 30 (stock screening with risk-based filtering, redesigned June 16)
- ✅ Dark Luxury UI (fully responsive, accessible)
- ✅ NSE market (1,085+ stock candidates live)
- ✅ US market (346+ candidates live)
- ✅ Trading Skills integrated (30 skills + NSE toolkit)
- ✅ Portfolio Strategy Tracker (live P&L, holdings, rebalance, feedback)
- ✅ Security hardening (6/8 CRITICAL issues fixed)
- ✅ CI/CD pipeline hardened (DATABASE_URL export + validation scripts created)
- ✅ TypeScript build: zero errors
- ✅ Code ready for production deployment

### Session 5 (July 6) — Deployment Finalization
1. ⏳ GitHub Actions deploys database schema to VPS (in progress)
2. ⏳ npm run drizzle:push creates scans + scan_results tables
3. ⏳ Validation script verifies deployment (SESSION_5_VALIDATION_PLAN.md)
4. ⏳ Seed 20 sample stocks to Fortress 30

### Phase 3 (July-Aug 2026) — Learning Engine
1. Feedback collection loop (why users delete strategies)
2. Learning engine (identify winning allocations)
3. Personalization (adjust presets based on learnings)
4. A/B testing infrastructure

### Phase 3+ (Aug-Sep 2026) — Advanced Analytics
1. Performance dashboard (returns, drawdown, volatility)
2. Real-time alerts (drift, price moves, rebalance triggers)
3. Risk monitoring (beta, sector concentration, currency exposure)
4. Daily market summary email

### Phase 4 (Q3 2026) — Market Expansion
1. Malaysia (KLSE), Singapore (SGX), Hong Kong (HKEX)
2. Adapter pattern for data sources (reduce API dependency)
3. Regional allocation presets
4. Currency conversion display

---

## 🎓 ASSUMPTIONS & CONTEXT

- **Investment allocation model:** Based on user-selected risk profile; not financial advice
- **Stock screening:** Technical analysis only (MACD, SMA, RSI) — no fundamental data in MVP
- **User base:** Early adopters interested in US + India markets
- **Privacy:** Stateless MVP — no user accounts or personal data storage yet
- **Scalability:** Current setup handles ~1K daily active users; Phase 2 will optimize DB queries & add caching

---

## 🔄 HOW TO UPDATE THIS FILE

This CLAUDE.md serves as the project's living memory. When:
- **Status changes** (e.g., NSE data live, new feature shipped) → Update the corresponding section
- **Documentation is added** (e.g., new API docs) → Add a link here
- **Tech stack evolves** → Update the Tech Stack table
- **Blockers emerge** → Add to KNOWN ISSUES & NOTES
- **Backlog priorities shift** → Update ROADMAP SUMMARY

---

**Last Updated:** July 7, 2026 (Session 10)  
**Status:** v0.6.0 Feature Complete | Hidden Gem Finder Live | Ready for Phase 2  
**Next Review:** Phase 2 GEM SCORE calculation | Broker API integration (July+)

---

## 🤖 OPERATING MODE (Updated May 30, 2026)

**Hands-Free Execution Model:**
- Claude executes end-to-end without permission gates
- Completes tasks autonomously: plan → test → deploy → verify → document
- Only asks for clarification if genuinely uncertain
- Challenges/proposes alternatives when needed (out of scope, risk, or better approach)
- Reports status when complete with full documentation + validation results
- Updates memory, skills, and principles automatically after each major task

**This Model Applies To:**
- Bug fixes and deployments
- Feature implementation and testing
- Database migrations and schema changes
- Documentation and memory updates
- Code reviews and quality validation
