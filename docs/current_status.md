# Current Status — March 25, 2026

## Session 2 — Live Scanner Tab Fix + Deployment Stabilisation

### What Was Fixed
4. **Live scanner results not appearing in V5 Extension tabs** — Sub-₹20, Penny, and 52W Lows
   tabs showed only curated stocks after scan completion, even after hard refresh. Root cause:
   `getLiveScanStocksByCategory()` and `getBestScan()` in `actions.ts` used Drizzle's relational
   query API (`db.query.scans.findFirst`) which silently fails in the Next.js standalone
   production build when no `relations()` are defined in the schema. Fixed by converting both
   functions to use `db.select().from(schema.scans)` (the standard query builder API used
   everywhere else). All four live query functions now work: `getLiveSub20Stocks`,
   `getLivePennyStocks`, `getLive52WLowStocks`, `getLiveF30Stocks`/`getLiveF30Candidates`.

5. **Deployment infrastructure** — `ecosystem.config.js` had wrong paths (`/opt/fortress/app/`
   instead of `/opt/fortress/`). `deploy-vps.sh` referenced `.env` instead of `.env.local`.
   Both corrected. PM2 process renamed from `fortress` to `fortress-app` running from
   standalone build. Standard deploy command: `cd /opt/fortress && bash scripts/deploy-vps.sh`.

---

## Session 1 — Engine Hardening + Sovereign Alpha Bootstrap

### What Was Fixed
1. **Scan reliability** — 86% failure rate (6/7 scans stuck/crashed). Root cause: no timeout
   on yfinance calls. Fixed with `as_completed(timeout=120)` + `future.result(timeout=30)`.

2. **Data layer** — FCF/ROCE null for ~90% NSE stocks. Fixed by calculating directly from
   cashflow statement and income_stmt/balance_sheet. Sanity check confirmed on 5 known stocks.

3. **Sovereign Alpha bootstrapped** — 215 NSE predictions recorded at Nifty 22,912.
   First 90-day alpha measurement due June 2026.

### Sanity Check Results (before → after fix)
| Stock | Total | L1 | FCF Yield | Verdict |
|---|---|---|---|---|
| Asian Paints | 42→50 | 7→15 | None→1.22% | Correctly improved |
| Tata Elxsi | 42→53 | 7→18 | None→3.06% | cc=100 confirmed |
| Vodafone Idea | 25→25 | 0→0 | None→-1.09% | Correctly poor |
| Suzlon | 57→63 | 7→13 | None→1.28% | Turnaround captured |

### Known Issues (carry forward)
- L3 labelled "Macro Tailwind" — actually measures Relative Strength (momentum)
- Sovereign Alpha outcome metric must track alpha vs Nifty, not raw return
- TAM table uses USD for domestic Indian stocks (distorts NBFC/banking MB scores)
- HDFC Bank compounding = 0 (banking ROCE formula not adapted)
- No thesis invalidation signals yet

---

# Sprint 8: Sovereign Alpha — Self-Learning Prediction Engine
**Completed: March 15, 2026**

The Fortress Intelligence platform now has a self-correcting feedback loop. Every Hidden Gem Hunter scan is recorded, tracked at 30/60/90 days, and fed back into the model. The GEM SCORE criteria weights can now be adjusted based on proven predictive performance.

---

## What Was Built

### Database Layer
Six new PostgreSQL tables added to the existing schema via Drizzle ORM:

| Table | Purpose |
|---|---|
| `alpha_scans` | Every scan session: markets, risk mode, active weights, total picks |
| `alpha_predictions` | Every individual pick: full GEM SCORE breakdown, entry price, thesis, risk tier |
| `alpha_tracking` | 30/60/90-day price checks with return % auto-calculated |
| `alpha_overrides` | Manual context tags — "market crash, thesis intact" — excluded from penalty |
| `alpha_insights` | Learning reports: criteria performance, weight recommendations, hit rates |
| `alpha_weight_history` | Full audit trail of every scoring weight change |

