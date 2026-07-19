# Fortress Intelligence — Living Documents Index

**Last Updated:** July 19, 2026  
**Status:** Production Live | Phase 6 Security Complete | Permanent Scanner Universe Live

---

## 📋 Core Project Documents

### CLAUDE.md
**Purpose:** Master project context — features, tech stack, roadmap, deployment  
**Owner:** Project  
**Update Frequency:** Per major milestone  
**Current State:** v0.7.0 | Phase 4.0 Trade Persistence + Phase 4+ Weight Recommendations  
**Location:** `/CLAUDE.md`

### PENDING_ITEMS.md
**Purpose:** Backlog of next-phase work + known issues  
**Owner:** Development  
**Update Frequency:** Session-end  
**Location:** `/PENDING_ITEMS.md`

### PROJECT_STATUS_REPORT.md
**Purpose:** Quarterly/milestone status for stakeholders  
**Owner:** Project  
**Update Frequency:** Monthly  
**Location:** `/PROJECT_STATUS_REPORT.md`

### ROADMAP.md
**Purpose:** Feature priorities, timelines, phases (Phase 5+)  
**Owner:** Project  
**Update Frequency:** Monthly  
**Location:** `/ROADMAP.md`

### README.md
**Purpose:** Quick start, repo overview, local dev setup  
**Owner:** Development  
**Update Frequency:** Per major version bump  
**Location:** `/README.md`

---

## 🔐 Security & Deployment

### .env.example
**Purpose:** Environment variable template (no secrets)  
**Owner:** DevOps  
**Status:** Updated with Phase 6 vars (CRON_SECRET, MASSIVE_API_KEY, etc.)  
**Location:** `/.env.example`

### ecosystem.config.js
**Purpose:** PM2 process manager config (production)  
**Status:** Cluster mode, 2 workers, auto-restart, VPS-ready  
**Location:** `/ecosystem.config.js`

### start.sh
**Purpose:** Production startup script (replaces `npm start`)  
**Status:** Active | Uses ecosystem.config.js  
**Location:** `/start.sh`

### .turbopackignore / .gitignore
**Purpose:** Prevent build errors from nested repos, venv, build artifacts  
**Status:** Active | Committed July 5 deploy rework  
**Location:** `/.turbopackignore`, `/.gitignore`

---

## 🗄️ Database & Schema

### lib/db/schema.ts
**Purpose:** Drizzle ORM schema definition (27 tables, 200K+ rows)  
**Current Tables:**
- `stocks` (master reference, 2K+ records)
- `stocks_universe` (scanner universe, 45+ seed stocks) **[NEW July 19]**
- `scans` (scan run history)
- `scan_results` (individual stock results per scan)
- `strategies`, `strategy_holdings` (portfolio tracking)
- `trades` (trade feedback log)
- `emailTokens`, `csrfTokens` (Phase 6 auth)
- 19+ others (user, allocation, sector, analysis, feedback tables)

**Location:** `/lib/db/schema.ts`

### drizzle/migrations/
**Purpose:** Database migrations (managed by Drizzle Kit)  
**Recent Additions:**
- `add-stocks-universe.sql` (July 19) — Scanner universe table + seeds  
- `add-csrf-tokens.sql` (July 10) — Phase 6 CSRF protection  
- `add-trades-userid.sql` (July 9) — Trade persistence fix  

**Location:** `/drizzle/migrations/`  
**Deploy Command:** `npm run drizzle:push`

---

## 🎯 Core Application Logic

### Investment Genie (Portfolio Allocation)
- **Form:** `/app/pages/investment-genie.tsx` (multi-step wizard, progressive disclosure)
- **Allocator:** `/lib/investment-genie/allocator.ts` (core logic, domicile-aware)
- **Contracts:** `/lib/investment-genie/contracts.ts` (types + tax optimization)
- **API:** `POST /api/allocation/generate` (allocation results endpoint)

### Fortress 30 (Stock Screening)
- **UI:** `/app/pages/fortress-30.tsx` (risk filter, sticky controls, redesigned June 16)
- **API:** `GET /api/scan/results?market=NSE|US` (live scanner results)
- **Scanner (NSE):** `POST /api/scan/run` (cron: Mon-Fri 4:30 PM IST)
- **Scanner (US):** `POST /api/scan/ai-run` (cron: Mon-Fri 6:00 PM IST)

### Trading Specialist (Hidden Gem Finder)
- **UI:** `/app/pages/trading-specialist.tsx` (multi-tab: Technical/Fundamental/Options)
- **Chart:** `/components/fortress/TradingChart.tsx` (Recharts, 60-day price + SMA overlay)
- **API:** `GET /api/analysis/gem-score?ticker=AAPL` (GEM SCORE + signals)
- **GEM SCORE:** G(rowth via SMA200) + E(quity via SMA50) + M(omentum via EMA21+RSI14)

