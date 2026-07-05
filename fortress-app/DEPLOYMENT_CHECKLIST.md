# Deployment Checklist

Use this checklist after every deployment to verify all systems are working correctly.

## Pre-Deployment (Before pushing code)

- [ ] `.env.production` exists in `fortress-app/`
- [ ] `nginx.conf` exists in `fortress-app/`
- [ ] `nginx.conf` has correct `proxy_pass` port
- [ ] Port in `.env.production` matches `proxy_pass` in `nginx.conf`
- [ ] All code changes are committed
- [ ] Tests pass locally: `npm run test`
- [ ] Build succeeds locally: `npm run build`

## Post-Deployment (After GitHub Actions completes)

### 1. Application is running

```bash
# SSH into VPS
ssh root@76.13.179.32

# Check PM2 process
pm2 list
# ✓ Should show "fortress" with status "online"

# Check if listening on port 3000
lsof -i :3000
# ✓ Should show node process listening
```

**Expected Output:**
```
│ id │ name        │ status  │
├────┼─────────────┼─────────┤
│ 0  │ fortress    │ online  │
```

### 2. Direct app access (localhost)

```bash
# Test API endpoint
curl -f http://127.0.0.1:3000/api/scan/results?market=NSE

# Expected: Returns JSON with scanId and results array
```

**Expected Output:**
```json
{
  "scanId": "...",
  "degraded": false,
  "results": [...]
}
```

### 3. Nginx configuration

```bash
# Verify Nginx config syntax
nginx -t

# Check proxy_pass port
grep "proxy_pass" /etc/nginx/sites-enabled/fortress

# Should show: proxy_pass http://127.0.0.1:3000;
```

**Expected Output:**
```
nginx: configuration file /etc/nginx/conf.d/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/conf.d/nginx.conf test is successful
```

### 4. Nginx reload

```bash
# Reload Nginx
systemctl reload nginx

# Check status
systemctl status nginx | grep active
```

**Expected Output:**
```
Active: active (running) since Thu 2026-05-21 08:00:00 UTC
```

### 5. Public domain access

```bash
# Test homepage
curl -I https://fortressintelligence.space
# ✓ Should return HTTP 200

# Test V5 extension
curl -I https://fortressintelligence.space/v5-extension
# ✓ Should return HTTP 200

# Test API through Nginx
curl -f https://fortressintelligence.space/api/scan/results?market=NSE
# ✓ Should return JSON with stock data
```

**Expected Output:**
```
HTTP/1.1 200 OK
Server: nginx/1.24.0
```

### 6. Database connectivity

```bash
# Verify app can query database
curl -s https://fortressintelligence.space/api/scan/results?market=NSE | \
  jq '.results | length'
# ✓ Should show a number > 0
```

**Expected Output:**
```
1085
```

### 7. Check for errors

```bash
# View PM2 logs for errors
pm2 logs fortress --err --lines 20

# Should NOT contain:
# - "relation 'stocks' does not exist"
# - "ECONNREFUSED"
# - "connection refused"
```

**Expected:** No error lines, only startup messages

### 8. Health check endpoints

```bash
# App health check
curl -f http://127.0.0.1:3000/_health
# ✓ Should return 200

# Nginx health check (via proxy)
curl -f https://fortressintelligence.space/_health
# ✓ Should return 200
```

---

## Deployment Verification Summary

| Component | Check | Command | Expected |
|-----------|-------|---------|----------|
| **PM2** | Is app running? | `pm2 list` | status: online |
| **Port** | App listening? | `lsof -i :3000` | node process found |
| **API** | Local access? | `curl http://127.0.0.1:3000/api/...` | 200 OK, JSON response |
| **Nginx** | Config valid? | `nginx -t` | syntax ok |
| **Domain** | Public access? | `curl https://fortressintelligence.space` | 200 OK |
| **Database** | Connected? | `curl https://.../api/scan/results` | JSON with data |
| **Logs** | Any errors? | `pm2 logs fortress --err` | No error lines |

---

## If Deployment Fails

### Symptom: `502 Bad Gateway`

**Step 1: Check if app is running**
```bash
pm2 list
pm2 logs fortress --err --lines 30
```

**Step 2: Check port mismatch**
```bash
# Get port from env
cat fortress-app/.env.production | grep PORT

# Get port from nginx
grep proxy_pass /etc/nginx/sites-enabled/fortress

# They MUST match!
```

**Step 3: Verify database connection**
```bash
# Test app can connect to database
curl -f http://127.0.0.1:3000/api/scan/results?market=NSE

# If fails, check:
PGPASSWORD='FortressSecure2026!' psql -U fortress_user -d fortress \
  -h 127.0.0.1 -c "SELECT COUNT(*) FROM stocks;"
```

**Step 4: Check Nginx logs**
```bash
tail -50 /var/log/nginx/error.log
```

### Symptom: Port mismatch

**This should never happen with the new deployment script**, but if it does:

```bash
# 1. Read the correct port from .env.production
PORT=$(grep "^PORT=" fortress-app/.env.production | cut -d= -f2)

# 2. Update nginx.conf on the server
sed -i "s/proxy_pass http:\/\/127.0.0.1:[0-9]*/proxy_pass http:\/\/127.0.0.1:${PORT}/g" \
  /etc/nginx/sites-enabled/fortress

# 3. Validate and reload
nginx -t && systemctl reload nginx

# 4. Test
curl -I https://fortressintelligence.space
```

---

## Rollback Procedure

If deployment breaks production:

```bash
# 1. Stop the app
pm2 stop fortress

# 2. Check git status
cd /opt/fortress/fortress-app
git status

# 3. Revert to previous commit
git reset --hard HEAD~1

# 4. Restart
pm2 start ecosystem.config.js

# 5. Verify
curl -I https://fortressintelligence.space
```

---

## Success Criteria

✅ Deployment is successful when:
- [ ] PM2 process shows "online"
- [ ] `curl -I https://fortressintelligence.space` returns HTTP 200
- [ ] `curl https://fortressintelligence.space/api/scan/results?market=NSE` returns JSON
- [ ] No errors in `pm2 logs fortress --err`
- [ ] All database queries respond
- [ ] UI loads and renders correctly

---

**Last Updated:** May 21, 2026
