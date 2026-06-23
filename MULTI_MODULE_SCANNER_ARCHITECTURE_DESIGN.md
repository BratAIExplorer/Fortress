# MULTI-MODULE SCANNER ARCHITECTURE — Holistic Design & Implementation Plan
## June 24, 2026 — Pre-Execution Design Review

---

## 🎯 CONTEXT: Fortress Intelligence Product Map

### Current Fortress Components (Thirteen Layers):
```
Layer 1-3:    Investment Genie (allocation) + Fortress 30 (screening) + Portfolio Tracker
Layer 4-5:    Deep Value Scanner (current: 4 tabs, 22 stocks) + Trading Skills (30 skills)
Layer 6-8:    Security hardening + CI/CD + Database layer
Layer 9-10:   NSE/US market data pipelines + Real-time pricing
Layer 11-12:  UI/UX components + Mobile responsive design
Layer 13:     Future: Learning engine (Phase 3 feedback loop)

WHERE DOES MULTI-MODULE FIT?
└─ Enhances Layer 4 (Deep Value Scanner)
   └─ Doesn't touch other layers
   └─ Uses existing data infrastructure
   └─ Adds new scoring modules, not new data sources
```

### Strategic Questions to Answer:
1. **Does this dilute Fortress' core thesis?** Or enhance it?
2. **Can it be built without breaking existing scanner?** 
3. **What's the user experience impact?**
4. **What's the data/infrastructure impact?**
5. **Can it be rolled back if it fails?**

---

## 💭 THE 4 PRINCIPLES IN ACTION

### **Principle 1: Think Before Coding** ✓

**Problem to Solve:**
- Current scanner catches 60-70% of market opportunities
- Missing growth + infrastructure + policy-driven plays
- Users feel FOMO vs. competitors

**Solution Approach:**
- Add 3 new specialized modules (not 1 big module)
- Each module is **independent** (can be turned on/off)
- Each module has **clear thesis** (transparent to users)
- Each module has **separate scoring** (no interference with current)

**Risk Analysis:**
- **Technical Risk:** Medium (new scoring logic, but isolated)
- **User Experience Risk:** Low (new tabs, existing users unaffected)
- **Data Risk:** None (uses existing data, no new sources needed)
- **Rollback Risk:** Low (can disable any module instantly)

---

### **Principle 2: Simplicity First** ✓

**DO NOT:**
- ❌ Refactor entire scanner scoring engine
- ❌ Create machine learning models
- ❌ Add new data sources
- ❌ Change existing tab logic

**DO:**
- ✅ Copy Quality Value scoring template
- ✅ Change 3-4 parameters per new module
- ✅ Reuse existing stock database
- ✅ Keep existing tabs untouched

**Implementation:**
- New module = ~200 lines of code per module
- Total: 600 lines of new code
- No refactoring of existing 2000+ lines

---

### **Principle 3: Surgical Changes** ✓

**What Changes:**
```
fortress-app/lib/db/queries/thesis.ts
├─ ADD: getEmergingGrowthStocks() function
├─ ADD: getInfrastructureCapexStocks() function
├─ ADD: getImportSubstitutionStocks() function
└─ NO CHANGES to existing getValuePickStocks(), getHiddenGems(), getHighRisk()

fortress-app/app/api/scan/results/route.ts
├─ ADD: filter parameter for module selection
├─ ADD: moduleType query param (value|growth|capex|substitution|risk)
└─ NO CHANGES to existing response structure

fortress-app/components/DeepValueScanner.tsx
├─ ADD: Tab 6, 7, 8 (Emerging Growth, Capex, Substitution)
├─ ADD: Module selection logic
└─ NO CHANGES to Tab 1-5 logic (copy-paste structure)

fortress-app/lib/db/schema.ts
├─ NO CHANGES (reuse existing stocks table)
└─ NO NEW TABLES
```

**What Doesn't Change:**
- ✓ Database schema (no new tables)
- ✓ Existing tabs 1-5
- ✓ API response structure (backward compatible)
- ✓ Data pipeline (uses existing stock data)

