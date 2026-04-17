# Investment Genie Architecture

**Version:** 1.0  
**Last Updated:** 2026-04-17  
**Owner:** Claude Code + Google Antigravity  
**Status:** Specification ready for parallel development

---

## Overview

Investment Genie is a personalized portfolio allocation system for NRI investors. It integrates:
- **User Input** (demographic + preferences)
- **Market Data** (scanner, macro, intelligence)
- **Allocation Logic** (mapper engine)
- **Output** (portfolio recommendation + tax optimization)

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. InvestmentGenieForm                                      │
│    (Antigravity: React component)                           │
│    Collects: age, amount, horizon, countries, risk,         │
│    experience, income stability                              │
│    Output: UserProfile                                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Submit → Trigger 3 Parallel Queries                      │
│    (Antigravity: API query functions)                       │
│                                                              │
│    Query 1: queryScanResults(["NSE"])                       │
│    → Latest stock scanner + top 20 stocks by score          │
│    → Output: ScanData                                        │
│                                                              │
│    Query 2: queryMacroSnapshot()                            │
│    → Nifty, Nifty Bank, USD/INR, Gold, Crude, VIX          │
│    → Computed fields: vixState, goldTrend, etc.             │
│    → Output: MacroState                                      │
│                                                              │
│    Query 3: queryIntelligence()                             │
│    → Market signals (Taiwan tensions, Fed cuts, etc.)       │
│    → Output: Signal[]                                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓ (All 3 complete)
┌─────────────────────────────────────────────────────────────┐
│ 3. Mapper: allocatePortfolio()                              │
│    (Claude Code: Core allocation logic)                     │
│                                                              │
│    Input: UserProfile + ScanData + MacroState + Signal[]    │
│    Process:                                                  │
│    - Initialize base template (risk appetite based)         │
│    - Apply macro adjustments (VIX elevation, gold trend)    │
│    - Apply signal adjustments (bullish/bearish sectors)     │
│    - Filter scan results by experience level                │
│    - Build allocation layers (fortress, growth, etc.)       │
│    - Generate signal-driven actions                         │
│    - Calculate projections (base/bull/bear)                 │
│    - Add tax optimization                                   │
│    Output: Allocation                                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. InvestmentGeniePage                                      │
│    (Claude Code: Integration component)                     │
│    Displays:                                                 │
│    - Allocation layers + weights                            │
│    - Reasoning for each layer                               │
│    - Signal-driven actions                                  │
│    - Tax optimization tips                                  │
│    - Projected returns (base/bull/bear)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Ownership

| Component | Owner | File | Status |
|-----------|-------|------|--------|
| InvestmentGenieForm | Antigravity | `components/` | 🔄 In Dev |
| queryScanResults() | Antigravity | `lib/investment-genie/queries.ts` | 🔄 In Dev |
| queryMacroSnapshot() | Antigravity | `lib/investment-genie/queries.ts` | 🔄 In Dev |
| queryIntelligence() | Antigravity | `lib/investment-genie/queries.ts` | 🔄 In Dev |
| allocatePortfolio() | Claude Code | `lib/investment-genie/allocator.ts` | ⏳ Pending |
| InvestmentGeniePage | Claude Code | `app/intelligence/page.tsx` | ⏳ Pending |
| contracts.ts | Both | `lib/investment-genie/contracts.ts` | ✅ Done |

---

## Type Safety & Contracts

**Single Source of Truth:** `lib/investment-genie/contracts.ts`

All interfaces are defined once. Antigravity and Claude Code both implement against these exact signatures:

```typescript
// Antigravity implements:
export async function queryScanResults(markets: string[]): Promise<ScanData>
export async function queryMacroSnapshot(): Promise<MacroState>
export async function queryIntelligence(): Promise<Signal[]>

// Claude Code implements:
export function allocatePortfolio(
  profile: UserProfile,
  scan: ScanData,
  macro: MacroState,
  signals: Signal[]
): Allocation
```

**CI/CD Verification:** `npm run tsc --noEmit` ensures type matching on every commit.

---

## Error Handling Strategy

### Form Validation (Antigravity)
- All 7 fields required before submission
- Show validation errors below each field
- No submit until all fields valid

### Query Failures (Antigravity)
- Try-catch around each API call
- Log errors for debugging
- Return safe defaults (empty ScanData, etc.)

### Mapper Errors (Claude Code)
- Graceful degradation (never crash)
- Return error message to display
- Example: "Insufficient data for allocation"

