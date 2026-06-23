# PHASE 2 SPRINT EXECUTION PLAN — Multi-Module Scanner
## June 24, 2026 — Implementation Begins NOW

---

## 🎯 YOUR DECISIONS (Confirmed)

✅ **SCOPE:** Launch all 3 modules (Emerging Growth + Capex + Substitution) in Phase 2  
✅ **ROLLBACK:** End of week (if issues, we fix by Friday close)  
✅ **RESOURCE:** Build all 3 modules now (not phased)  
✅ **TEAMS:** Build all in parallel (3 parallel tracks)  

❓ **USER EXPERIENCE:** Top 10 curated vs. ALL? → **MY RECOMMENDATION: Top 10 Curated**
❓ **DEPLOYMENT:** Feature flag OFF vs. ON? → **MY RECOMMENDATION: Feature Flag OFF**
❓ **METRICS:** Weekly emails? → **MY RECOMMENDATION: Yes, weekly emails**

---

## 💡 MY RECOMMENDATIONS (With 4 Principles)

### **RECOMMENDATION 1: Show Top 10 Curated Stocks Per Module**

**Why Top 10, not ALL:**
```
Principle 1 (Think Before Coding):
  └─ Curated = thoughtful filtering, not algorithmic dump
  └─ Implies confidence in recommendations

Principle 2 (Simplicity First):
  └─ Top 10 is digestible (not 50 stocks)
  └─ Users can make decisions without analysis paralysis
  └─ Easier to understand why these 10 (vs. why not the other 40)

Principle 3 (Surgical Changes):
  └─ Easy to add "View all" toggle later (MVP doesn't need it)
  └─ Start simple, expand based on user demand

Principle 4 (Goal-Driven):
  └─ Goal: "Help users find BEST opportunities"
  └─ Not: "Show users EVERY opportunity"
  └─ Quality > Quantity
```

**Implementation:**
```
Each module shows:
  ├─ Top 10 stocks by QS score (highest first)
  ├─ "View all X stocks" link (for power users)
  └─ Ranking number (1-10, so users know they're in top tier)
```

**Impact:**
- Users get high-conviction recommendations (not drowned in 50 options)
- Competitive vs. screener.in (they show 50+ mediocre picks, we show 10 strong picks)
- Easy to expand to 20-30 later if data shows demand

---

### **RECOMMENDATION 2: Deploy with Feature Flag OFF (Safer)**

**Why OFF, not ON:**
```
Principle 1 (Think Before Coding):
  └─ Think failure first: "What if something breaks?"
  └─ Flag OFF = ready to disable instantly if issues
  └─ Flag ON = have to patch code if issues

Principle 2 (Simplicity First):
  └─ Feature flag is 1 ENV variable (dead simple)
  └─ Adds negligible complexity
  └─ Used by every major tech company (battle-tested pattern)

Principle 3 (Surgical Changes):
  └─ No code changes needed to disable
  └─ No redeployment needed
  └─ Toggle via ENV var only

Principle 4 (Goal-Driven):
  └─ Goal: "Ship safely"
  └─ Enable gradually (10% → 50% → 100% canary deploy)
  └─ Measure before scaling
```

**Implementation:**
```
Deployment Sequence:
  1. Deploy code with FORTRESS_MULTI_MODULE_ENABLED=false
     └─ New code is live but modules don't show
     └─ No impact on existing tabs
     └─ Can run full sanity checks

  2. Set ENV var: FORTRESS_MULTI_MODULE_ENABLED=true (10% of users)
     └─ Use Nginx canary routing (10% traffic to new flag)
     └─ Monitor for 48 hours

  3. Scale to 50%
     └─ Monitor for 24 hours

  4. Scale to 100%
     └─ Full rollout complete

  Rollback (if needed):
     └─ FORTRESS_MULTI_MODULE_ENABLED=false
     └─ Takes 2 minutes
     └─ No code changes, no redeployment
```

**Impact:**
- Safe, measured rollout (not "ship and pray")
- Instant rollback if issues detected
- User experience unchanged until we flip flag ON

