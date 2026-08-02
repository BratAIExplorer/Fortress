# CLAUDE.md — Fortress Intelligence Project Context

**Project:** Fortress Intelligence — Multi-market investment allocation & stock screening
**Owner:** Bharat Samant (bharatsamant@gmail.com)
**Status:** 🟢 LIVE — v0.8.0, feature-complete, in 1-week stability observation on the MACD bot fix (started July 31, ends ~Aug 7)
**Live App:** https://fortressintelligence.space
**Production VPS:** 76.13.179.32 (port 3000 via PM2, Nginx reverse proxy 80/443 → 3000)
**GitHub:** https://github.com/BratAIExplorer/Fortress
**Full session history:** [SESSION_ARCHIVE.md](SESSION_ARCHIVE.md) — this file holds current state only

---

## 🎯 PROJECT MISSION

Build a user-friendly investment portfolio allocation engine with real-time stock screening across US and India (NSE) markets. Users select their risk profile, receive AI-optimized allocation percentages, and browse curated stock lists (Fortress 30) for each market.

---

## 📦 WHAT EXISTS TODAY

**Investment Genie** — Multi-market allocation wizard (3-step onboarding), live barbell split preview, AI risk-based allocation (US%/India%), "Approve & Add to Portfolio" → creates live-tracked strategy, or "Save for Later."

**Fortress 30** — Risk-based filtering (Conservative/Balanced/Aggressive) with sticky controls, real computed scores via `yahoo-finance2` (RSI, SMA20/50/200, volume trend — no more hardcoded data), Safe Core / Growth filtering, progressive disclosure (top 30 + runners-up 31-40). Universe: Nifty 500 + S&P 500 (~1,000 tickers). Not yet: full NSE/BSE/US universe (7,500+) — needs concurrent batch fetching (Phase 2 backlog).

**Portfolio Strategy Tracker** — `/portfolio` (strategy cards + live P&L), `/portfolio/[id]` (holdings, rebalance actions, blood rule), `/portfolio/[id]/edit` (IBKR share counts + avg buy price entry), `/portfolio/rebalance-schedule` (quarterly countdown). Live prices via yahoo-finance2, 5-min cache, 5% drift threshold triggers rebalance alerts.

**Hidden Gem Finder** (`/trading-specialist`) — Real GEM SCORE for any ticker (US, NSE `.NS`, LSE `.L` / Ireland-domiciled ETFs like CSPX/VUAA/VWRA). Technical indicators: EMA21, SMA50/200, RSI14, ATR14. Strategy signals for Intraday / Short-term / Long-term. Recharts price+SMA overlay (60-day). Trade feedback logged to PostgreSQL `trades` table with win-rate breakdown by GEM SCORE range.

**Momentum Radar** (`/momentum-radar`) — Dual-timeframe (Daily+Weekly) MACD(12,26,9) crossover scan across Nifty 500, sourced from the standalone `Equity_The-Final-chapter` bot. Read-only (symbol, CMP, EMA targets, stop loss) — no order execution exposed to web users. Bot's Zerodha auto-execution stays private, never reaches other users.
⚠️ **Access is currently open to everyone, logged-in or not.** Sign-in/trial/subscription gating was deliberately disabled (commit `d8209c46`) pending Phase 3 auth/SMTP work, with no re-enable date set. The gated version still exists in git history (`lib/db/schema/auth.ts`, `app/api/analysis/momentum-signals/route.ts`, `app/momentum-radar/page.tsx`) and can be restored. Flagging this as a live decision, not settled — worth revisiting.

**Design & UX** — Dark Luxury theme, fully responsive, interactive canvas charts, accessible.

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
- `/app` — Next.js pages & routes
- `/components` — React UI components
- `/lib/db` — Drizzle ORM schema & database layer
- `/lib/services` — Service layer (admin queries extracted here; more services planned)
- `/public` — Static assets
- `ecosystem.config.js` — PM2 production config
- `start.sh` — Production startup script

