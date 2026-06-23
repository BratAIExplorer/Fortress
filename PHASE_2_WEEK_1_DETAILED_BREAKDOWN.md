# PHASE 2 WEEK 1 — DETAILED BREAKDOWN (Emerging Growth Module)
## June 26-30, 2026 — Execute Using 4 Principles

---

## 🎯 PRINCIPLE 1: THINK BEFORE CODING (Day 1-2)

**Goal:** Design scoring logic completely before writing any code.

### Day 1: Emerging Growth Scoring Design

**Task 1.1: Define Scoring Thresholds**

```
Emerging Growth Definition:
├─ Growth companies (>25% revenue CAGR)
├─ Quality businesses (ROCE >15%)
├─ Reasonable valuation (P/E 12-20)
├─ Margin expanding (EBITDA or net margin rising YoY)
└─ Small to mid-cap (market cap 300Cr - 10,000Cr)

Scoring Formula (100 points max):
├─ Growth Rate (0-30 points)
│  ├─ Growth % >= 40%: 30 points
│  ├─ Growth % >= 30%: 25 points
│  ├─ Growth % >= 25%: 20 points
│  └─ Growth % < 25%: 0 points
│
├─ Quality (ROCE) (0-25 points)
│  ├─ ROCE >= 20%: 25 points
│  ├─ ROCE >= 15%: 20 points
│  └─ ROCE < 15%: 0 points
│
├─ Valuation (P/E) (0-25 points)
│  ├─ P/E <= 15: 25 points
│  ├─ P/E <= 18: 20 points
│  ├─ P/E <= 20: 15 points
│  └─ P/E > 20: 0 points
│
└─ Margin Trend (0-20 points)
   ├─ Margin expanding >200 bps: 20 points
   ├─ Margin expanding >100 bps: 15 points
   ├─ Margin stable: 10 points
   └─ Margin contracting: 0 points

Conversion to QS Score (0-10):
├─ 90-100 points = 9.5 QS
├─ 80-89 points = 8.5 QS
├─ 70-79 points = 7.5 QS
├─ 60-69 points = 6.5 QS
└─ < 60 points = not included
```

**Task 1.2: Identify Target Stocks**

Backtest verification (do these stocks meet criteria?):
```
ZEN TECHNOLOGIES:
├─ Growth: 32% revenue CAGR → 25 points
├─ ROCE: 18% → 20 points
├─ P/E: 18 → 20 points
├─ Margin: +150 bps → 15 points
└─ Total: 80 points = 8.5 QS ✓

KAYNES TECHNOLOGY:
├─ Growth: 35% revenue CAGR → 30 points
├─ ROCE: 20% → 25 points
├─ P/E: 17 → 20 points
├─ Margin: +180 bps → 20 points
└─ Total: 95 points = 9.5 QS ✓

JUPITER WAGONS:
├─ Growth: 28% revenue CAGR → 20 points
├─ ROCE: 16% → 20 points
├─ P/E: 14 → 25 points
├─ Margin: +80 bps → 10 points
└─ Total: 75 points = 7.5 QS ✓
```

**Task 1.3: Document Data Requirements**

What data do we need from database?
```
Per stock:
├─ Revenue (TTM + LTM)
├─ ROCE or ROE (current)
├─ P/E ratio (current market price / earnings)
├─ EBITDA or net margin (current + 1yr ago)
├─ Market cap (current)
├─ Sector + industry
└─ Price momentum (52W high/low, volume trend)

Query structure:
SELECT symbol, revenue_ttm, revenue_lym, roce, pe_ratio, 
       current_margin, prev_margin, market_cap, sector
FROM stocks
WHERE market = 'NSE'
  AND is_active = true
  AND market_cap BETWEEN 300 AND 10000  -- in crores
```

---

### Day 2: Backtest Framework Setup

**Task 2.1: Historical Data Backtest**

Goal: Verify ZEN, KAYNES, JUPITER would have been caught 3 months ago.

```
Backtest Period: March 1 - June 23, 2026 (14 weeks)

Week by week: Did scoring capture these stocks BEFORE they rallied?
├─ Week 1 (Mar 1-7): Check if ZEN scored >6.5 on Mar 1
├─ Week 2 (Mar 8-14): Check if ZEN scored >6.5 on Mar 8
├─ ... weekly checks through June 23
└─ Record: First week each stock appeared in top 10

Expected result:
├─ ZEN: First appeared early April (breakout signal detected early)
├─ KAYNES: First appeared late April (emerging quality detected)
└─ JUPITER: First appeared early May (growth acceleration detected)

Success metric: Catch all 3 at least 2-4 weeks before external lists
```

**Task 2.2: Create Backtest Data Extract**

