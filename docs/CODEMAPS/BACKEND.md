# Backend Data & Query Codemap

**Last Updated:** March 25, 2026
**Focus:** Live Scanner Integration with Server Actions

---

## Server Actions (app/actions.ts)

### Query Functions Overview

All functions are "use server" and handle both DB and mock data fallback.

| Function | Purpose | Data Source | Returns |
|----------|---------|-------------|---------|
| `getStocks()` | Fetch all curated stocks | stocks table | Stock[] |
| `getV5LowStocks()` | V5 category: 52W Lows | stocks where v5_category='low' | V5Stock[] |
| `getV5PennyStocks()` | V5 category: Penny | stocks where v5_category='penny' | V5Stock[] |
| `getV5SubTenStocks()` | V5 category: Sub-₹10 | stocks where v5_category='sub_ten' | V5Stock[] |
| `getLiveSub20Stocks()` | Scanner: Sub-₹20 candidates | scan_results where category='SUB20' | V5Stock[] |
| `getLive52WLowStocks()` | Scanner: 52W Low candidates | scan_results where category='52W_LOW' | V5Stock[] |
| `getLivePennyStocks()` | Scanner: Penny candidates | scan_results where category='PENNY' | V5Stock[] |
| `getLiveF30Candidates(limit)` | Scanner: Fortress 30 candidates | scan_results minus curated symbols | ScannerCandidate[] |
| `seedV5Stocks()` | Insert/update V5 stocks | stocks table (upsert) | { success, inserted } |

---

## Query Implementation Details

### getV5LowStocks() / getV5PennyStocks() / getV5SubTenStocks()

```typescript
export async function getV5LowStocks(): Promise<V5Stock[]> {
  try {
    const results = await db
      .select()
      .from(schema.stocks)
      .where(eq(schema.stocks.v5Category, "low"));

    if (results.length > 0) return results.map(mapV5Row);
  } catch (error) {
    console.error("Error fetching V5 Low stocks from DB:", error);
  }
  return v5LowStocks as V5Stock[];  // Fallback to mock
}
```

**Behavior:**
1. Query DB for v5_category match
2. If DB has data, map via `mapV5Row()` helper
3. If error or no data, return mock data from `lib/mock-data.ts`
4. No DB/mock merging — one or the other

---

### getLiveSub20Stocks() / getLive52WLowStocks() / getLivePennyStocks()

```typescript
async function getLiveScanStocksByCategory(
  category: "SUB20" | "PENNY" | "52W_LOW"
): Promise<V5Stock[]> {
  // 1. Find latest completed scan
  const lastScan = await db.query.scans.findFirst({
    where: eq(schema.scans.status, "COMPLETED"),
    orderBy: [desc(schema.scans.runAt)],
  });
  if (!lastScan) return [];

  // 2. Query scan results for this scan + category
  const results = await db
    .select()
    .from(schema.scanResults)
    .where(
      and(
        eq(schema.scanResults.scanId, lastScan.id),
        eq(schema.scanResults.category, category)
      )
    )
    .orderBy(desc(schema.scanResults.mbScore));

  // 3. Map to V5Stock with isLivePick flag
  return results.map(r => ({
    id: r.id,
    symbol: r.symbol,
    name: r.symbol,
    sector: r.megatrendTag || "Scanner Pick",
    current_price: Number(r.priceAtScan) || 0,
    quality_score: r.totalScore || 0,
    market_cap_crores: 0,
    megatrend: r.megatrendTag ? [r.megatrendTag] : [],
    is_active: true,
    tag: r.mbTier || "SCANNER",
    risk: "HIGH",
    drop52w: 0,
    moat: r.megatrendTag || "Scanner Pick",
    ocf: "–",
    l1: r.l1Pass ? 1 : 0,
    l2: r.l2Pass ? 1 : 0,
    l3: r.l3Pass ? 1 : 0,
    l4: r.l4Pass ? 1 : 0,
    l5: r.l5Pass ? 1 : 0,
    mbScore: r.mbScore ?? undefined,
    mbTier: r.mbTier ?? undefined,
    isLivePick: true,  // KEY: Marks as scanner-detected
  }));
}

// Public wrappers
export async function getLiveSub20Stocks(): Promise<V5Stock[]> {
  try {
    return await getLiveScanStocksByCategory("SUB20");
  } catch (error) {
    console.error("Error fetching live SUB20 stocks:", error);
    return [];
  }
}
// Similar for 52W_LOW and PENNY...
```

