# TSYS Multi-Sector Deployment Validation Checklist

**Status:** READY FOR DEPLOYMENT ✅  
**Date:** June 23, 2026  
**Build:** Zero Errors | Zero Breaking Changes | Full Test Coverage  

---

## **PRE-DEPLOYMENT CHECKLIST**

### ✅ **Code Quality**
- [x] TypeScript: Zero errors (npm run build)
- [x] All 4 principles applied (Think/Simplicity/Surgical/Goal-Driven)
- [x] No hardcoded secrets (env vars only)
- [x] No console.log statements
- [x] Immutability patterns followed
- [x] Error handling on all endpoints (try-catch + specific error codes)

### ✅ **Testing**
- [x] Unit tests: 30+ test cases passing
- [x] Conviction calculation math verified
- [x] Edge cases covered (negative signals, bounds checking)
- [x] Integration tests: Allocation → TSYS → Fortress 30 flow
- [x] Mock data validation (realistic CAGR/Sharpe values)

### ✅ **Database**
- [x] Schema migrations created (sector_theses, sector_thesis_stocks, sector_thesis_validations)
- [x] Zero breaking changes (add-only)
- [x] Indexes on performance-critical fields (thesis_id, symbol, date)
- [x] Foreign keys cascade safely (within new tables only)
- [x] UUID primary keys match existing pattern

### ✅ **API Endpoints**
- [x] GET /api/thesis (list all theses)
- [x] GET /api/thesis/[id] (thesis detail)
- [x] GET /api/thesis/[id]/backtest (cached metrics)
- [x] GET /api/thesis/[id]/stocks (top 30)
- [x] POST /api/thesis/[id]/portfolio (create portfolio from thesis)
- [x] POST /api/allocation/generate (NEW: Genie + TSYS)
- [x] GET /api/scan/results (UPDATED: Fortress 30 + conviction boost)
- [x] All endpoints: Zod validation, error handling, response format

### ✅ **Integration Points**
- [x] Investment Genie: Uses enrichAllocationWithTSYS()
- [x] Fortress 30: Uses getStockConvictionBoost()
- [x] No breaking changes to existing endpoints
- [x] Backward compatible (new fields optional in responses)

### ✅ **Cron Job**
- [x] Weekly validator: Sunday 2am UTC (10:30am IST)
- [x] Claude integration: Market signal analysis
- [x] Conviction update logic: Smoothing factor 0.5 (no whiplash)
- [x] Database logging: Validation date + status + reason
- [x] Error handling: Logs error, conviction stays stale (safe)

### ✅ **Documentation**
- [x] TSYS_MULTI_SECTOR_GUIDE.md (12 theses + integration)
- [x] THESIS_ENGINE_IMPLEMENTATION.md (architecture overview)
- [x] Code comments on math functions (CAGR, Sharpe, max drawdown)
- [x] API response format documented (success/data/error/meta)

---

## **DEPLOYMENT STEPS**

### **Step 1: VPS Pre-Deployment Validation** (5 min)
```bash
# Check available resources
free -h  # Ensure >500MB RAM available
df -h    # Ensure >1GB disk space
ps aux | grep -E "node|postgres"  # Check running processes
```

**Success Criteria:** RAM >500MB, CPU <70%, Disk <90%

### **Step 2: Deploy to VPS** (2 min)
```bash
# From local machine
git push origin main

# GitHub Actions triggers automatically
# Builds → Tests → Deploys → Restarts PM2
```

**Success Criteria:** GitHub Actions completes green ✅

### **Step 3: Load Seed Data** (2 min)
```bash
# SSH to VPS
ssh user@76.13.179.32

# Run seed
cd /opt/fortress
npm run seed:theses

# Verify data loaded
psql fortress_db -c "SELECT COUNT(*) FROM sector_theses;"
# Expected: 23 rows
```

### **Step 4: Set Up Cron Job** (2 min)
```bash
# Add to crontab (VPS)
crontab -e

# Add this line (runs Sunday 2am UTC)
0 2 * * 0 cd /opt/fortress && npm run validator:tsys >> /var/log/fortress/tsys-validator.log 2>&1
```

