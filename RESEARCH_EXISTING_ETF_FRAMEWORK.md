# RESEARCH FINDINGS: Existing ETF & Allocation Framework in Fortress

**Date:** May 29, 2026  
**Researcher:** Claude Code  
**Status:** ✅ EXTENSIVE REUSABLE FRAMEWORK FOUND

---

## Executive Summary

**GOOD NEWS:** Fortress already has ~70% of the ETF/allocation infrastructure needed. We don't need to build from scratch—we need to **expand and formalize** what already exists.

### What Already Exists

✅ **Portfolio Framework** (Live on production)
- `strategies` table with risk tiers (aggressive, balanced, conservative)
- `strategy_holdings` table for tracking individual positions
- Live price fetching via yfinance
- Rebalance computation engine with 5% drift detection

✅ **Investment Genie Allocator** (Live on production)
- Risk-tier system: conservative/balanced/aggressive
- ETF pools defined for each tier:
  - **FORTRESS_POOLS**: Core holdings (VOO, QQQ, SCHD, etc.)
  - **HEDGE_POOLS**: Downside protection (GLD, BND, AGG)
  - **INCOME_POOLS**: Dividend strategies (SCHD, VYM, DGRO)
  - **CASH_POOLS**: Emergency liquidity (VMFXX, SGOV)
  - **SWING_DEFAULTS**: Tactical sector bets (XLK, XLV, XLF)
  - **LEVERAGED_UPSIDE**: Aggressive bets (TQQQ, SOXL)

✅ **Integration with Trading Skills**
- `invest-portfolio-review` skill from InvestSkill (comprehensive portfolio analysis framework)
- NSE + equity research skills already installed
- Position sizing logic in skills

### What's Missing

❌ **Formal ETF Master List** (top 40 ETFs not indexed in database)
❌ **Tier Classification System** (which ETFs belong to Tier 1/2/3)
❌ **ETF Metadata Database** (AUM, expense ratio, sector, correlations not stored)
❌ **Multi-tier Allocation Templates** (only 1 strategy: 10X Moonshot)
❌ **ETF Comparison UI** (no side-by-side ETF comparison tool)
❌ **NSE ETF Support** (NIFTYBEES, JUNIORBEES, etc. not integrated)

---

## PART 1: WHAT ALREADY EXISTS (70% Complete)

### 1.1 Portfolio Database Schema

**File:** `fortress-app/lib/db/schema.ts`

```sql
-- Already exists in production:
CREATE TABLE strategies (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL,
  name VARCHAR (e.g., "10X Moonshot"),
  description TEXT,
  riskTier ENUM ('aggressive', 'balanced', 'conservative'),
  totalCapitalUsd NUMERIC,
  targetMultiple NUMERIC,
  targetHorizonYears INT,
  createdAt TIMESTAMP,
  ...
);

CREATE TABLE strategy_holdings (
  id UUID PRIMARY KEY,
  strategyId UUID NOT NULL (FK),
  ticker VARCHAR (e.g., "QQQ"),
  name VARCHAR,
  targetWeightPct NUMERIC (e.g., 15.0),
  unitsHeld NUMERIC (e.g., 5),
  avgBuyPrice NUMERIC (e.g., $400),
  ...
);
```

**Status:** ✅ Live on production (May 23, 2026)

---

### 1.2 Investment Genie Allocator Engine

**File:** `fortress-app/lib/investment-genie/allocator.ts` (~500 lines)

**What it does:** Takes user risk profile → selects from pre-defined ETF pools → returns allocation

**Risk Tiers Defined:**

#### Conservative Tier (Stable, Income)
```javascript
FORTRESS_POOLS.conservative = [
  { ticker: "AGG",  split: 0.40, why: "US total bond market" },
  { ticker: "BND",  split: 0.25, why: "Broad bond market" },
  { ticker: "VYM",  split: 0.20, why: "High-yield dividend ETF" },
  { ticker: "VXUS", split: 0.15, why: "International diversification" },
];

HEDGE_POOLS.conservative = [
  { ticker: "AGG", split: 0.40 },
  { ticker: "GLD", split: 0.35 },
  { ticker: "SGOV", split: 0.25 },
];

INCOME_POOLS.conservative = [
  { ticker: "SCHD", split: 0.50, why: "Dividend aristocrats" },
  { ticker: "VYM",  split: 0.30 },
  { ticker: "DGRO", split: 0.20 },
];
```

