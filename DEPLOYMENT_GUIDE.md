# Fortress Intelligence - Deployment Guide

**Target:** VPS 76.13.179.32 | **Domain:** fortressintelligence.space | **Status:** Production Live

---

## Quick Start (Already Deployed)

The system is live and running on VPS 76.13.179.32 as of **May 1, 2026**. This guide covers:
1. How the system is currently set up
2. How to verify it's working
3. How to troubleshoot issues
4. How to scale or modify

---

## Current Deployment State

### System Health ✅

**Frontend Status:**
```bash
curl -s https://fortressintelligence.space | head -20
```
Expected: HTML response with "Fortress Intelligence"

**API Status:**
```bash
curl -s https://fortressintelligence.space/api/stocks/screen?market=US | head -20
```
Expected: JSON with stock data

**Database Status:**
```bash
ssh root@76.13.179.32 "sudo -u postgres psql -d fortress -c 'SELECT COUNT(*) FROM stocks;'"
```
Expected: Integer (346+ for US market)

### Running Processes

**List all running services:**
```bash
ssh root@76.13.179.32 "pm2 list"
```

**Output should show:**
- fortress (Next.js app on port 3001)
- [Optional] Scanner cronjob (Python process)

**Check logs:**
```bash
# Application logs
ssh root@76.13.179.32 "pm2 logs fortress --lines 50"

# Scanner logs
ssh root@76.13.179.32 "tail -f /opt/fortress/scanner/scan.log"
```

### File Locations

**VPS Directory Structure:**
```
/opt/fortress/
├── fortress-app/              # Cloned from GitHub
│   ├── .env.local            # DATABASE_URL (production creds)
│   ├── .next/                # Built Next.js app
│   ├── start.sh              # Startup script (PM2 entry point)
│   ├── node_modules/
│   └── package.json
│
├── scanner/                   # Python scanner pipeline
│   ├── scanner.py            # Scoring engine
│   ├── scanner_db_writer.py  # DB orchestration
│   ├── run_scan.sh           # Cron entry point
│   ├── venv/                 # Python virtualenv
│   └── scan.log              # Scanner activity log
│
└── Reference/OutoftheBox/     # Watchlists
    ├── all_nse_stocks.csv
    ├── nifty500.csv
    └── sp500.csv
```

---

## Deployment Workflow

### Full Redeployment (If Needed)

**1. Clone the latest code:**
```bash
ssh root@76.13.179.32

cd /opt/fortress
mv fortress-app fortress-app.backup  # Backup current
git clone https://github.com/BratAIExplorer/Fortress fortress-app
cd fortress-app
```

**2. Set environment variables:**
```bash
cat > /opt/fortress/fortress-app/.env.local << 'EOF'
DATABASE_URL=postgresql://fortress_user:FortressSecure2026!@127.0.0.1:5432/fortress_db
NEXT_PUBLIC_API_URL=https://fortressintelligence.space
EOF
```

**3. Install dependencies and build:**
```bash
cd /opt/fortress/fortress-app
npm install
npm run build
```

**4. Create startup script:**
```bash
cat > /opt/fortress/fortress-app/start.sh << 'EOF'
#!/bin/bash
set -a
if [ -f "$(dirname "$0")/.env.local" ]; then
  source "$(dirname "$0")/.env.local"
fi
set +a

export PORT=3001
SERVER_PATH="$(dirname "$0")/.next/standalone/server.js"

if [ ! -f "$SERVER_PATH" ]; then
  echo "❌ Error: $SERVER_PATH not found"
  exit 1
fi

echo "🚀 Starting Fortress on port $PORT"
exec node "$SERVER_PATH"
EOF

chmod +x /opt/fortress/fortress-app/start.sh
```

**5. Start with PM2:**
```bash
pm2 delete fortress 2>/dev/null || true
pm2 start /opt/fortress/fortress-app/start.sh --name fortress --instances 1

# Save PM2 configuration
pm2 save
pm2 startup
```

**6. Verify it's running:**
```bash
pm2 list
pm2 logs fortress
```

**7. Update Nginx (if domain changed):**
```bash
nano /etc/nginx/sites-available/fortressintelligence.space
# Update server_name and upstream if needed
nginx -t
systemctl reload nginx
```

---

## Nginx Configuration

### SSL/TLS Certificate Setup

**First-time setup with Let's Encrypt:**
```bash
ssh root@76.13.179.32

# Install certbot
apt-get install -y certbot python3-certbot-nginx

# Generate certificate
certbot certonly --standalone -d fortressintelligence.space

# Point Nginx to certificate
nano /etc/nginx/sites-available/fortressintelligence.space
```

**Renewal (automatic with systemd timer):**
```bash
# Check renewal schedule
systemctl list-timers | grep certbot

# Manual renewal if needed
certbot renew --dry-run
certbot renew
```

### Reverse Proxy Setup

**Full Nginx config for fortressintelligence.space:**

