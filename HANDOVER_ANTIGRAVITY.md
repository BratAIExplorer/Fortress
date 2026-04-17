# 🤖 Google Antigravity Agent — Investment Genie Build Brief

**Sprint:** 3-day parallel development  
**Deadline:** Day 3, 3 PM IST  
**Owner:** Google Antigravity (Gemini 3.1 Agent)  
**Coordinator:** Claude Code (Integration + VPS deployment)

---

## 🎯 **Mission**

Build 3 independent React components + API query functions for **Investment Genie Tab** in Fortress Intelligence.

**User Story:**
> "As an NRI investor, I want to input my age, amount, time horizon, and risk appetite. The system should generate a personalized portfolio allocation based on latest market scanner data + macro intelligence."

---

## 📦 **Deliverables (3 Components)**

### **Component 1: InvestmentGenieForm.tsx**

**What:** React form collecting user profile (7 fields)

**Inputs:**
```
1. Age (slider: 18–70)
2. Investment Amount (number input: $100–$500K)
3. Time Horizon (dropdown: 1yr / 5yr / 10yr / 20yr / Retirement)
4. Investment Experience (radio: Beginner / Intermediate / Experienced)
5. Geographic Focus (multi-select: India / US / Malaysia / Singapore / ETFs)
6. Risk Appetite (slider: 0–100)
7. Income Stability (radio: Stable Salary / Variable / Business)
```

**Output:**
- Exports `UserProfile` interface (see `contracts.ts`)
- On submit: returns `UserProfile` object
- Validation: All fields required, no empty submissions

**Requirements:**
- ✅ Renders in < 1 second
- ✅ Mobile responsive (form works on 375px width)
- ✅ No external UI library (use HTML + CSS-in-JS, match Fortress design)
- ✅ Error handling: Show validation errors below each field
- ✅ Accessibility: Label each input, semantic HTML

**Testing:**
- Unit test: Form renders all 7 fields
- Unit test: Form validates required fields
- Unit test: Form exports `UserProfile` with correct types
- **Must pass:** `npm run test -- InvestmentGenieForm --coverage`

**Definition of Done:**
- ✅ Component compiles (TypeScript, no errors)
- ✅ All unit tests pass
- ✅ Screenshot: Form filled + submitted (shows UserProfile object)
- ✅ GitHub PR: Link to `integration` branch

---

### **Component 2: API Query Functions (Scanner + Macro + Intelligence)**

**What:** 3 async functions that fetch data from Fortress backend

**Function 1: queryScanResults()**

```typescript
export async function queryScanResults(
  markets: string[]
): Promise<ScanData> {
  // Fetch from GET /api/scan/results?markets=NSE,US
  // Returns latest completed scan + top 20 stocks by score
  // See ScanData interface in contracts.ts
}
```

**Implementation:**
```typescript
// Fetch from: GET /api/scan/results?markets=NSE,US
// Transform response to match ScanData interface
// Error handling: If API fails, return empty ScanData
```

**Testing:**
- Unit test: Function returns correct `ScanData` type
- Integration test: Can call backend API without errors
- Fallback test: If API fails, returns graceful error

---

**Function 2: queryMacroSnapshot()**

```typescript
export async function queryMacroSnapshot(): Promise<MacroState> {
  // Fetch from GET /api/macro?limit=1
  // Transform to MacroState (compute vixState, goldTrend, etc.)
  // See MacroState interface in contracts.ts
}
```

**Implementation:**
```typescript
// Fetch latest snapshot
// Compute derived fields:
//   - vixState = cboeVix > 20 ? "elevated" : "normal"
//   - goldTrend = goldUsd > 2100 ? "flight-to-safety" : "normal"
//   - etc.
// Return MacroState object
```

**Testing:**
- Unit test: Function returns correct `MacroState` type
- Integration test: API call works
- Data validation: Ensures all required fields present

---

**Function 3: queryIntelligence()**