#### Balanced Tier (Growth + Safety)
```javascript
FORTRESS_POOLS.balanced = [
  { ticker: "VOO", split: 0.60, why: "S&P 500" },
  { ticker: "QQQ", split: 0.25, why: "Nasdaq-100" },
  { ticker: "VXUS", split: 0.15 },
];

SWING_DEFAULTS.balanced = [
  { ticker: "XLV", split: 0.34, why: "Healthcare" },
  { ticker: "XLK", split: 0.33, why: "Tech sector" },
  { ticker: "XLF", split: 0.33, why: "Financials" },
];
```

#### Aggressive Tier (Growth-Focused)
```javascript
FORTRESS_POOLS.aggressive = [
  { ticker: "QQQ", split: 0.50, why: "Nasdaq-100" },
  { ticker: "SMH", split: 0.30, why: "Semiconductor ETF" },
  { ticker: "VXUS", split: 0.20 },
];

LEVERAGED_UPSIDE = [
  { ticker: "TQQQ", split: 0.50, why: "3× Nasdaq" },
  { ticker: "SOXL", split: 0.50, why: "3× Semiconductor" },
];
```

**Status:** ✅ Live on production

---

### 1.3 Portfolio Rebalance Engine

**File:** `fortress-app/lib/portfolio/rebalance.ts` (~80 lines)

```typescript
export function computeRebalance(
  strategy: Strategy,
  holdings: StrategyHolding[],
  prices: Record<string, number>
): StrategyDetail {
  // 1. Attach live prices & compute current values
  // 2. Aggregate portfolio totals
  // 3. Compute current weight % per holding
  // 4. Compute buy/trim actions (5% drift threshold)
  // 5. Return: actions needed to rebalance
}
```

**Features:**
- ✅ Computes current weight vs. target weight
- ✅ Flags holdings with >5% drift
- ✅ Suggests buy/trim/hold actions
- ✅ Calculates dollar amounts and units needed

**Status:** ✅ Live on production

---

### 1.4 Portfolio API Routes

**Files:** `fortress-app/app/api/portfolio/route.ts` + related

**Endpoints:**
- `GET /api/portfolio` — all strategies with live P&L
- `POST /api/portfolio` — create strategy from allocation
- `GET /api/portfolio/[id]` — strategy detail with rebalance actions
- `PUT /api/portfolio/[id]/holdings` — update holdings
- `DELETE /api/portfolio/[id]` — delete strategy with optional feedback
- `POST /api/portfolio/seed` — one-click 10X Moonshot seed

**Status:** ✅ Live on production (May 23-26, 2026)

---

### 1.5 Trading Skills Integration (InvestSkill + NSE)