```sql
-- Historical scores simulation
SELECT 
  symbol,
  DATE(scan_date) as date,
  -- Current quarter metrics
  revenue_ttm / NULLIF(revenue_ly, 0) - 1 as growth_rate,
  roce,
  pe_ratio,
  (current_ebitda_margin - prev_ebitda_margin) * 100 as margin_delta,
  -- Calculated score
  CASE
    WHEN revenue_ttm / NULLIF(revenue_ly, 0) >= 1.40 THEN 30
    WHEN revenue_ttm / NULLIF(revenue_ly, 0) >= 1.30 THEN 25
    WHEN revenue_ttm / NULLIF(revenue_ly, 0) >= 1.25 THEN 20
    ELSE 0
  END as growth_score
  -- ... other scoring components
FROM stocks_historical
WHERE symbol IN ('ZENTECH', 'KAYNES', 'JUPWAG')
ORDER BY symbol, date
```

---

## 📋 PRINCIPLE 2: SIMPLICITY FIRST (Day 3)

**Goal:** Copy existing Quality Value scorer template, change only 4 parameters.

### Day 3: Code Structure & Template Copy

**File Structure (Reuse Existing):**
```
Current (Working):
├─ lib/scanners/quality-value-scorer.ts (existing, don't touch)
├─ lib/db/queries/thesis.ts (existing getValuePickStocks function)
└─ components/DeepValueScanner.tsx (existing Tab 1-4)

New (Copy Template):
├─ lib/scanners/emerging-growth-scorer.ts [NEW - copy template]
├─ lib/db/queries/thesis.ts [ADD getEmergingGrowthStocks function]
└─ components/DeepValueScanner.tsx [ADD Tab 5 UI - copy existing tab structure]
```

**Task 3.1: Create emerging-growth-scorer.ts**

```typescript
// Copy structure from quality-value-scorer.ts
// Change ONLY these 4 parameters:

const EMERGING_GROWTH_CONFIG = {
  // Parameter 1: P/E Range (different from Value Picks)
  pe_min: 12,        // Value Picks: <10, Emerging Growth: 12-20
  pe_max: 20,

  // Parameter 2: Growth Rate Threshold
  growth_min: 0.25,  // 25% minimum growth (Value Picks: N/A, no growth filter)

  // Parameter 3: ROCE Threshold (higher quality bar)
  roce_min: 0.15,    // 15% (Value Picks: N/A, less emphasis)

  // Parameter 4: Margin Expansion (new, not in Value Picks)
  margin_expansion_min_bps: 100,  // 1% = 100 bps
};

// Scoring formula (copy from value-value-scorer.ts, adjust weights):
function scoreEmergingGrowth(stock: Stock): number {
  let score = 0;

  // Growth Score (30 points) - new in this module
  if (stock.growth_rate >= 0.40) score += 30;
  else if (stock.growth_rate >= 0.30) score += 25;
  else if (stock.growth_rate >= 0.25) score += 20;

  // Quality Score (25 points)
  if (stock.roce >= 0.20) score += 25;
  else if (stock.roce >= 0.15) score += 20;

  // Valuation Score (25 points) - adjusted for higher P/E
  if (stock.pe_ratio <= 15) score += 25;
  else if (stock.pe_ratio <= 18) score += 20;
  else if (stock.pe_ratio <= 20) score += 15;

  // Margin Trend Score (20 points) - new in this module
  if (stock.margin_delta >= 200) score += 20;
  else if (stock.margin_delta >= 100) score += 15;
  else if (stock.margin_delta >= 0) score += 10;

  return score / 10; // Convert to 0-10 scale
}

export function getEmergingGrowthStocks(stocks: Stock[]): Stock[] {
  return stocks
    .map(stock => ({ ...stock, qs_score: scoreEmergingGrowth(stock) }))
    .filter(stock => stock.qs_score >= 6.5)
    .sort((a, b) => b.qs_score - a.qs_score)
    .slice(0, 10);  // Top 10 curated
}
```

**Task 3.2: Add getEmergingGrowthStocks Query**

```typescript
// In lib/db/queries/thesis.ts, add new function (copy existing pattern):

export async function getEmergingGrowthStocks() {
  const stocks = await db.select().from(stocksTable)
    .where(eq(stocksTable.isActive, true))
    .where(and(
      gte(stocksTable.pe_ratio, 12),
      lte(stocksTable.pe_ratio, 20),
      gte(stocksTable.growth_rate, 0.25),
      gte(stocksTable.roce, 0.15),
      gte(stocksTable.margin_delta, 100)
    ));

  return scoreEmergingGrowth(stocks)
    .filter(s => s.qs_score >= 6.5)
    .sort((a, b) => b.qs_score - a.qs_score)
    .slice(0, 10);
}
```

**Task 3.3: Add Tab 5 UI Component**