---

### **RECOMMENDATION 3: Weekly Metrics Emails During 6-Week Rollout**

**Why weekly:**
```
Principle 1 (Think Before Coding):
  └─ Track what you're building
  └─ Make data-driven adjustments mid-sprint

Principle 2 (Simplicity First):
  └─ Weekly = 1 email/week (not daily noise)
  └─ Takes 15 min to compile + send
  └─ Simple template: 5 KPIs + notes

Principle 3 (Surgical Changes):
  └─ Minimal overhead (automated query → email)
  └─ Can skip weeks if sprint is stable

Principle 4 (Goal-Driven):
  └─ Goal: "Ship with confidence"
  └─ Measure against success criteria continuously
  └─ Catch issues early (before end of week rollback deadline)
```

**Metrics to Track:**
```
Weekly Email (Every Friday):

Technical Metrics:
  ├─ API Response Time (target: <500ms)
  ├─ Error Rate (target: <0.1%)
  ├─ Test Coverage (target: 80%+)
  └─ Build Time (target: <5 min)

Product Metrics:
  ├─ Catch Rate: % of ZEN/KAYNES/JUPITER/etc. caught >6.5 QS
  ├─ False Positives: % of picks that didn't deliver
  ├─ User Adoption: % of active users viewing new modules
  └─ FOMO Reduction: Survey feedback on "missing opportunities"

Deployment Metrics:
  ├─ Canary Rollout: % of users on new modules (10%→50%→100%)
  ├─ Issues Found: # of bugs, severity level
  └─ Rollback Count: # of times we toggled flag OFF
```

---

## 🚀 EXECUTION TIMELINE: 6 Weeks to Production

### **WEEK 1: Emerging Growth Module**

**Principle 1 (Think Before Coding):**
- Design scoring logic first (P/E 12-20, growth 25%+, ROCE >15%)
- Backtest on past 3 months data (verify ZEN/KAYNES/JUPITER caught)
- Document why this scoring catches these stocks

**Principle 2 (Simplicity First):**
- Copy Quality Value scorer template
- Change 4 parameters (P/E min/max, growth %, ROCE %)
- Reuse existing database queries (no new tables)

**Principle 3 (Surgical Changes):**
- New file: `lib/scanners/emerging-growth-scorer.ts` (150 lines)
- New function: `getEmergingGrowthStocks()` in queries (100 lines)
- New component: Tab 5 UI (copy existing tab structure, 200 lines)
- Total: ~450 lines of new code, zero refactoring

**Principle 4 (Goal-Driven):**
- Success = ZEN, KAYNES, JUPITER score 6.8-7.2/10 ✓
- Success = API <500ms response time ✓
- Success = 80%+ unit test coverage ✓

**Daily Breakdown:**
```
Day 1-2: Design + Backtest
  ├─ Define scoring thresholds
  ├─ Backtest on past 3 months
  ├─ Verify ZEN/KAYNES/JUPITER caught
  └─ Document logic

Day 3-4: Code Implementation
  ├─ Write emerging-growth-scorer.ts
  ├─ Write getEmergingGrowthStocks() query
  ├─ Write Tab 5 UI component
  └─ Wire API endpoint

Day 5: Testing
  ├─ Unit tests (verify scores correct)
  ├─ Integration tests (API returns correct results)
  ├─ E2E tests (UI displays, no breaks)
  └─ Regression tests (existing tabs unchanged)

Day 6-7: Review + Merge
  ├─ Code review (logic, performance, style)
  ├─ Fix feedback
  ├─ Merge to develop branch
  └─ Ready for staging
```

**Deliverable:** Emerging Growth module complete, tested, ready for staging

---

### **WEEK 2: Infrastructure Capex Module (Parallel Track)**

**Same 4-Principle Structure:**
1. Design scoring for railways/5G/power (gov capex cycle trigger)
2. Backtest on JUPITER, HFCL, KEI, RAILTEL
3. Code 450 lines (copy Emerging Growth template)
4. Test 80%+ coverage

