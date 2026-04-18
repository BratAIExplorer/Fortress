# Fortress Intelligence: Senior AI Handover & Infrastructure Blueprint
**Last updated: April 18, 2026**

---

## 🎯 Product Vision & Motto

> **"Not prediction. Preparation."**

Fortress Intelligence is a Sovereign Wealth Intelligence Engine for NRI investors.
Structure and discipline replace gut feel. The AI's role is triangulation (qualitative
research at scale), pattern recognition (Sovereign Alpha), and discipline enforcement.

**Data Source Policy (March 2026):** Free-first. yfinance with statement-level FCF/ROCE
fallbacks. No paid sources until alpha is empirically proven at 90-day cycle. It finds hidden gems across Stocks, ETFs, and Mutual Funds using a self-learning prediction system that improves accuracy with every 90-day scan cycle. The infrastructure goal is **Zero-Interference Hosting** — scale to multiple products on a single VPS with institutional-grade isolation.

---

## 🛡️ April 2026 Beta Audit & Remediation

Conducted a priority audit to resolve functional and visual blockers before public beta.

### 1. The "Contrast Trap" (CRITICAL)
- **Problem**: Future agents were adding `bg-white` cards to the dark-themed app. Since global `text-foreground` is light-colored, text became invisible (light-on-white).
- **Remedy**: **NEVER use `bg-white`**. Always use `bg-card`, `bg-background`, or `bg-secondary`. Use HSL variables from `globals.css`.
- **Enforcement**: Mandatory check in `InvestmentGenieForm.tsx` and `AllocationResult.tsx`.

### 2. Route Coverage
- **Problem**: `/stocks` was 404. Navigation intended to show a listing of all tracked equities.
- **Fixed**: Created `app/stocks/page.tsx` as a root listing fetched from PostgreSQL.

### 3. Investment Genie Reliability
- **Problem**: Form submission failing due to non-existent UI component imports and missing accessibility labels. Vitest configuration missing Next.js path aliases.
- **Fixed**: Rewrote form using standard accessible elements; added `aria-label` for Playwright E2E compatibility. Configured missing `@/*` vitest path aliases. Integrated Sovereign Alpha to components.
- **Verification**: 44/44 Unit tests passing. All Playwright E2E scenarios passing. Investment Genie feature fully validated, merged to main and ready for production launch.

---

## 🏗️ Architecture