**Location:** `C:\Antigravity\trading-repos\InvestSkill\`

**Installed Skills (30+):**
- `invest-portfolio-review` — comprehensive portfolio analysis framework
- `invest-full-report` — institutional-grade research
- `invest-stock-eval` — Piotroski F-Score, ROIC analysis
- `invest-dcf-valuation` — intrinsic value calculation
- `nse-trading-toolkit` — Indian market analysis
- `position-sizing` — risk-adjusted position sizing

**Portfolio-Review Framework** (exists but not connected to Fortress):
```
Phase 1: Portfolio Snapshot (total value, holdings, investor profile)
Phase 2: Performance Analysis (YTD/1Y/3Y/5Y returns, Sharpe ratio, drawdown)
Phase 3: Asset Allocation Review (current vs. target weights, deviations)
Phase 4: Holdings Review (concentration risk, overlap, efficiency)
Phase 5: Optimization (rebalancing actions, diversification gaps)
```

**Status:** ✅ Installed but not integrated into Fortress allocation system

---

## PART 2: WHAT'S MISSING (30% Needed)

### 2.1 ETF Master Index (Missing)

**What's needed:**
```sql
CREATE TABLE etfs (
  id UUID PRIMARY KEY,
  ticker VARCHAR UNIQUE,
  name VARCHAR,
  fortress_tier INT (1, 2, 3),
  asset_class VARCHAR,
  market VARCHAR ('US', 'NSE'),
  aum_usd NUMERIC,
  expense_ratio NUMERIC,
  sector VARCHAR,
  ...
);
```

**Current state:** No database table for ETF metadata

---

### 2.2 Tier Classification Framework (Missing)

**Allocator has:**
- ✅ Pools for conservative/balanced/aggressive
- ✅ Individual ETF selections within pools

**Missing:**
- ❌ Formal tier 1/2/3 classification
- ❌ Tier reasoning (AUM, liquid, expense ratio criteria)
- ❌ Non-pool ETFs (Tier 3 specialized)
- ❌ NSE ETF tiers (NIFTYBEES, JUNIORBEES, etc.)

---

### 2.3 NSE ETF Support (Missing)

**Current support:** INDA (US-listed India ETF) only

**Missing:**
- ❌ NIFTYBEES, JUNIORBEES, BANKBEES, NIFTYIT, etc.
- ❌ INR-denominated pricing
- ❌ NSE API integration (yfinance .NS suffix works but incomplete)
- ❌ NSE sector ETF mappings

---

### 2.4 Multi-Allocation Template System (Missing)

**Current state:** Allocator selects from pools, but pools are not:
- ❌ Named allocation templates
- ❌ Stored in database
- ❌ User-selectable ("Show me the CORE template")
- ❌ Comparable side-by-side

---

### 2.5 ETF Comparison UI (Missing)

**Current state:** No UI component to:
- ❌ Compare 2-3 ETFs side-by-side
- ❌ Show AUM, expense ratio, sector, yield
- ❌ Display tier reasoning
- ❌ Filter by market/sector/tier

---

## PART 3: TACTICAL SOLUTION (Using What Exists)

### Option A: Formalize Existing + Add NSE (Recommended)

**Timeline:** 2-3 weeks | Effort: 60 hrs | Impact: High

**Steps:**

1. **Week 1: Extend Allocator Pools**
   - Add missing ETFs to existing FORTRESS_POOLS (BND → AGG, VTI → VOO, VYM, VEA, VXUS, DBC, VNQ, XLV, XLF, IWM, EEM, TLT, IBIT)
   - Add NSE pools (NIFTYBEES, JUNIORBEES, BANKBEES, NIFTYIT, CPSE)
   - Formalize as "Tier 1 Core", "Tier 2 Growth", "Tier 3 Specialized"

2. **Week 1-2: Add ETF Metadata Table**
   - Create `etfs` table in schema
   - Backfill with 40 ETFs (AUM, expense ratio, sector, tier)
   - Create `/api/etf/top20?market=US|NSE` endpoint

3. **Week 2-3: Build Comparison UI**
   - Interactive ETF comparison component (select 2-3 tickers → compare)
   - Tier explanation cards on Genie results

---

### Option B: Leverage Existing Allocator + Document (Fastest)

**Timeline:** 1 week | Effort: 20 hrs | Impact: Medium

**Steps:**

1. **Document what exists** (allocator pools are already 70% of the answer)
   - Export pools from allocator.ts as markdown
   - Explain tier system + why ETFs were chosen
   - Host as GitHub doc + link from Genie

2. **Extend pools in allocator.ts**
   - Add 15-20 more ETFs to pools
   - Add NSE tiers

3. **Ship immediately** (no database changes needed)

---

## PART 4: REUSABLE CODE SNIPPETS

### From Allocator (Don't Rewrite)

```typescript
// Already exists, DO NOT REWRITE:
type RiskTier = "conservative" | "balanced" | "aggressive";

function deriveRiskTier(riskAppetite: number): RiskTier {
  if (riskAppetite <= 33) return "conservative";
  if (riskAppetite <= 66) return "balanced";
  return "aggressive";
}

