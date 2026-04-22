# Fortress Intelligence — Codemap Index

**Last Updated:** April 22, 2026
**Focus:** Deep Value Scanner with Macro Sentiment & Enhanced Tooltips

---

## Quick Navigation

### System Codemaps
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — System overview, data types, query layer, component tree, data flows
- **[FRONTEND.md](./FRONTEND.md)** — UI components (V5ExtensionTabs, SplitStockGrid, V5StockCard, ScannerCandidateCard)
- **[BACKEND.md](./BACKEND.md)** — Server actions, database schema, query optimization

---

## What Changed (April 22, 2026)

### Phase 1+2: Beta Feedback Redesign

**Phase 1 — Bug Fixes:**
- Investment Genie: Fixed India market showing US stocks
- Investment Genie: Fixed currency display (USD → ₹ INR when India selected)
- Intelligent Scanner: Fixed UI showing button for non-admin users (now shows "Scanner runs automatically")
- QS / OCF / MB Score: Added hover tooltips on all stock cards

**Phase 2 — Architecture Changes:**
- Renamed: V5 Extension → Deep Value Scanner (UI labels only; URL `/v5-extension` unchanged)
- Added: Macro Sentiment Banner at top of scanner page (NEW component + server action)
- Added: Scanner tab criteria descriptions (1-2 lines explaining filter logic)
- Changed: Fortress 30 default market from "US" to "NSE"
- Added: Intelligence page progressive disclosure (sections collapsed by default)

**Entry Points:**
- `app/v5-extension/page.tsx` — Deep Value Scanner page (fetches curated + live + macro snapshot)
- `app/fortress-30/page.tsx` — Fortress 30 page (default market = NSE)

**New Components:**
- `MacroSentimentBanner.tsx` — Macro snapshot (Nifty, VIX, USD-INR, sentiment)

**New Query Functions:**
- `getLatestMacroSnapshot()` — Fetches latest macro data for banner

**Enhanced Components:**
- `V5StockCard.tsx` — Added tooltip icons for QS, OCF, MB Score
- `ScannerCandidateCard.tsx` — Added tooltip icons for MB Score, FCF Yield
- `V5ExtensionTabs.tsx` — Added 1-2 line criteria descriptions per tab

---

## File Structure

```
fortress-app/
├── docs/
│   ├── CODEMAPS/
│   │   ├── INDEX.md (YOU ARE HERE)
│   │   ├── ARCHITECTURE.md
│   │   ├── FRONTEND.md
│   │   └── BACKEND.md
│   ├── proposal.md (original vision)
│   ├── current_status.md
│   └── ...
│
├── app/
│   ├── actions.ts (server actions: getStocks, getLive*, getLatestMacroSnapshot)
│   │
│   ├── v5-extension/
│   │   └── page.tsx (Deep Value Scanner: fetches 3 curated + 3 live + macro in parallel)
│   │
│   └── fortress-30/
│       └── page.tsx (Fortress 30: default market NSE, fetches curated + candidates)
│
├── components/fortress/
│   ├── MacroSentimentBanner.tsx (NEW: macro snapshot banner for scanner page)
│   ├── V5ExtensionTabs.tsx (main tab component with criteria descriptions)
│   ├── V5StockCard.tsx (stock card with live badge + tooltips)
│   ├── ScannerCandidateCard.tsx (compact candidate card with tooltips)
│   ├── StockCard.tsx (Fortress 30 curated card)
│   └── ...
│
├── lib/
│   ├── types.ts (V5Stock, ScannerCandidate, Stock, Thesis, etc.)
│   ├── mock-data.ts (fallback curated data)
│   ├── db/
│   │   ├── client.ts (Drizzle ORM init)
│   │   └── schema.ts (table definitions: stocks, scan_results, scans, etc.)
│   └── ...
│
├── ai-handover.md (system overview + deployment)
├── CHANGELOG.md (feature release notes)
└── ...
```

---

## Key Interfaces

### V5Stock (extends Stock)
```typescript
interface V5Stock extends Stock {
  tag: string;                           // 'QUALIFIED', 'SCANNER', etc.
  risk: string;                          // 'LOW', 'MEDIUM', 'HIGH', 'EXTREME'
  drop52w: number;                       // 52-week drop %
  moat: string;                          // Competitive advantage source
  ocf: string;                           // Operating cash flow indicator
  why_down?: string;                     // Why the stock fell
  why_buy?: string;                      // Investment thesis
  l1–l5: number;                         // 5-layer scores (0–25 each)
  isLivePick?: boolean;                  // KEY: scanner-detected if true
  mbScore?: number;                      // Multi-Bagger Score (live only)
  mbTier?: string;                       // 'Rocket'|'Launcher'|'Builder'|'Crawler'|'Grounded'
}
```