**Key Logic:**
- Finds latest **completed** scan by `runAt` DESC
- Returns empty array if no scan found (graceful fallback)
- Orders results by `mbScore DESC` (highest scanner score first)
- Maps scan_results row to V5Stock with `isLivePick: true` flag
- Sets L1–L5 as binary (1 if pass, 0 if fail) — not the actual scores
- Empty array on any error (no crash)

---

### getLiveF30Candidates(limit = 10)

```typescript
export async function getLiveF30Candidates(
  limit = 10
): Promise<ScannerCandidate[]> {
  try {
    // 1. Find latest completed scan
    const lastScan = await db.query.scans.findFirst({
      where: eq(schema.scans.status, "COMPLETED"),
      orderBy: [desc(schema.scans.runAt)],
    });
    if (!lastScan) return [];

    // 2. Get all curated symbols to exclude
    const curatedRows = await db
      .select({ symbol: schema.stocks.symbol })
      .from(schema.stocks);
    const curatedSymbols = curatedRows.map(r => r.symbol);

    // 3. Query scan results, excluding curated symbols
    const conditions = [eq(schema.scanResults.scanId, lastScan.id)];
    if (curatedSymbols.length > 0) {
      conditions.push(notInArray(schema.scanResults.symbol, curatedSymbols));
    }

    const results = await db
      .select()
      .from(schema.scanResults)
      .where(and(...conditions))
      .orderBy(desc(schema.scanResults.mbScore))
      .limit(limit);

    // 4. Map to ScannerCandidate
    return results.map(r => ({
      id: r.id,
      symbol: r.symbol,
      price: Number(r.priceAtScan) || 0,
      mbScore: r.mbScore ?? 0,
      mbTier: r.mbTier ?? "–",
      totalScore: r.totalScore ?? 0,
      megatrend: r.megatrendTag ?? "",
      megatrendEmoji: r.megatrendEmoji ?? "",
      fcfYieldPct: r.fcfYieldPct != null ? Number(r.fcfYieldPct) : null,
      deDirection: r.deDirection ?? null,
      marginDirection: r.marginDirection ?? null,
    }));
  } catch (error) {
    console.error("Error fetching live F30 candidates:", error);
    return [];
  }
}
```

**Key Logic:**
- Excludes any symbol that already exists in curated stocks table
- Uses `notInArray()` Drizzle filter for SQL-level deduplication
- Orders by `mbScore DESC` (highest scanner picks first)
- Applies limit at DB level (efficient)
- Returns ScannerCandidate[] for Fortress 30 display

---

## Helper Functions

### mapV5Row()