```typescript
export async function queryIntelligence(): Promise<Signal[]> {
  // Fetch from GET /api/intelligence/latest
  // Returns array of market signals
  // See Signal interface in contracts.ts
}
```

**Implementation:**
```typescript
// Fetch latest intelligence report
// Extract signals array
// Return as Signal[]
```

**Testing:**
- Unit test: Returns `Signal[]` type
- Integration test: API call works
- Edge case: Handle empty signals (return [])

---

**Requirements (All 3 Functions):**
- ✅ Must match TypeScript signatures in `contracts.ts` **exactly**
- ✅ Error handling: Catch API errors, log, return safe defaults
- ✅ Performance: Queries complete in < 2 seconds
- ✅ No side effects (pure functions)
- ✅ Unit tests for each function (80%+ coverage)

**Testing:**
- Run: `npm run test -- queries --coverage`
- **Must pass CI/CD:** `npm run tsc --noEmit` (no TypeScript errors)

**Definition of Done:**
- ✅ All 3 functions compile
- ✅ All unit tests pass
- ✅ Functions return correct types (CI/CD verified)
- ✅ GitHub PR: Link to `integration` branch

---

## 🔗 **Dependencies & Constraints**

**What YOU must have:**
- ✅ `contracts.ts` file (shared interface definitions) — **Claude Code provides this**
- ✅ GitHub access to `BratAIExplorer/Fortress` repo
- ✅ `.env` file with API endpoints (Claude Code provides)

**What YOU must NOT do:**
- ❌ Change interface signatures in `contracts.ts`
- ❌ Add new dependencies without approval
- ❌ Use `console.log` (use proper logging)
- ❌ Hardcode API URLs (use env vars)

**What YOU must do:**
- ✅ Push all code to `feature/investment-genie` branch
- ✅ Create GitHub PRs for each component
- ✅ Run `npm run tsc --noEmit` before committing (catch TypeScript errors)
- ✅ Run `npm run test` before PR (ensure tests pass)
- ✅ Update progress in GitHub Issues (see "Progress Tracking" below)

---

## ✅ **Checkpoints & Validation**

### **Checkpoint 1: Day 1, 6 PM IST — "Component Delivery"**

**Deliverables:**
- ✅ `InvestmentGenieForm.tsx` — merged to `integration` branch
- ✅ `queryScanResults()`, `queryMacroSnapshot()`, `queryIntelligence()` — merged to `integration` branch
- ✅ All TypeScript compiles (no errors)
- ✅ All unit tests pass

**Validation:**
```bash
npm run tsc --noEmit        # Must pass
npm run test -- --coverage  # Must pass 80%+
npm run lint                # Must pass
```

**Gate:** If ANY fails, debug and resubmit. No Checkpoint 2 without Checkpoint 1 passing.

**Evidence:**
- Screenshot: `npm run test` output (all green)
- Screenshot: Form component rendering
- GitHub PR list (3 PRs, all CI/CD passing)

---

### **Checkpoint 2: Day 2, 12 PM IST — "Integration Test"**

**Deliverables:**
- ✅ Claude Code has integrated your components
- ✅ Full flow works: Form → Queries → Mapper → Allocation
- ✅ Your $15K allocation generates in < 2 seconds
- ✅ No breaking changes to your code

**Validation:**
- Claude Code tests integration
- If integration fails, Antigravity fixes queries + retests
- Feedback loop: Max 1 iteration

**Gate:** If integration fails, Antigravity fixes + resubmits. Must resolve by 6 PM Day 2.

---

### **Checkpoint 3: Day 3, 9 AM IST — "Production Readiness"**

**Deliverables:**
- ✅ All code in `integration` branch ready for `main`
- ✅ Zero TypeScript errors
- ✅ Zero linting issues
- ✅ 80%+ test coverage

**Validation:**
- Final CI/CD run
- Code review by Claude Code
- Approval to merge to `main`

