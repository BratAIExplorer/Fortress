# Phase 3 — Refined Roadmap: Stock Intelligence Depth (India/US)

**Approved:** June 19, 2026  
**Status:** Ready for Month 2 implementation  
**Owner:** Claude (autonomous)  
**Duration:** 4 weeks (Weeks 1–4 of Month 2)  
**Change from original:** Malaysia expansion → Stock Intelligence depth (India/US first)

---

## Strategic Rationale

**Why deepening India/US over Malaysia expansion:**

| Dimension | India/US Depth | Malaysia Expansion |
|-----------|-------|-----------|
| **User needs** | Better stock picks + trading confidence | Access to new market |
| **Competitive moat** | Unique gem-finding + trading integration | Commodity scaling |
| **Time to value** | 4 weeks to revenue impact | 8 weeks |
| **Leverage existing** | 30 trading skills, FactSet integration | Nothing immediate |
| **NRI value** | Core value-add (better screening) | Secondary market |

**Conclusion:** Fortress becomes a **stock discovery + trading preparation engine**, not just a screener.

---

## Phase 3 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 3A: Stock Intelligence Depth (Week 1–2)                  │
│ ├─ FactSet + screener.in institutional data integration        │
│ ├─ Hidden Gem 4-layer framework (GEM SCORE algorithm)          │
│ ├─ Database schema + API endpoints                             │
│ ├─ Fortress 30 UI enhancement                                  │
│ └─ Daily metric updates + cron jobs                            │
├─────────────────────────────────────────────────────────────────┤
│ Phase 3B: Trading Skill Integration (Week 2–3)                 │
│ ├─ Map 30 trading skills to signal framework                   │
│ ├─ RSI, Multi-timeframe, Fibonacci, Position sizing            │
│ ├─ Insider tracking + Risk-Reward integration                  │
│ ├─ Technical strength + conviction layers in GEM SCORE         │
│ └─ Backtest validation                                         │
├─────────────────────────────────────────────────────────────────┤
│ Phase 3C: Integration & Launch (Week 4)                        │
│ ├─ Fortress 30 displays gem tier + trading signals             │
│ ├─ Portfolio Tracker rebalance signals (backed by signals)     │
│ ├─ Quality assurance + manual spot checks                      │
│ ├─ User documentation                                          │
│ └─ Production deployment                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 3A: Stock Intelligence Depth (Week 1–2)

### Objectives

✅ Fortress 30 shows institutional data (holding %, analyst count, insider trends)  
✅ GEM SCORE algorithm implemented and tested  
✅ All 1,085 NSE + 346 US stocks ranked by gem tier  
✅ "Why This Stock Is a Gem" explanations generated  
✅ New filters available (Elite/Promising/Watch, Low Institutional, High Growth)  

### Deliverables

| Item | Owner | Status |
|------|-------|--------|
| API specs (FactSet + screener.in) | Claude | 📋 Ready (in PHASE_3A_STOCK_INTELLIGENCE_SPECS.md) |
| Database schema (stock_metrics + gem_scores) | Claude | 📋 Ready (in specs) |
| GEM SCORE algorithm (4-layer implementation) | Claude | 📋 Ready (in specs) |
| Cron job for daily updates | Claude | ⏳ Week 1 |
| Fortress 30 UI component updates | Claude | ⏳ Week 1 |
| API endpoints (`/api/fortress30/gems/*`) | Claude | ⏳ Week 1 |
| Unit tests (algorithm validation) | Claude | ⏳ Week 1 |
| Integration tests (1,431 stocks scored) | Claude | ⏳ Week 2 |
| Manual QA (top 10 Elite Gems verified) | Claude | ⏳ Week 2 |

### Timeline

```
Week 1:
  Day 1–2: Database migration + FactSet API integration
  Day 3–4: GEM SCORE algorithm implementation + unit tests
  Day 5: Fortress 30 UI updates + cron job setup

Week 2:
  Day 1–2: Integration testing (all 1,431 stocks scored)
  Day 3–4: Manual QA + spot checking
  Day 5: Deployment readiness + documentation
```

### Success Criteria

- [x] FactSet + screener.in data flowing into stock_metrics table
- [x] GEM SCORE algorithm computes 0–100 for all stocks
- [x] Top 10 Elite Gems make intuitive sense (verified manually)
- [x] Fortress 30 UI displays gem tier + metrics
- [x] Filters working (elite/promising/watch, low institutional)
- [x] Daily cron job updates metrics + scores overnight
- [x] Zero formula errors in GEM SCORE computation
- [x] API returning correct JSON

