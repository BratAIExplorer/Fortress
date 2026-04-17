# 💻 Claude Code (Me) — Investment Genie Build Brief

**Sprint:** 3-day parallel development  
**Deadline:** Day 3, 3 PM IST  
**Owner:** Claude Code (Anthropic SDK)  
**Coordinator with:** Google Antigravity (Gemini 3.1 Agent)

---

## 🎯 **Mission**

**Day 1-2:** Build core system architecture + allocation mapper logic  
**Day 3:** VPS deployment + cron setup + final verification

**Parallel with Antigravity:** While they build 3 components, I build integration layer + mapper.

---

## 📦 **My Deliverables**

### **Day 1: System Architecture**

**1. contracts.ts — Code Contracts**

Create file: `fortress-app/lib/investment-genie/contracts.ts`

**What:** Single source of truth for all TypeScript interfaces. Antigravity and I must both follow these exactly.

**Contents:**
```typescript
// UserProfile — from form
export interface UserProfile {
  age: number;
  amount: number;
  horizon: "1yr" | "5yr" | "10yr" | "20yr" | "retirement";
  countries: ("India" | "US" | "Malaysia" | "Singapore" | "ETFs")[];
  riskAppetite: number; // 0-100
  experience: "beginner" | "intermediate" | "experienced";
  incomeStability: "stable" | "variable" | "business";
}

// ScanData — from scanner
export interface ScanResult {
  symbol: string;
  totalScore: number;
  mbTier: "Rocket" | "Launcher" | "Builder" | "Crawler" | "Grounded";
  mbScore: number;
  priceAtScan: number;
  sector: string;
  market: "NSE" | "US" | "HKEX";
}

export interface ScanData {
  scanDate: Date;
  market: string;
  totalStocks: number;
  results: ScanResult[];
}

// MacroState — from macro snapshot
export interface MacroSnapshot {
  snapshotDate: Date;
  nifty50: number;
  bankNifty: number;
  usdInr: number;
  goldUsd: number;
  crudeOilUsd: number;
  us10yYield: number;
  cboeVix: number;
  indiaVix: number;
}

export interface MacroState {
  snapshot: MacroSnapshot;
  vixState: "normal" | "elevated" | "extreme";
  goldTrend: "flight-to-safety" | "normal" | "overbought";
  currencyTrend: "inr-weak" | "inr-stable" | "inr-strong";
  equityTrend: "bullish" | "neutral" | "corrective";
}

// Signals — from intelligence
export interface Signal {
  name: string;
  direction: "bullish" | "bearish" | "neutral";
  impactLevel: "high" | "medium" | "low";
  affectedSectors: { sector: string; direction: string }[];
}

// Final allocation
export interface AllocationVehicle {
  ticker: string;
  weight: number;
  why: string;
}

export interface AllocationLayer {
  name: string;
  vehicles: AllocationVehicle[];
  why: string;
}

export interface Allocation {
  layers: Record<string, AllocationLayer>;
  signals: { signal: string; impact: string; action: string }[];
  taxOptimization: {
    nreDemat?: string;
    w8ben?: string;
    savings?: string;
  };
  projectedReturns: {
    base: { min: number; max: number };
    bull: { min: number; max: number };
    bear: { min: number; max: number };
  };
}

// API Query Function Signatures (Antigravity implements these)
export async function queryScanResults(markets: string[]): Promise<ScanData>;
export async function queryMacroSnapshot(): Promise<MacroState>;
export async function queryIntelligence(): Promise<Signal[]>;

// Mapper function (I implement this)
export function allocatePortfolio(
  profile: UserProfile,
  scan: ScanData,
  macro: MacroState,
  signals: Signal[]
): Allocation;
```

**Deliverable:** ✅ `contracts.ts` committed to `feature/investment-genie` branch

---

**2. System Design Document**

Create file: `fortress-app/docs/INVESTMENT_GENIE_ARCHITECTURE.md`

**What:** High-level architecture explaining flow

