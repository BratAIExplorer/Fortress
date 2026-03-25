# Fortress Intelligence — Architecture Codemap

**Last Updated:** March 25, 2026
**System Status:** V5 Extension with Live Scanner Bridge

---

## System Overview

Fortress is a curated intelligence platform for NRI investors, combining:
1. **Curated Lists** — Fortress 30, V5 Extensions (52W Lows, Qualified Penny, Sub-₹20 Spec)
2. **Live Scanner** — Real-time stock screening via Python engine + yfinance data
3. **UI Bridge** — Merges curated + scanner results in specialized views

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                         │
├─────────────────────────────────────────────────────────────┤
│  Fortress 30      │  V5 Extension (3 tabs)                  │
│  (Curated)        │  • 52W Lows                             │
│                   │  • Qualified Penny                      │
│                   │  • Sub-₹20 Spec                         │
│                   │  + Scanner Candidates (F30)             │
│                   │  + Scanner Detected (V5 tabs)           │
└──────────────────┬────────────────────────────────────────────┘
                   │ Parallel Fetch
        ┌──────────┴──────────┬─────────────────┐
        │                     │                 │
        v                     v                 v
┌──────────────────┐  ┌─────────────┐  ┌────────────────┐
│  Curated Data    │  │  Live Scan  │  │  Glossary /    │
│  (mock-data.ts   │  │  Results    │  │  Reference     │
│   + stocks DB)   │  │  (scan_     │  │  Data          │
│                  │  │   results)  │  │                │
└────────┬─────────┘  └──────┬──────┘  └────────┬───────┘
         │                   │                  │
         └───────────┬───────┴──────────────────┘
                     │ Merge & Deduplicate
                     v
        ┌────────────────────────────┐
        │   SplitStockGrid /          │
        │   Scanner Candidates        │
        │   Components                │
        └────────────────────────────┘
```

---

## Core Data Types

### Stock Types Hierarchy

```typescript
Stock (base)
├── id, symbol, name, sector, current_price, quality_score, market_cap_crores
├── pe_ratio, roce_5yr_avg, debt_to_equity
├── megatrend[], is_active
└── v5 fields (optional): tag, risk, drop52w, moat, l1–l5, ocf, etc.

V5Stock (extends Stock)
├── All Stock fields + v5 fields (required, non-optional)
└── isLivePick?, mbScore?, mbTier? (for live scanner results)

ScannerCandidate (new, for Fortress 30)
├── id, symbol, price, mbScore, mbTier, totalScore
├── megatrend, megatrendEmoji
├── fcfYieldPct?, deDirection?, marginDirection?
└── Derived from scan_results table
```

---

## Query Layer (app/actions.ts)

### Data Fetchers

| Function | Source | Filters | Returns |
|----------|--------|---------|---------|
| `getStocks()` | stocks table | All | Stock[] |
| `getV5LowStocks()` | stocks table | v5_category='low' | V5Stock[] (DB) or mock |
| `getV5PennyStocks()` | stocks table | v5_category='penny' | V5Stock[] |
| `getV5SubTenStocks()` | stocks table | v5_category='sub_ten' | V5Stock[] |
| `getLiveSub20Stocks()` | scan_results | latest scan, category='SUB20' | V5Stock[] (w/ isLivePick=true) |
| `getLive52WLowStocks()` | scan_results | latest scan, category='52W_LOW' | V5Stock[] |
| `getLivePennyStocks()` | scan_results | latest scan, category='PENNY' | V5Stock[] |
| `getLiveF30Candidates(limit)` | scan_results | latest scan, NOT IN curated symbols | ScannerCandidate[] |

### Helper Functions

**`getLiveScanStocksByCategory(category)`** (private)
- Finds latest completed scan via `scans.status='COMPLETED'` ordered by `runAt DESC`
- Returns empty array if no scan found
- Maps `scan_results` rows to `V5Stock` with `isLivePick=true`
- Sets MB score/tier from result; sets L1–L5 as binary (1 if passed, 0 if failed)

**`mapV5Row(s)`** (helper)
- Converts Drizzle stock row to V5Stock
- Provides defaults: tag='QUALIFIED', risk='MEDIUM', moat=sector
- Excludes isLivePick/mbScore/mbTier unless set by caller

**`getLiveF30Candidates(limit = 10)`**
- Fetches all curated symbols to exclude from candidates
- Queries scan_results ordered by mbScore DESC, limit applied
- Returns ScannerCandidate array with megatrendEmoji, fcfYieldPct, deDirection

---

## Component Layer

### Page Components

**`app/v5-extension/page.tsx`**
```typescript
// Fetch all three categories + live equivalents in parallel
const [curated*, live*] = await Promise.all([
  getV5LowStocks(), getLive52WLowStocks(),
  getV5PennyStocks(), getLivePennyStocks(),
  getV5SubTenStocks(), getLiveSub20Stocks(),
  ...
]);

