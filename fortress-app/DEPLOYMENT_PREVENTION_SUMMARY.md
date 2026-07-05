# Deployment Prevention Strategy — May 21, 2026

## Problem Statement

On May 21, 2026, production experienced a `502 Bad Gateway` error due to **port configuration drift**:

- **Nginx proxy_pass:** `http://127.0.0.1:3001` (outdated Docker port)
- **PM2 app port:** `3000` (new port from .env.production)
- **Result:** Nginx proxied requests to the wrong port, causing connection failures

This was caused by:
1. Migration from Docker (port 3001) to PM2 (port 3000)
2. Nginx configuration not automatically updated
3. No validation step to catch port mismatches before production
4. Configuration spread across multiple files with no single source of truth

---

## Solution: Infrastructure-as-Code (IaC) Approach

Implemented **three-layer prevention strategy** to ensure this never happens again:

### Layer 1: Version Control (Prevent Drift)

**Files Created:**

- **`fortress-app/.env.production`** — Single source of truth
  ```env
  PORT=3000                    # MUST match nginx.conf proxy_pass
  DATABASE_URL=...             # PostgreSQL connection string
  NEXTAUTH_URL=https://...     # Production domain
  ```
  
- **`fortress-app/nginx.conf`** — Version-controlled reverse proxy
  ```nginx
  proxy_pass http://127.0.0.1:3000;  # MUST match PORT in .env.production
  location /_health { ... }          # Health check endpoint
  ```

**Benefit:** Both config files are in git, so changes are auditable and can be rolled back.

---

### Layer 2: Automated Validation (Catch Errors Early)

**Files Created:**

- **`.github/workflows/deploy.yml`** — GitHub Actions CI/CD pipeline with validation
  
  **Step 1: Extract PORT from source of truth**
  ```bash
  PORT=$(grep "^PORT=" fortress-app/.env.production | cut -d= -f2)
  ```
  
  **Step 2: Validate Nginx has matching port**
  ```bash
  NGINX_PORT=$(grep "proxy_pass" fortress-app/nginx.conf | grep -oP ':\K[0-9]+')
  if [ "$NGINX_PORT" != "$APP_PORT" ]; then
      echo "ERROR: Port mismatch detected!"
      exit 1
  fi
  ```
  
  **Step 3: Validate Nginx syntax**
  ```bash
  nginx -t  # Check for syntax errors
  ```
  
  **Step 4: Run health checks**
  ```bash
  curl http://127.0.0.1:$PORT/_health  # Local app
  curl https://fortressintelligence.space/_health  # Public domain
  ```
  
  **Step 5: Rollback on failure**
  ```bash
  git reset --hard HEAD~1
  pm2 restart
  nginx reload
  ```

**Benefit:** If port mismatch is detected, deployment fails **before reaching production** instead of discovering it via 502 error.

---

### Layer 3: Documentation (Explicit Intent)

**Files Created:**

- **`INFRASTRUCTURE.md`** — Architecture documentation
  - Port mapping diagram
  - Configuration file relationships
  - How to change ports safely
  - Troubleshooting guide
  
- **`DEPLOYMENT_CHECKLIST.md`** — Step-by-step verification
  - Pre-deployment checks
  - Post-deployment verification at each layer
  - Health check commands
  - Success criteria
  - Rollback procedure

- **`deploy.sh`** — VPS deployment script
  - Can be called manually or by GitHub Actions
  - Validates port config on VPS before reloading Nginx
  - Performs comprehensive health checks
  - Automatic rollback on failure

**Benefit:** Clear documentation of how the system works and what to verify at each deployment step.

---

## How It Prevents Future Issues

### Scenario: Someone changes the port

#### Old Approach (FAILS):
```
1. Update .env.production: PORT=3001
2. Forget to update nginx.conf
3. Deploy to production
4. Public domain returns 502 Bad Gateway
5. Investigate production logs (expensive and stressful)
```

#### New Approach (SUCCEEDS):
```
1. Update .env.production: PORT=3001
2. Forget to update nginx.conf
3. Push to GitHub
4. GitHub Actions runs deploy.yml
5. Step 2: "Validate Nginx proxy_pass port matches .env.production"
   ERROR: PORT mismatch detected!
   - .env.production PORT: 3001
   - nginx.conf proxy_pass port: 3000
6. Deployment FAILS before reaching production
7. Developer sees error: "Update nginx.conf proxy_pass to match PORT"
8. Fix both files, commit, and redeploy
```

---

## Configuration Validation Hierarchy

```
┌─────────────────────────────────────────────────────┐
│ Developer commits to fortress-app/main              │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ GitHub Actions: .github/workflows/deploy.yml        │
├─────────────────────────────────────────────────────┤
│ ✓ Extract PORT from .env.production                 │
│ ✓ Check nginx.conf has matching port                │
│ ✓ Validate Nginx syntax                             │
│ ✓ Build Next.js app                                 │
│ ✓ Deploy to VPS                                     │
│ ✓ Run health checks                                 │
│ ✗ If validation fails: ROLLBACK automatically       │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ VPS: deploy.sh (called by GitHub Actions)           │
├─────────────────────────────────────────────────────┤
│ ✓ Validate .env.production port                     │
│ ✓ Check/update Nginx config                         │
│ ✓ Validate Nginx syntax                             │
│ ✓ Restart PM2                                       │
│ ✓ Run health checks before declaring success        │
│ ✗ If health check fails: ROLLBACK automatically     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ Manual Verification: DEPLOYMENT_CHECKLIST.md        │
├─────────────────────────────────────────────────────┤
│ ✓ 8-point verification at each layer                │
│ ✓ Success criteria checklist                        │
│ ✓ Rollback procedure                                │
└─────────────────────────────────────────────────────┘
```