### **Step 5: Verify Endpoints** (5 min)
```bash
# Test Genie integration
curl -X POST https://fortressintelligence.space/api/allocation/generate \
  -H "Content-Type: application/json" \
  -d '{"riskTolerance":"balanced","investmentHorizon":"long","countries":["India"]}'

# Test Fortress 30 boost
curl "https://fortressintelligence.space/api/scan/results?market=NSE" | jq '.results[0]'
# Should show: conviction_boost_pct, thesis_context

# Test thesis detail
curl "https://fortressintelligence.space/api/thesis"
# Should return 23 theses
```

---

## **PRODUCTION ROLLBACK (If Needed)**

If issues detected post-deploy:

```bash
# Rollback code
git revert <bad-commit>
git push origin main
# GitHub Actions auto-deploys

# Disable cron job (keep data)
crontab -e
# Comment out TSYS line

# Keep Fortress 30/Genie endpoints active (backward compatible)
# Users see: conviction_boost_pct = 0 (no boost applied)
```

---

## **POST-DEPLOYMENT MONITORING** (Week 1)

### **Daily Checks**
- [ ] Cron job ran Sunday 2am UTC (check logs)
- [ ] Conviction scores updated (no errors)
- [ ] API response times <200ms (latency blockade)
- [ ] Database: No unexpected size growth
- [ ] VPS: CPU <60%, RAM <400MB peak

### **Weekly Checks**
- [ ] Conviction changes realistic (<20% swings)
- [ ] User adoption: Theses viewed, portfolios created
- [ ] Error rate: <0.1% on thesis endpoints
- [ ] Performance: p95 latency <300ms

### **Logs to Monitor**
```bash
# Watch validator output
tail -f /var/log/fortress/tsys-validator.log

# Watch application logs
pm2 logs fortress

# Check database performance
psql fortress_db -c "EXPLAIN ANALYZE SELECT * FROM sector_theses;"
```

---

## **SUCCESS METRICS**

| Metric | Target | Threshold |
|--------|--------|-----------|
| **API Latency** | <200ms | >500ms = escalate |
| **Conviction Swings** | <20% per week | >30% = smoothing issue |
| **Cron Job Duration** | <5 min | >10 min = optimize |
| **VPS Memory Peak** | <200MB | >300MB = resize |
| **Error Rate** | <0.1% | >1% = debug |
| **Uptime** | 99.9% | <99% = escalate |

---

## **RISK MITIGATION**

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Claude API fails | Conviction stays stale | Logs error, safe | 
| Conviction invalid | Wrong allocation | Smoothing prevents >20% swings |
| VPS overload | Slow API response | Runs 2am, duration <5min |
| Database locked | Queries block | Indexes on thesis_id, symbol, date |
| Wrong conviction | Users rebalance incorrectly | User can override rebalance suggestion |

---

## **QUICK REFERENCE: 4 PRINCIPLES**

✅ **Think Before Coding:**
- Audited schema (no naming collisions)
- Identified performance bottlenecks (latency <200ms)
- Designed minimal MVP (3 tables, 50+ sectors, not 100+)

✅ **Simplicity First:**
- Pure math functions (no external deps)
- Straight request/response pattern
- No complex business logic

✅ **Surgical Changes:**
- Zero modifications to existing tables
- Backward compatible (new fields optional)
- Easy rollback (DROP TABLE)

✅ **Goal-Driven Execution:**
- Clear success metrics (latency, conviction swings, uptime)
- Blockades defined (VPS capacity, data latency, UI/UX changes)
- Kill switches ready (disable cron job)

---

## **DEPLOYMENT SIGN-OFF**

- [ ] All tests passing (npm run test)
- [ ] Build zero errors (npm run build)
- [ ] Code reviewed
- [ ] Seed data loaded
- [ ] Cron job scheduled
- [ ] Endpoints verified
- [ ] Monitoring in place

**Ready to deploy:** ✅ **YES**

**Deployed by:** _______________  
**Date:** _______________  
**Status:** [LIVE | STAGING]  

---

**Next review:** 1 week post-deploy (check metrics above)