**Contents:**
```
# Investment Genie Architecture

## Data Flow
1. User fills form → UserProfile
2. Submit → Trigger 3 parallel queries:
   - Query scan results (latest NSE stocks)
   - Query macro snapshot (VIX, gold, fx, nifty)
   - Query intelligence (market signals)
3. All 3 complete → Pass to allocatePortfolio()
4. Mapper returns Allocation
5. Display allocation + reasoning

## Components
- InvestmentGenieForm (Antigravity)
- queryScanResults, queryMacroSnapshot, queryIntelligence (Antigravity)
- allocatePortfolio (Claude Code)
- InvestmentGeniePage wrapper (Claude Code)

## Type Safety
All functions use contracts.ts interfaces
CI/CD verifies type matching via npm run tsc --noEmit

## Error Handling
- Form validation: Show errors below fields
- Query failures: Fall back to default allocation
- Mapper errors: Return error message to user
```

**Deliverable:** ✅ Design doc in `/docs/`

---

### **Day 2: Allocation Mapper**

**3. allocatePortfolio() Function**

Create file: `fortress-app/lib/investment-genie/allocator.ts`

**What:** Core logic that transforms (UserProfile + ScanData + MacroState + Signals) → Allocation

**Algorithm:**

```typescript
export function allocatePortfolio(
  profile: UserProfile,
  scan: ScanData,
  macro: MacroState,
  signals: Signal[]
): Allocation {
  // 1. Initialize base template based on risk appetite
  let allocation = initializeTemplate(profile.riskAppetite);
  
  // 2. Apply macro adjustments
  if (macro.vixState === "elevated") {
    allocation.safety += 5;    // +5% to cash
    allocation.growth -= 5;
  }
  if (macro.goldTrend === "flight-to-safety") {
    allocation.hedge += 3;
  }
  
  // 3. Apply signal adjustments
  for (const signal of signals) {
    if (signal.impactLevel === "high") {
      for (const sector of signal.affectedSectors) {
        if (sector.direction === "bullish") {
          // Increase allocation to bullish sectors
        } else {
          // Decrease allocation to bearish sectors
        }
      }
    }
  }
  
  // 4. Filter scan results by user's experience level
  let investmentUniverse = scan.results;
  if (profile.experience === "beginner") {
    investmentUniverse = investmentUniverse.filter(r => r.mbTier === "Launcher" || r.mbTier === "Builder");
  }
  
  // 5. Build allocation layers
  const layers: Record<string, AllocationLayer> = {
    fortress: {
      name: "Fortress (Safe Core)",
      vehicles: [
        { ticker: "VOO", weight: 22, why: "S&P 500, Buffett anchor" },
        { ticker: "QQQ", weight: 8, why: "Tech growth, but reduced for overlap" }
      ],
      why: "60/40 barbell: safe core absorbs crashes"
    },
    growth: {
      name: "Growth (India)",
      vehicles: buildIndiaGrowthAllocation(investmentUniverse, allocation.growth),
      why: "18% India mid-caps via NRE"
    },
    // ... more layers
  };
  
  // 6. Add signal-driven actions
  const signalActions = signals.map(s => ({
    signal: s.name,
    impact: s.impactLevel,
    action: generateAction(s) // E.g., "Taiwan tensions high → Reduce SOXX from 10% → 8%"
  }));
  
  // 7. Calculate projections
  const projections = calculateProjections(allocation, profile.horizon);
  
  // 8. Normalize (ensure weights sum to 100%)
  normalizeWeights(layers);
  
  return {
    layers,
    signals: signalActions,
    taxOptimization: {
      nreDemat: "Route India via NRE (tax-free gains, repatriable)",
      w8ben: "File W-8BEN at IBKR (15% vs 30% dividend withholding)"
    },
    projectedReturns: projections
  };
}
```

**Deliverable:** ✅ `allocator.ts` with:
- ✅ Function matches `contracts.ts` signature
- ✅ Unit tests (80%+ coverage)
- ✅ All TypeScript passes
- ✅ Handles macro + signal adjustments
- ✅ Generates India-only allocation (not US/Malaysia yet)

