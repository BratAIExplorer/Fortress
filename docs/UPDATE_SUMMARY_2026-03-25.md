# Documentation Update Summary — March 25, 2026

## What Was Updated

Complete documentation of the **Live Scanner UI Bridge** feature, which now displays live scanner results alongside curated data in three V5 Extension tabs and the Fortress 30 page.

---

## Files Modified

### 1. `ai-handover.md`
**Added new "Live Scanner Integration" section** documenting:
- New V5Stock fields (isLivePick, mbScore, mbTier)
- New ScannerCandidate interface
- Query layer helpers (getLiveSub20Stocks, getLive52WLowStocks, getLivePennyStocks, getLiveF30Candidates)
- UI changes (SplitStockGrid component, badge styling, MB Score display)
- Fortress 30 candidates section

**Location:** Lines ~92–140 (inserted before "Two Scoring Systems" section)

### 2. `CHANGELOG.md`
**Added new "2026-03-25 (Live Scanner Bridge)" section** with:
- Feature summary
- New data types
- New query functions
- Component changes
- UI improvements

**Location:** Lines 3–28 (prepended to existing changelog)

---

## Files Created

### 3. `docs/CODEMAPS/ARCHITECTURE.md` (NEW)
**Comprehensive architecture overview** including:
- System overview diagram
- Core data types hierarchy (Stock → V5Stock → ScannerCandidate)
- Query layer documentation (table showing all fetchers)
- Component tree structure
- Database schema (stocks, scan_results, scans tables)
- Data flow examples (V5 tabs, Fortress 30)
- Key design decisions
- Testing checklist

**~450 lines — covers entire system**

### 4. `docs/CODEMAPS/FRONTEND.md` (NEW)
**Component-focused documentation** including:
- Complete component tree with imports
- V5ExtensionTabs implementation details
- SplitStockGrid logic and styling
- V5StockCard modifications (live badge, MB score row, drop52w display)
- ScannerCandidateCard implementation (NEW component)
- Data mapping from database to component props
- Responsive breakpoints
- Testing scenarios
- Import statements

**~400 lines — focuses on UI/React code**

### 5. `docs/CODEMAPS/BACKEND.md` (NEW)
**Server actions and database documentation** including:
- Server action overview table
- Implementation details for each query function
- Helper function (mapV5Row)
- Complete database schema with indexes
- Data flow diagrams
- Error handling patterns
- Performance considerations
- Related files

**~400 lines — focuses on data access layer**

### 6. `docs/CODEMAPS/INDEX.md` (NEW)
**Navigation hub and quick reference** including:
- Quick navigation to other codemaps
- What changed summary
- File structure overview
- Key interfaces (V5Stock, ScannerCandidate)
- Data flow diagrams
- Component interaction map
- Testing scenarios
- Deployment checklist
- Maintenance notes
- Future improvements
- Quick reference table

**~300 lines — entry point for all architecture docs**

---

## Documentation Structure

```
docs/CODEMAPS/
├── INDEX.md          ← START HERE (navigation hub)
├── ARCHITECTURE.md   ← System overview, types, flows
├── FRONTEND.md       ← Component implementation
└── BACKEND.md        ← Server actions, database
```

---

## Key Information Captured

### Data Flow (V5 Extension Example)
```
getV5LowStocks() + getLive52WLowStocks()
    ↓
Promise.all([...])
    ↓
Server-side merge (curated first, live appended)
    ↓
V5ExtensionTabs → SplitStockGrid
    ├─ Curated section (amber label)
    └─ Scanner Detected section (emerald label, with badges)
```

### Type Hierarchy
```
Stock (base)
└── V5Stock (+ tag, risk, l1–l5, isLivePick?, mbScore?, mbTier?)

ScannerCandidate (separate type for F30 candidates)
```

### Query Functions
| Function | Purpose | Returns |
|----------|---------|---------|
| `getLiveSub20Stocks()` | Scanner: Sub-₹20 | V5Stock[] with isLivePick=true |
| `getLive52WLowStocks()` | Scanner: 52W Low | V5Stock[] with isLivePick=true |
| `getLivePennyStocks()` | Scanner: Penny | V5Stock[] with isLivePick=true |
| `getLiveF30Candidates(10)` | F30 candidates | ScannerCandidate[] |

### Component Changes
- **V5StockCard**: Green "Live Scan" badge when isLivePick=true; MB Score row for live picks
- **SplitStockGrid**: Splits by isLivePick; renders two labeled sections
- **ScannerCandidateCard**: NEW; compact cards for Fortress 30 candidates
- **Fortress 30 Page**: NEW "Scanner Candidates" section (conditional render)

---

## Coverage

These codemaps document:
- [x] New type definitions (V5Stock fields, ScannerCandidate)
- [x] New server actions (getLive* functions)
- [x] Component changes (V5ExtensionTabs, V5StockCard, SplitStockGrid)
- [x] NEW components (ScannerCandidateCard)
- [x] Database schema (stocks, scan_results, scans)
- [x] Data flows (V5 tabs, Fortress 30)
- [x] Design decisions (why separate types, why server-side merge, etc.)
- [x] Testing scenarios (unit, integration, E2E)
- [x] Deployment checklist

## What NOT Documented

- Scanner backend (Python engine, yfinance integration) — covered in ai-handover.md
- Authentication/auth flow — covered in ai-handover.md
- Glossary/educational content — out of scope
- Admin panel for editing stocks — minimal changes
- Other pages (homepage, learning, glossary) — not modified

---

## How to Use These Docs

**For New Developers:**
1. Start with `INDEX.md` (navigation + what changed)
2. Read `ARCHITECTURE.md` (system overview)
3. Dive into `FRONTEND.md` or `BACKEND.md` based on your task

**For Code Review:**
- Check `FRONTEND.md` for component structure
- Check `BACKEND.md` for query logic
- Reference type definitions in `ARCHITECTURE.md`

**For Deployment:**
- Use deployment checklist in `INDEX.md`
- Refer to `ai-handover.md` for VPS/database commands
- Check schema in `BACKEND.md` if schema changes needed

**For Bug Fixes:**
- Component behavior → `FRONTEND.md`
- Data fetching bugs → `BACKEND.md`
- Type mismatches → `ARCHITECTURE.md`

---

## Quality Checklist

- [x] All file paths verified to exist
- [x] Code examples match actual implementation
- [x] Type definitions match `lib/types.ts`
- [x] Component names match `components/fortress/`
- [x] Server action names match `app/actions.ts`
- [x] Database schema matches `lib/db/schema.ts`
- [x] Data flows tested and documented
- [x] Fresh timestamps on all docs
- [x] Cross-references between docs
- [x] No orphaned or broken links

---

## Related Documentation

- **CHANGELOG.md** — Feature release notes
- **ai-handover.md** — System overview, deployment, infrastructure
- **docs/proposal.md** — Original product vision
- **docs/current_status.md** — Overall platform status

---

## Summary

Three new comprehensive codemaps have been created to document the Live Scanner UI Bridge feature. Together with updates to CHANGELOG.md and ai-handover.md, they provide a complete, authoritative reference for how the system works, how to extend it, how to test it, and how to deploy it.

**Total documentation added: ~1,550 lines across 6 files**

Last Updated: March 25, 2026
Generated by: Claude (Documentation Specialist)
