# Deployment Safety Checklist
## Before Merging Any Feature Branch

### Phase 1: Local Validation (15 min)
```bash
# 1. Run full test suite
npm test -- --run
# Expected: 44/44 passing (or higher)

# 2. Type checking
npm run type-check
# Expected: 0 errors

# 3. Build
npm run build
# Expected: Completes in <60s, no errors

# 4. E2E tests
npm run e2e
# Expected: 13/13 passing (or higher)

# 5. Lint check
npm run lint
# Expected: 0 warnings in modified files
```

### Phase 2: Manual Testing (30 min)
Critical flows that MUST work after each merge:

#### Homepage (/)
- [ ] Page loads without 500 error
- [ ] All 4 CTA buttons clickable
- [ ] Feature cards visible and readable
- [ ] Mobile menu toggles on mobile (<768px)
- [ ] No horizontal scroll on mobile

#### Fortress 30 (/fortress-30)
- [ ] Page loads (skip if database state unknown)
- [ ] Stock table displays with data
- [ ] Sorting works on columns
- [ ] Mobile: Table scrolls horizontally, readable

#### Investment Genie Form (/genie)
- [ ] Form loads
- [ ] All inputs accept values
- [ ] Submit button works
- [ ] Loading state shows spinner
- [ ] Success/error messages display
- [ ] Mobile: Inputs stack vertically, readable

#### Admin Dashboard (/admin/dashboard)
- [ ] Page loads
- [ ] Charts/data visible
- [ ] No console errors
- [ ] Mobile: Charts stack, readable

### Phase 3: Browser DevTools Check (10 min)
```
Chrome DevTools → Console:
- [ ] No red errors
- [ ] No unhandled promise rejections
- [ ] No infinite loops

Chrome DevTools → Network:
- [ ] All images load (<5s LCP)
- [ ] API calls respond <200ms
- [ ] No 404s for critical assets

Chrome DevTools → Lighthouse:
- [ ] Performance: >80
- [ ] Accessibility: >85
- [ ] Best Practices: >85
```

### Phase 4: Responsive Test (10 min)
Test at these exact viewports:
- [ ] 320px (iPhone SE) - no horizontal scroll
- [ ] 375px (iPhone 12) - buttons clickable
- [ ] 768px (iPad) - 2-column layout works
- [ ] 1024px (Desktop) - 3-column layout correct

### Phase 5: Production-Like Test (5 min)
```bash
# Build production bundle
npm run build

# Serve locally
npx http-server out/

# Visit localhost:8080
# Repeat Phase 2 critical flows
```

---

## ROLLBACK PROCEDURE (If Something Breaks)

**If tests fail after merge:**
```bash
# 1. Stop deployment immediately
git revert <commit-hash>

# 2. Run tests again to confirm revert worked
npm test -- --run

# 3. Notify team in Slack
# Message: "@channel Rolled back [feature] due to [specific failure]"

# 4. Post-mortem in next standup
```

**If production error occurs (user-facing):**
```bash
# 1. Check error monitoring (Sentry/logs)
# 2. Immediately revert the problematic commit
git revert HEAD --no-edit

# 3. Force push only if <5 min after merge
git push origin main --force-with-lease

# 4. Notify stakeholder + team
```

---

## GIT MERGE GATE (Required Before Approval)

Every PR must have:
```
✅ All 44+ tests passing
✅ Build succeeds (<60s)
✅ E2E tests pass (13+ tests)
✅ Lighthouse >80 performance
✅ Code review approved
✅ 0 console errors on manual test
```

---

## MONITORING POST-DEPLOY

After each merge to main:
```bash
# Check error rate (if you have Sentry/LogRocket)
- Error count: Should be 0 new errors
- User reports: Monitor support email
- Performance: Check Lighthouse score

# In browser, open each route and check console
- /
- /fortress-30
- /genie
- /admin/dashboard
```

---

## CRITICAL FLOWS NEVER TO BREAK

| Flow | Why | Test Method |
|------|-----|-------------|
| Homepage loads | Entry point | Visit / in browser |
| Form submission | Core feature | Fill + submit genie form |
| Navigation works | Basic UX | Click all navbar links |
| Mobile responsive | Mobile-first design | DevTools 375px |
| Button states | Visual feedback | Hover + click buttons |
| No 500 errors | User experience | Check browser console |

---

## Sprint Merge Strategy

**Daily (End of Day):**
```
1. Run full checklist locally
2. Push to feature branch (NOT main)
3. Create PR with checklist in description
4. Teammate reviews
5. If approved: Merge to main
6. Run full checklist again on main
```

**Weekly (Friday EOD):**
```
1. Verify ALL merged features still work
2. Run full test suite one more time
3. Deploy to staging
4. Team tests on staging for 1 hour
5. If clear: Deploy to production
```

**Before Launch (May 9):**
```
1. Run full checklist 3x
2. Test all 5 features together (no isolation)
3. Load test with 100+ concurrent users
4. 24-hour monitoring after launch
```

---

## Team Accountability

- **Claude Code**: Ensures all UI passes Phases 1-4
- **Antigravity**: Ensures all APIs pass Phase 1 + return correct data
- **Both**: Review rollback procedure before starting

