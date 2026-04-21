# Fortress Intelligence: Product Roadmap

## The Vision
**Sovereign Wealth Intelligence Engine** — the tool NRI investors trust over Bloomberg for actionable hidden-gem alpha.

The AI doesn't just find stocks. It finds wealth-building patterns — and it gets better at finding them every month.

---

## The Core Problem
**"I have money, but no time to research, and I don't trust tipsters."**

Most platforms offer data (screeners) or orders (tips). None offer wisdom that compounds.

| The Gap | Current Market Solution | The Fortress Solution |
|---|---|---|
| **Discovery** | Manual screeners | Hidden Gem Hunter — 4-layer GEM SCORE across 8 markets |
| **Validation** | "Trust me bro" screenshots | Sovereign Alpha — public track record with real returns |
| **Learning** | Expensive courses | Mental Model Engine — hover-to-learn embedded in analysis |
| **Personalization** | One-size-fits-all | Risk Modes — Conservative / Balanced / Aggressive |
| **Trust** | No accountability | Anti-Portfolio — showing our misses, not just wins |

---

## ✅ Accomplished

### March 2026 — Sovereign Alpha (Sprint 8)
The self-learning prediction loop. Every pick tracked. Model gets smarter every 90 days.
- 6 new database tables (`alpha_scans`, `alpha_predictions`, `alpha_tracking`, `alpha_overrides`, `alpha_insights`, `alpha_weight_history`)
- 7 new API endpoints at `/api/alpha/`
- Daily cron price tracker (`scanner/price_tracker.py`)
- Performance dashboard at `/alpha`
- Risk Modes (Conservative / Balanced / Aggressive) — fully specified and documented
- Glossary expanded: GEM Tiers, GEM Criteria, Risk Modes

### March 2026 — V5 Deep Value Extension (Sprint 7)
- V5 institutional scan types: 52W Lows, Qualified Penny, Sub-₹10
- NextAuth.js v5 admin authentication
- Full thesis CRUD + V5 stock editor admin panel
- CI/CD hardened with native SSH (appleboy broken for ed25519)
- PostgreSQL schema: 18 new v5 columns

### Earlier 2026 — Intelligence Layer (Sprint 6)
- Python 5-layer scanner (L1–L5: Protection, Pricing Power, Macro Tailwind, Growth, Governance)
- Real-time SSE streaming to dashboard
- Mental Model Engine: hover-to-learn tooltips, Daily Wisdom widget
- 20+ financial concepts seeded (Buffett, Munger, Kahneman)

---

## 🔵 Sprint 9 — Skill Integration (Week 3–4)

**Goal:** Close the loop. The Hidden Gem Hunter skill auto-records every scan to the VPS. The system becomes truly self-feeding.

1. **Skill Upgrade** — Hidden Gem Hunter calls `POST /api/alpha/scan` after every scan. Fire-and-forget. On failure, outputs JSON payload to copy manually.
2. **Risk Toggle** — Skill asks for risk mode upfront. Filters picks and output accordingly.
3. **Ripple Effect Section** — New HTML report section: "Cross-Market Signals. If US AI demand surges → these Indian IT beneficiaries..."
4. **Wealth Synthesis Section** — New report section: REITs, InvITs, land bank companies, dividend aristocrats.
5. **Glossary Tab** — Render the 3 new Glossary sections in the v5-extension UI (data is live, rendering is this sprint).
6. **Navbar** — Wire `/alpha` into the navigation.

---

## 🟡 Sprint 10 — First Data Cycle + Genie Research Brief (Month 2)

**Goal:** 30-day tracking data arrives. Validate the system works end-to-end. Simultaneously: Investment Genie graduates from calculator to personalised advisor.

### Alpha Tracking
1. **Telegram Alerting** — Notification when any 30/60/90d check completes. Include: ticker, return %, tier, verdict.
2. **Prediction Ledger** — Table view of all predictions with their tracking status (pending / checked / 90d complete).
3. **Apply Weights Button** — One-click to apply the learning engine's weight recommendations.
4. **Override UI** — Add override buttons to each prediction card ("Market crash", "Thesis broken", etc.).

