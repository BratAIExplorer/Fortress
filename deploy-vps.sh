#!/bin/bash
# deploy-vps.sh — Fortress Intelligence Scanner Pipeline VPS Deployment
# Complete end-to-end automation: deploy, schema, env, cron, verify

set -e

VPS_HOST="76.13.179.32"
VPS_USER="root"
SCANNER_HOME="/opt/fortress-scanner"
DATABASE_URL="postgresql://fortress_user:FortressSecure2026!@127.0.0.1:5432/fortress_db"

echo "=========================================="
echo "Fortress Intelligence VPS Deployment"
echo "=========================================="

# Step 1: Sync scanner pipeline to VPS
echo ""
echo "[1/7] Copying scanner pipeline to VPS..."
ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "mkdir -p ${SCANNER_HOME}"
cd Reference/OutoftheBox
tar --exclude='.git' --exclude='__pycache__' --exclude='*.pyc' -czf /tmp/scanner-pipeline.tar.gz .
scp -o StrictHostKeyChecking=no /tmp/scanner-pipeline.tar.gz ${VPS_USER}@${VPS_HOST}:/tmp/
ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "cd ${SCANNER_HOME} && tar -xzf /tmp/scanner-pipeline.tar.gz && rm /tmp/scanner-pipeline.tar.gz"
rm /tmp/scanner-pipeline.tar.gz
cd ../..
echo "✅ Scanner pipeline deployed"

# Step 2: Create .env file on VPS
echo ""
echo "[2/7] Configuring environment..."
ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} << EOSSH
cat > ${SCANNER_HOME}/.env <<EOF
DATABASE_URL=${DATABASE_URL}
YFINANCE_TIMEOUT=30
NSE_BATCH_SIZE=50
US_BATCH_SIZE=100
SCAN_LOG_LEVEL=INFO
EOF
echo "✅ Environment configured"
EOSSH

# Step 3: Install Python dependencies
echo ""
echo "[3/7] Installing Python dependencies..."
ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} <<'EOSSH'
cd /opt/fortress-scanner
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ Dependencies installed"
EOSSH

# Step 4: Create database schema
echo ""
echo "[4/7] Creating database schema..."
ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} <<'EOSSH'
cd /opt/fortress-scanner
source venv/bin/activate
export DATABASE_URL="postgresql://fortress_user:FortressSecure2026!@127.0.0.1:5432/fortress_db"

python3 << 'EOPY'
import psycopg2
import os

db_url = os.environ.get("DATABASE_URL")
conn = psycopg2.connect(db_url)
cur = conn.cursor()

# Create scans table
cur.execute("""
    CREATE TABLE IF NOT EXISTS scans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        market VARCHAR(10) NOT NULL,
        status VARCHAR(20) NOT NULL,
        started_at TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP,
        duration_ms INTEGER
    )
""")

# Create scan_results table
cur.execute("""
    CREATE TABLE IF NOT EXISTS scan_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        scan_id UUID NOT NULL REFERENCES scans(id),
        symbol VARCHAR(20) NOT NULL,
        market VARCHAR(10) NOT NULL,
        price_at_scan DECIMAL(12,2),
        l1_pass BOOLEAN, l2_pass BOOLEAN, l3_pass BOOLEAN,
        l4_pass BOOLEAN, l5_pass BOOLEAN, l6_pass BOOLEAN,
        total_score INTEGER,
        category VARCHAR(30),
        mb_score INTEGER,
        mb_tier VARCHAR(20),
        coffee_can_score INTEGER,
        cc_tier VARCHAR(20),
        cc_revenue_cagr DECIMAL(5,2),
        cc_years_checked INTEGER,
        megatrend_tag VARCHAR(50),
        megatrend_emoji VARCHAR(10),
        fcf_yield_pct DECIMAL(5,2),
        earnings_quality DECIMAL(5,2),
        peg_ratio DECIMAL(5,2),
        de_direction VARCHAR(20),
        margin_direction VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
    )
""")

# Create indexes
cur.execute("CREATE INDEX IF NOT EXISTS idx_scan_results_market ON scan_results(market)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_scan_results_scan_id ON scan_results(scan_id)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_scan_results_symbol ON scan_results(symbol)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_scans_market ON scans(market)")

conn.commit()
print("✅ Database schema created")
cur.close()
conn.close()
EOPY
EOSSH

# Step 5: Run manual NSE scan verification
echo ""
echo "[5/7] Running manual NSE scan verification..."
ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} <<'EOSSH'
cd /opt/fortress-scanner
source venv/bin/activate
export DATABASE_URL="postgresql://fortress_user:FortressSecure2026!@127.0.0.1:5432/fortress_db"

python3 scanner_db_writer.py --market NSE 2>&1 | head -50
echo ""
echo "Checking database for scan results..."
psql ${DATABASE_URL} -c "SELECT market, COUNT(*) as row_count FROM scan_results GROUP BY market;"
EOSSH

# Step 6: Configure cron jobs
echo ""
echo "[6/7] Configuring cron jobs..."
ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} <<'EOSSH'
# Create cron script wrapper
cat > /opt/fortress-scanner/cron-runner.sh <<'EOF'
#!/bin/bash
cd /opt/fortress-scanner
source venv/bin/activate
export DATABASE_URL="postgresql://fortress_user:FortressSecure2026!@127.0.0.1:5432/fortress_db"
MARKET=$1
LOG_FILE="/var/log/fortress-scanner/${MARKET}-$(date +%Y%m%d-%H%M%S).log"
mkdir -p /var/log/fortress-scanner
python3 scanner_db_writer.py --market $MARKET >> $LOG_FILE 2>&1
EOF
chmod +x /opt/fortress-scanner/cron-runner.sh

# Add cron jobs (using root crontab)
(crontab -l 2>/dev/null || true; echo "0 0 * * 1-5 /opt/fortress-scanner/cron-runner.sh NSE") | crontab -
(crontab -l 2>/dev/null || true; echo "30 14 * * 1-5 /opt/fortress-scanner/cron-runner.sh US") | crontab -

echo "✅ Cron jobs configured"
EOSSH

# Step 7: Final verification
echo ""
echo "[7/7] Final verification..."
ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} <<'EOSSH'
echo "VPS Status:"
echo "  Scanner home: $(ls -la /opt/fortress-scanner/ | grep -E 'scanner.py|scanner_db_writer.py|requirements.txt' | wc -l) core files"
echo "  Virtualenv: $(test -d /opt/fortress-scanner/venv && echo '✅ Active' || echo '❌ Missing')"
echo "  Database connection:"
psql postgresql://fortress_user:FortressSecure2026!@127.0.0.1:5432/fortress_db -c "SELECT 'Database OK' as status;" 2>&1
echo "  Cron jobs:"
crontab -l 2>/dev/null | grep -E 'NSE|US' || echo "No cron jobs found"
echo ""
echo "✅ VPS Deployment Complete!"
EOSSH

echo ""
echo "=========================================="
echo "✅ FORTRESS INTELLIGENCE SCANNER LIVE"
echo "=========================================="
echo ""
echo "VPS: 76.13.179.32"
echo "Scanner Home: /opt/fortress-scanner"
echo "Database: fortress_db (fortress_user)"
echo "Cron: NSE (9:30 AM IST), US (9:30 AM EST)"
echo ""
echo "Next: Monitor scans at /var/log/fortress-scanner/"