### ScannerCandidate
```typescript
interface ScannerCandidate {
  id: string;
  symbol: string;
  price: number;
  mbScore: number;
  mbTier: string;
  totalScore: number;
  megatrend: string;
  megatrendEmoji: string;
  fcfYieldPct: number | null;
  deDirection: string | null;           // 'falling' | 'rising'
  marginDirection: string | null;       // 'expanding' | 'contracting'
}
```

---

## Data Flow Diagrams

### Deep Value Scanner (V5 Extension) Flow
```
getV5LowStocks()           ─┐
getLive52WLowStocks()      ─┤
getV5PennyStocks()         ─┤
getLivePennyStocks()       ─┼─> Promise.all([...])
getV5SubTenStocks()        ─┤       ↓
getLiveSub20Stocks()       ─┤    Merge by symbol
getLatestMacroSnapshot()   ─┤  (curated first, live appended)
getV5TopMutualFunds()      ─┤       ↓
                            ─→ MacroSentimentBanner (NEW, top)
                            ─→ V5ExtensionTabs (with criteria descriptions)
                                   ↓
                        SplitStockGrid (per tab, with tooltips)
                        ├─ Curated section (amber label)
                        │  └─ V5StockCard[] (no badge, tooltips on QS/OCF)
                        └─ Scanner Detected (emerald label)
                           └─ V5StockCard[] (green badge, MB score, tooltips)
```

### Fortress 30 Flow
```
getStocks()                ─┐
getLiveF30Candidates(10)   ─┼─> Promise.all([...])
                            ┘       ↓
                        Fortress 30 Page
                        ├─ Render: StockCard[] (curated)
                        └─ Render: (if candidates.length > 0)
                           └─ "Scanner Candidates" section
                              └─ ScannerCandidateCard[]
```

---

## Query Execution

### Find Latest Scan
```sql
SELECT * FROM scans
WHERE status = 'COMPLETED'
ORDER BY run_at DESC
LIMIT 1
```

### Query Results by Category
```sql
SELECT * FROM scan_results
WHERE scan_id = ? AND category = ?
ORDER BY mb_score DESC
```

### Exclude Curated Symbols
```sql
SELECT * FROM scan_results
WHERE scan_id = ?
AND symbol NOT IN (SELECT symbol FROM stocks)
ORDER BY mb_score DESC
LIMIT 10
```

---

## Component Interaction Map

```
Page Component
├── Fetches: data via actions.ts
├── Renders: Navbar + main content
└── Passes: merged/filtered data to child components

V5ExtensionTabs
├── Props: lowStocks[], pennyStocks[], subTenStocks[], topMF[], topIndex[], topPicks[], glossary
├── State: activeTab (string)
├── Renders: TabsList (6 tabs) + TabsContent
└── Child: SplitStockGrid (for stock tabs)
        └─ Props: stocks[] (mixed curated + live)
        └─ Renders: two sections (curated + scanner detected)
        └─ Child: V5StockCard
                 └─ Props: stock (V5Stock)
                 └─ Renders: symbol, price, why*, moat, tag
                 └─ Shows: green badge if isLivePick=true
                 └─ Shows: MB Score row if isLivePick && mbScore != null

Fortress 30 Page
├── Fetches: stocks[], candidates[]
├── Renders: StockCard grid (curated)
└─ Conditionally Renders: Scanner Candidates section (if candidates.length > 0)
        └─ Header: "Scanner Candidates" + count
        └─ Description: "Top-scoring stocks... No editorial review"
        └─ Child: ScannerCandidateCard[]
                 └─ Props: candidate (ScannerCandidate)
                 └─ Renders: symbol, price, MB tier, score, megatrend, FCF, debt direction
```

---

## Testing Scenarios

### Unit Tests (Components)
- [ ] V5StockCard renders green badge when isLivePick=true
- [ ] V5StockCard shows MB Score row when isLivePick && mbScore != null
- [ ] ScannerCandidateCard renders all fields without errors
- [ ] ScannerCandidateCard MB tier colors match TIER_COLORS map
- [ ] SplitStockGrid renders two sections with correct labels and counts
- [ ] SplitStockGrid hides live section when live.length === 0

### Integration Tests (Pages)
- [ ] /v5-extension page fetches all 7 data sources in parallel (including macro snapshot)
- [ ] /v5-extension displays MacroSentimentBanner at top (NEW)
- [ ] /v5-extension merges curated + live correctly (no duplicates by symbol)
- [ ] /v5-extension tabs show criteria descriptions below tab labels (NEW)
- [ ] /v5-extension tabs switch between categories
- [ ] /fortress-30 page defaults to NSE market (NEW)
- [ ] /fortress-30 page fetches stocks + candidates in parallel
- [ ] /fortress-30 shows candidates section only if candidates.length > 0
- [ ] /fortress-30 candidates are excluded from curated stocks
- [ ] All stock cards show tooltip icons for QS/OCF/MB Score (NEW)
- [ ] Tooltips display plain-English definitions on hover (NEW)