```typescript
// In components/DeepValueScanner.tsx, add new tab (copy Tab 1 structure):

export function EmergingGrowthTab() {
  const stocks = useQuery(() => getEmergingGrowthStocks());
  
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <h3 className="font-bold text-blue-900">Emerging Growth</h3>
        <p className="text-sm text-blue-800">
          High-growth quality companies (25%+ growth, ROCE >15%, P/E 12-20)
          with expanding margins. Higher volatility than Value Picks.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stocks?.data?.map(stock => (
          <StockCard key={stock.symbol} stock={stock} />
        ))}
      </div>
    </div>
  );
}

// Add to tab navigation:
<Tab value="emerging-growth" label="Emerging Growth (12)" />
```

---

## ✅ PRINCIPLE 3: SURGICAL CHANGES (Day 4)

**Goal:** Minimal, focused changes. Zero refactoring. Existing code untouched.

### Day 4: Code Integration

**Files Modified (ONLY):**

1. **lib/scanners/emerging-growth-scorer.ts** [NEW: 150 lines]
   - No dependencies on other modules
   - Standalone function
   - Can be deleted without affecting anything else

2. **lib/db/queries/thesis.ts** [ADD: 1 function, 20 lines]
   - New `getEmergingGrowthStocks()` function
   - Existing functions untouched
   - Can be removed independently

3. **app/api/scan/results/route.ts** [ADD: 1 parameter, 5 lines]
   - Add `moduleType` query param
   - Route to correct scorer based on param
   - Backward compatible (existing calls still work)

4. **components/DeepValueScanner.tsx** [ADD: 1 tab, 30 lines]
   - Add Tab 5 to navigation
   - Add EmergingGrowthTab component
   - Existing tabs untouched

**Files NOT Modified:**
```
✓ lib/db/schema.ts (NO schema changes)
✓ lib/scanners/quality-value-scorer.ts (existing untouched)
✓ app/api/scan/route.ts (existing endpoint untouched)
✓ Database tables (reuse existing stocks table)
✓ Fortress layers 1-3, 5-13 (zero impact)
```

**Total Lines of New Code:**
```
emerging-growth-scorer.ts: ~150 lines
thesis.ts additions: ~20 lines
route.ts additions: ~5 lines
DeepValueScanner.tsx additions: ~30 lines
─────────────────────────────
Total: ~205 lines (vs. refactoring 2000+ lines)

Complexity added: ZERO
Technical debt incurred: ZERO
Risk introduced: MINIMAL (can rollback in 2 minutes)
```

---

## 🎯 PRINCIPLE 4: GOAL-DRIVEN EXECUTION (Day 5-7)

**Goal:** Clear success metrics, measured daily.

### Day 5-6: Testing (80%+ Coverage)

**Unit Tests (Day 5):**

```typescript
// Test emerging-growth-scorer.ts

describe('Emerging Growth Scorer', () => {
  it('should score ZEN correctly', () => {
    const zen = {
      symbol: 'ZEN',
      growth_rate: 0.32,
      roce: 0.18,
      pe_ratio: 18,
      margin_delta: 150,
    };
    expect(scoreEmergingGrowth(zen)).toBe(8.5);
  });

  it('should score KAYNES correctly', () => {
    const kaynes = {
      symbol: 'KAYNES',
      growth_rate: 0.35,
      roce: 0.20,
      pe_ratio: 17,
      margin_delta: 180,
    };
    expect(scoreEmergingGrowth(kaynes)).toBe(9.5);
  });

  it('should score JUPITER correctly', () => {
    const jupiter = {
      symbol: 'JUPWAG',
      growth_rate: 0.28,
      roce: 0.16,
      pe_ratio: 14,
      margin_delta: 80,
    };
    expect(scoreEmergingGrowth(jupiter)).toBe(7.5);
  });

  it('should filter out low-quality stocks', () => {
    const lowQuality = {
      symbol: 'BAD',
      growth_rate: 0.20,  // Below 25% threshold
      roce: 0.12,         // Below 15% threshold
      pe_ratio: 25,       // Above 20 max
      margin_delta: -100, // Contracting
    };
    expect(scoreEmergingGrowth(lowQuality)).toBeLessThan(6.5);
  });
});
```

**Integration Tests (Day 6):**

