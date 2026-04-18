# Fortress Intelligence v0.2.0 - Deployment Verification

**Release Date:** April 18, 2026  
**Version:** v0.2.0 (Beta Launch)  
**Commit:** 14af7d0  
**Tag:** v0.2.0

## ✅ Pre-Deployment Checklist

- [x] All unit tests passing (44/44)
- [x] All E2E tests passing (13/13)
- [x] Production build successful
- [x] Code pushed to main branch
- [x] Version bumped to 0.2.0
- [x] Release tag created
- [x] GitHub Actions CI/CD triggered

## 🚀 Deployment Steps

GitHub Actions will automatically:
1. Checkout code from main
2. Install dependencies
3. Run build
4. Deploy via SSH to VPS
5. Run deploy-vps.sh script
6. Restart PM2 server

## ✔️ Post-Deployment Verification

### Health Checks (Once deployed)

```bash
# Check application is running
curl -I https://fortressintelligence.space/

# Check Investment Genie is active
curl https://fortressintelligence.space/investment-genie

# Check Macro endpoint
curl https://fortressintelligence.space/api/macro

# Check Intelligence endpoint
curl https://fortressintelligence.space/api/intelligence/latest
```

### Expected Behavior

1. **Investment Genie Page** should show the form (not "Coming Soon")
2. **Macro Snapshot** should load macro data (no "Network error")
3. **API endpoints** should return 200 or 401 (auth error, not 500)
4. **Page should load** in < 3 seconds

### Rollback Plan (if needed)

If deployment fails:
```bash
# SSH into VPS
ssh -i ~/.ssh/deploy_key user@fortressintelligence.space

# Check PM2 status
pm2 status

# View logs
pm2 logs fortress-app

# Rollback to previous version
cd /opt/fortress
git reset --hard 5fc2a33  # Previous known-good commit
npm run build
npm run deploy:reload
```

## 📋 Key Routes Deployed

- [x] `/investment-genie` - Portfolio builder
- [x] `/api/macro` - Macro data endpoint
- [x] `/api/intelligence/latest` - Intelligence signals
- [x] `/api/investment/scan-results` - Stock scan results
- [x] `/api/investment/intelligence` - Risk ratings

## 🔍 Monitoring

Check VPS logs (after deployment):
- Application: `/var/log/fortress/pm2-app.log`
- Cron jobs: `/var/log/fortress/cron-*.log`
- Database: Supabase dashboard

## ✅ Completion

Deployment is complete when:
1. GitHub Actions workflow finishes successfully
2. https://fortressintelligence.space/ loads without errors
3. Investment Genie page displays form (not "Coming Soon")
4. Macro page shows data or appropriate loading state