---

### **Principle 4: Goal-Driven Execution** ✓

**Success Metrics (Clear & Measurable):**
```
Technical:
├─ Build time: <2 weeks for Phase 2 (Emerging Growth)
├─ Test coverage: 80%+ (unit + integration tests)
├─ Performance: API response time <500ms (same as current)
├─ Errors: Zero critical bugs in first 30 days

Product:
├─ Catch rate: ZEN, KAYNES, JUPITER score >6.5/10
├─ False positives: <10% of picks fail to deliver in 6 months
├─ User adoption: 20%+ of active users view new modules in first month
├─ FOMO reduction: User surveys show 30%+ improvement in "missing opportunities"

Competitive:
├─ Lead time: Find opportunities 2-4 weeks before competitors
├─ Coverage: 85-90% alignment with screener.in top performers
├─ Uniqueness: Competitors can't easily replicate multi-module approach
```

---

## 🏗️ ARCHITECTURAL DESIGN: How It Fits Fortress

### Current Scanner Architecture:
```
Deep Value Scanner (Layer 4)
├─ Stocks Table (120K+ stocks, NSE + US)
├─ Scan Results Table (historical results)
├─ MB Score Engine (Quality Value module)
└─ 4 Tabs + 1 module type
    ├─ Tab 1: Value Picks (17 stocks, QS 80-86)
    ├─ Tab 2: Hidden Gems (4 stocks, QS 80-89)
    ├─ Tab 3: High Risk/High Reward (1 stock, QS 32)
    ├─ Tab 4: Top Picks & MF (composite)
    └─ Module: Quality Value (established business + discount)
```

### New Multi-Module Architecture:
```
Deep Value Scanner v2 (Layer 4 Enhanced)
├─ Stocks Table (NO CHANGE)
├─ Scan Results Table (NO CHANGE)
├─ MB Score Engine (existing) + 3 New Modules
└─ 6-8 Tabs + 4 module types
    ├─ Tab 1: Value Picks (17 stocks, QS 80-86) [Module: Quality Value]
    ├─ Tab 2: Hidden Gems (4 stocks, QS 80-89) [Module: Quality Value]
    ├─ Tab 3: High Risk/High Reward (1 stock, QS 32) [Module: Distressed]
    ├─ Tab 4: Top Picks & MF (composite) [NO CHANGE]
    ├─ Tab 5: Emerging Growth (8-12 stocks, QS 65-75) [NEW Module]
    ├─ Tab 6: Infrastructure Capex (5-8 stocks, QS 65-75) [NEW Module]
    ├─ Tab 7: Import Substitution (5-8 stocks, QS 65-75) [NEW Module]
    └─ [Optional] Tab 8: Dividend Income (COAL, NTPC, etc.)

Module Definitions:
├─ Quality Value: P/E <10, stable business, established moat
├─ Emerging Growth: P/E 12-20, growth >25% YoY, margin expanding
├─ Infrastructure Capex: Railways/5G/Power/Telecom, gov capex cycle
├─ Import Substitution: EMS/Defense/Aerospace, PLI/Make in India
└─ Distressed: P/E <5, FCF negative, binary catalyst
```

### Data Flow (No New Dependencies):
```
Existing Data Sources (NO CHANGE):
├─ Yahoo Finance API (prices, historical data)
├─ NSE APIs (Indian stock data)
└─ PostgreSQL stocks table (company metadata)
                │
                ▼
        MB Score Engine (ENHANCED)
        ├─ Quality Value Scorer (existing)
        ├─ Emerging Growth Scorer [NEW]
        ├─ Capex Scorer [NEW]
        └─ Substitution Scorer [NEW]
                │
                ▼
        Deep Value Scanner UI
        ├─ 4 existing tabs (unchanged)
        ├─ 3 new tabs (new modules)
        └─ Module selector (which filter)
```

---

## 🔧 IMPLEMENTATION PLAN: Phase-by-Phase