### Database Schema (PostgreSQL)
**`scans`** — run metadata: `id`, `run_at`, `status` (RUNNING|COMPLETED|FAILED), `market` (NSE|US), `total_scanned`, `good_results_count`
**`scan_results`** — per-stock results: `symbol`, `market`, `mb_score`, `mb_tier` (Rocket|Launcher|Builder|Crawler|Grounded), `price_at_scan`, `sector`, criteria flags l1-l6
**`stocks`** — master registry (pre-populated, indexed)
**`sectors`** — market structure
**`strategies` / `strategy_holdings`** — Portfolio Tracker
**`trades`** — Hidden Gem Finder trade feedback
**`emailTokens` / `csrfTokens`** — auth/security

### Documentation
- `README.md` — quick start
- `PROJECT_STATUS_REPORT.md` — state & blockers
- `ANTIGRAVITY_MVP1_GLOBAL_BRIEF.md` — data layer specs
- `ROADMAP.md` / `PENDING_ITEMS.md` — priorities
- `DEPLOYMENT_AUDIT.md` — required post-deploy checklist
- `SESSION_ARCHIVE.md` — full session-by-session history

---

## ✅ CURRENT STATE (as of Aug 2, 2026)

- **Production:** stable, live on port 3000 (PM2)
- **Database:** PostgreSQL `fortress`, 27 tables, 200K+ rows
- **US market:** full real technical analysis via yahoo-finance2
- **NSE market:** bulk scans working; single-ticker GEM SCORE gracefully degrades to "data unavailable" (Yahoo Finance NSE coverage gap — Phase 2 will add a dedicated NSE API)
- **Auth:** login/register/email-verify/forgot-password/reset/logout all complete; rate limiting (5 login attempts/15min), CSRF on all state-changing endpoints, email verification required before first login
- **MACD bot:** running on VPS under PM2 (`/opt/macd-bot`), Zerodha optional (scanning/Telegram work without it), multi-recipient Telegram alerts live. In observation window through ~Aug 7 to confirm the Session 41/41b fixes hold.
- **CI/CD:** GitHub Actions → VPS, building on the VPS itself
- **TypeScript build:** zero errors

---

## 📋 KNOWN ISSUES (unresolved)

- **Momentum Radar has no access gate** — see flag above. Live risk to revisit, not a bug, but a decision that's been left open longer than intended.
- **NSE/LSE single-ticker GEM SCORE degraded** — Yahoo Finance doesn't have full NSE/LSE coverage; shows honest "data unavailable" rather than wrong data. Fix is a dedicated NSE API integration (Phase 2).
- **CRON_SECRET fragility** — two separate incidents (Session 41, 41b) where a secret name/format mismatch silently broke signal posting (401s). No startup validation currently catches this class of bug early.

---

## 🎓 DESIGN DECISIONS & ASSUMPTIONS

- Symbol format stored without market suffix (HDFC, not HDFC.NS) — UI adds suffix for display
- Currency stored in local currency (INR for NSE, USD for US) — no conversion
- Minimum 50 good stocks per scan required to appear in Fortress 30
- Same scoring logic for both markets (weights may diverge in future after more data)
- Investment allocation is risk-profile-based, not financial advice
- Stock screening is technical-only (MACD, SMA, RSI) — no fundamentals in MVP
- Stateless-ish MVP — no personal data stored beyond auth + trade feedback log

---

## 📅 ROADMAP (forward-looking)

**Phase 2 (Aug-Sep):** Expand Fortress 30 to Nifty Smallcap 250 + Russell 2000 (~1,500 more tickers) — requires concurrent batch fetching (10-20 in flight) to keep scan runtime under ~5 min instead of 25+. Extract remaining admin routes to service layer.

**Phase 3 (Aug-Sep):** Extract analysis service (trades/weights/learning) to service layer. Investment Genie feedback loop + personalization. Resolve Momentum Radar access-gating decision.

**Phase 4 (Q4 2026):** Portfolio service + caching layer. Market expansion (Malaysia/KLSE, Singapore/SGX, Hong Kong/HKEX). Performance dashboard (returns, drawdown, volatility), real-time drift/price alerts.