### API Layer (`/api/alpha/`)
| Endpoint | Purpose |
|---|---|
| `POST /api/alpha/scan` | Record scan session + all predictions |
| `GET /api/alpha/track?pending=true` | List predictions due for price check |
| `POST /api/alpha/track` | Record a price check result |
| `POST /api/alpha/override` | Tag a prediction with manual context |
| `POST /api/alpha/learn` | Generate learning report from 90d outcomes |
| `GET /api/alpha/dashboard` | Full performance data package |
| `GET/POST /api/alpha/weights` | View and apply scoring weight changes |

All endpoints secured with `x-admin-secret` header.

### Price Tracker Cron Job
`scanner/price_tracker.py` — runs daily at 08:00 VPS time. Queries the API for pending checks, fetches current prices via yfinance, posts results back. Auto-triggers learning report when 5+ 90-day checks complete in a batch.

Install: `sudo /opt/fortress/scripts/cron-alpha.sh`

### Performance Dashboard
`/alpha` — dark-luxury performance view:
- Overall hit rate with trend over time
- Hit rate by market (NSE / US / ETF / MF)
- Hit rate by tier (Diamond / Sapphire / Emerald / Quartz)
- Top 5 and worst 5 picks at 90 days
- Current scoring weights — animated rings
- Latest learning report with weight recommendations
- Weight evolution history

### Glossary Uplift
Three new sections added to the Glossary:
- **GEM Tiers** — Diamond/Sapphire/Emerald/Quartz: plain English descriptions, action guidance, frequency expectations
- **GEM Criteria** — All 4 scoring criteria: what they measure, signals they detect, red flags that disqualify
- **Risk Modes** — Conservative/Balanced/Aggressive: who they're for, rules, stop-loss logic

---

## Verification

- TypeScript: zero new errors (4 pre-existing errors in `V5MarketScanner.tsx` unchanged)
- All API routes follow existing auth pattern
- Schema uses Drizzle pgTable with proper foreign keys and cascades
- Price tracker tested against yfinance for NSE (.NS), BSE (.BO), US, SGX (.SI) suffixes

---

## Deploy Steps (VPS)

```bash
cd /opt/fortress
git pull origin main && npm ci && npm run build
DATABASE_URL=postgresql://fortress_user:PASSWORD@localhost:5432/fortress npm run drizzle:push
pm2 restart fortress --update-env && pm2 save
chmod +x /opt/fortress/scripts/cron-alpha.sh && sudo /opt/fortress/scripts/cron-alpha.sh
```

Verify: `curl -H "x-admin-secret: YOUR_SECRET" http://localhost:3000/api/alpha/dashboard`

---

## Sprint 9 — Next Steps

1. **Skill Upgrade** — Update Hidden Gem Hunter skill to auto-call `POST /api/alpha/scan` after every scan. Add risk toggle input. Add Ripple Effect and Wealth Synthesis sections to HTML report.
2. **Glossary Tab Rendering** — Update `/v5-extension` Glossary tab to render `gemTiers`, `gemCriteria`, `riskModes` sections (data is live, UI card rendering is Sprint 9).
3. **Navbar** — Wire `/alpha` into the Navbar.
4. **Telegram Alerting** — Notify when 30/60/90d price check completes.

---

## Prior Sprints

### Sprint 7: V5 Deep Value Extension (March 10, 2026)
- V5 stock types: `V5Stock` interface, `Stock` kept clean
- `/v5-extension` with 52W Lows, Qualified Penny, Sub-₹10 scans
- `seedV5Stocks()` upsert-safe seeding — 24 stocks to PostgreSQL
- Admin: Full thesis CRUD + v5 stock editor
- Auth: NextAuth.js v5, `proxy.ts` convention, no hardcoded secrets
- CI/CD: Native SSH client (appleboy/ssh-action broke on ed25519)
- DB schema: 18 new columns on `stocks` table

### Sprint 6: Intelligence Layer (Earlier 2026)
- Python 5-layer scanner with real-time SSE streaming
- Mental Model Engine: hover-to-learn tooltips, Daily Wisdom widget
- Concepts table seeded with 20+ Buffett/Munger/Kahneman concepts