**Stocks to Catch:**
- JUPITER WAGONS (railways capex)
- HFCL (5G fiber rollout)
- KEI INDUSTRIES (power grid)
- RAILTEL (railways infrastructure)

**Deliverable:** Infrastructure Capex module complete, tested, ready for staging

---

### **WEEK 3: Import Substitution Module (Parallel Track)**

**Same 4-Principle Structure:**
1. Design scoring for defense/EMS/aerospace (Make in India tailwind)
2. Backtest on ZEN, KAYNES, PTC
3. Code 450 lines (copy Emerging Growth template)
4. Test 80%+ coverage

**Stocks to Catch:**
- ZEN TECHNOLOGIES (defense)
- KAYNES TECHNOLOGY (EMS + aerospace)
- PTC INDUSTRIES (aerospace & defense)

**Deliverable:** Import Substitution module complete, tested, ready for staging

---

### **WEEK 4: Integration + Staging Deployment**

**All 3 Modules Combined:**
- Merge all 3 branches into `develop`
- Full integration testing (modules work together)
- Deploy to staging environment
- Run complete E2E tests (all tabs, all modules)
- 10 beta users test for 48 hours
- Collect feedback

**Principle 1 (Think Before Coding):**
- Think about failure modes: What could break when 3 modules are live?
- Identify edge cases (overlapping stocks, scoring conflicts)

**Principle 2 (Simplicity First):**
- One integrated staging environment (not 3 separate)
- Simple user flow: click tab → see stocks

**Principle 3 (Surgical Changes):**
- Zero changes to core Fortress infrastructure
- All changes isolated to scanner module

**Principle 4 (Goal-Driven):**
- Success = all 3 modules work together without errors ✓
- Success = 20+ users test without critical issues ✓

**Deliverable:** All 3 modules staging-ready, user feedback collected

---

### **WEEK 5: Feature Flag Deployment to Production**