### Portfolio Strategy Tracker
- **Pages:** `/portfolio`, `/portfolio/[id]`, `/portfolio/[id]/edit`, `/portfolio/rebalance-schedule`
- **APIs:** `GET/POST /api/portfolio`, `PUT /api/portfolio/[id]/holdings`, `POST /api/portfolio/seed`
- **Features:** Live P&L, holdings editor, rebalance actions, blood rule, 10X Moonshot seed

### Trade Feedback & Learning (Phase 4+)
- **API:** `POST /api/analysis/feedback` (log BOUGHT/SKIPPED/LOSS decisions)
- **Analytics:** Win rate by GEM SCORE range, weight recommendations (UPWEIGHT/DOWNWEIGHT/MAINTAIN)
- **Next:** Mark WIN/LOSS, learning engine integration

---

## 🌍 Scanner Universe (Updated July 19)

### Scanner Universe Feed
**File:** `/lib/scanners/universe.ts`  
**Purpose:** Live, free ticker universes (replaces hardcoded arrays)

**Live Sources:**
- **US:** S&P 500 constituents (500 stocks) — GitHub CSV, updated daily  
  URL: `https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.csv`
- **NSE:** Nifty 500 list (500 stocks) — NSE Archives CSV, updated quarterly  
  URL: `https://archives.nseindia.com/content/indices/ind_nifty500list.csv`

**Cache:** 24-hour TTL per market (network efficient)  
**Fallback:** Small lists (10 US + 15 NSE) if fetch fails  
**DB Table:** `stocks_universe` (future query source, seeded with 45 stocks)

---

## 📧 Email & Notifications

### Email Service
**File:** `/lib/email/service.ts`  
**Status:** Nodemailer integration (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD)  
**Features:** Email verification (24hr tokens), weekly digest (scaffold)

### Weekly Digest (Scaffold)
**File:** `/app/api/notifications/weekly-digest/route.ts`  
**Status:** Endpoint created, unscheduled (Phase 3+)  
**Purpose:** Send allocation recap + trade stats + market summary

---

## 🔑 Authentication & Security (Phase 6)

### Auth Flow
**File:** `/auth.ts` (NextAuth configuration)  
**Status:** Email + password auth, email verification required, session-based

### Phase 6 Security Stack
1. **Email Verification** (Phase 6.2)
   - 24-hour token expiration, one-time use
   - Database: `emailTokens` table
   - Enforced before login

2. **CSRF Protection** (Phase 6.3)
   - Token generation on login, one-time validation, consumed after POST/PUT/DELETE
   - Database: `csrfTokens` table
   - Middleware: `requireCSRFToken()`

3. **Rate Limiting** (Phase 6.4)
   - Login: 5 failed attempts = 15-min lockout per email
   - API: 10 req/sec per IP
   - Database: In-memory limiter (upgrade to Redis for multi-instance)

**All endpoints:** Require auth (session cookie) + CSRF token (state-modifying) + rate limit check

---

## 🚀 Deployment & CI/CD

### GitHub Actions CI/CD
**File:** `.github/workflows/deploy.yml`  
**Flow:** Push → Build → Test → Deploy → PM2 restart  
**Status:** Active | No failures in recent deployments

### VPS Architecture
**Host:** 76.13.179.32 (Ubuntu 22.04)  
**App Root:** `/opt/fortress/`  
**Process Manager:** PM2 v6.0.14 (cluster mode, 2 workers)  
**Web Server:** Nginx 1.24.0 (reverse proxy 80/443 → 3000)  
**Database:** PostgreSQL (internal, Socket connection)  
**Live:** https://fortressintelligence.space

### Cron Jobs (VPS)
- **NSE Scan:** Mon-Fri 4:30 PM IST (11:00 UTC) → `POST /api/scan/run?market=NSE`
- **US Scan:** Mon-Fri 6:00 PM IST (12:30 UTC) → `POST /api/scan/ai-run?market=US`
- **Auth:** `x-cron-secret` header (env var)

---

## 📚 Reference & Architecture

### Memory (Auto-Updated)
**Location:** `C:\Users\user\.claude\projects\C--Antigravity-Fortress\memory/`

**Key Memories:**
- `CRITICAL_GUARDRAIL_PROJECT_SCOPE.md` — NO cross-project work (Kyro isolation)
- `july_19_scanner_universe_gap_fix.md` — Today's universe expansion
- `july_10_phase6_security_complete.md` — Auth/CSRF/rate limit docs
- `july_9_phase4_persistence.md` — Trade logging to PostgreSQL
- `user_profile.md` — Operating mode (hands-free execution)
- `feedback_*.md` — Code delivery preferences

### Rules (Global Coding Standards)
**Location:** `C:\Users\user\.claude\rules/`

**Common Rules** (all projects):
- `coding-style.md` — Immutability, small files, error handling
- `testing.md` — 80%+ coverage, unit+integration+E2E
- `git-workflow.md` — Conventional commits, detailed PR descriptions
- `security.md` — No hardcoded secrets, input validation
- `agents.md` — Agent orchestration (planner, tdd-guide, code-reviewer, etc.)

