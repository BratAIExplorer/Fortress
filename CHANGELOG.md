# Fortress Intelligence — Changelog

## [0.4.1] - 2026-04-22 (Phase 1+2 Beta Feedback Redesign)

### Fixed
- **Investment Genie — India shows US stocks**: Fixed missing market filter in `allocatePortfolio()` upside/Rocket-tier layer. Curated India portfolios no longer include US equities. File: `lib/investment-genie/allocator.ts`
- **Investment Genie — Currency stays USD when India selected**: Fixed hardcoded `$` in `AllocationResult.tsx` — now uses `formatPrice()` to display ₹ INR when India market selected. File: `components/investment-genie/AllocationResult.tsx`
- **Intelligent Scanner — silently broken for users**: Scanner showed active button but ran admin-only at API level. Non-admin users now see "Scanner runs automatically — results appear in the tabs above." File: `components/fortress/V5MarketScanner.tsx`
- **QS / OCF / MB Score tooltips missing**: Added hover tooltips (ⓘ icon) on all stock cards with plain-English definitions of Quality Score, Operating Cash Flow, and Multi-Bagger Score. Files: `components/fortress/V5StockCard.tsx`, `components/fortress/ScannerCandidateCard.tsx`

### Changed
- **Renamed: V5 Extension → Deep Value Scanner**: All user-facing labels and breadcrumbs updated. URL `/v5-extension` unchanged (backward compat). Files: `Navbar.tsx`, `Breadcrumb.tsx`, `app/page.tsx`, `app/guide/page.tsx`, `app/v5-extension/page.tsx`
- **Fortress-30 default market**: Changed from `"US"` to `"NSE"` for India-first positioning. File: `app/fortress-30/page.tsx`

### Added
- **Macro Sentiment Banner on Deep Value Scanner page**: New component `MacroSentimentBanner.tsx` embedded at top of scanner page. Shows Nifty/VIX/USD-INR snapshot + sentiment indicator + link to full `/macro` intelligence. Includes new server action `getLatestMacroSnapshot()` in `app/actions.ts`. Files: `components/fortress/MacroSentimentBanner.tsx` (new), `app/actions.ts` (new function), `app/v5-extension/page.tsx`
- **Scanner tab criteria descriptions**: Each tab (52W Lows, Qualified Penny, Sub-₹20 Spec, etc.) now shows 1-2 line explanation of its filter logic. File: `components/fortress/V5ExtensionTabs.tsx`
- **Intelligence page progressive disclosure**: Six technical scoring sections (L1–L5 Criteria, MB Score Engine, etc.) collapsed by default in beginner mode. MB Score section includes new banner explanation. File: `app/intelligence/page.tsx`

---

## 2026-04-18 (Admin Security Hardening & Beta Launch Sync)

### Added
- **Admin Access Control**: Implemented role-based access control (RBAC) across the UI.
  - **Sovereign Alpha Dashboard**: Navigation link in Navbar is now hidden for non-admin users.
  - **Manual Refresh (Admin)**: The admin control panel on the `/macro` page is now gated by a server-side session check.
- **Documentation Expansion**:
  - **Investment Genie Breakdown**: Added a comprehensive technical explanation of the cluster-based allocation methodology.
  - **Data Integrity / Sources**: Added a dedicated section clarifying data origins (yfinance, FRED, RBI) and update frequencies.
- **Improved UI Messaging**: Updated the `/guide` page to prominently feature Sovereign Alpha and Investment Genie as "Live" for the beta launch.
- **Analytics & Social Proof**:
  - **Live Tracking**: Implemented specialized page-view tracking middleware with rate limiting (100 req/min).
  - **Live Activity API**: Created administrative endpoint for real-time traffic analysis.
  - **Social Proof Widget**: Added an animated, glassmorphic live activity indicator on the homepage to build user FOMO.
  - **Admin Analytics Dashboard**: Enhanced the `/admin` overview with live users online and trending pages metrics.

### Security
- **NextAuth Integration**: Configured the root layout with `SessionProvider` to enable global session awareness.
- **Secrets Management**: Verified and documented administrative secrets (`ADMIN_SECRET`, `CRON_SECRET`) for production use.

### Fixed
- **Navbar Links**: Removed "unauthorized" links for public users to reduce noise and improve security posturing.

---

## 2026-03-25 (Live Scanner Fix + Deployment Stabilisation)

### Fixed
- **Live scanner tabs blank after scan** — Sub-₹20, Penny, and 52W Lows tabs in V5 Extension
  showed only curated stocks despite scan data existing in DB. Root cause: `db.query.scans.findFirst()`
  (Drizzle relational API) silently fails in standalone production build without `relations()` defined.
  Converted `getLiveScanStocksByCategory()` and `getBestScan()` to `db.select()` query builder.
  All four live query functions now work correctly.
- **Deployment paths** — `ecosystem.config.js` pointed to `/opt/fortress/app/` (wrong).
  Corrected to `/opt/fortress/`. `deploy-vps.sh` referenced `.env` instead of `.env.local`. Fixed.
  PM2 process is now `fortress-app` running from the standalone build.

