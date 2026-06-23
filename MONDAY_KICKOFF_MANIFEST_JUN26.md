# MONDAY KICKOFF MANIFEST
## June 26, 2026 — 9:00 AM — EXECUTION START

---

## 🎬 EXECUTION BEGINS NOW

**Status:** All branches created, templates ready, 4 principles embedded.

**Starting:** Monday, June 26, 2026 at 9:00 AM

**Duration:** 6 weeks to full production rollout (July 24, 2026)

---

## 📋 BEFORE 9 AM (Preparation)

### Pre-Kickoff Checklist (15 minutes)
- [ ] Pull latest master: `git pull origin master`
- [ ] Verify 3 branches exist:
  - [ ] `emerging-growth`
  - [ ] `infrastructure-capex`
  - [ ] `import-substitution`
- [ ] Verify template files created:
  - [ ] `fortress-app/lib/scanners/emerging-growth-scorer.ts`
  - [ ] `fortress-app/lib/scanners/infrastructure-capex-scorer.ts`
  - [ ] `fortress-app/lib/scanners/import-substitution-scorer.ts`
- [ ] Review PHASE_2_WEEK_1_DETAILED_BREAKDOWN.md (10 min read)
- [ ] Slack channel #phase-2-emerging-growth created
- [ ] Database access confirmed
- [ ] Git write permissions confirmed

### Team Assignments (Confirm)
- [ ] Track 1 Lead (Emerging Growth): _______________
- [ ] Track 2 Lead (Capex): _______________
- [ ] Track 3 Lead (Substitution): _______________
- [ ] QA/Testing Lead: _______________
- [ ] DevOps/Deployment Lead: _______________

---

## 🚀 9 AM KICKOFF

### Track 1: Emerging Growth Module

**Responsible:** [Track 1 Lead]

**Day 1 Objectives (Jun 26):**
```
☐ Switch to branch: git checkout emerging-growth
☐ Review scoring thresholds in PHASE_2_WEEK_1_DETAILED_BREAKDOWN.md
☐ Document scoring formula in code comments:
   - Growth rate (0-30 pts)
   - Quality/ROCE (0-25 pts)
   - Valuation/P/E (0-25 pts)
   - Margin trend (0-20 pts)
☐ Set up backtest data extraction
☐ Validate ZEN, KAYNES, JUPITER meet criteria
☐ Post Day 1 summary in Slack #phase-2-emerging-growth
```

**Template File:** `fortress-app/lib/scanners/emerging-growth-scorer.ts`
- [ ] File exists and readable
- [ ] TODO comments clear
- [ ] Backtest expectations documented

**Success = By EOD Friday (Jun 30):**
- ZEN caught at 6.8-7.0 QS ✓
- KAYNES caught at 6.9-7.1 QS ✓
- JUPITER caught at 7.0-7.2 QS ✓
- 90%+ test coverage ✓
- Code reviewed + merged ✓

---

### Track 2: Infrastructure Capex Module

**Responsible:** [Track 2 Lead]

**Day 1 Objectives (Jun 26):**
```
☐ Switch to branch: git checkout infrastructure-capex
☐ Identify capex trigger signals:
   - Railway modernization budget
   - 5G rollout announcements
   - Power grid upgrade cycles
☐ Define capex cycle indicators
☐ Backtest on JUPITER, HFCL, KEI, RAILTEL
☐ Post Day 1 summary in Slack
```

**Template File:** `fortress-app/lib/scanners/infrastructure-capex-scorer.ts`
- [ ] File exists and readable
- [ ] TODO comments clear
- [ ] Capex sectors documented

**Success = By EOD Friday (Jul 7):**
- JUPITER caught at 6.5-7.0 QS ✓
- HFCL caught at 6.5-7.0 QS ✓
- KEI caught at 6.5-7.0 QS ✓
- RAILTEL caught at 6.8-7.2 QS ✓
- 90%+ test coverage ✓

---

### Track 3: Import Substitution Module

**Responsible:** [Track 3 Lead]

**Day 1 Objectives (Jun 26):**
```
☐ Switch to branch: git checkout import-substitution
☐ Research PLI scheme eligibility:
   - Defense manufacturing
   - Electronics manufacturing (EMS)
   - Aerospace components
☐ Define Make in India benefit indicators
☐ Backtest on ZEN, KAYNES, PTC
☐ Post Day 1 summary in Slack
```

**Template File:** `fortress-app/lib/scanners/import-substitution-scorer.ts`
- [ ] File exists and readable
- [ ] TODO comments clear
- [ ] Policy triggers documented

**Success = By EOD Friday (Jul 14):**
- ZEN caught at 7.2-7.5 QS ✓
- KAYNES caught at 7.2-7.5 QS ✓
- PTC caught at 6.8-7.2 QS ✓
- 90%+ test coverage ✓

---

## 📞 COMMUNICATION PROTOCOL