### Server Action Tests (app/actions.ts)
- [ ] getV5LowStocks() returns DB data if available
- [ ] getV5LowStocks() returns mock data if DB empty/error
- [ ] getLive52WLowStocks() queries latest completed scan
- [ ] getLive52WLowStocks() returns empty array if no scan found
- [ ] getLive52WLowStocks() marks all results with isLivePick=true
- [ ] getLiveF30Candidates() excludes curated symbols
- [ ] getLiveF30Candidates() orders by mbScore DESC
- [ ] getLiveF30Candidates() respects limit parameter

### End-to-End Tests
- [ ] User navigates to /v5-extension → sees curated + live stocks
- [ ] User navigates to /fortress-30 → sees curated grid + scanner candidates (if available)
- [ ] User hovers card on desktop → details expand
- [ ] User taps card on mobile → details toggle
- [ ] Scanner candidates have different styling than curated stocks

---

## Deployment Checklist

- [ ] Database schema applied: `npm run drizzle:push`
- [ ] scan_results table populated with at least one completed scan
- [ ] Server actions deployed: `npm run build` (includes `getLatestMacroSnapshot`)
- [ ] MacroSentimentBanner component deployed (NEW)
- [ ] V5ExtensionTabs component deployed with criteria descriptions (NEW)
- [ ] ScannerCandidateCard component deployed with tooltips (NEW)
- [ ] V5StockCard updated with tooltips for QS/OCF/MB Score (NEW)
- [ ] Fortress 30 page default market set to NSE (NEW)
- [ ] Test /v5-extension shows macro banner at top (NEW)
- [ ] Test /v5-extension tab descriptions display correctly (NEW)
- [ ] Test /v5-extension tab switching
- [ ] Test /fortress-30 defaults to NSE market (NEW)
- [ ] Test /fortress-30 with/without candidates
- [ ] Test tooltip hover on stock cards (NEW)
- [ ] Test mobile responsive layout on all components

---

## Maintenance Notes

### Regular Tasks
- Monitor scan_results table size — old scans should be pruned
- Monitor performance of `getLiveF30Candidates()` if curated symbols grow >1000
- Check error logs for DB connection issues in live query functions

### Future Improvements
1. **Pagination** — If candidates exceed 10, add pagination
2. **Caching** — Cache merged lists for 5-10 minutes
3. **Real-time Updates** — WebSocket subscription for live price updates
4. **Candidate Details** — Expand ScannerCandidateCard to show thesis, risks
5. **AB Testing** — Track which candidates users click on (conversion metrics)

---

## Related Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Detailed system architecture (updated Apr 22)
- **[FRONTEND.md](./FRONTEND.md)** — Component implementation details (updated Apr 22)
- **[BACKEND.md](./BACKEND.md)** — Server actions and database queries
- **[../../ai-handover.md](../../ai-handover.md)** — Full system overview, deployment, VPS setup
- **[../../CHANGELOG.md](../../CHANGELOG.md)** — Feature release history (updated Apr 22)

---

## Quick Reference: What File Does What?

| File | Purpose | Key Content |
|------|---------|-------------|
| `app/actions.ts` | Server data fetching | getV5*(), getLive*(), getLatestMacroSnapshot(), seedV5Stocks() |
| `app/v5-extension/page.tsx` | Deep Value Scanner page | Parallel fetch + macro banner + merge logic |
| `app/fortress-30/page.tsx` | Fortress 30 page | Default market NSE, curated + candidates render |
| `components/fortress/MacroSentimentBanner.tsx` | Macro banner (NEW) | Nifty, VIX, USD-INR, sentiment display |
| `components/fortress/V5ExtensionTabs.tsx` | Tab UI | TabsList with criteria descriptions + SplitStockGrid |
| `components/fortress/V5StockCard.tsx` | Stock card | Green badge + MB score + tooltips for QS/OCF |
| `components/fortress/ScannerCandidateCard.tsx` | Candidate card | Compact display + tooltips for MB Score/FCF Yield |
| `lib/types.ts` | TypeScript types | V5Stock, ScannerCandidate, MacroSnapshot, etc. |
| `lib/db/schema.ts` | Database schema | stocks, scan_results, scans tables |
| `lib/mock-data.ts` | Fallback data | Curated stock lists |

---

## Contact & Questions

For questions about:
- **Architecture decisions** → See ARCHITECTURE.md rationale section
- **Component implementation** → See FRONTEND.md component details
- **Database queries** → See BACKEND.md query implementations
- **Deployment & setup** → See ai-handover.md infrastructure section

Last updated by: Claude (AI)
Last feature: Phase 1+2 Beta Feedback Redesign (April 22, 2026)