---

## 2026-03-25 (Live Scanner Bridge)

### Added
- **Live Scanner UI Bridge**: All V5 Extension tabs (52W Lows, Qualified Penny, Sub-₹20 Spec) now display live scanner results alongside curated data.
  - New `V5Stock` fields: `isLivePick?: boolean`, `mbScore?: number`, `mbTier?: string`
  - New `ScannerCandidate` interface for Fortress 30 scanner candidates
  - New helpers: `getLiveSub20Stocks()`, `getLive52WLowStocks()`, `getLivePennyStocks()`, `getLiveF30Candidates(limit)`
  - Private helper `getLiveScanStocksByCategory(category)` fetches from latest completed scan, queries `scan_results` table

- **V5 Extension Tabs**: SplitStockGrid component now renders curated and scanner-detected stocks in separate labeled sections
  - Curated: amber label, sorted first
  - Scanner Detected: emerald label, deduplicated by symbol, sorted after
  - Live picks show green "Live Scan" badge with RadioTower icon
  - MB Score row displayed for live picks
  - Missing `drop52w` shows "–" instead of "0%"

- **Fortress 30 Page**: New "Scanner Candidates" section below curated grid
  - Fetches up to 10 candidates via `getLiveF30Candidates(10)`
  - Excludes symbols already in curated stocks table
  - Only visible if candidates exist
  - Uses new `ScannerCandidateCard` component (compact cards with symbol, price, MB tier, score, megatrend, FCF yield, debt direction)

---

## 2026-03-25

### Fixed
- **Scan reliability**: Added timeout guard on ThreadPoolExecutor —
  as_completed(timeout=120) + future.result(timeout=30). Prevents
  infinite hang when yfinance stalls on an NSE stock. Was causing 86%
  scan failure rate (6 of 7 scans stuck or crashed).

- **Data layer — FCF**: Added get_fcf_from_cashflow() helper.
  Calculates FCF = OCF minus CapEx directly from cashflow statement.
  yfinance freeCashflow field returns null for ~90% of NSE stocks.
  CapEx=None guard prevents overstating FCF when CapEx label missing.

- **Data layer — ROCE**: Added get_roce_from_statements() helper.
  Calculates ROCE = EBIT / (Total Assets minus Current Liabilities)
  from statements. Consistent with Coffee Can ROCE logic.

- **Info dict override**: Calculated values always override yfinance.
  yfinance values are unreliable even when present, not just missing.

### Known Issues / Next Sprint
- Sovereign Alpha (alpha_predictions table) not yet created.
  Learning loop is conceptual — zero historical outcome data collected.
- Sovereign Alpha outcome metric must track alpha vs benchmark (Nifty 50),
  not raw positive return. Current design will learn from noise.
- Promoter pledge / delivery % data unavailable (needs Trendlyne or NSE Bhavcopy).
- L3 labelled "Macro Tailwind" but measures Relative Strength (momentum).
  Rename pending.
- TAM table uses USD for domestic Indian stocks — distorts runway scores
  for NBFCs, local consumption, banking businesses.
- HDFC Bank compounding score = 0 — banking business model not captured
  by ROCE x reinvestment rate formula. Known limitation.
- No thesis invalidation signals — users have no signal when to exit.

### Audit Findings Status (external review 2026-03-24)
| Finding                          | Status                                      |
|----------------------------------|---------------------------------------------|
| yfinance data fragility          | Partially fixed — FCF/ROCE from statements  |
| Scan hang / reliability          | Fixed                                       |
| L3 misnaming                     | Noted, not yet renamed                      |
| Sovereign Alpha measurement flaw | Noted, not yet addressed                    |
| TAM currency mismatch            | Noted, not yet addressed                    |
| Missing thesis invalidation      | Not yet built                               |
| Sovereign Alpha table missing    | Not yet created                             |

## 2026-03-25 (continued)

### Fixed
- **L5 governance hardcoding**: `l5Pass: true` in route.ts bypassed Python engine output entirely.
  All 215 existing predictions have inflated L5 scores (15/15 for every stock including
  Vodafone Idea). Future scans use honest governance proxy.
- **L5 engine placeholder**: Python engine also hardcoded `l5 = weights['l5']` (full credit).
  Replaced with basic proxy: D/E < 1.0 (35%), positive OCF (35%), debt trajectory (30%).
  Vodafone Idea now correctly scores l5=0. Asian Paints/Tata Elxsi score 9/15.
- **Database indexes added**: scan_results (scan_id+score), scan_results (market+score),
  alpha_predictions (entry_date+symbol).

### Impact on Existing Predictions
- 215 predictions recorded 2026-03-25 have l5 scores inflated by +6 to +15 points.
- These are the baseline dataset — leave as-is for historical consistency.
- All future scans use corrected L5 scoring.
- Effective threshold for "genuinely qualified" in existing dataset: total_score >= 66
  (accounts for ~6pt L5 inflation on average).