---

**4. Integration Component**

Create file: `fortress-app/app/intelligence/page.tsx`

**Update:** Add "💎 Your Allocation" tab to existing Intelligence page

**What:** Wire together:
- InvestmentGenieForm (from Antigravity)
- 3 query functions (from Antigravity)
- allocatePortfolio (from me)

**Implementation:**

```typescript
export default function InvestmentGeniePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (userProfile: UserProfile) => {
    setProfile(userProfile);
    setLoading(true);
    try {
      // Fetch all 3 in parallel
      const [scan, macro, signals] = await Promise.all([
        queryScanResults(["NSE"]), // India-only for MVP
        queryMacroSnapshot(),
        queryIntelligence()
      ]);

      // Compute allocation
      const result = allocatePortfolio(userProfile, scan, macro, signals);
      setAllocation(result);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!allocation ? (
        <InvestmentGenieForm onSubmit={handleFormSubmit} />
      ) : (
        <AllocationResult allocation={allocation} profile={profile} />
      )}
    </div>
  );
}
```

**Deliverable:** ✅ Full integration working end-to-end

---

### **Day 3: VPS Deployment + Cron Setup**

**5. Cron Jobs (PM2 Configuration)**

Update: `ecosystem.config.js` on VPS

**Add 3 new cron jobs:**

```javascript
module.exports = {
  apps: [
    // Existing fortress-app
    {
      name: "fortress-app",
      script: "server.js",
      cwd: "/opt/fortress/.next/standalone",
      instances: 1,
    },
    // NEW: Scanner cron (2 AM IST)
    {
      name: "cron-scanner",
      script: "cron-scanner.js",
      cron_time: "0 2 * * *",
      env: { CRON_SECRET: process.env.CRON_SECRET }
    },
    // NEW: Macro cron (8 PM IST)
    {
      name: "cron-macro",
      script: "cron-macro.js",
      cron_time: "0 20 * * *",
      env: { CRON_SECRET: process.env.CRON_SECRET }
    },
    // NEW: Intelligence cron (8:30 PM IST)
    {
      name: "cron-intelligence",
      script: "cron-intelligence.js",
      cron_time: "30 20 * * *",
      env: { CRON_SECRET: process.env.CRON_SECRET }
    }
  ]
};
```

**Create 3 scripts:**

`cron-scanner.js`:
```javascript
const fetch = require('node-fetch');

async function trigger() {
  const res = await fetch('http://localhost:3000/api/scan/run', {
    method: 'POST',
    headers: { 'x-cron-secret': process.env.CRON_SECRET },
    body: JSON.stringify({ market: 'NSE' })
  });
  console.log(`[${new Date().toISOString()}] Scanner triggered:`, res.status);
}

trigger().catch(console.error);
```

Similar for `cron-macro.js` and `cron-intelligence.js`

**Deliverable:** ✅ Cron jobs deployed + tested on VPS

---

## ✅ **Checkpoints & Validation**

### **Checkpoint 1: Day 1, 6 PM IST — "System Ready for Antigravity"**

**Deliverables:**
- ✅ `contracts.ts` committed (all interfaces defined)
- ✅ Architecture doc written
- ✅ GitHub PR open for Antigravity to review
- ✅ CI/CD setup (contracts verified)

**Validation:**
- Antigravity can read `contracts.ts` and match their signatures
- No ambiguity in interface definitions

---

### **Checkpoint 2: Day 2, 12 PM IST — "Integration Works"**

**Deliverables:**
- ✅ `allocator.ts` complete + tested
- ✅ Integration component `InvestmentGeniePage` wired
- ✅ Antigravity's 3 components merged
- ✅ Full flow works: Form → Queries → Mapper → Result

**Validation:**
```bash
npm run tsc --noEmit          # Must pass
npm run test -- allocator     # Must pass
npm run test -- page          # Must pass
```

**Gate:** Test YOUR $15K allocation:
```
Input: Age 35, $15K, 20yr, India, 50% aggressive, Intermediate, Stable
Output: Portfolio shows in < 2 seconds
Validation: You approve? ✅/❌
```

