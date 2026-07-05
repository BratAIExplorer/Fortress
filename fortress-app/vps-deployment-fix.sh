#!/bin/bash
# VPS Deployment Fix Script
# Run this entire script on the VPS as root

set -e  # Exit on first error

echo "=========================================="
echo "Fortress VPS Deployment Recovery"
echo "=========================================="

# Step 1: Navigate to app directory
echo ""
echo "[Step 1] Navigating to app directory..."
cd /opt/fortress/fortress-app
pwd

# Step 2: Check current deployed commit
echo ""
echo "[Step 2] Current deployed commit:"
git log -1 --oneline

# Step 3: Fetch latest from GitHub
echo ""
echo "[Step 3] Fetching latest from origin..."
git fetch origin

# Step 4: Show what we're about to deploy
echo ""
echo "[Step 4] Latest commits from origin/main:"
git log origin/main -3 --oneline

# Step 5: Reset to latest
echo ""
echo "[Step 5] Resetting to origin/main..."
git reset --hard origin/main
echo "Current commit after reset:"
git log -1 --oneline

# Step 6: Install dependencies
echo ""
echo "[Step 6] Installing npm dependencies..."
npm install --legacy-peer-deps

# Step 7: Build for production
echo ""
echo "[Step 7] Building for production..."
npm run build

# Step 8: Stop old process
echo ""
echo "[Step 8] Stopping old PM2 process..."
pm2 stop fortress

# Step 9: Restart with new build
echo ""
echo "[Step 9] Restarting PM2..."
pm2 restart fortress

# Step 10: Wait for startup
echo ""
echo "[Step 10] Waiting 10 seconds for app to start..."
sleep 10

# Step 11: Check PM2 status
echo ""
echo "[Step 11] PM2 Status:"
pm2 show fortress

# Step 12: Check logs
echo ""
echo "[Step 12] Last 30 lines of error log:"
pm2 logs fortress --lines 30 --err

# Step 13: Test local connectivity
echo ""
echo "[Step 13] Testing local connectivity (should show HTML)..."
curl -s http://localhost:3001/ | head -20

echo ""
echo "=========================================="
echo "Deployment recovery complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check if page loads: https://fortressintelligence.space/"
echo "2. Verify new tabs: https://fortressintelligence.space/v5-extension"
echo "3. If 502 persists, check logs: pm2 logs fortress --follow"