**Vertical Sandbox** approach:
- **Process Isolation (PM2)**: App process named `fortress-app`, managed by `/opt/fortress/ecosystem.config.js`.
- **Dependency Isolation**: Next.js `standalone` output in `next.config.ts`.
- **Port**: App runs on **port 3000** (`srv1327289`, Hostinger).
- **Reverse Proxy**: Nginx with SSL (Let's Encrypt).
- **Database**: PostgreSQL, dedicated user `fortress_user`, database `fortress`.

---

## 🖥️ VPS Production State (March 15, 2026)

| Setting | Value |
|---|---|
| Server | `srv1327289` (Hostinger VPS) |
| App path | `/opt/fortress/` |
| Git remote | `https://github.com/BratAIExplorer/Fortress.git` (branch: `main`) |
| PM2 process | `fortress-app`, standalone build via `ecosystem.config.js` |
| Database | PostgreSQL — `fortress_user` @ `localhost:5432/fortress` |
| Env file | `/opt/fortress/.env.local` (NOT in git) |
| Node | v20.20.0 |
| npm | 10.8.2 |
| PM2 | 6.0.14 |
| Alpha cron | `price_tracker.py` daily at 08:00 via crontab |

### Required `/opt/fortress/.env.local`
```env
DATABASE_URL=postgresql://fortress_user:YOUR_PASSWORD@localhost:5432/fortress
ADMIN_SECRET=your-admin-panel-password
AUTH_SECRET=your-32-char-random-string
```
⚠️ Not in git. Recreate manually if VPS is rebuilt before starting the app.

### 🚀 Deploying Database Changes (April 18)
After pushing changes to `main`:
1. **SSH to VPS**: `ssh user@srv1327289.hostinger.com`
2. **Pull latest**: `cd /opt/fortress && git pull`
3. **Run Migrations**: 
   - Option A (Sync): `npx drizzle-kit push` (Uses `.env.local`)
   - Option B (SQL): `psql $DATABASE_URL -f drizzle/0001_breezy_psylocke.sql`
4. **Restart App**: `npm run deploy:reload` (PM2 reload)

---

## 🗄️ Database Schema (Drizzle ORM + PostgreSQL)

Schema file: `lib/db/schema.ts`

### Core Tables (Pre-existing)
| Table | Purpose |
|---|---|
| `stocks` | Core stock reference with all v5 fields |
| `scans` | Scanner run sessions (5-layer engine) |
| `scan_results` | Deep score snapshots per scanner run |
| `theses` | Investment thesis CRUD |
| `collections` | Fortress 30, Velocity Set, etc. |
| `collection_members` | Junction: stock ↔ collection with risk weights |
| `changelog` | Entry/exit/rebalance audit trail |
| `concepts` | Mental model glossary (Buffett, Munger, Kahneman) |

### Sovereign Alpha Tables (Added March 15, 2026)
| Table | Purpose |
|---|---|
| `alpha_scans` | GEM SCORE scan sessions: markets, risk mode, active weights |
| `alpha_predictions` | Every pick: full GEM SCORE breakdown, entry price, thesis, tier |
| `alpha_tracking` | 30/60/90-day price checks with return % |
| `alpha_overrides` | Manual context tags — excluded from learning penalty |
| `alpha_insights` | Learning reports: criteria performance, weight recommendations |
| `alpha_weight_history` | Audit trail of all scoring weight changes |

### User & Interaction Tables (Added April 18, 2026)
| Table | Purpose |
|---|---|
| `auth_user` | User records, passwords, admin flags, and onboarding status |
| `password_reset_requests` | Secure 15-min tokens for self-service password recovery |
| `feedback` | Bug reports, suggestions, and validation feedback with admin review tracking |

### v5 Columns on `stocks` Table
`v5_category`, `tag`, `risk`, `industry`, `drop_52w`, `moat`, `l1`–`l5`, `why_down`, `why_buy`, `penny_why`, `multi_bagger_case`, `killer_risk`, `fortress_note`, `ocf`

### Apply Schema Changes
```bash
# ALWAYS prefix DATABASE_URL — drizzle-kit does NOT auto-load .env.local
DATABASE_URL=postgresql://fortress_user:PASSWORD@localhost:5432/fortress npm run drizzle:push
```

---

## 🔌 Live Scanner Integration (Added March 25, 2026)

Three major changes enable live scanner picks to appear alongside curated data:

### New Data Types
- **`V5Stock` fields**: Added `isLivePick?: boolean`, `mbScore?: number`, `mbTier?: string` to distinguish scanner results
- **`ScannerCandidate` interface**: Compact type for Fortress 30 candidates with symbol, price, MB tier, score, megatrend, FCF yield, debt direction

### Query Layer (app/actions.ts)
New private helper `getLiveScanStocksByCategory(category)` queries `scan_results` table:
- `getLiveSub20Stocks()` — `category = 'SUB20'`
- `getLive52WLowStocks()` — `category = '52W_LOW'`
- `getLivePennyStocks()` — `category = 'PENNY'`
- `getLiveF30Candidates(limit)` — all results ordered by `mbScore DESC`, excluding symbols already in `stocks` table

### UI Layer

**V5 Extension Tabs (3 specialized views)**
- Each tab (52W Lows, Qualified Penny, Sub-₹20 Spec) now fetches curated + live in parallel
- `SplitStockGrid` component renders two labeled sections: "Curated" (amber) and "Scanner Detected" (emerald)
- Live picks appended after curated (deduplicated by symbol)
- `V5StockCard`: Shows green "Live Scan" badge with RadioTower icon when `isLivePick = true`; displays MB Score row for live picks; shows "–" instead of "0%" for missing `drop52w`

**Fortress 30 Page**
- Fetches `getLiveF30Candidates(10)` alongside curated `getStocks()`
- Shows curated Fortress 30 grid as before
- Below: "Scanner Candidates" section with `ScannerCandidateCard` grid (only visible if candidates exist)
- Candidates labeled "Scanner Detected · No Editorial Review" to clarify unreviewed status

**ScannerCandidateCard Component** (NEW)
- Compact card for Fortress 30 candidates
- Shows: symbol, price, MB tier badge, MB score, megatrend with emoji, FCF yield, debt direction icon
- Green border (`emerald-500/20`) and hover effects to match theme

---

## 🧠 Two Scoring Systems (Important — Do Not Confuse)

Fortress has two scoring systems that coexist and serve different purposes:

### System 1: GEM SCORE (Hidden Gem Hunter Skill)
Used for discovery — finding hidden gems across all markets via Claude's live web research.

| Criterion | Weight | What It Measures |
|---|---|---|
| Valuation Edge | 30 pts | P/E, P/B, EV/EBITDA vs sector. PEG < 1.2 |
| Institutional Blindspot | 25 pts | Low analyst coverage, low institutional ownership |
| Fundamental Strength | 25 pts | Revenue >15% YoY, ROE >15%, positive FCF |
| Momentum Divergence | 20 pts | Strong business, lagging price; unusual volume |

**Tiers:** Diamond (80–100) / Sapphire (60–79) / Emerald (40–59) / Quartz (20–39) / Dust (<20, hidden)

**Weights are dynamic** — the learning engine adjusts them after each 90-day cycle based on predictive performance. Current weights stored in `alpha_weight_history`, default `{undervaluation:30,institutional:25,fundamental:25,momentum:20}`.

### System 2: 5-Layer Engine Score (`scanner/engine.py`)
Used for automated quality filtering — scanning thousands of tickers in real-time via yfinance.

| Layer | Factor | Points |
|---|---|---|
| L1 | Protection (D/E, ROCE, OCF) | 25 |
| L2 | Pricing Power (margins) | 20 |
| L3 | Relative Strength (vs benchmark) — note: mislabelled 'Macro Tailwind', rename pending | 15 |
| L4 | Growth Visibility (revenue CAGR) | 25 |
| L5 | Governance (manual placeholder) | 15 |

---


### Engine Fixes Applied March 25, 2026
- **Timeout guard**: `as_completed(timeout=120)` + `future.result(timeout=30)` — was causing 86% scan failure rate
- **FCF from statements**: `get_fcf_from_cashflow()` — yfinance `freeCashflow` null for ~90% NSE stocks
- **ROCE from statements**: `get_roce_from_statements()` — calculated from income_stmt + balance_sheet
- **Always override**: Calculated values override yfinance info dict (unreliable even when present)
- **Sanity check passed**: Asian Paints 42→50, Tata Elxsi 42→53, Vodafone Idea 25 (correct)

### Sovereign Alpha — Actual State (March 25, 2026)
- **215 predictions recorded** from first clean NSE scan
- **Benchmark locked**: Nifty 50 at 22,912.4
- **First outcome measurement**: June 2026 (90 days)
- **108 cc_confirmed** (cc_score ≥ 60) — historically consistent quality
- **55 cc_divergent** (cc_score < 40) — snapshot quality only, higher risk
- Top entries: ARIES.NS (92), GANDHITUBE.NS (91), EMCURE.NS (91), CANTABIL.NS (90)

## 🔄 Sovereign Alpha Feedback Loop

```
SCAN → RECORD → TRACK → LEARN → ADJUST → REPEAT
```

1. **SCAN**: Hidden Gem Hunter skill runs → generates picks with GEM SCORE
2. **RECORD**: Call `POST /api/alpha/scan` → all picks stored with entry prices
3. **TRACK**: Daily cron at 08:00 → `price_tracker.py` checks pending 30/60/90d windows
4. **LEARN**: After 90-day batch → `POST /api/alpha/learn` analyses which criteria predicted winners
5. **ADJUST**: Apply weight recommendations via `POST /api/alpha/weights`

### Alpha API Endpoints
All require `x-admin-secret: ADMIN_SECRET` header.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/alpha/scan` | POST | Record scan + predictions |
| `/api/alpha/scan` | GET | List recent scans |
| `/api/alpha/track` | POST | Record price check |
| `/api/alpha/track?pending=true` | GET | List checks due |
| `/api/alpha/override` | POST | Add context tag |
| `/api/alpha/learn` | POST | Generate learning report |
| `/api/alpha/learn` | GET | Fetch latest insights |
| `/api/alpha/dashboard` | GET | Full performance data |
| `/api/alpha/weights` | GET/POST | View/apply weight changes |

### Override Types
`market_crash_intact` | `management_change` | `sector_rotation` | `thesis_broken` | `external_factor` | `upgraded_conviction` | `take_profit`

Overrides tagged `market_crash_intact`, `sector_rotation`, `external_factor` are excluded from learning penalty calculations.

### Price Tracker Cron
```bash
# Installed by:
sudo /opt/fortress/scripts/cron-alpha.sh

# Runs daily at 08:00. Log at:
tail -f /var/log/fortress-alpha-tracker.log

# Manual test:
FORTRESS_API_URL=http://localhost:3000 ADMIN_SECRET=YOUR_SECRET /opt/fortress/venv/bin/python3 /opt/fortress/scanner/price_tracker.py
```

---

## 🔑 Authentication

- **Provider**: `CredentialsProvider` — username `admin`, password = `ADMIN_SECRET` env var
- **CRITICAL**: No hardcoded fallback. Login blocked if `ADMIN_SECRET` is unset.
- **Proxy file**: `proxy.ts` at project root (NOT `middleware.ts` — Next.js 16 convention)

```ts
// proxy.ts — DO NOT rename to middleware.ts
export { auth as proxy } from "@/auth"
export const config = { matcher: ["/admin/:path*"] }
```

⚠️ `middleware.ts` is deprecated in Next.js 16. `proxy.ts` is correct. Build output shows `ƒ Proxy (Middleware)`.

---

## 🚢 CI/CD Pipeline

| Setting | Value |
|---|---|
| Repo | `github.com/BratAIExplorer/Fortress` |
| Workflow | `.github/workflows/ci.yml` |
| Trigger | Push to `main` |
| Steps | Build + lint → deploy via native SSH |

### GitHub Secrets Required
| Secret | Value |
|---|---|
| `VPS_HOST` | VPS IP address |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Full ed25519 private key from `/root/.ssh/fortress_deploy` |

### ⚠️ CI SSH Notes
- Uses **native ubuntu SSH client** — NOT `appleboy/ssh-action` (PEM parser broken for ed25519)
- Key written with forced trailing newline: `(echo "$SSH_KEY"; echo) > ~/.ssh/deploy_key`

### VPS Deploy Script
```bash
cd /opt/fortress && bash scripts/deploy-vps.sh
```

The script handles: git pull → npm install → build → copy assets + .env.local → pm2 reload.

---

## 🎨 Visual Identity

- **Fonts**: DM Sans (Sans) + IBM Plex Mono (Mono) via `next/font/google`
- **Toast**: `sonner` v2 — `<Toaster>` in `app/layout.tsx`. Use `toast.success/error()` from `"sonner"`
- **No external UI library**: All primitives (`Tabs`, `Input`, `Textarea`, `Button`, `Card`) are custom in `components/ui/`
- **Theme**: Dark luxury — navy/gold, animated score rings, institutional feel

---

## 📐 Type System

```
Stock                — core DB-mapped type (lib/types.ts)
V5Stock              — extends Stock, v5 fields required
StockWithThesis      — Stock + Thesis join result
ThesisRow            — admin UI join type (actions.ts)
GlossaryGemTier      — Diamond/Sapphire/Emerald/Quartz definitions
GlossaryGemCriteria  — GEM SCORE criterion with signals and red flags
GlossaryRiskMode     — Conservative/Balanced/Aggressive rules
```

---

## 🔧 Key Technical Decisions

1. **`proxy.ts` not `middleware.ts`**: Next.js 16 convention. Never rename.
2. **`ADMIN_SECRET` mandatory**: No fallback. Intentional — blocks login if unset.
3. **v5 DB fallback**: `getV5*()` tries DB first, falls back to `lib/mock-data.ts`. Safe before seeding.
4. **`getRandomWisdom` = `ORDER BY RANDOM() LIMIT 1`**: O(1).
5. **`V5Stock` interface**: Core `Stock` stays clean. v5 fields required on subtype.
6. **`seedV5Stocks()` is upsert-safe**: Updates existing symbols, inserts new ones.
7. **drizzle:push needs explicit DATABASE_URL**: Does not auto-load `.env.local`.
8. **Native SSH in CI**: `appleboy/ssh-action` PEM parser broken for ed25519 keys.
9. **GEM SCORE weights are dynamic**: Default `{undervaluation:30,institutional:25,fundamental:25,momentum:20}`. Source of truth is `alpha_weight_history` latest record.
10. **Two scoring systems coexist**: GEM SCORE (skill, discovery) ≠ L1–L5 (engine.py, quality filter). Do not merge.
11. **Alpha API auth**: Uses `x-admin-secret` header (not session cookie) — allows cron job access.

---

## ✅ Full Completion Status (March 15, 2026)

### Code
- [x] Sovereign Alpha: 6 new DB tables, 7 API endpoints, price tracker, cron setup, dashboard
- [x] Glossary: GEM tiers, criteria, risk modes documented in types + mock-data
- [x] v5 types: `V5Stock` interface, `Stock` kept clean
- [x] v5 UI: `/v5-extension` with 3-tab deep value scans
- [x] v5 data: `seedV5Stocks()` + `/api/seed?target=v5`
- [x] v5 schema: 18 new columns on `stocks` table
- [x] Admin: Full thesis CRUD at `/admin/theses`
- [x] Admin: v5 Stock Editor UI at `/admin/v5-stocks`
- [x] Auth: NextAuth.js v5, `proxy.ts`, no hardcoded secrets
- [x] Mobile: Navigation and responsive data cards optimized
- [x] Toast: `sonner` v2
- [x] Query efficiency: `getRandomWisdom` O(1)
- [x] CI: Native SSH client replaces `appleboy/ssh-action`
- [x] Infrastructure: Nginx reverse proxy + SSL live
- [x] **Audit Fixes (April 2026)**: /stocks listing page, Investment Genie contrast/E2E
- [x] **Security Hardening (April 18, 2026)**: Admin RBAC implemented, `/alpha` gated, `/macro` refresh restricted, `SessionProvider` global, docs synced.

### Infrastructure
- [x] VPS git repo initialized at `/opt/fortress`
- [x] PostgreSQL `fortress_user` + `fortress` database confirmed
- [x] Core stocks + concepts seeded
- [x] 24 v5 stocks seeded to PostgreSQL
- [x] PM2 `fortress` process running on port 3000
- [x] GitHub secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` set

### Pending (Sprint 9)
- [ ] Schema push on VPS: `npm run drizzle:push` for alpha tables
- [ ] Cron install on VPS: `sudo /opt/fortress/scripts/cron-alpha.sh`
- [x] `/alpha` dashboard wired into Navbar (conditionally visible to admins)
- [x] Glossary tab UI updated (synced to Intelligence page)
- [ ] Telegram alerting for price check completion
- [ ] Feedback analytics dashboard (UI)
- [ ] Legal pages (ToS, Privacy Policy)
- [ ] Product proof / screenshots in Hero section

---

## 🌱 Seed Endpoints

| URL | Action | Status |
|---|---|---|
| `GET /api/seed` | Core stocks + concepts | ✅ Done |
| `GET /api/seed?target=v5` | 24 v5 stocks to PostgreSQL | ✅ Done |

---

## Maintenance Commands

```bash
# Manual VPS update
cd /opt/fortress && bash scripts/deploy-vps.sh

# Schema changes (ALWAYS prefix DATABASE_URL)
DATABASE_URL=postgresql://fortress_user:PASSWORD@localhost:5432/fortress npm run drizzle:push

# Reseed
curl http://localhost:3000/api/seed
curl "http://localhost:3000/api/seed?target=v5"

# Alpha API test
curl -H "x-admin-secret: YOUR_SECRET" http://localhost:3000/api/alpha/dashboard

# Cron (install once after first deploy)
sudo /opt/fortress/fortress-app/scripts/cron-alpha.sh

# Monitor
pm2 status
pm2 logs fortress --lines 50
tail -f /var/log/fortress-alpha-tracker.log
```