```typescript
function mapV5Row(s: typeof schema.stocks.$inferSelect): V5Stock {
  return {
    id: s.id,
    symbol: s.symbol,
    name: s.name,
    sector: s.sector,
    industry: s.industry ?? undefined,
    logo_url: s.logoUrl ?? undefined,
    current_price: Number(s.currentPrice) || 0,
    quality_score: s.qualityScore || 0,
    market_cap_crores: Number(s.marketCapCrores) || 0,
    pe_ratio: s.peRatio ? Number(s.peRatio) : undefined,
    roce_5yr_avg: s.roce5yrAvg ? Number(s.roce5yrAvg) : undefined,
    debt_to_equity: s.debtToEquity ? Number(s.debtToEquity) : undefined,
    megatrend: s.megatrend || [],
    is_active: s.isActive ?? true,
    tag: s.tag ?? "QUALIFIED",
    risk: s.risk ?? "MEDIUM",
    drop52w: Number(s.drop52w) || 0,
    moat: s.moat ?? s.sector,
    ocf: s.ocf ?? "N/A",
    l1: s.l1 ?? 0,
    l2: s.l2 ?? 0,
    l3: s.l3 ?? 0,
    l4: s.l4 ?? 0,
    l5: s.l5 ?? 0,
    why_down: s.whyDown ?? undefined,
    why_buy: s.whyBuy ?? undefined,
    penny_why: s.pennyWhy ?? undefined,
    multi_bagger_case: s.multiBaggerCase ?? undefined,
    killer_risk: s.killerRisk ?? undefined,
    fortress_note: s.fortressNote ?? undefined,
    // NOTE: isLivePick, mbScore, mbTier NOT set here (set by caller if needed)
  };
}
```

**Note:** This helper does NOT set `isLivePick`, `mbScore`, or `mbTier`. Those are caller's responsibility.

---

## Database Schema (Relevant Tables)

### stocks Table