### **PHASE 2A: Emerging Growth Module (Weeks 1-2)**

**Scope:**
- Add 1 new scoring module
- Catch: ZEN, KAYNES, JUPITER
- Effort: 2 weeks
- Risk: Low

**Deliverables:**
```
1. Code Changes (< 500 lines total):
   ├─ lib/db/queries/thesis.ts: +100 lines (getEmergingGrowthStocks)
   ├─ lib/scanners/scoring-engine.ts: +150 lines (Emerging Growth scorer)
   ├─ components/DeepValueScanner.tsx: +200 lines (Tab 5 UI)
   └─ app/api/scan/results/route.ts: +50 lines (module filter)

2. Database Queries (No schema changes):
   ├─ getEmergingGrowthStocks() filters:
   │  ├─ P/E 12-20 (range check)
   │  ├─ Growth >25% YoY (CAGR check)
   │  ├─ ROCE >15% (quality check)
   │  ├─ Margin trend: expanding (direction check)
   │  └─ Market cap: >500 Cr (liquidity check)
   └─ Score formula: (Growth% × 0.4) + (ROCE × 0.3) + (Margin× 0.2) + (P/E discount × 0.1)

3. Test Cases:
   ├─ Unit: ZEN scores 6.8/10, KAYNES 6.9/10, JUPITER 7.0/10
   ├─ Integration: API returns correct module picks
   ├─ E2E: New tab displays correctly, no UI breaks
   └─ Regression: Existing tabs 1-4 scores unchanged

4. Validation:
   ├─ Historical backtest (3 months): ZEN, KAYNES, JUPITER scored >6.5
   ├─ Performance: API response time <500ms
   ├─ Error rate: <0.1% (same as current scanner)
   └─ User feedback: 20+ users, rating 4+/5
```

**Questions for You:**
1. Should Emerging Growth tab show all matching stocks, or top 10 curated?
2. Should we include smaller cap (<500 Cr) emerging growth plays?
3. Do you want a "why it qualifies" explanation card like Value Picks tab?

---

### **PHASE 2B: Infrastructure Capex Module (Weeks 3-4)**

**Scope:**
- Add 1 new scoring module
- Catch: Railway, 5G, Power stocks
- Reuse Emerging Growth template
- Effort: 2 weeks
- Risk: Low

**Scoring Triggers:**
- Government capex announcements (railways, 5G, power grid)
- Sector exposure: Railways, Telecom Equipment, Power Distribution
- Technical: Volume breakout + 52W reversal pattern
- Catalysts: Budget announcements, tender wins, capacity additions

**Stocks to Catch:**
- JUPITER WAGONS (railways)
- HFCL (5G fiber)
- KEI INDUSTRIES (power grid)
- POLYCAB (existing, validate)
- RAILTEL (railways)

---

### **PHASE 2C: Import Substitution Module (Weeks 5-6)**

**Scope:**
- Add 1 new scoring module
- Catch: Defense, EMS, Aerospace stocks
- Reuse Emerging Growth template
- Effort: 2 weeks
- Risk: Low

**Scoring Triggers:**
- Government policy: PLI scheme, Make in India initiatives
- Sector exposure: Defense, Aerospace, EMS (electronics manufacturing)
- Growth: Revenue >30%, exports increasing
- Quality: ROCE >15%, debt manageable

**Stocks to Catch:**
- ZEN TECHNOLOGIES (defense)
- KAYNES TECHNOLOGY (EMS + aerospace)
- PTC INDUSTRIES (aerospace & defense)
- (Others to be discovered in backtest)

---

## 🛡️ SAFEGUARDS: Ensuring Nothing Breaks

### Risk Assessment Matrix:

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **New module breaks existing tabs** | Low | High | Feature flagging: moduleType param, default to existing |
| **API response time increases** | Medium | Medium | Cache new module results, separate API calls |
| **Scoring logic errors** | Medium | Medium | Comprehensive unit tests, backtest on 3 months history |
| **False positives (bad picks)** | Medium | Low | Monitor 6 months, measure false positive %, adjust weights |
| **Database performance** | Low | Medium | No schema changes, reuse existing indexes |
| **User confusion (too many tabs)** | High | Low | Clear tab descriptions, module explanations |