### Investment Genie Research Brief (parallel track)
**Backlog card:** `docs/backlog/GENIE_RESEARCH_BRIEF.md`  
**Owner:** Google Antigravity (frontend) + Claude Code (data layer)

5. **Tax Profiles Data Layer** — `lib/data/tax-profiles.ts` for IN-MY, IN-SG, IN-AE profiles. Government-sourced, vintage-dated. (Claude Code)
6. **Research Brief UI** — Sections A–F rendered inline after existing Genie output, collapsed by default behind `View Your Research Brief →` CTA. (Google Antigravity)
7. **Allocation Enhancement** — Each row in the existing allocation table gets a 1-line "why this, for you" string from the mapper. (Claude Code)
8. **Integration + QA** — End-to-end test: $10K, Indian-Malaysian NRI, balanced risk. Verify all 10 acceptance criteria. (Both)

---

## 🟠 Sprint 11 — First Learning Cycle (Month 3–4)

**Goal:** 90-day data arrives. Run first weight adjustment. Prove the model is improving.

1. **Run first `POST /api/alpha/learn`** — Analyse all 90-day outcomes.
2. **Apply first weight adjustment** — Document the change and the reasoning.
3. **Japan (TSE) + Korea (KRX) market adapters** — `.T` and `.KS` suffixes added to price tracker.
4. **Data quality audit** — Compare yfinance vs Screener.in Pro for NSE fundamentals. Decision: pay $20/month if hit rate improvement > 10 points.
5. **"Is the model improving?" trend line** — Add chart to `/alpha` showing hit rate across cycles.

---

## 🔴 Sprint 12+ — Audience and Revenue (Month 4+)

**Goal:** Prove accuracy publicly. Start building the NRI audience.

1. **Public Track Record Page** — A public `/track-record` page showing overall hit rates, best picks, worst picks. No auth required. This is the trust-builder.
2. **NRI User Accounts** — Registration, watchlists, risk profile selection, personalized picks feed.
3. **Bloomberg Comparison** — "What would Bloomberg have told you vs what Fortress found?" — monthly post.
4. **Screener.in Pro integration** — If justified by data quality audit.
5. **Broker integrations** — IBKR (Malaysia primary), Moomoo, mStock/Mirae Asset deep links.

---

## Revenue Path to $1M ARR

| Tier | Price | Features | Target Users |
|---|---|---|---|
| **Free** | $0 | Fortress 30 view, basic glossary, track record | Awareness |
| **Alpha** | $49/month | Full scan access, all 8 markets, risk toggle, export | NRI retail investors |
| **Family** | $99/month | 3 risk profiles, Telegram alerts, prediction ledger | HNI families |
| **Institutional** | $499/month | API access, custom markets, white-label | Boutique advisors |

1,700 Alpha subscribers = $1M ARR.

---

## Wealth Synthesis Module (Planned)

Public market proxies for private wealth-building patterns. Added to every full-market scan report:

- **REITs with NAV discount** — Embassy REIT, Brookfield REIT, Mindspace REIT. Screen: yield >7%, NAV discount >15%
- **InvITs** — IRB InvIT, PowerGrid InvIT. Screen: distribution yield >9%, sponsor quality
- **Land bank companies** — Listed companies with land value > market cap (Bombay Dyeing, DLF at distressed P/B)
- **Dividend aristocrats** — 10+ consecutive years of dividend increases, yield >4%, payout <60%
- **Capital allocation masters** — Aggressive buybacks at sub-book valuations

---

## Ripple Effect Engine (Planned)

Cross-market intelligence. When a trend is detected in one market, the scan proactively identifies beneficiaries in others:

- US AI/semiconductor demand surge → Indian IT exporters, Korean chip suppliers, Japanese equipment makers
- India defence budget increase → Indian OEM stocks, international supply chain
- Commodity supercycle → EM exporters, Indian processors, logistics beneficiaries
- Interest rate change in major economy → yield-sensitive assets globally