**Friday Release:**
- Deploy code with `FORTRESS_MULTI_MODULE_ENABLED=false`
- New code is live but hidden (modules don't show)
- Run sanity checks (no impact on existing tabs)
- Verify database connections, APIs, performance

**Principle 1 (Think Before Coding):**
- Think safety first: Flag OFF = no user impact

**Principle 2 (Simplicity First):**
- One flag toggle, no code changes needed

**Principle 3 (Surgical Changes):**
- Deploy once, flag can change 100x without redeployment

**Principle 4 (Goal-Driven):**
- Goal = ship safely ✓

**Deliverable:** 3 modules live in production, hidden behind feature flag

---

### **WEEK 6: Canary Rollout**

**Day 1-2: 10% Canary**
- Enable `FORTRESS_MULTI_MODULE_ENABLED=true` for 10% of users
- Monitor: errors, API response time, user adoption
- Collect feedback
- Weekly metrics email sent (Friday)

**Day 3-4: 50% Canary**
- If 10% is stable, roll to 50%
- Monitor for 24 hours
- Metrics email (Friday)

**Day 5-7: 100% Rollout**
- If 50% is stable, roll to 100%
- Full production deployment
- Final metrics email (Friday)

**Principle 1 (Think Before Coding):**
- Each canary level = measured risk

**Principle 2 (Simplicity First):**
- Simple % cutoff (10% → 50% → 100%)

**Principle 3 (Surgical Changes):**
- Nginx routing + ENV var = all the complexity needed

**Principle 4 (Goal-Driven):**
- Goal = 85-90% market coverage by end of week ✓

**Deliverable:** Multi-module scanner live for all users

---

## 🛡️ SAFETY RAILS (If Issues Detected)

### **Instant Rollback (2 minutes)**
```
If critical issue found during canary:
  1. Slack alert: "Critical issue detected, rolling back"
  2. Set FORTRESS_MULTI_MODULE_ENABLED=false
  3. Test that modules are hidden
  4. Verify existing tabs work
  5. Announce to team + users
```

### **End-of-Week Rollback (If Not Complete)**
```
If rollout not complete by Friday:
  ├─ Assess blockers
  ├─ Either: Fix + continue rollout
  └─ Or: Disable flag, debug over weekend
  └─ Resume following Monday
```

---

## 📊 TESTING MATRIX (80%+ Coverage)

### **Unit Tests (Day 5, Week 1-3)**
```
For each module (Emerging Growth, Capex, Substitution):
  ├─ Test scoring formula (unit test)
  ├─ Test boundary conditions (P/E at min/max, growth at threshold)
  ├─ Test edge cases (negative revenue, missing data)
  └─ Expected coverage: 90%+
```

### **Integration Tests (Day 6, Week 4)**
```
Test 3 modules together:
  ├─ API endpoint returns correct module type
  ├─ Filtering by module works correctly
  ├─ Scores are independent (changing one doesn't affect others)
  └─ Expected coverage: 85%+
```

### **E2E Tests (Day 7, Week 4)**
```
Real user scenarios:
  ├─ User clicks Emerging Growth tab → sees ZEN, KAYNES, JUPITER
  ├─ User clicks Capex tab → sees JUPITER, HFCL, KEI
  ├─ User clicks Substitution tab → sees ZEN, KAYNES, PTC
  ├─ All tabs load without errors
  └─ Mobile responsive, no layout breaks
```

### **Regression Tests (Day 7, Week 4)**
```
Existing tabs unchanged:
  ├─ Value Picks: Same 17 stocks, same QS scores
  ├─ Hidden Gems: Same 4 stocks, same QS scores
  ├─ High Risk: IDEA still shows, QS 32
  └─ Performance: API still <500ms
```

### **Backtest (Day 2-3, Week 1-3)**
```
For each module, backtest on past 3 months:
  ├─ Did Emerging Growth catch ZEN breakout (early June)?
  ├─ Did Capex catch JUPITER rally (May)?
  ├─ Did Substitution find KAYNES early (April)?
  └─ If yes = scoring logic is sound, proceed
  └─ If no = adjust thresholds, re-backtest
```

---

## 📋 WEEKLY METRICS EMAIL TEMPLATE

**Subject:** `[Fortress Scanner] Week X Metrics - Phase 2 Rollout`

```
Technical Metrics:
  ├─ API Response Time: 342ms (target: <500ms) ✓
  ├─ Error Rate: 0.02% (target: <0.1%) ✓
  ├─ Test Coverage: 84% (target: 80%+) ✓
  └─ Build Time: 4min 12sec (target: <5min) ✓

Product Metrics:
  ├─ Catch Rate: 100% (ZEN, KAYNES, JUPITER all >6.5 QS) ✓
  ├─ False Positives: 0% (all picks performing well)
  ├─ User Adoption: 15% of active users viewing new modules
  └─ FOMO Reduction: +25% (user surveys)

Deployment Status:
  ├─ Rollout: 10% → 50% [current] → 100% [planned Friday]
  ├─ Issues Found: 0 critical, 2 minor (fixed)
  └─ Rollback Count: 0

Next Week Plan:
  ├─ Continue canary rollout
  ├─ Monitor performance metrics
  └─ Launch Infrastructure Capex module
```

---

## ✅ SUMMARY: Starting NOW

**Week 1-3:** Build all 3 modules in parallel
**Week 4:** Integration + staging
**Week 5:** Production deployment (flag OFF)
**Week 6:** Canary rollout (10% → 50% → 100%)

**By End of Week 6:**
- 6-8 scanner tabs live
- 85-90% market coverage
- 2-4 week lead vs. competitors
- ZEN, KAYNES, JUPITER caught
- 0 existing functionality broken

**4 Principles Throughout:**
- ✓ Think Before Coding (backtest first)
- ✓ Simplicity First (copy templates, not refactor)
- ✓ Surgical Changes (450 lines per module, isolated)
- ✓ Goal-Driven Execution (clear success criteria)

---

**STATUS: EXECUTION BEGINS MONDAY (June 26, 2026)**

Ready? 🚀

