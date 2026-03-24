# Fortress Intelligence 🛡️

> **"Not prediction. Preparation."**
> Structure and discipline replace gut feel. Fortress doesn't tell you what to buy.
> It tells you what deserves your attention — and builds a track record to prove it.

**Project Motto:** Sovereign Wealth Intelligence Engine for disciplined investors.
**AI's Role:** Triangulation (qualitative research at scale), Pattern Recognition
(Sovereign Alpha learns which factors predict real alpha), and Discipline Enforcement
(the score is the score — no emotional override).

**Data Source Policy:** Free-first. yfinance with statement-level fallbacks for FCF/ROCE.
Paid sources (Trendlyne, Kite Connect) only after alpha is empirically proven.

---

Sovereign Wealth Intelligence Engine for NRI investors. Finds hidden gems across Stocks, ETFs, and Mutual Funds using a self-learning, multi-market prediction system that improves accuracy with every 90-day scan cycle.

## 🚀 Production Status: Sovereign Alpha — Data Collection Started
As of March 25, 2026: 215 NSE predictions recorded at Nifty 22,912. First 90-day alpha measurement due June 2026.

**Engine fixes applied March 25:** Timeout guard (was 86% failure rate), FCF/ROCE calculated from statements (was null for ~90% NSE stocks), sanity-checked against Asian Paints, Tata Elxsi, Vodafone Idea, Suzlon.

---

## 🏗️ Core Architecture

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, `proxy.ts` for Auth) |
| Database | PostgreSQL + Drizzle ORM (12 tables) |
| Scanner Engine | Python 5-layer scoring system (real-time SSE) |
| Authentication | NextAuth.js v5 (Auth.js) |
| Infrastructure | PM2 + Nginx + SSL on Hostinger VPS |
| CI/CD | GitHub Actions → native SSH deployment |
| AI Skills | Hidden Gem Hunter (Claude Code skill) |

---

## 🎯 Core Features

### Sovereign Alpha Engine (March 2026)
Self-learning prediction loop that tracks every Hidden Gem Hunter pick and improves scoring weights over time.
- **Prediction Ledger** — Every pick stored with full GEM SCORE breakdown, entry price, thesis
- **Automated Price Tracking** — 30/60/90-day return checks via daily cron job
- **Override System** — Manual context tags ("market crash — thesis intact") excluded from model penalty
- **Learning Engine** — After each 90-day cycle, analyses which criteria predicted winners; recommends weight adjustments
- **Performance Dashboard** — Live at `/alpha` — hit rates by market, by tier, weight evolution, best/worst picks
- **API Layer** — 6 endpoints at `/api/alpha/` for full programmatic control

### Hidden Gem Hunter (Claude Skill)
4-layer GEM SCORE system (0–100) finding undervalued hidden gems across India (NSE/BSE), US (NYSE/NASDAQ), Emerging Markets (Malaysia, Singapore, Indonesia, Thailand, Vietnam, Brazil, Korea, South Africa), ETFs, and Mutual Funds.

**Output Formats:** Chat summary / Ranked scored table / Dark-luxury HTML report with animated score rings

### V5 Extension
Institutional deep-value scans: 52-Week Lows, Qualified Penny Stocks, Sub-₹10 Speculative.

### 5-Layer Python Scanner
Real-time automated scanning of NSE/US/HKEX markets with SSE streaming. L1–L5 quality scoring.

### Admin Engine
- Investment thesis CRUD at `/admin/theses`
- V5 stock management at `/admin/v5-stocks`

---

## 📊 Database Schema (12 tables)

**Core:** `stocks`, `scans`, `scan_results`, `theses`, `collections`, `collection_members`, `changelog`, `concepts`

**Sovereign Alpha:** `alpha_scans`, `alpha_predictions`, `alpha_tracking`, `alpha_overrides`, `alpha_insights`, `alpha_weight_history`

---

## 🧠 GEM SCORE Framework

| Criterion | Weight | What It Measures |
|---|---|---|
| Valuation Edge | 30 pts | P/E, P/B, EV/EBITDA vs sector median. PEG < 1.2 |
| Institutional Blindspot | 25 pts | Low analyst coverage, low institutional ownership |
| Fundamental Strength | 25 pts | Revenue growth >15%, ROE >15%, positive FCF |
| Momentum Divergence | 20 pts | Strong business, price lagging; unusual volume |

**Tiers:** Diamond (80–100) → Sapphire (60–79) → Emerald (40–59) → Quartz (20–39) → Dust (0–19, never shown)

**Bonus:** Promoter increasing stake +7 | Buyback +5 | Dividend initiator +5

**Penalty:** Promoter pledge >30% −10 | Auditor qualification −15 | Regulatory investigation −20

---

## 🎛️ Risk Modes

| Mode | Tiers | Max Picks | Stop-Loss | For |
|---|---|---|---|---|
| Conservative | Diamond + Sapphire | 10 | None | Capital preservation |
| Balanced | Diamond → Emerald | 15 | −15% trailing | Growth with calculated risk |
| Aggressive | All incl. Quartz | 20 | −8% hard stop | Maximum upside, small bet |

---

## 🔑 Documentation

| Document | Contents |
|---|---|
| [ai-handover.md](ai-handover.md) | Full infrastructure blueprint, VPS state, deployment commands |
| [docs/current_status.md](docs/current_status.md) | Latest sprint summary and completion status |
| [docs/product_roadmap.md](docs/product_roadmap.md) | Sprint roadmap and strategic vision |

---

## 🛠️ Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🚢 Deploy to VPS

Automated via GitHub Actions on every push to `main`.

**After schema changes:**
```bash
DATABASE_URL=postgresql://fortress_user:PASSWORD@localhost:5432/fortress npm run drizzle:push
```

**Full manual deploy:**
```bash
cd /opt/fortress && git pull origin main && npm ci && npm run build && pm2 restart fortress --update-env && pm2 save
```

See [ai-handover.md](ai-handover.md#maintenance-commands) for all commands.