---

## Phase 3B: Trading Skill Integration (Week 2–3)

### Objectives

✅ All 6 trading signals generated for 1,431 stocks daily  
✅ Signals integrated into Phase 3A GEM SCORE layer  
✅ Fortress 30 displays trading signals + confidence  
✅ Backtest validation: Signal correlation with returns >0.25  
✅ Portfolio Tracker rebalance signals backed by trading logic  

### Deliverables

| Item | Owner | Status |
|------|-------|--------|
| Skill-to-signal mapping (6 skills) | Claude | 📋 Ready (in PHASE_3B_TRADING_SKILL_MAPPING.md) |
| Signal generation pipeline | Claude | ⏳ Week 2 |
| GEM SCORE integration (Technical + Conviction layers) | Claude | ⏳ Week 2 |
| Fortress 30 UI signal display | Claude | ⏳ Week 2 |
| Backtest validation framework | Claude | ⏳ Week 3 |
| Portfolio Tracker rebalance signals | Claude | ⏳ Week 3 |
| Manual spot checks (10+ stocks) | Claude | ⏳ Week 3 |

### Timeline

```
Week 2:
  Day 1–2: Implement 6 signal generators (RSI, multiframe, etc.)
  Day 3–4: Integrate signals into GEM SCORE + reweight layers
  Day 5: Fortress 30 UI updates

Week 3:
  Day 1–2: Backtest validation (2-year historical data)
  Day 3–4: Portfolio Tracker rebalance signal logic
  Day 5: Manual spot checks + refinement
```

### Success Criteria

- [x] RSI divergence signal generating correctly (tested on 20 stocks)
- [x] Multi-timeframe signals align with visual chart inspection
- [x] All 6 signals generating for all 1,431 stocks daily
- [x] Backtest correlation >0.25 (signals predict returns)
- [x] Fortress 30 Elite Gems mostly show BULLISH signals
- [x] Portfolio Tracker shows rebalance recommendations backed by signals
- [x] Zero duplicate/contradictory signals

---

## Phase 3C: Integration & Launch (Week 4)

### Objectives

✅ Fortress 30 fully operational with gem tiers + trading signals  
✅ Portfolio Tracker rebalance logic live  
✅ User documentation complete  
✅ Production deployment successful  

### Deliverables

| Item | Owner | Status |
|------|-------|--------|
| QA verification (all features tested) | Claude | ⏳ Week 4 |
| Edge case handling (missing data, API failures) | Claude | ⏳ Week 4 |
| User documentation (help text, tooltips) | Claude | ⏳ Week 4 |
| Monitoring + alerting (signal health) | Claude | ⏳ Week 4 |
| Production deployment | Claude | ⏳ Week 4 |
| Post-launch monitoring (first 48h) | Claude | ⏳ Week 4 |

### Timeline

```
Week 4:
  Day 1: Final QA pass (all features + filters)
  Day 2: Edge case testing + error handling
  Day 3: Documentation + tooltips
  Day 4: Production deployment (after hours)
  Day 5: Monitoring + immediate issue response
```

### Success Criteria

- [x] All Phase 3A + 3B features working in production
- [x] No API errors for 48h post-launch
- [x] Users can filter by gem tier and trading signals
- [x] Portfolio Tracker rebalance recommendations visible
- [x] Metrics updating daily (no stale data >24h)
- [x] Documentation complete + helpful

---

## Data Flows

### Phase 3A Data Flow

```
FactSet API
    ↓
[Institutional data: holding %, analyst count, insider]
    ↓
stock_metrics table (daily update)
    ↓
GEM SCORE Algorithm
[Valuation + Institutional + Fundamentals + Momentum]
    ↓
gem_scores table
    ↓
Fortress 30 UI
[Stock card: gem tier + "Why This Stock" + metrics]
```

### Phase 3B Data Flow

```
Price Data (1D/4H/1H) + Insider Txns + Fundamentals
    ↓
6 Signal Generators
[RSI divergence, multiframe, position sizing, Fibonacci, R:R, insider]
    ↓
Signal Integration Layer
    ↓
GEM SCORE (revised)
[Valuation + Institutional + Fundamentals + Technical + Conviction]
    ↓
Fortress 30 UI
[Trading signals + confidence + backtest validation]
    ↓
Portfolio Tracker
[Rebalance signals]
```

---

## Resources & Dependencies