```sql
CREATE TABLE stocks (
  id UUID PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  sector VARCHAR(100),
  industry VARCHAR(100),
  logo_url VARCHAR(500),
  current_price DECIMAL(12, 2),
  quality_score INTEGER,
  market_cap_crores DECIMAL(15, 2),
  pe_ratio DECIMAL(10, 2),
  roce_5yr_avg DECIMAL(10, 2),
  debt_to_equity DECIMAL(10, 2),
  megatrend JSONB,                     -- array of strings
  is_active BOOLEAN DEFAULT true,

  -- V5 fields (added March 2026)
  v5_category VARCHAR(20),             -- 'low' | 'penny' | 'sub_ten'
  tag VARCHAR(50),                     -- 'QUALIFIED', 'SCANNER', etc.
  risk VARCHAR(20),                    -- 'LOW', 'MEDIUM', 'HIGH', 'EXTREME'
  drop_52w DECIMAL(10, 2),
  moat TEXT,
  ocf TEXT,
  l1 INTEGER,
  l2 INTEGER,
  l3 INTEGER,
  l4 INTEGER,
  l5 INTEGER,
  why_down TEXT,
  why_buy TEXT,
  penny_why TEXT,
  multi_bagger_case TEXT,
  killer_risk TEXT,
  fortress_note TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### scan_results Table

```sql
CREATE TABLE scan_results (
  id UUID PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES scans(id),
  symbol VARCHAR(20) NOT NULL,
  category VARCHAR(20),                -- 'SUB20' | 'PENNY' | '52W_LOW'
  price_at_scan DECIMAL(12, 2),
  megatrend_tag VARCHAR(100),
  megatrend_emoji VARCHAR(50),
  l1_pass BOOLEAN,
  l2_pass BOOLEAN,
  l3_pass BOOLEAN,
  l4_pass BOOLEAN,
  l5_pass BOOLEAN,
  total_score INTEGER,
  mb_score INTEGER,                    -- Multi-Bagger Score
  mb_tier VARCHAR(50),                 -- 'Rocket' | 'Launcher' | 'Builder' | 'Crawler' | 'Grounded'
  fcf_yield_pct DECIMAL(10, 2),
  de_direction VARCHAR(20),            -- 'falling' | 'rising'
  margin_direction VARCHAR(20),        -- 'expanding' | 'contracting'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_scan_results_scan_id_score ON scan_results(scan_id, mb_score DESC);
CREATE INDEX idx_scan_results_market_score ON scan_results(category, mb_score DESC);
CREATE INDEX idx_scan_results_symbol ON scan_results(symbol);
```

### scans Table

```sql
CREATE TABLE scans (
  id UUID PRIMARY KEY,
  status VARCHAR(20),                  -- 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  run_at TIMESTAMP,
  total_tickers INTEGER,
  total_results INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for finding latest completed scan
CREATE INDEX idx_scans_status_run_at ON scans(status, run_at DESC);
```

---

## Data Flow: V5 Extension Page Load

```
1. Page.tsx calls Promise.all([
     getV5LowStocks(),      // DB query: v5_category='low'
     getLive52WLowStocks(), // scan_results query: category='52W_LOW', isLivePick=true
     getV5PennyStocks(),
     getLivePennyStocks(),
     getV5SubTenStocks(),
     getLiveSub20Stocks(),
     getV5TopMutualFunds(),
   ])

2. Server-side merge:
   const mergeWithLive = (curated, live) =>
     [...curated, ...live.filter(s => !curatedSymbols.has(s.symbol))]

   lowStocks = mergeWithLive(curatedLowStocks, liveLowStocks)
   // Result: [curated1, curated2, ..., liveNew1, liveNew2, ...]
   //         (no duplicates, curated first)

3. V5ExtensionTabs receives merged arrays
   └─ SplitStockGrid filters:
      ├─ curated = filter(s => !s.isLivePick)  // [curated1, curated2, ...]
      └─ live = filter(s => s.isLivePick)      // [liveNew1, liveNew2, ...]
      └─ Renders two sections (amber + emerald)
```

---

## Data Flow: Fortress 30 Page Load

```
1. Page.tsx calls Promise.all([
     getStocks(),              // All curated stocks
     getLiveF30Candidates(10), // Scanner picks not in curated
   ])

2. Render curated Fortress 30 grid
   └─ StockCard[] × {stocks.length}

3. If candidates.length > 0:
   └─ Render "Scanner Candidates" section
      └─ ScannerCandidateCard[] × {candidates.length}
      └─ Candidates are filtered at DB level:
         WHERE scan_id = latest
         AND symbol NOT IN (select symbol from stocks)
         ORDER BY mb_score DESC
```

---

## Error Handling

All server actions follow this pattern:

```typescript
export async function getV5LowStocks(): Promise<V5Stock[]> {
  try {
    const results = await db.select().from(schema.stocks).where(...);
    if (results.length > 0) return results.map(mapV5Row);
  } catch (error) {
    console.error("Error fetching V5 Low stocks from DB:", error);
  }
  return v5LowStocks as V5Stock[];  // Fallback to mock
}
```

**Behavior:**
1. Query DB
2. If DB succeeds and has data, return mapped data
3. If DB fails OR returns empty, log error and return mock data
4. Never throw — graceful degradation
5. Live functions return empty array if no scan found (not error)

---

## Performance Considerations

### Indexes
- `scans(status, run_at DESC)` — Fast latest scan lookup
- `scan_results(scan_id, mb_score DESC)` — Fast scan results fetch ordered by score
- `scan_results(category, mb_score DESC)` — Fast category filtering
- `scan_results(symbol)` — Fast symbol lookups for deduplication

### Query Optimization
- `getLiveF30Candidates()` uses `notInArray()` — SQL-level filtering, not app-side
- All `.limit()` calls at DB level — only requested rows fetched
- `orderBy(desc())` at DB level — sorted before app receives
- Parallel `Promise.all()` in pages — no sequential delays

### Memory
- No in-memory caching (yet) — OK for <1000 stocks
- If candidates list grows >10k, consider pagination
- scan_results table should be pruned old scans (not implemented)

---

## Related Files

- `app/actions.ts` — All server action implementations
- `app/v5-extension/page.tsx` — V5 page fetch + merge logic
- `app/fortress-30/page.tsx` — Fortress 30 page fetch + render
- `lib/db/schema.ts` — Drizzle ORM table definitions
- `lib/types.ts` — TypeScript interfaces (V5Stock, ScannerCandidate)
- `lib/mock-data.ts` — Fallback data for curated stocks
- `scanner/engine.py` — Backend: populates scan_results table
