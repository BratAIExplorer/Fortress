# Infrastructure & Deployment Architecture

## Port Mapping Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ PUBLIC INTERNET                                                 │
│ https://fortressintelligence.space                              │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTPS/443
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ NGINX REVERSE PROXY (Ubuntu 22.04)                              │
│ ────────────────────────────────────────────────────────────    │
│ Config: /etc/nginx/sites-enabled/fortress                       │
│ Source: fortress-app/nginx.conf (VERSION CONTROLLED)            │
│ Port: 0.0.0.0:443 (HTTPS) + :80 (HTTP → HTTPS redirect)        │
│ ────────────────────────────────────────────────────────────    │
│ ⚠️ proxy_pass: http://127.0.0.1:3000                            │
│    ^^ MUST match PORT in .env.production                        │
└────────────────────────────────┬────────────────────────────────┘
                                 │ http://127.0.0.1:3000
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ PM2 PROCESS MANAGER                                             │
│ ────────────────────────────────────────────────────────────    │
│ Command: pm2 start /opt/fortress/start.sh --name fortress       │
│ Script: fortress-app/start.sh                                   │
│ Config: fortress-app/ecosystem.config.js                        │
│ ────────────────────────────────────────────────────────────    │
│ Listens on: 0.0.0.0:3000 (Next.js standalone server)           │
│ Env Source: /opt/fortress/fortress-app/.env.local or            │
│             /opt/fortress/fortress-app/.env.production          │
│ (start.sh sources both if they exist)                           │
└────────────────────────────────┬────────────────────────────────┘
                                 │ DATABASE_URL
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ POSTGRESQL (127.0.0.1:5432)                                     │
│ ────────────────────────────────────────────────────────────    │
│ Database: fortress                                              │
│ User: fortress_user                                             │
│ Tables: 27 (stocks, scan_results, scans, etc.)                 │
│ Size: 200K+ rows, 27 tables fully populated                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuration Files (Source of Truth)

### 1. `.env.production` (APPLICATION CONFIG)
**Location:** `fortress-app/.env.production`  
**Purpose:** Single source of truth for production variables  
**Read by:**
- `start.sh` (sourced on app startup)
- Deploy script (validates port matches nginx.conf)
- CI/CD health checks (tests the correct port)

**Critical Variables:**
```env
PORT=3000                    # ⚠️ If changed, also update nginx.conf
DATABASE_URL=...             # PostgreSQL connection string
NEXTAUTH_URL=https://...     # Must be production domain
```

### 2. `nginx.conf` (REVERSE PROXY CONFIG)
**Location:** `fortress-app/nginx.conf`  
**Purpose:** Version-controlled Nginx configuration  
**Deployed to:** `/etc/nginx/sites-enabled/fortress`

**Critical Line:**
```nginx
proxy_pass http://127.0.0.1:3000;  # ⚠️ Must match PORT in .env.production
```

### 3. `start.sh` (STARTUP SCRIPT)
**Location:** `fortress-app/start.sh`  
**Purpose:** Load environment and start Next.js standalone server  
**Reads:** `.env.local` and `.env.production` (if present)
**Starts:** `node .next/standalone/server.js`

### 4. `ecosystem.config.js` (PM2 CONFIG)
**Location:** `fortress-app/ecosystem.config.js`  
**Purpose:** PM2 process management configuration  
**Runs:** `/opt/fortress/start.sh`

---

## Deployment Flow

### Step 1: Code Push
```bash
git push origin main
```

### Step 2: GitHub Actions CI/CD
1. Build Next.js app
2. Run tests
3. Deploy to VPS
4. **NEW:** Health check endpoints

### Step 3: VPS Deployment Script
1. Pull latest code
2. **NEW:** Read `PORT` from `.env.production`
3. **NEW:** Validate Nginx config syntax
4. **NEW:** Deploy nginx.conf to `/etc/nginx/sites-enabled/fortress`
5. Restart PM2 process
6. Reload Nginx
7. **NEW:** Verify health endpoints respond

---

## How to Change the Port

If you need to change from port 3000 to another port (e.g., 3001):

### 1. Update `.env.production`
```env
PORT=3001  # Change from 3000 to 3001
```

### 2. Update `nginx.conf`
```nginx
proxy_pass http://127.0.0.1:3001;  # Update to match
```

### 3. Commit and push
```bash
git add fortress-app/.env.production fortress-app/nginx.conf
git commit -m "ops: change app port from 3000 to 3001"
git push origin main
```

### 4. Deploy script will:
- Read PORT from `.env.production`
- Validate Nginx config
- Restart PM2
- Reload Nginx
- Health check the new port

---

## Verification Checklist

After deployment, verify all layers are working:

```bash
# 1. App is running on correct port
curl -f http://127.0.0.1:3000/api/scan/results?market=NSE

# 2. Nginx proxies correctly
curl -f https://fortressintelligence.space/api/scan/results?market=NSE

# 3. Database is connected
curl -f http://127.0.0.1:3000/api/scan/results?market=NSE | grep -q "scanId"

# 4. SSL/TLS is working
curl -I https://fortressintelligence.space | grep "HTTP/1.1 200"

# 5. PM2 process is healthy
pm2 list  # Should show fortress as "online"
```

---

## Environment Priority

If both `.env.local` and `.env.production` exist, `start.sh` sources both:
1. `.env.production` is sourced first (production defaults)
2. `.env.local` is sourced second (can override)

This allows `.env.local` to override production for testing without changing production config.

---

## Monitoring & Alerts

### Health Check Endpoint
```
GET http://127.0.0.1:3000/_health
```

Should return 200 within 2 seconds if app is healthy.

### Nginx Endpoint
```
GET https://fortressintelligence.space/_health
```

Should return 200 if both Nginx and app are healthy.

---

## Troubleshooting

### Symptom: `502 Bad Gateway`
**Diagnosis:**
```bash
# 1. Is app running?
pm2 list

# 2. Is app on correct port?
lsof -i :3000  # Check if process is listening on 3000
curl http://127.0.0.1:3000

# 3. Does Nginx config match?
grep proxy_pass /etc/nginx/sites-enabled/fortress
cat .env.production | grep PORT

# 4. Are they the same?
# They MUST match, e.g., both 3000
```

### Symptom: Port mismatch detected after deployment
**Prevention:**
- Deploy script validates port before reloading Nginx
- Health check fails if ports don't match
- CI/CD rollback on health check failure

---

## Key Files Checklist

- ✅ `fortress-app/nginx.conf` — Version controlled
- ✅ `fortress-app/.env.production` — Source of truth
- ✅ `fortress-app/start.sh` — Sources .env vars
- ✅ `fortress-app/ecosystem.config.js` — PM2 config
- ✅ `.github/workflows/deploy.yml` — Health checks
- ✅ `deploy.sh` — Deployment script with validation
- ✅ `DEPLOYMENT_CHECKLIST.md` — Manual verification steps

---

## Last Updated
May 21, 2026 — Infrastructure-as-Code implementation
