# Allocation Preservation Layer — Deployment Guide

**Date:** May 28, 2026  
**Feature:** Fix Digital Amnesia — Preserve Investment Genie allocation data through strategy creation  
**Status:** Code deployed to GitHub, pending VPS database migration and verification

---

## What Was Changed

### 1. Database Schema (`lib/db/schema.ts`)
Added new column to `strategies` table:
```typescript
allocationBreakdown: jsonb("allocation_breakdown"), // Preserved from Genie: {layers: {[key]: {vehicles: [{ticker, name, weight}]}}}
```

**Migration:** `drizzle/0005_special_psynapse.sql`
```sql
ALTER TABLE "strategies" ADD COLUMN "allocation_breakdown" jsonb;
```

### 2. API Endpoint (`app/api/portfolio/route.ts`)
Updated `CreateStrategySchema` to accept allocation data:
```typescript
allocationBreakdown: z.unknown().optional(), // Allocation data from Genie
```

### 3. Query Layer (`lib/portfolio/portfolio-queries.ts`)
Updated `createStrategy()` function to accept and store allocation:
```typescript
allocationBreakdown?: unknown;
```

### 4. Component (`components/investment-genie/InvestmentGeniePage.tsx`)
Updated `handleAddToPortfolio()` to pass allocation data:
```typescript
allocationBreakdown: allocation, // Preserve Genie allocation data
```

---

## Implementation Workflow

**Before Fix:**
1. User generates allocation via Genie form (allocation data stored in React state)
2. User clicks "Add to My Portfolio"
3. API extracts holdings from allocation but **discards allocation object**
4. Strategy created with blank/empty allocation context
5. Holdings editor shows empty table with no reference data
6. User must manually re-enter all tickers and percentages

**After Fix:**
1. User generates allocation via Genie form (allocation data stored in React state)
2. User clicks "Add to My Portfolio"
3. API **preserves allocation object** in database
4. Strategy created with allocation_breakdown JSONB containing full allocation
5. Holdings editor can display "Based on your allocation: [breakdown]"
6. UI can pre-populate holdings table with recommended tickers and target percentages
7. User confidence: allocation is now preserved and visible throughout the flow

---

## Deployment Steps

### Step 1: GitHub Actions Deployment (AUTOMATIC)
✅ **COMPLETE** — Commit `f9a7f3d` pushed to master
- GitHub Actions CI/CD will automatically:
  - Build the Next.js app
  - Run TypeScript checks ✅
  - Deploy code to VPS (`/opt/fortress`)
  - Restart PM2 process

### Step 2: Database Migration (MANUAL — SSH to VPS)
**Required BEFORE app restarts**

```bash
# SSH into VPS
ssh -i ~/.ssh/fortress ubuntu@76.13.179.32

# Navigate to app directory
cd /opt/fortress/fortress-app

# Run Drizzle migration
npm run drizzle:push

# Expected output:
# ✓ Successfully applied 1 migration
```

### Step 3: Restart App (MANUAL or AUTOMATIC)
After migration completes:
```bash
# Option A: PM2 reload (if GitHub Actions doesn't auto-restart)
pm2 reload fortress

# Option B: Check status
pm2 status

# Option C: View logs
pm2 logs fortress --lines 50
```

---

## Testing the Fix — End-to-End Workflow

1. **Login** to https://fortressintelligence.space
2. **Navigate** to Investment Genie (`/investment-genie`)
3. **Select** "Aggressive Growth" preset
4. **Generate allocation** by submitting form
5. **Click** "✨ Add to My Portfolio" button
6. **Verify** allocation data is captured:
   - Navigate to `/portfolio/[strategyId]`
   - Allocation breakdown should be visible in database
   - Holdings editor should show pre-populated table
7. **Create** 2 more test portfolios (Balanced, Conservative)
8. **Verify** each has allocation context preserved

---

## Rollback Plan (If Issues)

If the migration fails or causes issues:
```bash
# Drizzle will not auto-rollback; manually revert in psql:
ssh ubuntu@76.13.179.32

# Access PostgreSQL (via VPS tunnel)
psql postgresql://user:pass@localhost/fortress_db

# Drop the column (if needed)
ALTER TABLE "strategies" DROP COLUMN "allocation_breakdown";

# Or revert the code commit and redeploy
git revert f9a7f3d
```

---

## Key Files Modified

```
fortress-app/
├── lib/db/schema.ts                  # Added allocationBreakdown field
├── lib/portfolio/portfolio-queries.ts # Updated createStrategy()
├── app/api/portfolio/route.ts        # Updated CreateStrategySchema
├── components/investment-genie/InvestmentGeniePage.tsx # Pass allocation
├── drizzle/
│   ├── 0005_special_psynapse.sql     # Migration file (NEW)
│   └── meta/
│       └── 0005_snapshot.json        # Migration metadata (NEW)
```

---

## Verification Checklist

- [ ] GitHub Actions deployment completes (check Actions tab)
- [ ] SSH to VPS and run `npm run drizzle:push`
- [ ] Migration applies successfully (no errors)
- [ ] App restarts and loads without 500 errors
- [ ] Investment Genie form still loads (`/investment-genie`)
- [ ] Can generate allocation and create strategy
- [ ] Allocation data visible in database (via Drizzle Studio)
- [ ] Holdings editor shows pre-populated data
- [ ] Create 3 test portfolios (10x, 100x, Steady Growth)
- [ ] Verify P&L tracking works on `/portfolio` page

---

## Timeline

- **Code Commit:** May 28, 2026 — 20:45 UTC
- **GitHub Push:** May 28, 2026 — 20:50 UTC
- **VPS Deployment:** In progress (automatic via GitHub Actions)
- **Database Migration:** Pending (manual: SSH + `npm run drizzle:push`)
- **Verification:** After both steps complete

---

## Notes for Next Session

1. **Allocation Editor UI (Future Phase):** Currently allocation is stored but not displayed. In Phase 2, enhance the holdings editor to show "Recommended vs Your Choices" side-by-side.
2. **100% Validation:** Currently holdings can be edited freely. Consider enforcing that user's targetWeightPct must sum to 100% (per user's requirement).
3. **Feedback Loop:** Phase 3 will track how users modify allocations and use that to personalize future recommendations.

---

**Status:** Ready for VPS migration and testing  
**Next Step:** SSH to VPS and run `npm run drizzle:push`