### Rollback Strategy:

**If anything goes wrong:**
```
Instant Rollback (5 minutes):
├─ Disable new modules via feature flag (ENV variable)
├─ Existing tabs 1-4 continue working
├─ No data loss
└─ Users see only Value Picks + Hidden Gems + High Risk

Partial Rollback (if one module fails):
├─ Disable only failing module (e.g., Capex)
├─ Keep other new modules (Emerging Growth, Substitution)
└─ Takes 1 minute to deploy

Full Rollback (if system breaks):
├─ Revert to last stable commit (before multi-module changes)
├─ Takes 5 minutes
└─ Zero data loss
```

---

## 📊 VALIDATION PLAN: Before Launch

### Step 1: Unit Testing (Days 1-3)
```
Test each new module independently:
├─ Test Emerging Growth scorer
│  ├─ ZEN: P/E 18, growth 32%, ROCE 18% → expect 6.8-7.0/10
│  ├─ KAYNES: P/E 17, growth 35%, ROCE 20% → expect 6.9-7.1/10
│  └─ Edge cases: P/E 11 (too low), growth 20% (too low)
│
├─ Test Capex scorer
│  ├─ JUPITER: Railway play, gov policy, breakout → expect 6.5-7.0/10
│  └─ Edge cases: No capex announcement, no breakout
│
└─ Test Substitution scorer
   ├─ ZEN: Defense, Make in India, growth → expect 7.2-7.5/10
   └─ Edge cases: No policy support, declining revenue
```

### Step 2: Integration Testing (Days 4-5)
```
Test modules together:
├─ Can users toggle between tabs without errors?
├─ Do API responses include all modules correctly?
├─ Does filtering by module type work?
├─ Are scores independent (changing Value Picks doesn't affect Emerging Growth)?
└─ Performance: All tabs load <500ms
```

### Step 3: Regression Testing (Days 6-7)
```
Ensure existing functionality unchanged:
├─ Value Picks tab: Same 17 stocks, same QS scores
├─ Hidden Gems tab: Same 4 stocks, same QS scores
├─ High Risk tab: IDEA still shows, QS 32
├─ Top Picks tab: Composite still works
└─ API backward compatibility: Existing integrations unaffected
```

### Step 4: End-to-End Testing (Days 8-10)
```
Real user scenarios:
├─ User visits scanner, sees all 6-7 tabs
├─ User clicks Emerging Growth tab → ZEN, KAYNES, JUPITER appear
├─ User clicks Infrastructure Capex → Railway stocks appear
├─ User clicks back to Value Picks → Still shows correct stocks
├─ User on mobile: UI responsive, all tabs accessible
└─ Performance: No lag, no timeouts
```

### Step 5: Historical Backtest (Days 11-14)
```
Run on past 3 months of data:
├─ Did Emerging Growth module catch ZEN breakout (March)?
├─ Did Capex module catch JUPITER rally (April-May)?
├─ Did Substitution module find KAYNES early (early June)?
├─ False positives: How many picks didn't work out?
└─ Lead time: Weeks ahead of when external lists found them
```

---

## 📋 DOCUMENTATION PLAN

Before Launch:
```
1. Code Comments (inline, explaining each module's logic)
2. API Documentation (new endpoints, module types, scoring formulas)
3. User Guide (how to navigate new tabs, what each module means)
4. Deployment Guide (how to enable/disable modules)
5. Runbook (if something breaks, how to fix it)
6. Performance Baseline (response times, load testing results)
```

---

## ⚡ DEPLOYMENT STRATEGY

### Local Development:
```
Week 1-2: Build Emerging Growth on feature branch
├─ Code → Test → Push to git-develop
├─ Code review (verify logic, no syntax errors)
└─ Merge to develop when all tests pass
```

