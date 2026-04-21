#!/bin/bash
# Fortress DB Authentication Fix Script
# Fixes PostgreSQL password authentication errors

set -e

echo "=========================================="
echo "🔧 Fortress Database Auth Fix"
echo "=========================================="

cd /opt/fortress/fortress-app

# Step 1: Verify .env.local exists and has correct password
echo ""
echo "✓ Step 1: Verifying .env.local..."
if [ ! -f .env.local ]; then
    echo "❌ ERROR: .env.local not found!"
    exit 1
fi

if grep -q "Fortress_2027%24" .env.local; then
    echo "✅ .env.local has correct URL-encoded password"
else
    echo "❌ ERROR: .env.local password not correct"
    cat .env.local | grep DATABASE_URL
    exit 1
fi

# Step 2: Stop and clean old PM2 process
echo ""
echo "✓ Step 2: Cleaning old PM2 processes..."
pm2 stop fortress 2>/dev/null || true
pm2 delete fortress 2>/dev/null || true
sleep 1

# Step 3: Start app with ecosystem config
echo ""
echo "✓ Step 3: Starting fortress with fresh environment..."
pm2 start /opt/fortress/fortress-app/ecosystem.config.js --name fortress
sleep 4

# Step 4: Check PM2 status
echo ""
echo "✓ Step 4: Checking PM2 status..."
pm2 status

# Step 5: Test database connection directly
echo ""
echo "✓ Step 5: Testing direct PostgreSQL connection..."
if psql postgresql://fortress_user:'Fortress_2027$'@localhost:5432/fortress -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Step 6: Check app logs for errors
echo ""
echo "✓ Step 6: Checking app logs (last 30 lines)..."
echo ""
pm2 logs fortress --lines 30 --nostream

# Step 7: Final verdict
echo ""
echo "=========================================="
if pm2 logs fortress --lines 5 --nostream | grep -q "password authentication failed"; then
    echo "❌ FAILED: App still has DB auth errors"
    echo ""
    echo "Next step: Need to rebuild the app"
    echo "Run: npm run build"
    exit 1
else
    echo "✅ SUCCESS: Database authentication fixed!"
    echo ""
    echo "The app should now be running without DB errors."
    echo "Monitor logs: pm2 logs fortress"
    exit 0
fi
