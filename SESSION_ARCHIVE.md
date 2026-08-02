# SESSION_ARCHIVE.md — Fortress Intelligence Session History

Full session-by-session log, moved out of CLAUDE.md on 2026-08-02 to keep the main file readable. CLAUDE.md now holds only current state; this file holds the "how we got here."

---

## Session 1-2 — VPS Rework & Deployment (July 5, 2026) — COMPLETE

**Status:** App live at https://fortressintelligence.space
**Duration:** 4 hours | **Root Cause:** Turbopack symlink issue + nested git repos + branch mismatch
**Solution:** Minimal Node.js server deployed (fallback), .turbopackignore/.gitignore fixes committed

**What Happened:**
- 502 Bad Gateway on VPS — app wouldn't start
- Turbopack build error: "Symlink fortress-scanner/venv/bin/python is invalid"
- Root causes: (1) nested git repos (`/opt/fortress/` AND `/opt/fortress/fortress-app/`), (2) master branch (CI/CD fixes) missing app code — app code on origin/main, (3) historical fortress-scanner symlink in git metadata (broken Python scanner integration), (4) multiple package-lock.json files confusing npm workspace resolution

**Fixes Applied:**
1. Created `.turbopackignore` + `.gitignore` exclusions (committed to main)
2. Deleted nested `fortress-app/` directory structure
3. Consolidated work at `/opt/fortress/` root
4. Deployed minimal Node.js server (instant, zero build errors)
5. Validated live deployment through HTTPS

**Files Changed:** `.turbopackignore` (new), `.gitignore` (new), `server.js` (VPS only — minimal fallback server), `ecosystem.config.js` (updated PM2 config)

**Deployment:** Commit 1bfded9 pushed to origin/main, VPS checkout `dd22087`, PM2 online (PID 272049), HTTPS 200.

Session 2 follow-up: install full dependency tree, build full Next.js app, verify Fortress 30 + Portfolio routes live. See FULL_APP_RESTORATION_PATH.md.

---

## May 21, 2026 — Trading Skills Installed
- 30 Claude Code skills live in `~/.claude/skills/` — zero config needed
- 9 NSE skills — `nse-trading-toolkit`, `rsi-divergence`, `multi-timeframe-analysis`, `fibonacci-trading`, `position-sizing`, `stop-loss-strategies`, `trailing-stops`, `risk-reward-ratio`, `nse-technical-analysis`
- 21 InvestSkill — DCF, Piotroski F-Score, earnings call analysis, insider tracking, sector rotation, full institutional reports
- Equity Research command — `/equity-research/research SYMBOL` → buy/sell rec with price target
- Source repos → `C:/Antigravity/trading-repos/`
- Also resolved: DB connection issue (wrong password in .env.local), production 502 errors, port mapping (3001 → 3000)

---

## May 23, 2026 — Portfolio Strategy Tracker Shipped

Full end-to-end feature shipped and pushed to GitHub.

**New DB tables:** `strategies`, `strategy_holdings`
**New API routes:** `GET/POST /api/portfolio`, `GET /api/portfolio/[id]`, `PUT /api/portfolio/[id]/holdings`, `POST /api/portfolio/seed`
**New pages:** `/portfolio`, `/portfolio/[id]`, `/portfolio/[id]/edit`, `/portfolio/rebalance-schedule`
**New components:** `StrategyCard`, `HoldingsTable`, `RebalanceSummary`, `HoldingsEditor`, `SeedButton`, `SkillResult`
**10X Moonshot seed data:** SMH 20%, QQQ 15%, TQQQ 30%, SOXL 15%, INDA 10%, GLD 10%

**Build fixes applied:** installed `@radix-ui/react-select` (was missing), created missing `SkillResult` component, fixed `schema-feedback.ts` broken `users` FK (use `varchar userId`), fixed Zod `.errors` → `.issues` (v3 API), fixed yahoo-finance2 type cast for `regularMarketPrice`.
Also resolved: TypeScript build errors, `schema-feedback.ts` Phase 3 tables FK issue.

---

## June 16, 2026 — Fortress 30 Redesign

**Critical bugs fixed:** risk filtering (Conservative/Balanced/Aggressive buttons were non-functional), navigation scrolling (sticky filter header).
**Design:** color-coded risk profiles, animations, progressive disclosure (show/hide runners-up), premium feel (backdrop blur, gradients).
**Technical:** new `Fortress30Client` component (265 lines), `filterStocksByRisk()` function, useMemo optimization, zero TS errors. Docs: `FORTRESS_30_REDESIGN.md`.

---

## July 7, 2026 — Session 10 — Hidden Gem Finder built & tested
- `/trading-specialist` tab live, navbar integration (Advanced Tools dropdown + mobile), API `/api/analysis/gem-score?ticker=AAPL` ready, scalable architecture for Phase 2 (mock → real calculation). Commit 609b689d.

## July 8, 2026 — Session 11 — Phase 2.1: Real GEM SCORE live
- Real calculation: G (Growth via SMA200) + E (Equity via SMA50) + M (Momentum via EMA21+RSI14). Data source yfinance2 v3.15.4. All tickers work (AAPL, TSLA, MSFT, HDFC, GOOGL). NSE auto-detect (.NS, ₹). Cache 15-min TTL. Graceful fallbacks (neutral signals, not 500s). Commit db0a0e7e / eb52d917 (90-day range fix).