```nginx
upstream fortress_backend {
    server 127.0.0.1:3001;
    keepalive 32;
}

server {
    listen 80;
    server_name fortressintelligence.space;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fortressintelligence.space;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/fortressintelligence.space/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fortressintelligence.space/privkey.pem;
    
    # SSL best practices
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_proxied any;
    gzip_vary on;
    
    # Logging
    access_log /var/log/nginx/fortress_access.log;
    error_log /var/log/nginx/fortress_error.log;
    
    # Reverse proxy to Next.js
    location / {
        proxy_pass http://fortress_backend;
        
        # Forward headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed in future)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static assets (if needed)
    location ~* \.(jpg|jpeg|png|gif|css|js|svg)$ {
        proxy_pass http://fortress_backend;
        proxy_cache_valid 200 1d;
        expires 1d;
    }
}
```

**Test and reload:**
```bash
nginx -t
systemctl reload nginx
```

---

## Database Operations

### PostgreSQL Credentials

**User:** fortress_user  
**Database:** fortress_db  
**Host:** 127.0.0.1 (local)  
**Port:** 5432

**Connect from local machine:**
```bash
# Via SSH tunnel (from your local machine)
ssh -L 5432:127.0.0.1:5432 root@76.13.179.32

# Then in another terminal
psql "postgresql://fortress_user:FortressSecure2026!@localhost:5432/fortress_db"
```

**Common queries:**

**Check data volume:**
```sql
SELECT COUNT(*) as total_stocks FROM stocks;
SELECT COUNT(*) as us_stocks FROM stocks WHERE market='US';
SELECT COUNT(*) as nse_stocks FROM stocks WHERE market='NSE';
```

**Latest scan status:**
```sql
SELECT market, status, started_at, completed_at, duration_ms 
FROM scans 
ORDER BY started_at DESC 
LIMIT 10;
```

**Top ranked stocks:**
```sql
SELECT symbol, total_score, l1_score, l6_score, mb_score, mb_tier
FROM scan_results 
WHERE market='US'
ORDER BY total_score DESC 
LIMIT 30;
```

**Delete stale NSE data (if needed):**
```sql
DELETE FROM scan_results WHERE market='NSE' AND created_at < NOW() - INTERVAL '7 days';
DELETE FROM scans WHERE market='NSE' AND created_at < NOW() - INTERVAL '7 days';
```

### Backup Strategy

**Daily automated backups (set up as cron job):**
```bash
cat > /opt/fortress/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/fortress/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/fortress_db_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR

sudo -u postgres pg_dump fortress_db | gzip > $BACKUP_FILE

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "✅ Backup completed: $BACKUP_FILE"
EOF

chmod +x /opt/fortress/backup.sh

# Add to crontab (run daily at 2 AM)
# 0 2 * * * /opt/fortress/backup.sh
```

---

## Scanner Configuration

### Cron Jobs

**View current cron schedule:**
```bash
ssh root@76.13.179.32 "crontab -l"
```

**Expected output:**
```
# US scan: 9:30 AM EST, Mon-Fri
30 14 * * 1-5 /opt/fortress/scanner/run_scan.sh US >> /opt/fortress/scanner/scan.log 2>&1

# NSE scan: 9:30 AM IST, Tue-Fri (skip Monday)
30 4 * * 2-5 /opt/fortress/scanner/run_scan.sh NSE >> /opt/fortress/scanner/scan.log 2>&1
```

**Update if needed:**
```bash
ssh root@76.13.179.32 "crontab -e"
# Add or modify the lines above
# Save and exit
```

### Manual Scan Trigger

**Trigger a scan immediately:**
```bash
ssh root@76.13.179.32 "cd /opt/fortress/scanner && python3 scanner_db_writer.py --market NSE"
```

**Monitor progress:**
```bash
ssh root@76.13.179.32 "tail -f /opt/fortress/scanner/scan.log"
```

**Expected output:**
```
[10:30:15] Starting NSE scan...
[10:30:16] Loaded 500 stocks from nifty500.csv
[10:31:45] Completed 500/500 scans - 89.5 seconds
[10:31:46] Inserted 500 rows into scan_results
[10:31:47] ✅ Scan completed successfully
```

---

## Monitoring & Troubleshooting

### Health Check Script

**Create a health check (run periodically):**
```bash
cat > /opt/fortress/health-check.sh << 'EOF'
#!/bin/bash

echo "🔍 Fortress Intelligence Health Check"
echo "======================================"

# Check 1: Frontend availability
echo -n "Frontend HTTPS: "
curl -s -I https://fortressintelligence.space | head -1

# Check 2: API endpoint
echo -n "API Stocks Endpoint: "
RESPONSE=$(curl -s https://fortressintelligence.space/api/stocks/screen?market=US)
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ OK"
else
  echo "❌ FAILED"
  echo "Response: $RESPONSE"
fi

# Check 3: Database connection
echo -n "Database Connection: "
ssh root@76.13.179.32 "sudo -u postgres psql -d fortress_db -c 'SELECT 1;' >/dev/null 2>&1" && echo "✅ OK" || echo "❌ FAILED"

# Check 4: Process status
echo -n "PM2 Fortress Process: "
ssh root@76.13.179.32 "pm2 list | grep fortress" | grep -q "online" && echo "✅ OK" || echo "❌ FAILED"

# Check 5: Recent scans
echo -n "Latest Scan Status: "
SCAN_STATUS=$(ssh root@76.13.179.32 "sudo -u postgres psql -d fortress_db -c \"SELECT status FROM scans ORDER BY created_at DESC LIMIT 1;\" -t | tr -d ' '")
echo "$SCAN_STATUS"

echo "======================================"
EOF

chmod +x /opt/fortress/health-check.sh
```

