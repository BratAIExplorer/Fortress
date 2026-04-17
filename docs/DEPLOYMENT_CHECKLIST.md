# Investment Genie Deployment Checklist

**Deployment Date:** 2026-04-19, 3 PM IST  
**Version:** 1.0  
**Status:** Ready for Production

---

## Pre-Deployment (Code Review)

- [x] All TypeScript compiles (`npx tsc --noEmit`)
- [x] All unit tests pass (31/31 tests passing)
- [x] Allocator function tested with multiple scenarios
- [x] Integration component tested
- [x] Code committed and pushed
- [x] Feature branch ready: `feature/investment-genie`

## Components Delivered

### Architecture
- [x] `contracts.ts` — Shared TypeScript interfaces
- [x] `allocator.ts` — Core allocation engine (allocatePortfolio)
- [x] `queries.ts` — API query functions (Antigravity implementations)
- [x] `InvestmentGeniePage.tsx` — Integration component
- [x] `AllocationResult.tsx` — Result display component
- [x] `InvestmentGenieForm.tsx` — Form component

### Testing
- [x] 31 unit tests for allocator
- [x] Test fixtures for all scenarios
- [x] Edge case coverage (age 18-70, amounts $100-$500k, all horizons)
- [x] Macro adjustment tests (VIX, gold, currency, equity)
- [x] Signal adjustment tests
- [x] Projection tests

### Infrastructure
- [x] ecosystem.config.js updated with 3 cron jobs
- [x] Cron scripts created (scanner, macro, intelligence)
- [x] Error handling in cron jobs
- [x] Log file configuration
- [x] CRON_SECRET env var setup

---

## Deployment Steps

### Step 1: Merge to Integration (Pre-Prod)

```bash
# On your local machine
git checkout integration
git pull origin integration
git merge feature/investment-genie
git push origin integration
```

**Validation:** Check GitHub Actions CI/CD passes on integration branch

### Step 2: Deploy to VPS (Staging)

SSH into VPS and run:

```bash
cd /opt/fortress
git fetch origin
git checkout integration
npm install                    # Install any new deps
npm run build                 # Build Next.js app
pm2 stop fortress-app         # Stop current app
pm2 delete fortress-app        # Remove from PM2
npm run deploy:start          # Start with new code + cron jobs
pm2 save                      # Save PM2 state
```

**Validation:** Check deployment
```bash
pm2 status                    # All 4 apps running (fortress-app + 3 cron jobs)
pm2 logs fortress-app         # Check app is up
```

### Step 3: Test on Staging

```bash
# Test form submission
curl -X POST http://VPS_IP:3000/api/scan/results?markets=NSE

# Test macro endpoint
curl -X GET http://VPS_IP:3000/api/macro?limit=1

# Test intelligence endpoint
curl -X GET http://VPS_IP:3000/api/intelligence/latest

# Manual cron trigger (optional)
curl -X POST http://VPS_IP:3000/api/scan/run \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "Content-Type: application/json"
```

### Step 4: Merge to Main

Once integration branch is verified on staging:

```bash
git checkout main
git pull origin main
git merge integration
git push origin main
```

### Step 5: Deploy to Production

SSH into VPS and run:

```bash
cd /opt/fortress
git fetch origin
git checkout main
npm install
npm run build
pm2 reload fortress-app       # Zero-downtime reload
pm2 save
pm2 logs fortress-app         # Verify logs
```

### Step 6: Verify Cron Jobs

```bash
# Check cron jobs are registered
pm2 list | grep cron

# Check logs
pm2 logs cron-scanner
pm2 logs cron-macro
pm2 logs cron-intelligence

# Verify log directory exists
mkdir -p /var/log/fortress
```

### Step 7: Smoke Tests

```bash
# Test allocation endpoint (once Antigravity queries are live)
curl -X POST http://VPS_IP:3000/api/allocation \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "amount": 15000,
    "horizon": "20yr",
    "countries": ["India", "US"],
    "riskAppetite": 50,
    "experience": "intermediate",
    "incomeStability": "stable"
  }'

# Test browser (access from your local machine)
# Open: http://VPS_IP:3000/intelligence?tab=allocation
# Fill form, submit, verify allocation generates
```

---

## Rollback Plan

If anything goes wrong:

### Quick Rollback (5 minutes)

```bash
# On VPS
cd /opt/fortress
git checkout integration      # Go back to previous version
npm run build
pm2 reload fortress-app
pm2 save
```

### Full Rollback (10 minutes)

```bash
# If integration is also bad, go back to main
cd /opt/fortress
git checkout main
npm run build
pm2 reload fortress-app
pm2 save
```

---

## Environment Variables

Ensure these are set on VPS (in `.env.local`):

```
NODE_ENV=production
PORT=3000
CRON_SECRET=<secure-secret>
# Other existing vars...
```

---

## Post-Deployment Verification

### Day 1
- [ ] Verify app is up and responsive
- [ ] Check allocator tests still pass
- [ ] Verify cron jobs logged at scheduled times
- [ ] Monitor error logs for any issues

### Day 2
- [ ] Invite 5 beta users to test
- [ ] Collect feedback via GitHub Issues
- [ ] Monitor performance metrics
- [ ] Check cron job logs for data freshness

### Day 3
- [ ] All beta users report success
- [ ] No critical issues in logs
- [ ] Cron jobs running smoothly
- [ ] Ready for broader rollout

---

## Success Criteria

✅ Deployment is successful when:
- pm2 shows 4 apps running (fortress-app + cron-scanner + cron-macro + cron-intelligence)
- No errors in pm2 logs
- Form submission generates allocation in < 2 seconds
- Cron jobs execute at scheduled times and log success
- TypeScript compiles clean on VPS
- Test allocation generates expected output

---

## Contacts

- **Technical Issues:** GitHub Issues on BratAIExplorer/Fortress
- **Emergency Rollback:** SSH to VPS and run rollback commands
- **Cron Job Issues:** Check `/var/log/fortress/*.log` files

---

## Notes

- **Cron Timing:** All times are IST (India Standard Time)
- **First Run:** Cron jobs will run the next day after deployment. Manual trigger available via API.
- **Database:** Allocation results are computed on-demand, no persistent storage needed for MVP
- **Scaling:** If users increase, consider caching macro/intelligence queries (currently fresh each time)

---

**Deploy with confidence!** 🚀