## July 9, 2026 — Session 14 — Phase 4.0: Trade Persistence live
- Added `trades` table (ticker, gemScore, action, result, date, createdAt). API swapped in-memory array → PostgreSQL db.insert/select. 4 trades logged, survived app restart. 2 files changed. Commit `96d722fb`, build 10.6s VPS / 6.0s local, 0 errors.

## July 10, 2026 — Session 13 — Phase 2.0: Chart rendering live
- Recharts 2.12.7 LineChart, 60-day historical price + SMA(50/200). New `TradingChart.tsx` (90 lines). API `/api/analysis/gem-score` now returns `chartData: [{date, close, sma50, sma200}, ...]`. Verified AAPL/MSFT/TSLA. Commit 4e3a4151.

## July 10, 2026 — Session 15 — Phase 6: Auth & Security complete
- **6.2 Email Verification:** 24h token expiry, one-time use, login blocks unverified users (403). `emailTokens` table. Nodemailer SMTP. Commit ed367f18.
- **6.3 CSRF Protection:** token issued on login, one-time use, required via `x-csrf-token` header on POST/PUT/DELETE. `csrfTokens` table. Commit 1ba57827.
- **6.4 Rate Limiting:** login 5 failed attempts/15min → lockout; API 10 req/sec/IP → 429. In-memory (Redis upgrade path noted). Commit 1b26b324.
- **Weight Recommendations:** `/api/analysis/feedback` GET returns `weightRecommendations` per GEM SCORE range (UPWEIGHT/DOWNWEIGHT/MAINTAIN based on win-rate vs average). Commit ce25e517.

## July 20, 2026 — Session 21 — Real Data Scoring via yahoo-finance2
- Replaced `us-technical-scorer.ts` (Massive API, US-only) with `yahoo-technical-scorer.ts` (free, both markets). Removed `MASSIVE_API_KEY` dependency and hardcoded fallback dictionary. Commit 8e3e1410. Verified live: NSE 480/501, US 501/503 scanned with real computed scores.

## July 21, 2026 — Session 24 — Auth flows complete
- Added missing POST `/api/auth/logout`. Forgot-password now sends real email (was demo mode). Rate limiting on password reset (3/hour). Consolidated validation into `lib/validation/email.ts` / `password.ts`. All flows (login/register/verify/forgot/reset/logout) verified E2E. Commits 75693184, 291b2277, 7c48b5a9. 11 files, ~400 LOC.

## July 28, 2026 — Session 30/30b/30c — Momentum Radar tab live
- New `/momentum-radar` nav tab — dual-timeframe MACD(12,26,9) crossover scan across Nifty 500, sourced from standalone `Equity_The-Final-chapter` bot. Read-only (no order execution exposed to web users).
- Auth/subscription gating deliberately disabled same day (commit `d8209c46`) pending Phase 3 auth/SMTP work — see CLAUDE.md Known Issues for current status of this.
- MACD bot deployed to `/opt/macd-bot` on VPS under PM2. New password-gated `/momentum-radar/admin` page for bot health + credential entry (`POST /api/admin/bot-config` writes to bot's `.env`, restarts it — no SSH needed). Validated end-to-end with dummy credentials then cleaned up.
- CI/CD deploy pipeline fixed to build on the VPS; duplicate CRON_SECRET cleaned up.

## July 31, 2026 — Session 41 — MACD Bot Consolidation & Zerodha Optional
- Deleted stale duplicate bot file (`scripts/macd-bot/macd_excel_bot.py`, 361 lines); kept `bot/macd_excel_bot.py` (1550 lines) as single source of truth.
- Fixed env var mismatch: `FORTRESS_CRON_SECRET` → `CRON_SECRET` (3 refs).
- Made Zerodha fully optional (like Telegram) — missing/invalid credentials now log info only, no error/login prompts; scanning and Telegram work regardless.
- Commits `bdab85f4`, `bf471f2b`, `fdd4ad03`. Verified live: bot online, no Zerodha errors, 31 active signals, correct message format.

## July 31, 2026 — Session 41b — API Auth + Multi-Recipient Alerts (same day)
- Fixed API push logging (status code + signal count now logged).
- Fixed 401 auth error — Fortress app wasn't loading CRON_SECRET correctly, restarted app.
- Bot now broadcasts alerts to admin + all subscribers (was admin-only) via `/api/admin/telegram-subscribers`.
- Fixed CRON_SECRET typo in bot's `.env` (missing trailing `=`).
- Commits `53bf728e`, `ff5c027d`. Verified: signals posting with status 200, 35 active signals, multi-recipient broadcast confirmed in logs.
- **Note:** two separate CRON_SECRET mismatches caused outage-class bugs across Sessions 41/41b. Worth a startup check that fails loud on missing/malformed secret rather than relying on manual `.env` review catching it.

## July 31, 2026 — Architecture: Service Layer Extraction Phase 1
- Extracted admin read-only queries to `lib/services/admin.ts` (`getDiagnosticData()`, `getTelegramSubscribers()`, `getMomentumStatus()`). Updated `/api/admin/diagnostic` and `/api/admin/telegram-subscribers` GET to use it.
- Why: 37 routes were directly importing db — a schema change broke 10+ routes at once. Now a schema change touches 1 service file.
- Zero behavioral changes. Rollback tag: `backup/before-service-layer-20260731_193608`.
- Roadmap: Phase 2 (Aug) extract remaining admin routes; Phase 3 (Aug) extract analysis service; Phase 4 (Aug) portfolio service + caching.
- Docs: ARCHITECTURE_REFACTOR_ANALYSIS.md, POST_DEPLOYMENT_VALIDATION.md