// Merge: curated first, live deduplicated after
const mergeWithLive = (curated, live) => [
  ...curated,
  ...live.filter(s => !curatedSymbols.has(s.symbol))
];
```

**`app/fortress-30/page.tsx`**
```typescript
const [stocks, candidates] = await Promise.all([
  getStocks(),
  getLiveF30Candidates(10),
]);

// Render curated Fortress 30 grid
// Render Scanner Candidates section only if candidates.length > 0
```

### UI Components

**`components/fortress/V5ExtensionTabs.tsx`**
- Renders tabs: 52W Lows | Qualified Penny | Sub-₹20 Spec | Top Picks & MF | Scanner | Glossary
- Embeds `SplitStockGrid` component for each stock category

**`components/fortress/SplitStockGrid.tsx`** (internal to V5ExtensionTabs)
```typescript
const curated = stocks.filter(s => !s.isLivePick);
const live = stocks.filter(s => s.isLivePick);

// Render two sections:
// 1. "Curated" (amber label) — curated.length picks
// 2. "Scanner Detected" (emerald label) — live.length new picks
// Each section uses V5StockCard for rendering
```

**`components/fortress/V5StockCard.tsx`**
- Shows green "Live Scan" badge if `isLivePick=true`
- Displays MB Score row: `MB {mbScore} · {mbTier}` for live picks
- Shows "–" instead of "0%" for missing `drop52w`
- All other fields (why_down, why_buy, moat, tag) same for curated + live

**`components/fortress/ScannerCandidateCard.tsx`** (NEW)
```typescript
// Compact card for Fortress 30 candidates
// Layout: symbol + price | MB tier badge + score
//         megatrend emoji + label
//         [Score] [FCF Yield %] [Debt direction icon]
//         "Scanner Detected · No Editorial Review" footer
```

**Legend Updates**
- V5 Tabs: Shows "Curated" (amber) and "Scanner Detected" (emerald) labels
- Fortress 30: Shows "Scanner Candidates" section header with RadioTower icon + count

---

## Database Schema (Relevant Tables)

### stocks Table (Drizzle schema)
```
id (UUID)
symbol (TEXT, PK)
name, sector, industry
current_price, market_cap_crores, quality_score
pe_ratio, roce_5yr_avg, debt_to_equity
megatrend (JSONB array)
v5_category ('low' | 'penny' | 'sub_ten' | NULL)
tag, risk, drop_52w, moat, ocf
l1, l2, l3, l4, l5 (all nullable)
why_down, why_buy, penny_why, multi_bagger_case, killer_risk, fortress_note
is_active, created_at, updated_at
```

### scan_results Table (Drizzle schema)
```
id (UUID)
scan_id (FK → scans)
symbol (TEXT)
category ('SUB20' | 'PENNY' | '52W_LOW')
price_at_scan (DECIMAL)
megatrend_tag (TEXT)
megatrend_emoji (TEXT)
l1_pass, l2_pass, l3_pass, l4_pass, l5_pass (BOOLEAN)
total_score (INT)
mb_score (INT nullable)
mb_tier (TEXT nullable: 'Rocket'|'Launcher'|'Builder'|'Crawler'|'Grounded')
fcf_yield_pct (DECIMAL nullable)
de_direction (TEXT nullable: 'falling'|'rising')
margin_direction (TEXT nullable: 'expanding'|'contracting')
```

### scans Table (Drizzle schema)
```
id (UUID)
status ('PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED')
run_at (TIMESTAMP)
total_tickers (INT)
total_results (INT)
created_at, updated_at
```

---

## Data Flow Example: V5 "52W Lows" Tab

```
1. GET /v5-extension
   ├─ getV5LowStocks()            → [Curated, labeled isLivePick=false]
   └─ getLive52WLowStocks()       → [Scanner, labeled isLivePick=true]

