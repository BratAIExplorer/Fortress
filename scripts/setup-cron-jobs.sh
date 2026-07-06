#!/bin/bash
# Setup cron jobs for NSE and US market scans on VPS
# Run once on VPS: bash /opt/fortress/scripts/setup-cron-jobs.sh

set -e

echo "🔧 Setting up market scan cron jobs..."

# Ensure log directory exists
mkdir -p /var/log/fortress
chmod 755 /var/log/fortress

# Make scan scripts executable
chmod +x /opt/fortress/scripts/run-nse-scan.sh
chmod +x /opt/fortress/scripts/run-us-scan.sh

echo ""
echo "Cron jobs to install:"
echo "  1. NSE scan:  0 11 * * 1-5 (4:30 PM IST / 11:00 UTC)"
echo "  2. US scan:  30 11 * * 1-5 (6:00 PM EST / 11:30 UTC)"
echo ""

# Check if jobs already exist
CURRENT_CRON=$(crontab -l 2>/dev/null || echo "")

if echo "$CURRENT_CRON" | grep -q "run-nse-scan.sh"; then
  echo "✓ NSE scan cron job already exists"
else
  echo "Installing NSE scan cron job..."
  (crontab -l 2>/dev/null; echo "0 11 * * 1-5 /opt/fortress/scripts/run-nse-scan.sh") | crontab -
  echo "✓ NSE scan installed"
fi

if echo "$CURRENT_CRON" | grep -q "run-us-scan.sh"; then
  echo "✓ US scan cron job already exists"
else
  echo "Installing US scan cron job..."
  (crontab -l 2>/dev/null; echo "30 11 * * 1-5 /opt/fortress/scripts/run-us-scan.sh") | crontab -
  echo "✓ US scan installed"
fi

echo ""
echo "Verifying cron jobs..."
echo ""
crontab -l | grep -E "run-(nse|us)-scan" || echo "⚠️  No scan jobs found"

echo ""
echo "✅ Cron job setup complete!"
echo ""
echo "Logs will be written to:"
echo "  /var/log/fortress/nse-scan-*.log"
echo "  /var/log/fortress/us-scan-*.log"
echo ""
echo "To view logs:"
echo "  ls -la /var/log/fortress/"
echo "  tail -f /var/log/fortress/nse-scan-*.log"