**Gate:** If anything fails, fix immediately. No deployment without green CI/CD.

---

## 📊 **Progress Tracking Format**

**Update GitHub Issue with:**

```markdown
## Day 1 Progress

### InvestmentGenieForm.tsx
- Status: ✅ COMPLETED | 🔄 IN_PROGRESS | ⏳ BLOCKED
- What I did: [Describe what you built]
- What I'm doing: [Current work]
- Blockers: [If any]
- Tests passing: ✅ / ❌

### queryScanResults()
- Status: ✅ COMPLETED | 🔄 IN_PROGRESS | ⏳ BLOCKED
- Lines of code: XXX
- Tests: YY passing, ZZ failing

### queryMacroSnapshot() + queryIntelligence()
- Status: [Same format]

### Next Steps
- Tomorrow: [What's next]
```

**Update EVERY 4 hours** so Claude Code knows status without asking.

---

## 🧪 **Self-Testing Checklist**

Before submitting each component, **you must verify:**

### **InvestmentGenieForm.tsx**
```
✅ Form renders without errors
✅ All 7 fields appear on page
✅ Form validation works (try submitting empty form — should show errors)
✅ Form submission returns UserProfile object with correct types
✅ Unit test: npm run test -- InvestmentGenieForm (all tests pass)
✅ TypeScript: npm run tsc --noEmit (no errors)
✅ Linting: npm run lint -- InvestmentGenieForm.tsx (no issues)
✅ Mobile responsive: Form looks good on 375px width
```

### **Query Functions**
```
✅ queryScanResults() returns ScanData (correct type)
✅ queryMacroSnapshot() returns MacroState (correct type)
✅ queryIntelligence() returns Signal[] (correct type)
✅ All functions handle API errors gracefully
✅ Unit tests: npm run test -- queries (all pass)
✅ Integration test: Can call API without crashing
✅ TypeScript: npm run tsc --noEmit (no errors)
✅ Performance: Each query completes in < 2 seconds
```

---

## 📋 **Code Management Principles**

**You MUST follow:**

1. **TypeScript is Strict**
   - No `any` types
   - All function signatures must match `contracts.ts` exactly
   - Use `unknown` for untrusted inputs, then narrow

2. **No Hardcoded Values**
   - Use environment variables (`.env`)
   - Use constants for thresholds (e.g., `VIX_ELEVATED_THRESHOLD = 20`)

3. **Error Handling**
   - Every API call has try-catch
   - Errors are logged (console.error is OK for now, we'll add proper logging)
   - Functions return safe defaults on error (never throw)

4. **Testing First**
   - Write test file alongside component
   - Aim for 80%+ coverage
   - Test happy path + error cases

5. **Git Hygiene**
   - Small, focused commits (`git commit -m "feat: add form validation"`)
   - Push to `feature/investment-genie` branch
   - Create PR when component is complete
   - Link PR to GitHub Issue

---

## 🎯 **Success Criteria**

You're done when:
- ✅ 3 components built
- ✅ All TypeScript compiles
- ✅ All tests pass (80%+ coverage)
- ✅ All CI/CD gates pass
- ✅ 3 PRs merged to `integration` branch
- ✅ Claude Code confirms integration works
- ✅ Ready to deploy to VPS

---

## 🆘 **If You Get Stuck**

1. **TypeScript error?** Check `contracts.ts` — function signature must match exactly
2. **API call failing?** Check `.env` — endpoint URLs must be correct
3. **Test failing?** Check test file — mock data must match real API response
4. **Blocker?** Add comment to GitHub Issue with `[BLOCKER]` tag — Claude Code will unblock

---

## 📞 **Questions?**

Ask in GitHub Issue comments. Claude Code monitors and responds within 1 hour.

---

**START DATE:** [TODAY]  
**DEADLINE:** Day 3, 3 PM IST  
**CONTACT:** GitHub Issues on `BratAIExplorer/Fortress`

Good luck! 🚀