2. Server-side merge in page.tsx
   ├─ Extract curated symbols
   └─ Append live, filter out duplicates by symbol

3. Pass merged array to V5ExtensionTabs component
   └─ Render SplitStockGrid

4. SplitStockGrid splits by isLivePick
   ├─ Render "Curated" section (amber)
   │  └─ V5StockCard for each curated stock
   └─ Render "Scanner Detected" section (emerald)
      └─ V5StockCard for each live stock (with green badge)

5. User sees:
   ─────────────────────────────────────
   Curated    [────────────────────────]  12 picks
   [V5StockCard] [V5StockCard] [V5StockCard]  ...

   Scanner Detected    [────────────────]  4 new picks
   Auto-detected by the live scanner. No editorial review yet.
   [V5StockCard+badge] [V5StockCard+badge]  ...
```

---

## Data Flow Example: Fortress 30 + Scanner Candidates

```
1. GET /fortress-30
   ├─ getStocks()                 → [Curated Fortress 30, 30 stocks]
   └─ getLiveF30Candidates(10)    → [Scanner picks not in curated, max 10]

2. Page renders curated grid
   └─ StockCard × 30 (fixed constellation view)

3. If candidates.length > 0, render "Scanner Candidates" section
   ├─ Header: RadioTower icon + "Scanner Candidates" (green)
   ├─ Description: "Top-scoring stocks from latest scan not currently in F30..."
   └─ Grid: ScannerCandidateCard × candidates.length
      └─ Each card shows: symbol, price, MB tier, MB score, megatrend, FCF, debt
```

---

## Key Design Decisions

1. **Separate Query Functions** — Each V5 category has its own curated + live getter. Allows independent data freshness and cache invalidation per category.

2. **isLivePick Marker** — Boolean flag on V5Stock makes filtering and styling trivial. No need for separate array types.

3. **Deduplication at Page Level** — Server-side merge avoids duplicate renders. Curated takes precedence (assumed editorial over algorithmic).

4. **ScannerCandidate Type Distinction** — Separate from V5Stock because Fortress 30 candidates display different fields (no why_down/why_buy, compact layout).

5. **Graceful Fallback** — If no scan found, `getLive*()` returns empty array. UI still renders curated list. No error state needed.

6. **MB Score Visibility** — Only shown for live picks (the scanner's core signal). Curated stocks show quality_score instead.

7. **RadioTower Icon** — Visual signal for "live / scanner-detected" across all components. Consistent branding.

---

## Testing Checklist

- [ ] Fetch curated stocks from mock-data (before DB seeding)
- [ ] Fetch curated stocks from DB (after seeding)
- [ ] Fetch live stocks from scan_results with latest scan
- [ ] Merge logic deduplicates by symbol correctly
- [ ] V5StockCard renders green badge + MB Score for live picks
- [ ] SplitStockGrid renders two sections with correct count labels
- [ ] ScannerCandidateCard renders all fields without errors
- [ ] Fortress 30 candidates section hidden if no candidates
- [ ] Fortress 30 candidates section visible if candidates exist
- [ ] Mobile layout responsive on all components

---

## Related Documentation

- `CHANGELOG.md` — Feature release notes for Live Scanner Bridge (2026-03-25)
- `ai-handover.md` — Full system overview, deployment, maintenance
- `lib/types.ts` — Type definitions (V5Stock, ScannerCandidate, etc.)
- `app/actions.ts` — Server action implementations