---

## Files Changed Summary

### In fortress-app/ (committed to GitHub)

| File | Purpose | Committed |
|------|---------|-----------|
| `.env.production` | Single source of truth for production config | ✅ May 21 |
| `nginx.conf` | Version-controlled reverse proxy config | ✅ May 21 |
| `start.sh` | Enhanced startup script with validation | ✅ May 21 |
| `ecosystem.config.js` | PM2 process manager config (unchanged) | Already present |

### In root/ (committed to GitHub)

| File | Purpose | Committed |
|------|---------|-----------|
| `.github/workflows/deploy.yml` | GitHub Actions CI/CD with port validation | ✅ May 21 |
| `deploy.sh` | VPS deployment script with validation | ✅ May 21 |
| `INFRASTRUCTURE.md` | Architecture documentation | ✅ May 21 |
| `DEPLOYMENT_CHECKLIST.md` | Step-by-step verification guide | ✅ May 21 |

---

## Key Design Decisions

### 1. Single Source of Truth
- `.env.production` is the authoritative source for all production config
- Comments in `nginx.conf` and `deploy.sh` explicitly reference it
- No manual Nginx config editing allowed; must go through `.env.production`

### 2. Defense in Depth
- **GitHub Actions** validates before deployment (fail fast)
- **VPS deploy.sh** validates again on the server (belt and suspenders)
- **Health checks** verify app is actually working, not just running
- **Rollback** is automatic on any failure (safe by default)

### 3. Clear Responsibility
- Port is configured in `.env.production` (one place)
- `.env.production` is sourced by `start.sh` (enforced by design)
- `nginx.conf` must match `.env.production` (validated by CI/CD)
- No ambiguity about where configuration comes from

### 4. Auditability
- All config in git (who changed what, when, why)
- Commit messages explain the reasoning
- `.github/workflows/deploy.yml` logs every validation step
- `deploy.sh` creates timestamped backups of Nginx config

---

## Testing the Prevention Strategy

### Test 1: Port Mismatch Detection

```bash
# On a test branch, intentionally create a mismatch
cd fortress-app
echo "PORT=3001" >> .env.production

# Commit and push
git add -A && git commit -m "test: intentional port mismatch"
git push origin test-branch

# GitHub Actions will:
# ✓ Extract PORT=3001 from .env.production
# ✗ Find proxy_pass port=3000 in nginx.conf
# ✗ FAIL with clear error message
# ✗ Not deploy anything to production
```

### Test 2: Manual Deployment

```bash
# To manually deploy using deploy.sh
ssh root@76.13.179.32
cd /opt/fortress
./deploy.sh <COMMIT_SHA> 3000

# Script will:
# ✓ Validate PORT in .env.production
# ✓ Check/update Nginx config
# ✓ Restart PM2
# ✓ Run health checks
# ✓ Report success or rollback on failure
```

### Test 3: Health Checks

```bash
# The health check endpoint is available at:
curl http://127.0.0.1:3000/_health    # Local (via SSH)
curl https://fortressintelligence.space/_health  # Public

# Should return HTTP 200 if app is healthy
# Used by CI/CD to verify deployment worked
```

---

## Maintenance & Updates

### To Change Port (Example: 3000 → 3001)

1. **Update .env.production**
   ```env
   PORT=3001  # Changed from 3000
   ```

2. **Update nginx.conf**
   ```nginx
   proxy_pass http://127.0.0.1:3001;  # Changed from 3000
   ```

3. **Commit and push**
   ```bash
   git add fortress-app/.env.production fortress-app/nginx.conf
   git commit -m "ops: change app port from 3000 to 3001"
   git push origin main
   ```

4. **GitHub Actions will:**
   - Extract PORT=3001 from .env.production
   - Validate nginx.conf has proxy_pass :3001
   - Deploy to VPS with new port
   - Run health checks on port 3001

5. **Deploy.sh will:**
   - Verify .env.production PORT=3001
   - Update Nginx if needed
   - Reload Nginx and restart PM2
   - Health check on port 3001

**No manual steps required.** The entire flow is automated and validated.

---

## Next Steps

### Short Term (Already Done)
- ✅ Version control infrastructure config
- ✅ Implement GitHub Actions validation
- ✅ Create VPS deployment script
- ✅ Document architecture and checklist
- ✅ Commit and deploy prevention system

### Medium Term (Month 2)
- [ ] Monitor first 3-5 deployments for any edge cases
- [ ] Update CI/CD if new failure modes are discovered
- [ ] Add alerting for health check failures
- [ ] Document any manual interventions needed

### Long Term (Month 3+)
- [ ] Automate additional config validation (DATABASE_URL, NEXTAUTH_SECRET, etc.)
- [ ] Add configuration drift detection (periodic checks that VPS matches git)
- [ ] Implement zero-downtime deployments (blue-green)
- [ ] Add secrets rotation automation

---

## Summary

**Before (May 21 incident):**
- Port configuration spread across multiple files
- No validation before deployment
- Discovered issues via 502 errors in production

**After (May 21 fix):**
- Single source of truth (.env.production)
- Automated validation at 2 levels (GitHub Actions + VPS)
- Health checks verify app is actually working
- Automatic rollback on any failure
- Clear documentation of the system
- All configuration in version control for auditability

**Result:** Same port mismatch issue will be **caught and rejected BEFORE production**, with a clear error message telling developers exactly what to fix.

---

**Status:** ✅ Infrastructure-as-code deployed and ready  
**Last Updated:** May 21, 2026  
**Next Validation:** When next deployment is pushed to GitHub