**Backlog / not scheduled:** Full NSE/BSE/US universe (7,500+ tickers) — needs dedicated scraper tier + local caching. Broker sync (IBKR credentials + holdings import). Advanced indicators (Bollinger Bands, volume divergence). Fundamental Core tab (real P/E, growth rates, insider trading signals).

---

## 🔗 API ENDPOINTS

**Investment Genie:** `POST /api/allocation/generate`

**Fortress 30:** `GET /api/scan/results?market=NSE|US|GLOBAL`

**Portfolio:** `GET/POST /api/portfolio`, `GET /api/portfolio/[id]`, `PUT /api/portfolio/[id]/holdings`, `DELETE /api/portfolio/[id]`, `POST /api/portfolio/seed`

**Hidden Gem Finder:** `GET /api/analysis/gem-score?ticker=AAPL`
**Trade Feedback:** `POST /api/analysis/feedback` (`{ticker, gemScore, action}`), `GET /api/analysis/feedback?action=BOUGHT` (win-rate by GEM SCORE range)

**Momentum Radar:** `POST /api/analysis/momentum-signals` (bot push, shared-secret `CRON_SECRET`), `GET /api/analysis/momentum-signals` (currently ungated — see Known Issues)

**Admin:** `/api/admin/diagnostic`, `/api/admin/telegram-subscribers`, `/api/admin/bot-config` (writes bot `.env`, restarts it)

---

## 🚀 DEPLOYMENT & OPERATIONS

```bash
git push origin main
# → GitHub Actions builds on VPS → deploy → restart PM2

# THEN required: bash ~/deployment-check.sh  (see DEPLOYMENT_AUDIT.md)
```

**Local dev:**
```bash
npm install
cp .env.example .env.local   # add DATABASE_URL
npm run dev
```

**Cron jobs (VPS):** NSE scan Mon-Fri 4:30 PM IST → `/api/scan/ai-run?market=NSE`; US scan Mon-Fri 6:00 PM IST → `/api/scan/ai-run?market=US`. Logs: `/var/log/fortress_nse_scan.log`, `/var/log/fortress_us_scan.log`. Auth header: `x-cron-secret`.

**Monitoring:** Nginx + PM2 process monitoring, PostgreSQL health checks, scan status in `scans.status`, GitHub Actions notifications.

---

## 🛠 HOW TO WORK WITH THIS PROJECT

**Working style:** Non-technical owner — high-level context and clear summaries over implementation detail. Hands-off: Claude handles technical legwork.

**Ask Claude for:** documentation audits, architecture reviews, code implementation & debugging, feature planning, database/schema validation, CI/CD & deployment troubleshooting.

**Claude avoids:** unexplained jargon, implementation-detail overload, multi-step changes without confirming intent first.

**Response shape:** brief intro of the work → clear next steps (if any) → concise explanation → direct links/files → ask when unsure, never assume intent.

---

## 🤖 OPERATING MODE

**Hands-free execution:** Claude executes end-to-end without permission gates for bug fixes, feature implementation, DB migrations, docs/memory updates, and code review — plan → test → deploy → verify → document. Only stops to ask when genuinely uncertain, or to flag scope/risk/better-approach concerns. Reports status on completion with validation results. Updates this file (edited, not appended) and memory after each major task.

---

## 🔄 HOW TO UPDATE THIS FILE

This file holds **current state only** — edit sections in place, don't append a new dated block every session. When a session finishes:
- Update **CURRENT STATE** to reflect what's true now (overwrite, don't stack)
- Move anything resolved out of **KNOWN ISSUES**
- Update **ROADMAP** if priorities shifted
- Put the narrative (what happened, what broke, how it was fixed, commit hashes) in **SESSION_ARCHIVE.md** instead — that file is append-only by design, this one isn't

**Last updated:** August 2, 2026 — trimmed from 780 lines to current-state-only; full session history (Sessions 1-41b) moved to SESSION_ARCHIVE.md.