### Staging:
```
Week 3: Deploy to staging VPS
├─ Run full test suite
├─ 10 beta users test new tabs
├─ Measure performance, errors, FOMO reduction
└─ Iterate on feedback
```

### Production:
```
Week 4: Deploy to production with feature flag OFF
├─ New code is live but disabled
├─ Run sanity checks (no errors, API healthy)
├─ Enable for 10% of users (canary deploy)
├─ Monitor for 2 days
├─ Rollout to 50% of users
├─ Rollout to 100% of users
└─ Keep feature flag for instant rollback
```

---

## 🎯 SUCCESS CRITERIA

**Must Have (Blocking):**
- ✓ All existing tabs work unchanged
- ✓ New modules catch ZEN, KAYNES, JUPITER
- ✓ Zero critical bugs in first 7 days
- ✓ API response time <500ms
- ✓ 80%+ test coverage

**Should Have (Nice to Have):**
- ✓ 20%+ user adoption of new tabs in first month
- ✓ 30%+ improvement in "missing opportunities" feedback
- ✓ 2-4 week lead vs. competitors on macro plays
- ✓ False positive rate <10%

**Nice to Have (Bonus):**
- ✓ Module selection UI (let users customize which modules to see)
- ✓ Performance optimization (sub-300ms response times)
- ✓ ML-based threshold tuning (auto-adjust QS scores based on performance)

---

## ❓ CRITICAL QUESTIONS FOR YOU

**Before I Proceed, Please Answer:**

1. **Scope Confirmation:**
   - Should all 3 new modules launch in Phase 2, or one at a time?
   - Answer: _______________

2. **User Experience:**
   - Should new tabs show ALL matching stocks or top 10 curated?
   - Answer: _______________

3. **Marketing/Communication:**
   - How do we announce multi-module to existing users?
   - Email? In-app? Blog post? All?
   - Answer: _______________

4. **Rollback Tolerance:**
   - If we discover module is catching bad stocks, how fast rollback?
   - Same day? End of week? Let it run and see?
   - Answer: _______________

5. **Resource Allocation:**
   - Should I build all 3 modules, or focus on Emerging Growth first?
   - Full build (3 modules) or Phased (1 at a time)?
   - Answer: _______________

6. **Risk Tolerance:**
   - Is it OK to deploy to production with feature flag OFF initially?
   - (Safe approach, but adds complexity)
   - Or deploy with flag ON and monitor?
   - Answer: _______________

7. **Metrics/Reporting:**
   - Do you want weekly metrics emails during rollout?
   - (Catch rate, false positives, user adoption, performance)
   - Answer: _______________

---

## 📌 SUMMARY: What I'm Asking Sign-Off For

### Design Decisions:
✓ Multi-module architecture (don't refactor, add 3 new modules)
✓ No database schema changes (reuse existing stocks table)
✓ No new data sources (use existing APIs)
✓ Feature-flag deployment (instant rollback capability)
✓ Quarterly benchmarking loop (continuous improvement)

### Implementation Timeline:
✓ Phase 2A: Emerging Growth (2 weeks)
✓ Phase 2B: Infrastructure Capex (2 weeks)
✓ Phase 2C: Import Substitution (2 weeks)
✓ Total: 6 weeks from start to full rollout

### Testing & Safeguards:
✓ 80%+ test coverage (unit + integration + E2E)
✓ Regression tests (ensure existing tabs unchanged)
✓ Historical backtest (validate on past 3 months)
✓ Canary deployment (10% → 50% → 100%)
✓ Instant rollback (feature flag disables new modules)

### Success = Everyone Wins:
✓ Users: Find opportunities 2-4 weeks before competitors
✓ Fortress: 85-90% market coverage, less FOMO complaints
✓ Competition: Hard to replicate multi-module approach
✓ Maintenance: Quarterly enhancements, sustainable pace

---

**Is this approach sound? Any concerns, questions, or modifications before I proceed?**