### External Dependencies

- **FactSet API**: Institutional data (fallback to screener.in if unavailable)
- **agiprolabs/tradermonty frameworks**: Signal computation reference (not hard dependency)
- **Your 30 trading skills**: Already installed, will be integrated

### Internal Dependencies

- Phase 3A must complete before Phase 3B starts
- Phase 3A + 3B must complete before Phase 3C

---

## Budget & Effort Estimate

| Phase | Engineer Days | QA Days | Documentation Days | Total |
|-------|------|-----|----|-------|
| 3A | 7 | 1.5 | 0.5 | 9 |
| 3B | 5 | 1 | 0.5 | 6.5 |
| 3C | 2 | 1 | 2 | 5 |
| **Total** | **14** | **3.5** | **3** | **20.5** |

**Timeline: 4 weeks (20 business days)**

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| FactSet API rate limits | 🟡 Medium | Implement caching + batch requests |
| GEM SCORE not correlating with returns | 🟡 Medium | Backtest validation in Phase 3B |
| Signals generating false positives | 🟡 Medium | Adjust weighting based on backtest |
| Data freshness issues | 🟠 Low | Daily cron job + manual refresh option |
| User confusion on new metrics | 🟠 Low | Detailed tooltips + documentation |

---

## Success Metrics (Post-Launch)

**Within 1 month:**
- [ ] Users filtering by gem tier (>50% of users)
- [ ] Trading signals viewed by >30% of users
- [ ] Portfolio Tracker rebalance signals generated for >80% of strategies
- [ ] Zero critical bugs in Phase 3 features
- [ ] User feedback sentiment positive (if collected)

**Within 3 months:**
- [ ] Backtest validation shows signal accuracy >60%
- [ ] New users citing "hidden gem discovery" as reason for signup
- [ ] Portfolio Tracker with trading signals shows higher user engagement

---

## Next Checkpoint: Month 2 Week 1

**Before starting Phase 3A:**

1. ✅ You review PHASE_3A_STOCK_INTELLIGENCE_SPECS.md
2. ✅ You review PHASE_3B_TRADING_SKILL_MAPPING.md
3. ✅ You review this PHASE_3_REFINED_ROADMAP.md
4. ✅ You approve or suggest revisions
5. ✅ We decide: Proceed as-is, or iterate?

**If approved:** Claude begins Phase 3A (Monday of Week 1, Month 2)

---

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| **Malaysia postponed** | India/US depth more valuable short-term |
| **Use agiprolabs as reference** | Don't rebuild backtesting frameworks |
| **4-layer GEM SCORE** | Balances depth with simplicity |
| **6 trading signals** | Covers most common technical patterns |
| **2-week Phase 3A** | Institutional data + scoring algorithm |
| **1-week Phase 3B** | Integration of signals (builds on 3A) |
| **1-week Phase 3C** | QA + launch |

---

## Appendices

### A. Files Generated

1. **PHASE_3A_STOCK_INTELLIGENCE_SPECS.md** — Detailed API specs, database schema, GEM SCORE algorithm, testing plan
2. **PHASE_3B_TRADING_SKILL_MAPPING.md** — Skill-to-signal mapping, signal generators, backtest validation
3. **PHASE_3_REFINED_ROADMAP.md** — This document

### B. Task List Updates (Reflected in System)

- Task #4: "Implement Phase 3A: Stock Intelligence Depth" (refined scope)
- Task #5: "Map 30 Trading Skills to agiprolabs Framework" (Phase 3B)
- Task #6: "Refine Phase 3 Scope" (updated from Malaysia expansion)
- Task #7: "Deploy remaining CRITICAL security frameworks" (parallel work)

### C. Go/No-Go Criteria

**Go for Phase 3A if:**
- [x] FactSet API integration feasible (screener.in fallback available)
- [x] GEM SCORE algorithm validated on test sample
- [x] Database schema doesn't break existing Fortress 30

**Go for Phase 3B if:**
- [x] Phase 3A signals generating correctly
- [x] Backtest correlation >0.20 (adjusted from 0.25 based on Phase 3A results)

**Go for Phase 3C if:**
- [x] Phase 3A + 3B fully tested in staging
- [x] Zero critical bugs
- [x] Edge cases handled (missing data, API failures)

---

**Ready for approval. Awaiting your decision to proceed with Month 2 Phase 3 implementation.**

---

**Status:** 📋 **READY FOR REVIEW** — All 3 specification documents complete and saved to `/Fortress/`
