# Fortress Intelligence 🛡️

> **"Not prediction. Preparation."**
> Structure and discipline replace gut feel. Fortress doesn't tell you what to buy.
> It tells you what deserves your attention — and builds a track record to prove it.

---

## Vision

A global stock intelligence platform that gives any investor — anywhere in the world — the same institutional-grade analysis that was previously only available to hedge funds and wealth managers. Full transparency. No black boxes. Every stock ranked, scored, and explained.

## Mission

Show investors exactly *why* a stock deserves their attention: the criteria it passed, the score it earned, and the thesis behind the ranking. Not tips. Not predictions. Frameworks they can verify and trust.

## What Makes Us Different

- **Full transparency** — Every stock shows its full score breakdown (L1–L6 criteria)
- **No editorial bias** — The score is the score. No human override, no sponsor influence
- **Multi-market** — Same rigorous framework applied to India and US markets (more markets planned)
- **Free-first data** — yfinance-powered. No paywalled data. Reproducible by anyone
- **Automatic, not manual** — Daily scans run on schedule. No human curation required

---

## Product Suite

### Fortress 30
The flagship list. Top 30 stocks from the latest scan, ranked by Multi-Bagger (MB) Score. Click any stock to see exactly why it made the list — criteria passed, score breakdown, sector context.

**Markets:** 🇮🇳 India (NSE) | 🇺🇸 United States (NYSE/NASDAQ) | 🌍 Global (blended top 30)

### Deep Value Scanner — Specialized Deep Value Scans
Beyond the flagship 30. Specialized filters for:
- **52-Week Lows** — Quality stocks at extreme discounts
- **Qualified Penny** — Small caps that pass rigorous quality criteria
- **Speculative Picks** — High-risk, high-conviction momentum plays
- **Top Picks & ETFs** — Curated selections with full investment thesis
- **Macro Sentiment Banner** — Real-time Nifty, VIX, USD-INR snapshot + sentiment

**Markets:** 🇮🇳 India (NSE) | 🇺🇸 United States (NYSE/NASDAQ)

### Investment Genie
Personalized portfolio allocation. Input your age, amount, time horizon, risk appetite, and geographic preference. Get a full allocation across asset classes with reasoning for every pick.

**Markets:** 🇮🇳 India | 🇺🇸 United States

### Macro Intelligence
Real-time macro snapshot: VIX, gold, crude, currency trends, equity momentum. Context for every investment decision.

### Sovereign Alpha Engine
Self-learning system that tracks every pick made, measures 30/60/90-day returns, and feeds learnings back into the scoring weights. The system gets smarter with every scan cycle.

---

## Market Roadmap

| Phase | Markets | Status |
|-------|---------|--------|
| MVP 1 | 🇮🇳 India (NSE) + 🇺🇸 United States | In Development |
| MVP 2 | + 🇸🇬 Singapore + 🇦🇺 Australia | Planned |
| Phase 3 | + 🇬🇧 United Kingdom + others | Future |
| Future | Crypto, Real Estate, ETFs (when PMF proven) | Research |

---

## Production Status (April 2026)

| Feature | Status | Notes |
|---------|--------|-------|
| Investment Genie | ✅ Live | 13/13 E2E tests passing |
| Fortress 30 (India) | ⚠️ Pending scan data | Scanner pipeline → DB not yet wired |
| Fortress 30 (US) | 🔨 In Development | Part of MVP 1 global sprint |
| V5 Extension (India) | ⚠️ Partially live | Curated data only; live scan pending |
| V5 Extension (US) | 🔨 In Development | Part of MVP 1 global sprint |
| Market Selector | 🔨 In Development | Global state, persists across all tabs |
| "Why Selected" Panel | 🔨 In Development | L1–L6 transparency on every stock card |
| Google OAuth | ✅ Live | Deployed April 18, 2026 |
| Dark Luxury Theme | ✅ Live | Navy/Gold premium institutional design |
| CI/CD Pipeline | ✅ Live | GitHub Actions → VPS auto-deploy |
| NSE Daily Cron | 🔨 In Development | Antigravity building scanner DB pipeline |
| US Daily Cron | 🔨 In Development | Antigravity building US scanner |

---

## Score Framework (MB Score)

Every stock gets an MB Score (0–100) based on 6 criteria:

| Criterion | What It Checks |
|-----------|---------------|
| L1 — Profitability | ROCE > 15% |
| L2 — Debt Quality | Debt-to-Equity < 0.5 |
| L3 — Free Cash Flow | Positive FCF |
| L4 — Revenue Growth | 3-year revenue CAGR > 10% |
| L5 — Momentum | Price above 200-day MA |
| L6 — Value | PEG ratio < 1.5 |

**Tiers:** Rocket (80–100) → Launcher (60–79) → Builder (40–59) → Crawler (20–39) → Grounded (<20)

These criteria are shown in full on every stock card. No hidden logic.

---

## Core Architecture

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL + Drizzle ORM |
| Scanner Engine | Python + yfinance + `ta` library |
| Authentication | NextAuth.js v5 (Google OAuth) |
| Infrastructure | PM2 + Nginx + SSL (Hostinger VPS) |
| CI/CD | GitHub Actions → SSH deploy |

**Data Source Policy:** Free-first. yfinance for all market data. Paid sources only after PMF is proven.

**Theme Policy:** ALL components use Dark Luxury theme (Navy/Gold).
- Never use `bg-white` or `text-black` — use `bg-card`, `text-foreground`, `text-muted-foreground`
- Every new page must pass contrast check before merge

---

## Parallel Development Model

This project runs two AI agents in parallel:

| Agent | Role | Owns |
|-------|------|------|
| **Claude Code** | Frontend + API + DB schema | `fortress-app/` — TypeScript, Next.js, Drizzle |
| **Antigravity** | Scanner engine + data pipeline | `Reference/OutoftheBox/` — Python, yfinance, cron |

**Interface contract:** Antigravity writes scan results to Postgres with `market="NSE"` or `market="US"`. Claude Code reads them and serves them via API. See `ANTIGRAVITY_MVP1_GLOBAL_BRIEF.md` for Antigravity's full brief.

---

## Key Documents

| Document | Purpose |
|----------|---------|
| `ANTIGRAVITY_MVP1_GLOBAL_BRIEF.md` | Antigravity's technical brief for India + US scanner pipeline |
| `HANDOVER_ANTIGRAVITY.md` | Original Investment Genie handover (historical) |
| `HANDOVER_CLAUDE_CODE.md` | Claude Code's infrastructure reference |
| `fortress-app/CHANGELOG.md` | Feature change history |
| `fortress-app/BETA_LAUNCH_READY.md` | Beta launch checklist |

---

## Local Development

```bash
cd fortress-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to VPS

Automated on every push to `main` via GitHub Actions.

```bash
# After schema changes:
DATABASE_URL=postgresql://fortress_user:PASSWORD@localhost:5432/fortress npm run drizzle:push

# Full manual deploy:
cd /opt/fortress && git pull origin main && npm ci && npm run build && pm2 restart fortress --update-env && pm2 save
```