### Integration Component (Claude Code)
- Handle loading state
- Display error message if any query fails
- Retry mechanism (manual button)

---

## Allocation Algorithm Overview

The `allocatePortfolio()` function:

1. **Initialize Base Template**
   - Map risk appetite (0-100) to allocation template
   - Example: 50% risk → 60% equities / 40% bonds

2. **Apply Macro Adjustments**
   - VIX elevated (>20) → Shift 5% toward safety
   - Gold flight-to-safety → Add 3% hedges
   - INR weak → Reduce India allocation slightly

3. **Apply Signal Adjustments**
   - High-impact bullish signal → Increase affected sectors
   - High-impact bearish signal → Decrease affected sectors
   - Example: Taiwan tensions high → Reduce semiconductor allocation

4. **Experience-Based Filtering**
   - Beginner: Only Launcher + Builder tier stocks
   - Intermediate: All tiers
   - Experienced: All tiers, higher concentration allowed

5. **Build Allocation Layers**
   - **Fortress (Safe Core):** US index ETFs (VOO, QQQ)
   - **Growth (India):** Mid-cap stocks from scan
   - **Upside (Moonshots):** Rocket-tier stocks
   - **Hedge:** Gold ETF, bonds
   - **Income:** Dividend aristocrats
   - **Swing:** Sector bets
   - **Cash:** Emergency buffer

6. **Signal-Driven Actions**
   - Document each signal
   - Specify impact level
   - Define action (e.g., "Reduce SOXX from 10% → 8%")

7. **Tax Optimization**
   - NRE Demat routing (tax-free gains, repatriable)
   - W-8BEN filing (15% vs 30% dividend withholding)
   - Savings account recommendations

8. **Projections**
   - Base case CAGR (realistic)
   - Bull case (optimistic)
   - Bear case (pessimistic)
   - Range: min to max returns

9. **Normalize & Return**
   - Ensure all weights sum to 100%
   - Return Allocation object

---

## MVP Scope (Day 3, 3 PM IST)

### IN MVP
- India-only allocation (NSE stocks)
- Form with 7 fields
- 3 query functions (mocked if needed)
- Mapper with macro + signal logic
- Basic tax optimization (NRE Demat hint)
- Projected returns (base/bull/bear)

### NOT IN MVP (Future)
- US/Malaysia/Singapore allocations
- Rebalancing recommendations
- Tax-loss harvesting
- Options strategies
- Real-time portfolio tracking

---

## Testing Strategy

### Unit Tests (80%+ coverage)

**Antigravity:**
- Form renders all 7 fields
- Form validates required fields
- Form submission returns UserProfile with correct types
- Each query function returns correct type
- Query functions handle API errors gracefully

**Claude Code:**
- allocatePortfolio() handles edge cases (no data, empty signals)
- Macro adjustments correctly apply
- Signal adjustments correctly apply
- Experience filtering works
- Weights normalize to 100%
- Projections are realistic

### Integration Tests

**Together:**
- Full flow: Form → Queries → Mapper → Result
- Test with real-world scenario: Age 35, $15K, 20yr, India, 50% risk
- Verify allocation generates in < 2 seconds
- Verify output displays correctly

### E2E Tests

**Playwright:**
- User fills form, submits, sees allocation
- Try with mobile (375px width)
- Try with error conditions (query failure)

---

## Deployment Timeline

**Day 1 (Apr 17, 6 PM IST):** Contracts + architecture ready
**Day 2 (Apr 18, 12 PM IST):** Antigravity components + mapper integrated
**Day 3 (Apr 19, 3 PM IST):** VPS deployment + cron setup → LAUNCH

---

## Cron Jobs (Day 3)

Three automated jobs refresh data nightly:

```
2 AM IST → Scanner job (queryScanResults)
8 PM IST → Macro job (queryMacroSnapshot)
8:30 PM IST → Intelligence job (queryIntelligence)
```

Results cached in database. Forms always use latest data.

---

## Success Criteria

✅ All TypeScript compiles  
✅ All tests pass (80%+ coverage)  
✅ CI/CD gates pass  
✅ Your $15K allocation generates correctly  
✅ Mobile responsive (375px width)  
✅ Error handling works  
✅ Deployment to VPS succeeds  
✅ Ready for beta users  

---

## Questions?

- Type mismatch? Check `contracts.ts`
- Implementation detail? See handover brief
- Blocker? Open GitHub Issue