If ❌, fix mapper logic (max 2 iterations by 6 PM).

---

### **Checkpoint 3: Day 3, 9 AM IST — "Production Ready"**

**Deliverables:**
- ✅ All code in `integration` branch
- ✅ All CI/CD gates pass
- ✅ Merged to `main` branch
- ✅ Deployed to VPS

**Validation:**
- Final CI/CD run
- Cron jobs verified on VPS
- Zero downtime deployment

**Gate:** Ready to launch.

---

## 🧪 **My Self-Testing Checklist**

Before merging each component:

### **contracts.ts**
```
✅ All interfaces defined
✅ No ambiguous types (no `any`)
✅ Antigravity can implement these signatures
```

### **allocatePortfolio()**
```
✅ Function accepts (UserProfile, ScanData, MacroState, Signal[])
✅ Returns Allocation object
✅ Handles edge cases (no data, empty signals)
✅ Unit tests: npm run test -- allocator (all pass)
✅ Test with sample data (your $15K scenario)
✅ Projections are realistic (not 1000% returns)
✅ TypeScript: npm run tsc --noEmit
```

### **Integration Component**
```
✅ Form renders
✅ Can submit form
✅ Queries fire in parallel
✅ Mapper receives correct data
✅ Result displays allocation
✅ Error handling works (try with invalid data)
✅ Loading state shows while fetching
✅ Mobile responsive
```

### **Cron Jobs**
```
✅ All 3 jobs in ecosystem.config.js
✅ CRON_SECRET env var set on VPS
✅ Scanner job fires at 2 AM IST (verify in logs)
✅ Macro job fires at 8 PM IST
✅ Intelligence job fires at 8:30 PM IST
✅ Jobs don't interfere with each other
```

---

## 📊 **Progress Tracking**

**Update GitHub Issue every 4 hours:**

```markdown
## Day 1 Progress (Claude Code)

### contracts.ts
- Status: ✅ COMPLETED
- What I did: Defined all 7 interfaces (UserProfile, ScanData, MacroState, Signal, Allocation, etc.)
- Tests: N/A (no tests for interfaces)
- Blockers: None

### System Architecture
- Status: ✅ COMPLETED
- What I did: Wrote INVESTMENT_GENIE_ARCHITECTURE.md
- Blockers: None

### Next Steps
- Awaiting Antigravity to review contracts.ts
- Starting allocator.ts on Day 2

---

## Day 2 Progress

### allocatePortfolio() function
- Status: ✅ COMPLETED
- Lines: 250 (core logic)
- Tests: 15 unit tests, all passing
- Coverage: 85%
- What I did: 
  - Implemented macro adjustments (VIX, gold, trends)
  - Implemented signal-driven actions
  - Built India-only allocation (not US/Malaysia yet)
  - Added tax optimization layer
- Blockers: None

### Integration Component
- Status: 🔄 IN_PROGRESS
- What I'm doing: Wiring form → queries → mapper
- Blockers: None

### Next Steps
- Complete integration by tomorrow 9 AM
- Test with your $15K allocation
```

---

## 🎯 **Success Criteria**

I'm done when:
- ✅ All code compiles (TypeScript)
- ✅ All tests pass (80%+ coverage)
- ✅ Integration works end-to-end
- ✅ Your $15K allocation passes legendary trader test
- ✅ Cron jobs deployed + verified on VPS
- ✅ Zero downtime deployment to main
- ✅ Ready to invite beta users

---

## 🆘 **Blockers I May Hit**

1. **Antigravity delays** → I still proceed with mock data, wire integration
2. **Type mismatch** → Back to Antigravity to fix their function
3. **VPS SSH issues** → Use GitHub Actions for deployment instead
4. **Cron timing wrong** → Adjust cron_time, test with manual trigger

---

**START DATE:** [TODAY]  
**DEADLINE:** Day 3, 3 PM IST  
**GITHUB:** Issues + PRs on `BratAIExplorer/Fortress`

Let's ship this. 🚀