```typescript
describe('getEmergingGrowthStocks API', () => {
  it('should return top 10 stocks', async () => {
    const response = await fetch('/api/scan/results?moduleType=emerging-growth');
    const data = await response.json();
    
    expect(data.stocks.length).toBeLessThanOrEqual(10);
    expect(data.stocks[0].qs_score).toBeGreaterThan(data.stocks[1].qs_score);
  });

  it('should include ZEN, KAYNES, JUPITER', async () => {
    const response = await fetch('/api/scan/results?moduleType=emerging-growth');
    const data = await response.json();
    const symbols = data.stocks.map(s => s.symbol);
    
    expect(symbols).toContain('ZEN');
    expect(symbols).toContain('KAYNES');
    expect(symbols).toContain('JUPWAG');
  });

  it('should filter by module type correctly', async () => {
    const growthResponse = await fetch('/api/scan/results?moduleType=emerging-growth');
    const valueResponse = await fetch('/api/scan/results?moduleType=value');
    
    const growthData = await growthResponse.json();
    const valueData = await valueResponse.json();
    
    // Different results for different modules
    expect(growthData.stocks).not.toEqual(valueData.stocks);
  });

  it('should maintain backward compatibility', async () => {
    const response = await fetch('/api/scan/results');  // No moduleType param
    const data = await response.json();
    
    // Should default to Value Picks (existing behavior)
    expect(data.stocks.length).toBe(17);  // Existing count
  });
});
```

**Regression Tests (Day 6):**

```typescript
describe('Regression: Existing Tabs Unchanged', () => {
  it('Value Picks should still return 17 stocks', async () => {
    const response = await fetch('/api/scan/results?moduleType=value');
    const data = await response.json();
    expect(data.stocks.length).toBe(17);
  });

  it('Hidden Gems should still return 4 stocks', async () => {
    const response = await fetch('/api/scan/results?moduleType=hidden-gems');
    const data = await response.json();
    expect(data.stocks.length).toBe(4);
  });

  it('High Risk should still return 1 stock (IDEA)', async () => {
    const response = await fetch('/api/scan/results?moduleType=high-risk');
    const data = await response.json();
    expect(data.stocks[0].symbol).toBe('IDEA');
  });

  it('Scores should not have changed', async () => {
    const oldResponse = await fetch('/api/scan/results?moduleType=value');
    const oldData = await oldResponse.json();
    
    const hcltech = oldData.stocks.find(s => s.symbol === 'HCLTECH');
    expect(hcltech.qs_score).toBe(86);  // Should be unchanged
  });
});
```

**Success Metrics (Day 7):**

```
✓ Unit Test Coverage: 90%+ (all scoring paths covered)
✓ Integration Tests: 100% (all API paths tested)
✓ Regression Tests: 100% (existing functionality verified)
✓ ZEN Score: 6.8-7.0/10 (within target range)
✓ KAYNES Score: 6.9-7.1/10 (within target range)
✓ JUPITER Score: 7.0-7.2/10 (within target range)
✓ API Response Time: <300ms (better than target <500ms)
✓ Error Rate: 0% (zero errors in test suite)
✓ Backtest: ZEN/KAYNES/JUPITER caught 2-4 weeks pre-breakout
```

---

## 📊 WEEK 1 CHECKLIST

### Day 1 ✓
- [ ] Scoring thresholds defined
- [ ] Target stocks identified (ZEN, KAYNES, JUPITER)
- [ ] Data requirements documented

### Day 2 ✓
- [ ] Backtest framework created
- [ ] Historical data extracted
- [ ] Verification completed (3 stocks caught pre-breakout)

### Day 3 ✓
- [ ] emerging-growth-scorer.ts written (150 lines)
- [ ] getEmergingGrowthStocks() query added (20 lines)
- [ ] Tab 5 UI component created (30 lines)
- [ ] API endpoint updated (5 lines)

### Day 4 ✓
- [ ] Code integrated into develop branch
- [ ] Zero refactoring verified
- [ ] Existing code untouched confirmed

### Day 5 ✓
- [ ] Unit tests written (90%+ coverage)
- [ ] All scoring edge cases tested
- [ ] ZEN/KAYNES/JUPITER tests passing

### Day 6 ✓
- [ ] Integration tests written (API behavior)
- [ ] Regression tests written (existing tabs)
- [ ] All tests passing

### Day 7 ✓
- [ ] Success metrics verified
- [ ] Code review ready
- [ ] Merge to develop branch

---

## 🎬 WEEK 1 DELIVERABLE

**What You'll Have by Friday:**
- ✅ Emerging Growth module complete
- ✅ ZEN, KAYNES, JUPITER caught at 6.8-7.2/10
- ✅ 205 lines of new code (no refactoring)
- ✅ 90%+ test coverage
- ✅ Backward compatible (existing tabs untouched)
- ✅ Ready for staging deployment

**Ready for Week 2:** Capex module build (same process, parallel track)

---

**PRINCIPLE 1 (Think Before Coding):** Days 1-2 ✓
**PRINCIPLE 2 (Simplicity First):** Day 3 ✓
**PRINCIPLE 3 (Surgical Changes):** Day 4 ✓
**PRINCIPLE 4 (Goal-Driven):** Days 5-7 ✓

**STATUS: Week 1 Ready to Execute Monday, June 26, 2026**