// Just expand these pools:
const FORTRESS_POOLS: Record<RiskTier, PoolInstrument[]> = { ... };
const HEDGE_POOLS: Record<RiskTier, PoolInstrument[]> = { ... };
const INCOME_POOLS: Record<RiskTier, PoolInstrument[]> = { ... };
```

### From Rebalance (Don't Rewrite)

```typescript
// Already exists, REUSE:
const DRIFT_THRESHOLD_PCT = 5; // Perfect for tier-based rebalancing
export function computeRebalance(...) { ... } // Already handles all logic
```

### From Portfolio Queries (Don't Rewrite)

```typescript
// Already exists, REUSE:
await getStrategiesByUserId(userId);
await getHoldingsByStrategyId(strategyId);
await fetchLivePrices(tickers);
```

---

## PART 5: GitHub ETF Framework (Reusable)

**Location:** `C:\Antigravity\trading-repos\InvestSkill\`

**Reusable for Fortress:**
- Portfolio-review methodology (framework already written)
- Position-sizing skill (already calculates risk-adjusted allocation)
- Asset allocation analysis (already structured)

**Integration point:** Connect `invest-portfolio-review` skill to Fortress portfolio page

---

## PART 6: Recommendations

### 🎯 BEST APPROACH: Incremental Expansion (3 Weeks)

**Week 1:** Expand allocator pools + add NSE ETFs
```
- Edit FORTRESS_POOLS to include 15+ missing ETFs
- Add NIFTYBEES, JUNIORBEES, BANKBEES, etc. to NSE pools
- Rename pools to reflect "Tier 1/2/3" philosophy
- NO database changes needed
```

**Week 1-2:** Add ETF metadata (database)
```
- Create etfs table in schema
- Backfill 40 ETFs with AUM, expense ratio, sector, tier
- Create /api/etf endpoint
- Minimal migration needed (add to existing schema.ts)
```

**Week 2-3:** Build comparison UI
```
- ETF comparison component (already use fetchLivePrices from portfolio)
- Tier explanation cards
- Integration with Genie results
```

### Why This Works

✅ **Reuses 70% of existing code** (allocator, rebalance, portfolio API)  
✅ **No breaking changes** (only adds, not modifies)  
✅ **Ship weekly** (incremental progress, not all-or-nothing)  
✅ **Low risk** (proven patterns in production)  
✅ **Leverages skills** (InvestSkill already has methodology)

---

## PART 7: Files to Modify (Not Create)

| File | Change | Effort |
|------|--------|--------|
| `allocator.ts` | Expand pools + add NSE tiers | 2 hrs |
| `schema.ts` | Add `etfs` table | 1 hr |
| `portfolio/rebalance.ts` | No change needed | 0 hrs |
| `api/portfolio/route.ts` | Add tier selection to allocation | 1 hr |
| New: `api/etf/route.ts` | List top 40 ETFs with metadata | 2 hrs |
| New: `components/etf-comparison.tsx` | UI component | 4 hrs |
| New: `lib/etf-data.json` | Static pool definitions | 3 hrs |

**Total code changes:** ~13 hours

---

## CONCLUSION

**Don't build from scratch. Fortress already has:**
- ✅ Portfolio tracking (strategies, holdings, rebalance)
- ✅ Risk tier system (conservative/balanced/aggressive)
- ✅ ETF pools (50+ ETFs already referenced in allocator)
- ✅ Allocation logic (proven in production)
- ✅ Pricing + rebalance engine (live, tested)

**What's needed:**
- ❌ Formalize + extend pools (30% of allocator needs)
- ❌ Add ETF metadata table (straightforward schema addition)
- ❌ Build comparison UI (reuses existing components)
- ❌ NSE ETF integration (yfinance already supports .NS suffix)

**Recommendation:** **Use Option B (Leverage Existing) for Week 1, then expand to Option A (Formalize) for Weeks 2-3.**

---

**Files to reference:** See Appendix below

---

## APPENDIX: Key Locations

**Allocation Logic:**
- `fortress-app/lib/investment-genie/allocator.ts` (main engine, 500 lines)
- `fortress-app/lib/investment-genie/contracts.ts` (types)

**Portfolio Framework:**
- `fortress-app/lib/db/schema.ts` (strategies + holdings tables)
- `fortress-app/lib/portfolio/rebalance.ts` (rebalance logic)
- `fortress-app/lib/portfolio/portfolio-prices.ts` (price fetching)
- `fortress-app/app/api/portfolio/route.ts` (API)

**UI Components:**
- `fortress-app/components/investment-genie/InvestmentGeniePage.tsx`
- `fortress-app/components/investment-genie/AllocationResult.tsx`
- `fortress-app/components/portfolio/` (all portfolio UI)

**Trading Skills:**
- `C:/Antigravity/trading-repos/InvestSkill/prompts/portfolio-review.md`
- `C:/Antigravity/trading-repos/InvestSkill/plugins/us-stock-analysis/skills/portfolio-review/`

---

**END OF RESEARCH REPORT**