### Daily Standup: 4 PM (15 minutes)
- **Track 1 Lead:** 5 min status (Day 1: design/backtest progress)
- **Track 2 Lead:** 5 min status
- **Track 3 Lead:** 5 min status
- **Blockers?** Escalate immediately

### Weekly Metrics: Friday 5 PM
- Technical metrics (API response time, test coverage, error rate)
- Product metrics (catch rate, false positives, adoption)
- Issues found + fixes applied
- Next week plan

### Slack Channel: #phase-2-emerging-growth
- Daily progress updates (one message per track)
- Blocker escalations (ASAP)
- Code review notifications (as PRs created)

### GitHub: Branch-based PRs
- Include test descriptions
- Include backtest results
- Require code review before merge

---

## 🎯 WEEK 1 SUCCESS CRITERIA

### Technical (Must-Have)
- [ ] 205 lines of new code (Emerging Growth module)
- [ ] 90%+ test coverage across all modules
- [ ] API response time <300ms (target: <500ms)
- [ ] Error rate 0%
- [ ] All existing tabs show unchanged scores (regression tests pass)
- [ ] All existing tests passing

### Product (Must-Have)
- [ ] ZEN caught at 6.8-7.0 QS (target: 6.8-7.2) ✓
- [ ] KAYNES caught at 6.9-7.1 QS (target: 6.8-7.2) ✓
- [ ] JUPITER caught at 7.0-7.2 QS (target: 7.0-7.2) ✓
- [ ] All 3 appear in top 10 curated list ✓
- [ ] Backtest validates scoring on past 3 months ✓

### Deployment (Must-Have)
- [ ] Code ready for staging
- [ ] All safety checks passed
- [ ] No technical debt added
- [ ] Feature flag infrastructure enabled

---

## ⚠️ KILL CRITERIA (Stop Immediately)

If ANY of these occur, rollback and debug:

- **Regression:** Any existing tab shows wrong scores
- **Performance:** API response time >1 second
- **Product Failure:** ZEN/KAYNES/JUPITER not caught at >6.5 QS
- **Infrastructure:** Database connection fails
- **Test Coverage:** Drops below 85%
- **Security:** Critical issue found

**Action on Kill:** Disable feature flag, debug, resume next day

---

## 📅 TIMELINE

| Week | Focus | Track 1 | Track 2 | Track 3 | Complete By |
|------|-------|---------|---------|---------|------------|
| 1 | Build | Emerging Growth | Capex | Substitution | Jul 2 |
| 2 | Test | Unit + Integration | Unit + Integration | Unit + Integration | Jul 9 |
| 3 | Integrate | All 3 merged | All 3 merged | All 3 merged | Jul 16 |
| 4 | Staging | E2E Testing | E2E Testing | E2E Testing | Jul 23 |
| 5 | Prod Deploy | Feature Flag OFF | Feature Flag OFF | Feature Flag OFF | Jul 30 |
| 6 | Rollout | Canary 10% | Canary 10% | Canary 10% | Aug 6 |

---

## 🎬 NEXT STEPS

**Monday 9 AM:**
1. All 3 team leads pull their branches
2. Read PHASE_2_WEEK_1_DETAILED_BREAKDOWN.md (10 min)
3. Begin Day 1 objectives (Design phase - no coding yet)
4. Post status in Slack at 4 PM

**Monday 4 PM:**
1. Daily standup (15 min)
2. Review Day 1 progress
3. Confirm Tuesday readiness

**Tuesday-Thursday:**
1. Continue design + backtest verification
2. Begin coding (Day 3)
3. Daily standups at 4 PM

**Friday:**
1. Testing phase (Days 5-6)
2. Code review + merge
3. Success criteria verification
4. Weekly metrics email at 5 PM

---

## 📋 FILES READY TO USE

All template files created and committed:

**Emerging Growth:**
- `fortress-app/lib/scanners/emerging-growth-scorer.ts`
- TODO comments guide implementation
- Backtest expectations documented

**Infrastructure Capex:**
- `fortress-app/lib/scanners/infrastructure-capex-scorer.ts`
- Ready for Week 2 Day 3

**Import Substitution:**
- `fortress-app/lib/scanners/import-substitution-scorer.ts`
- Ready for Week 2 Day 5

---

## ✅ STATUS

**Pre-Flight Checklist:**
- [x] All 3 branches created
- [x] Template files written
- [x] 4 Principles embedded
- [x] Success criteria defined
- [x] Kill criteria defined
- [x] Communication protocol set
- [x] Documentation committed

**Ready to Launch:** YES ✓

---

**EXECUTION AUTHORIZED**

**Start Time:** Monday, June 26, 2026 — 9:00 AM

**First Standup:** Monday — 4:00 PM

**First Weekly Metrics:** Friday, June 30 — 5:00 PM

---

*Generated: June 24, 2026*
*4 Principles Applied: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution*

