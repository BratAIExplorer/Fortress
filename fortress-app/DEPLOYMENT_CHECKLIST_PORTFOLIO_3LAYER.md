# Deployment Checklist — Portfolio 3-Layer Feature
**Target Date:** May 26-30, 2026  
**Status:** Pre-Implementation  

---

## 🗂 PHASE 1: DOCUMENTATION & REVIEW (Today)

- [x] Feature specification created (`PORTFOLIO_3LAYER_FEATURE_SPEC.md`)
- [ ] Customer experience review (UX/CX assessment)
- [ ] Code review checklist prepared
- [ ] Security review prepared
- [ ] Performance review prepared

---

## 💾 PHASE 2: DATABASE SETUP (May 27)

**Task: Create new tables on VPS PostgreSQL**

- [ ] **Table: `portfolio_strategies`**
  - [ ] Deploy SQL schema
  - [ ] Create indexes (portfolio_id, layer_type, deleted_at)
  - [ ] Verify table structure
  
- [ ] **Table: `strategy_deletion_feedback`**
  - [ ] Deploy SQL schema
  - [ ] Create indexes
  - [ ] Test feedback insertion

**Validation:**
- [ ] Run `SELECT COUNT(*) FROM portfolio_strategies;` (should return 0)
- [ ] Run `SELECT COUNT(*) FROM strategy_deletion_feedback;` (should return 0)
- [ ] Test constraints (FK references)

---

## 🧑‍💻 PHASE 3: COMPONENT DEVELOPMENT (May 27-28)

**Components to build/enhance:**

- [ ] **EditStrategyModal** (NEW)
  - [ ] Sliders for allocation % adjustment
  - [ ] Holdings table with quantity inputs
  - [ ] Amendment reason text field
  - [ ] Save/Cancel buttons
  - [ ] Live allocation % recalculation
  
- [ ] **StrategyDeleteModal** (NEW)
  - [ ] 9 pre-defined reason checkboxes
  - [ ] Free text feedback field
  - [ ] "Delete & Send Feedback" button
  - [ ] "Delete Anyway" button
  - [ ] "Cancel" button
  - [ ] Validation (disable button if no feedback selected)

- [ ] **PortfolioPage** (enhance)
  - [ ] Add portfolio link to main nav
  - [ ] Display all 3 layers
  - [ ] Empty state CTAs
  - [ ] Wire Edit/Delete buttons to modals

- [ ] **StrategyCard** (enhance)
  - [ ] Show amendments
  - [ ] Display drift status
  - [ ] Add Edit/Delete action buttons

**Code Quality:**
- [ ] All components have TypeScript types
- [ ] No prop drilling (use context if needed)
- [ ] Proper error boundaries
- [ ] Accessibility (ARIA labels, keyboard nav)

---

## 🔌 PHASE 4: API ENDPOINT DEVELOPMENT (May 28-29)

**Endpoints to implement:**

- [ ] **GET /api/portfolio**
  - [ ] Fetch all strategies + holdings
  - [ ] Calculate allocation % from holdings
  - [ ] Return 3-layer structured response
  - [ ] Test: Response structure matches spec
  - [ ] Test: Edge case (empty portfolio)

- [ ] **POST /api/portfolio/strategy**
  - [ ] Create new strategy
  - [ ] Link to Genie session (if from Genie)
  - [ ] Create initial holdings
  - [ ] Test: Can create from Genie
  - [ ] Test: Can create manually

- [ ] **PUT /api/portfolio/strategy/[id]**
  - [ ] Update allocation %
  - [ ] Update holdings quantities
  - [ ] Record amendments
  - [ ] Test: Amendments stored correctly
  - [ ] Test: Allocation % recalculated

- [ ] **DELETE /api/portfolio/strategy/[id]**
  - [ ] Accept optional feedback
  - [ ] Store feedback in DB
  - [ ] Delete strategy
  - [ ] Test: Feedback captured
  - [ ] Test: Delete without feedback

**API Testing:**
- [ ] All endpoints return correct HTTP codes (200, 201, 400, 401, 404)
- [ ] Error messages are clear
- [ ] Auth checks working (401 for unauthenticated)
- [ ] No SQL injection vulnerabilities
- [ ] Request validation (Zod schemas)

---

## 🔗 PHASE 5: INTEGRATION (May 29)

**Wire Genie → Portfolio flow:**

- [ ] **Investment Genie Results Page**
  - [ ] Add "Approve & Add to Portfolio" button
  - [ ] Add "Adjust Percentages" button
  - [ ] Wire "Approve & Add" → POST /api/portfolio/strategy
  - [ ] Handle success: redirect to /portfolio
  - [ ] Handle error: show error message