**Run it:**
```bash
./health-check.sh
```

### Common Issues & Fixes

**Issue: 502 Bad Gateway**
```bash
# Check if process is running
ssh root@76.13.179.32 "pm2 list"

# Restart if down
ssh root@76.13.179.32 "pm2 restart fortress"

# Check error logs
ssh root@76.13.179.32 "pm2 logs fortress --err"

# Check if port 3001 is listening
ssh root@76.13.179.32 "netstat -tlnp | grep 3001"
```

**Issue: Database connection fails**
```bash
# Check PostgreSQL status
ssh root@76.13.179.32 "systemctl status postgresql"

# Check if listening on 5432
ssh root@76.13.179.32 "sudo -u postgres psql -c 'SELECT version();'"

# Check .env.local has correct URL
ssh root@76.13.179.32 "cat /opt/fortress/fortress-app/.env.local | grep DATABASE_URL"
```

**Issue: Scanner doesn't run (yfinance rate limit)**
```bash
# This is expected - auto-recovery
# Check scan log
ssh root@76.13.179.32 "tail -100 /opt/fortress/scanner/scan.log | grep -i 'rate\|error\|timeout'"

# Retry manually after 30-60 minutes
ssh root@76.13.179.32 "python3 /opt/fortress/scanner/scanner_db_writer.py --market NSE"
```

**Issue: High API response time**
```bash
# Check database query performance
ssh root@76.13.179.32 "sudo -u postgres psql -d fortress_db -c 'EXPLAIN ANALYZE SELECT * FROM scan_results WHERE market=\\'US\\' LIMIT 30;'"

# Add index if needed
ssh root@76.13.179.32 "sudo -u postgres psql -d fortress_db -c 'CREATE INDEX idx_scan_results_market ON scan_results(market);'"
```

---

## Scaling Considerations

### Vertical Scaling (Single VPS)

**Current Limits:**
- CPU: 4 cores (adequate for current load)
- RAM: 8 GB (adequate)
- Disk: 160 GB (adequate for 6+ months of scan history)

**When to scale:**
- If frontend response time > 1000ms
- If API requests timeout frequently
- If database disk usage > 80%

**How to scale:**
1. Upgrade VPS plan (double RAM/CPU with same provider)
2. Redeploy: Fresh clone, rebuild, PM2 restart
3. Database backup → restore on new instance

### Horizontal Scaling (Multiple Servers)

**If needed in future:**

```
                    ┌──────────────────────────────┐
                    │   Nginx Load Balancer        │
                    │  (www.fortressintelligence)  │
                    └──────────────┬─────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
          ┌─────────▼───────┐         ┌──────────▼──────┐
          │  App Server 1   │         │   App Server 2  │
          │  (port 3001)    │         │   (port 3001)   │
          └─────────┬───────┘         └──────────┬──────┘
                    │                            │
                    └──────────────┬─────────────┘
                                   │
                         ┌─────────▼──────────┐
                         │  PostgreSQL (RDS)  │
                         │  (Multi-zone)      │
                         └────────────────────┘
```

**Effort:** 20+ hours (load balancer, database failover, secrets management)

---

## Rollback Procedure

**If deployment breaks:**

```bash
ssh root@76.13.179.32

# Stop current version
pm2 stop fortress

# Restore backup
cd /opt/fortress
rm -rf fortress-app
mv fortress-app.backup fortress-app

# Restart
pm2 start fortress
pm2 logs fortress
```

---

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] CI/CD pipeline passes (GitHub Actions)
- [ ] Database migrations applied
- [ ] `.env.local` updated with production secrets
- [ ] Fresh clone & npm install
- [ ] `npm run build` completes without errors
- [ ] `start.sh` is executable
- [ ] PM2 process starts and stays running (no crashes)
- [ ] Nginx reverse proxy correctly forwards traffic
- [ ] SSL certificate is valid (`curl -I https://...`)
- [ ] Frontend loads at https://fortressintelligence.space
- [ ] API endpoint responds at /api/stocks/screen
- [ ] Database has data (SELECT COUNT(*) FROM stocks)
- [ ] Health check script passes all tests
- [ ] Cron jobs are set for automated scans
- [ ] Backup script is configured and tested

---

## Further Reading
- [ARCHITECTURE.md](ARCHITECTURE.md) — System design
- [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) — Local environment
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — Endpoint specs
- [ROADMAP.md](ROADMAP.md) — Feature timeline