**TypeScript Rules** (`typescript/`):
- `coding-style.md` — Types on public APIs, avoid `any`
- `testing.md` — Playwright E2E, jest unit tests
- `patterns.md` — Repository pattern, API response format
- `hooks.md` — Prettier, TypeScript check, console.log audit

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js | 16.1.6 |
| Frontend Framework | React | 19.0.0 |
| Styling | TailwindCSS | 3.4.1 |
| Charting | Recharts | 2.12.7 |
| Backend API | Next.js API Routes | 16.1.6 |
| Database ORM | Drizzle Kit | 0.30.10 |
| Database | PostgreSQL | 15+ |
| Process Manager | PM2 | 6.0.14 |
| Web Server | Nginx | 1.24.0 |
| Auth | NextAuth.js | 4.24.3 |
| Email | Nodemailer | 6.9.7 |
| Market Data | yfinance | 0.2.28 |
| TypeScript | TypeScript | 5.3.3 |
| Testing | Playwright | 1.40.0 |

---

## 📊 Data Layer Status

### Markets & Universe Coverage
| Market | Universe | Count | Source | Status |
|--------|----------|-------|--------|--------|
| US | S&P 500 + Growth | 515+ | GitHub CSV + Nasdaq100 | ✅ Live |
| NSE | Nifty 500 | 500+ | NSE Archives CSV | ✅ Live |
| DB Seed | Mixed (manual) | 45 | `stocks_universe` table | ✅ Seeded |

### Scan Frequency
| Market | Schedule | Frequency | Last Run | Status |
|--------|----------|-----------|----------|--------|
| US | Mon-Fri | 6:00 PM IST (12:30 UTC) | July 19 6:00 PM | ✅ On-time |
| NSE | Mon-Fri | 4:30 PM IST (11:00 UTC) | July 19 4:30 PM | ✅ On-time |

### Database Growth
| Table | Rows | Growth | Status |
|-------|------|--------|--------|
| stocks | 2,100+ | Stable (master reference) | ✅ |
| scans | 200+ | Growing (~2 per day) | ✅ |
| scan_results | 50K+ | Growing (100-500 per scan) | ✅ |
| strategies | 15 | User-created | ✅ |
| trades | 100+ | Growing (feedback log) | ✅ |

---

## 🚨 Known Issues & Resolutions

### ✅ RESOLVED (July 19, 2026)
1. **Port Mismatch** → Nginx 3001→3000 redirect fixed, Fortress config enabled
2. **Scanner Universe Gap** → Expanded US (20→25) + NSE (8→22) + live CSV feeds (500+ each)
3. **PM2 Restart Instability** → Stabilized after deployment (58 restarts from build, now stable)

### 🔄 IN PROGRESS
- Learning engine integration (Phase 4+) — Win/Loss tracking pending
- Fundamentals tab completion — Placeholder → PE/growth/FCF indicators

### ⏳ BACKLOG (Phase 5+)
- Advanced indicators (MACD, Bollinger Bands, volume divergence)
- Broker sync (IBKR credentials + holdings import)
- Market expansion (Malaysia, Singapore, Hong Kong)
- Redis cache layer (multi-instance support)

---

## 📅 Version History

| Version | Date | Status | Key Features |
|---------|------|--------|--------------|
| v0.7.0 | July 19 | 🟢 Live | Phase 4.0 Trade Persistence + Weight Recommendations + Scanner Universe Live |
| v0.6.0 | July 10 | 🟢 Live | Phase 6 Security (Email Verification + CSRF + Rate Limiting) |
| v0.5.0 | July 9 | 🟢 Live | Phase 2.0 Chart Rendering (Recharts) + Phase 4.0 Persistence |
| v0.4.0 | July 7 | 🟢 Live | Hidden Gem Finder (Trading Specialist) + GEM SCORE (Real Calculation) |
| v0.3.0 | June 16 | 🟢 Live | Fortress 30 UI/UX Redesign + Risk Filtering Fix |
| v0.2.0 | May 23 | 🟢 Live | Portfolio Strategy Tracker + Live P&L |
| v0.1.0 | May 1 | 🟢 Live | Investment Genie + Fortress 30 + Dark Luxury UI |

---

## 🎯 How to Use This Index

1. **For feature work:** Find the feature in "Core Application Logic" → reference the files/APIs
2. **For deployment:** Follow "Deployment & CI/CD" → use `start.sh` not `npm start`
3. **For database changes:** Update `lib/db/schema.ts` → create migration in `drizzle/migrations/` → run `npm run drizzle:push`
4. **For security:** Review "Authentication & Security" → Phase 6 stack is live
5. **For understanding universe coverage:** See "Scanner Universe" → live CSV feeds handle 500+ stocks per market
6. **For roadmap:** See ROADMAP.md → next phases are Phase 5+ (learning engine, market expansion)

---

**Status:** All living documents current as of July 19, 2026, 10:30 AM UTC  
**Maintainer:** Claude Code (Haiku 4.5)  
**Last Build:** 0 errors (TypeScript) | 10.6s (VPS) | 6.0s (local)