- [ ] **Portfolio Page**
  - [ ] Fetch portfolio on load (GET /api/portfolio)
  - [ ] Display all 3 layers
  - [ ] Wire Edit button → EditStrategyModal
  - [ ] Wire Delete button → StrategyDeleteModal
  - [ ] Handle edit submit → PUT /api/portfolio/strategy/[id]
  - [ ] Handle delete submit → DELETE /api/portfolio/strategy/[id]

**Integration Testing:**
- [ ] Complete Genie → Portfolio flow
- [ ] Edit → recalculation → display
- [ ] Delete → feedback capture → success
- [ ] Navigate between pages without errors

---

## 🧪 PHASE 6: TESTING (May 29-30)

### Unit Tests
- [ ] Component renders correctly
- [ ] Button clicks trigger correct handlers
- [ ] Form validation works
- [ ] Calculations correct (allocation %)

### Integration Tests
- [ ] Create strategy from Genie
- [ ] Edit strategy + verify DB update
- [ ] Delete strategy + verify feedback stored
- [ ] Load portfolio + verify all layers display

### E2E Tests (Manual)
- [ ] Log in at https://fortressintelligence.space
- [ ] Navigate to Portfolio page
- [ ] Create strategy from Investment Genie
- [ ] Edit strategy (change %)
- [ ] Delete strategy (with feedback)
- [ ] Delete strategy (without feedback)
- [ ] Verify feedback in DB

### Edge Cases
- [ ] Empty portfolio
- [ ] Portfolio with only pre-existing holdings
- [ ] Portfolio with multiple strategies
- [ ] User with no holdings
- [ ] Zero allocation % (edge case)
- [ ] Concurrent edits (if multi-device)

---

## 🚀 PHASE 7: DEPLOYMENT (May 30)

**Pre-deployment checks:**

- [ ] All tests passing
- [ ] No console errors
- [ ] TypeScript build: zero errors
- [ ] No hardcoded secrets
- [ ] Performance acceptable (queries < 200ms)

**Deployment steps:**

1. [ ] Commit all changes to git
   ```bash
   git add .
   git commit -m "feat: implement portfolio 3-layer system with edit/delete + feedback"
   ```

2. [ ] Push to GitHub
   ```bash
   git push origin main
   ```

3. [ ] GitHub Actions CI/CD runs
   - [ ] Build succeeds
   - [ ] Tests pass
   - [ ] Deploy to VPS

4. [ ] VPS deployment
   - [ ] Pull latest code
   - [ ] Run database migrations (if any)
   - [ ] Rebuild Next.js app
   - [ ] Restart PM2 process
   - [ ] Check PM2 logs for errors

5. [ ] Verify production
   - [ ] Navigate to https://fortressintelligence.space/portfolio
   - [ ] Test all flows
   - [ ] Check browser console for errors
   - [ ] Monitor VPS logs for errors

---

## ✅ PHASE 8: VALIDATION (May 30)

### Functional Validation
- [ ] Portfolio page loads without errors
- [ ] Can approve strategy from Genie
- [ ] Can edit strategy (allocation % + holdings)
- [ ] Can delete strategy (with/without feedback)
- [ ] Feedback stored in DB correctly
- [ ] All 3 layers visible and accurate

### UX/CX Validation
- [ ] Portfolio page is discoverable (link in nav)
- [ ] Flows are intuitive (no confusion)
- [ ] Error messages are clear
- [ ] Success messages are helpful
- [ ] No unexpected behavior
- [ ] Mobile responsive (test on phone)

### Performance Validation
- [ ] Portfolio page loads < 1 second
- [ ] Edit/Delete actions < 500ms
- [ ] API responses < 200ms
- [ ] No memory leaks

### Security Validation
- [ ] Only authenticated users can access portfolio
- [ ] Users can only see their own portfolio
- [ ] No SQL injection vectors
- [ ] No XSS vulnerabilities
- [ ] Feedback doesn't expose PII

---

## 📋 PHASE 9: POST-DEPLOYMENT (May 30+)

- [ ] Monitor error logs (24 hours)
- [ ] Check feedback submissions (any errors?)
- [ ] Monitor performance metrics
- [ ] Document any issues found
- [ ] Update CLAUDE.md with feature status
- [ ] Create post-deploy summary

---

## 🎯 SUCCESS CRITERIA

**Feature is "DONE" when:**

- [x] Feature spec complete
- [ ] All tests passing
- [ ] All code reviewed
- [ ] Deployed to production
- [ ] All validation checks passed
- [ ] No critical errors in production logs
- [ ] UX/CX review satisfied
- [ ] CLAUDE.md updated
- [ ] Team notified

---

## ⚠️ ROLLBACK PLAN

If deployment fails:

1. Revert commit: `git revert <commit-hash>`
2. Push: `git push origin main`
3. CI/CD redeploys previous version
4. Database: Keep new tables (no data loss)
5. Post-mortem: Identify issue and fix

---

**Deployment Status:** Pending Implementation  
**Estimated Completion:** May 30, 2026  
**Owner:** Claude Code  
**Reviewer:** Bharat Samant
