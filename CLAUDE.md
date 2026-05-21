# CLAUDE.md — Fortress Intelligence Project Context

**Project:** Fortress Intelligence — Multi-market investment allocation & stock screening  
**Owner:** Bharat Samant (bharatsamant@gmail.com)  
**Status:** Beta Live ✅ (v0.2.0) — May 3, 2026 | UI Overhaul ✅ May 21, 2026 | Trading Skills Installed ✅ May 21, 2026  
**Live App:** https://fortressintelligence.space  
**Production VPS:** 76.13.179.32 (port 3000 via PM2)

---

## 🎯 PROJECT MISSION

Build a user-friendly investment portfolio allocation engine with real-time stock screening across US and India (NSE) markets. Users select their risk profile, receive AI-optimized allocation percentages, and browse curated stock lists (Fortress 30) for each market.

---

## 📦 WHAT EXISTS TODAY

### ✅ Features (LIVE)

**Investment Genie**
- Multi-market portfolio allocation form
- AI-powered risk-based allocation (US % / India %)
- Result summary with allocation breakdown

**Fortress 30**
- Real-time stock screening engine
- Safe Core (dividend-quality stocks)
- Growth (momentum-driven candidates)
- US Market: 346 candidates live
- India (NSE): Schema ready, awaiting data population

**Design & UX**
- Dark Luxury theme (modern, professional, accessible)
- Fully responsive (desktop, tablet, mobile)
- Clean, intuitive navigation

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

## 📊 CURRENT STATE (May 21, 2026)

### ✅ WORKING
- **Production** stable and live on port 3000 (PM2)
- **Database** PostgreSQL `fortress` fully operational with 27 tables, 200K+ rows
- **NSE market** live with 1,085+ stock candidates, real-time API responses
- **US market** screening & data updates running (9:30 AM EST daily, Mon-Fri)
- **Investment Genie** form-to-results flow 100% functional
- **Fortress 30 (Deep Value Scanner)** with new client-friendly UI:
  - ✅ Tabs renamed: "Value Picks", "Hidden Gems", "High Risk / High Reward", "How It Works"
  - ✅ Progressive disclosure: Plain English default + expandable technical details
  - ✅ Layer labels: "Financial Safety", "Pricing Power", "Market Momentum", etc.
  - ✅ MB Score display: "Growth Potential: Very High/High/Moderate/Low"
  - ✅ Human insights: Plain-language stock thesis + FCF, PEG, debt/margin trends
- **CI/CD** GitHub Actions → VPS automated deployment working flawlessly

### 🔧 INFRASTRUCTURE FIXED
- **Database credentials** corrected (was using wrong password in .env.local)
- **Connection string** updated: `postgresql://fortress_user:FortressSecure2026!@127.0.0.1:5432/fortress`
- **Port mapping** verified: App listens on 3000, Nginx reverse proxy to 443 (HTTPS)

### 🆕 TRADING SKILLS INSTALLED (May 21, 2026)
- **30 Claude Code skills** live in `~/.claude/skills/` — zero config needed
- **9 NSE skills** — `nse-trading-toolkit`, `rsi-divergence`, `multi-timeframe-analysis`, `fibonacci-trading`, `position-sizing`, `stop-loss-strategies`, `trailing-stops`, `risk-reward-ratio`, `nse-technical-analysis`
- **21 InvestSkill** — DCF, Piotroski F-Score, earnings call analysis, insider tracking, sector rotation, full institutional reports
- **Equity Research command** — `/equity-research/research SYMBOL` → buy/sell rec with price target
- **Source repos** → `C:/Antigravity/trading-repos/`
- **Integration plan** → `TRADING_INTEGRATION_PLAN.md`

### ⏳ BACKLOG (MONTH 2+)
- **Investment Genie Feedback Loop** (Track user allocations over time, learn preferences)
- **Advanced analytics** (Performance tracking, recommendation engine)
- **Expanded markets** (Malaysia, Singapore, Hong Kong — Phase 2)

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

### Cron Jobs (VPS)
- **US Scan:** 6:00 PM EST (23:00 UTC) Mon-Fri
- **NSE Scan:** 4:30 PM IST (11:00 UTC) Mon-Fri
- Both run `scanner_db_writer.py --market [NSE|US]`
- Logs: `/var/log/fortress/`

### Monitoring
- **App:** Nginx reverse proxy + PM2 process monitoring
- **DB:** PostgreSQL health checks
- **Scans:** Cron job logs + scan status in DB (`scans.status`)
- **Errors:** GitHub Actions CI/CD notifications

---

## 📋 KNOWN ISSUES & NOTES

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

### NOW (Beta Live — v0.2.0)
- ✅ Investment Genie (multi-market allocation)
- ✅ Fortress 30 / Deep Value Scanner (stock screening, NSE + US live)
- ✅ Dark Luxury UI with client-friendly overhaul (May 21)
- ✅ NSE market live (1,085+ stock candidates, real-time API)
- ✅ Trading Skills integrated (30 skills in ~/.claude/skills/)

### MONTH 2+ (Backlog)
1. Investment Genie feedback loop (after 50+ users)
2. Advanced filtering & analytics
3. Real-time alerts & monitoring
4. Expanded market coverage (Malaysia, Singapore, Hong Kong)

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

**Last Updated:** May 21, 2026  
**Next Review:** When trading skills are fully integrated into UI (Month 2 milestone)
