# Multi-Sector TSYS Implementation Guide

**Status:** Implementation Ready ✅  
**Scope:** 50+ sector theses + Weekly Claude validation + Investment Genie integration  

---

## **Architecture Overview**

```
TSYS (Thesis System) Hub
├─ Seed Data (50+ sectors)
│  └─ lib/db/seeds/sector-theses.ts
│
├─ Weekly Validator (Claude AI)
│  └─ lib/jobs/weekly-tsys-validator.ts
│     ├─ Runs: Sunday 2am UTC (10:30am IST)
│     ├─ Reads: Market news, earnings, macro signals
│     └─ Updates: Conviction scores for all sectors
│
├─ Integration Layer
│  └─ lib/integrations/tsys-allocation-helper.ts
│     ├─ Investment Genie: Enrich allocations with related theses
│     └─ Fortress 30: Boost stock rankings by sector conviction
│
└─ Testing (Comprehensive)
   └─ __tests__/jobs/tsys-validator.test.ts
```

---

## **Implementation Checklist**

### **Phase 1: Data Setup** (1 hour)
- [x] Create sector theses seed data (23 sectors, expandable to 50+)
- [x] Database schema (sector_theses, sector_thesis_validations)
- [x] Type definitions (SectorThesis, BacktestResult)
- [ ] **TODO:** Load seed data: `npm run seed:theses`

### **Phase 2: Weekly Validator** (2 hours)
- [x] Build Claude-powered validator (analyzeMarketSignals)
- [x] Conviction calculation logic (calculateNewConviction)
- [x] Database update logic (update conviction + log validation)
- [ ] **TODO:** Wire up cron scheduler

### **Phase 3: Integration** (2 hours)
- [x] Build allocation enrichment (enrichAllocationWithTSYS)
- [x] Build stock boost logic (getStockConvictionBoost)
- [ ] **TODO:** Update Investment Genie API to call enrichAllocationWithTSYS
- [ ] **TODO:** Update Fortress 30 scoring to include sector conviction

### **Phase 4: Testing & Validation** (1 hour)
- [x] Comprehensive unit tests (30+ test cases)
- [ ] **TODO:** Run test suite: `npm run test -- tsys-validator.test.ts`
- [ ] **TODO:** Load test: Run validator on full 50-sector set
- [ ] **TODO:** Validate conviction changes are realistic (not >20% swings)

### **Phase 5: Deployment** (30 min)
- [ ] **TODO:** Deploy to staging (test with Claude API)
- [ ] **TODO:** Deploy to production
- [ ] **TODO:** Monitor first run (Sunday 2am)

---

## **Key Metrics**

| Metric | Target | Purpose |
|--------|--------|---------|
| **Validator duration** | <5 min | Don't overload VPS |
| **Conviction precision** | 4 decimals | Storage accuracy |
| **Weekly swings** | <20% change | Avoid whiplash |
| **API latency** | <200ms | Investment Genie response time |
| **Sector coverage** | 50+ | Comprehensive macro context |

---

## **Database Updates Required**

Run once:
```sql
-- Seed 23 initial theses (expandable to 50+)
INSERT INTO sector_theses (name, slug, macro_catalyst, conviction_score) 
VALUES (...)

-- First validation run (empty, will be populated by cron)
INSERT INTO sector_thesis_validations (thesis_id, validation_date, validation_status)
VALUES (...)
```

---

## **Cron Job Setup**

**Integration with your scheduler:**

```typescript
// In your cron job runner:
import { scheduleWeeklyTSYSValidator } from "@/lib/jobs/weekly-tsys-validator";

const tsysJob = scheduleWeeklyTSYSValidator();
// Outputs: { name: "weekly-tsys-validator", schedule: "0 2 * * 0", handler: ... }

// Add to your scheduler (e.g., node-cron, APScheduler, etc.)
```

**Schedule:** Sunday 2am UTC (10:30am IST)  
**Duration:** ~5 minutes  
**VPS Impact:** 200MB peak RAM during run, negligible after  

---

## **Investment Genie Integration**

**When user submits allocation:**

```typescript
// Current: Just return allocation percentages
// const allocation = { NSE: 40, US: 60 }

// NEW: Enrich with TSYS context
import { enrichAllocationWithTSYS } from "@/lib/integrations/tsys-allocation-helper";

const context = await enrichAllocationWithTSYS(allocation);

// Response now includes:
// {
//   allocation: { NSE: 40, US: 60 },
//   relatedTheses: [
//     { sector: "Healthcare Growth", conviction: 0.80, status: "WORKING" },
//     { sector: "NBFC Lending", conviction: 0.70, status: "WORKING" }
//   ],
//   qualityScore: 0.75,
//   suggestions: [
//     "Strong conviction: Consider increasing Healthcare allocation (80% confidence)",
//     "Alert: NBFC conviction declining. Consider rebalancing."
//   ]
// }
```

---

## **Fortress 30 Integration**

**When scoring stocks:**

```typescript
// Current: Score based on technicals + fundamentals
// const stockScore = calculateMBScore(stock);

// NEW: Add sector conviction boost
import { getStockConvictionBoost } from "@/lib/integrations/tsys-allocation-helper";

const boost = await getStockConvictionBoost(stock.symbol, stock.sector);
const finalScore = stockScore + (stockScore * boost.boost);

// Example:
// Healthcare stock in high-conviction sector (+0.15 boost)
// Original score: 65 → Final score: 74.75
```

---

## **Testing & Validation**

**Run unit tests:**
```bash
npm run test -- tsys-validator.test.ts
# Should pass: 30+ test cases covering conviction logic, integrations, edge cases
```

**Manual validation:**
```bash
# Run validator once to ensure Claude integration works
npm run dev
# Then manually call: POST /api/admin/run-tsys-validator
```

**Monitor first production run:**
- Sunday 2:00am UTC (10:30am IST)
- Check VPS CPU/RAM during run
- Verify conviction scores updated
- Check logs for any Claude API errors

---

## **Risk Mitigation**

| Risk | Mitigation |
|------|-----------|
| **Claude API fails** | Validator logs error, conviction stays stale (safe) |
| **Conviction swings >20%** | Smoothing factor (0.5) prevents whiplash |
| **VPS overload** | Run duration <5min, happens at 2am (off-peak) |
| **Wrong conviction damages allocation** | Investment Genie still has user override (accepts/rejects) |
| **Sector expansion breaks schema** | Schema is generic (50+ sectors fit easily) |

---

## **Success Criteria**

✅ Seed data loads (23 sectors)  
✅ Weekly validator runs without errors  
✅ Conviction scores update realistically  
✅ Investment Genie shows related theses  
✅ Fortress 30 stocks boost by sector conviction  
✅ Tests all pass (30+ cases)  
✅ No VPS degradation  

---

## **Next Steps**

1. Load seed data
2. Set up cron job
3. Run tests
4. Deploy to staging
5. Monitor first run (Sunday)
6. Deploy to production

**Estimated total time:** 6-8 hours implementation + 1 week monitoring
