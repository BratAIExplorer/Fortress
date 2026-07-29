#!/bin/bash
# Deploy EXACT Fortress bot with standalone logic restoration
# This script copies the fixed macd_excel_bot.py to the VPS and restarts the bot

set -e

VPS_IP="76.13.179.32"
VPS_USER="root"
BOT_REMOTE_PATH="/opt/fortress/scripts/macd-bot/macd_excel_bot.py"
BOT_LOCAL_PATH="./scripts/macd-bot/macd_excel_bot.py"

echo "=== DEPLOY BOT FIX: Restore Exact Standalone Logic ==="
echo "Local bot: $BOT_LOCAL_PATH"
echo "Remote bot: $BOT_REMOTE_PATH"
echo ""

# Copy fixed bot to VPS
echo "📦 Copying fixed bot to VPS..."
scp -o ConnectTimeout=10 "$BOT_LOCAL_PATH" "$VPS_USER@$VPS_IP:$BOT_REMOTE_PATH"

if [ $? -eq 0 ]; then
  echo "✅ Bot copied successfully"
else
  echo "❌ SCP failed. Ensure VPS is online and SSH key is configured."
  exit 1
fi

# Restart bot via PM2
echo "🔄 Restarting bot via PM2 on VPS..."
ssh -o ConnectTimeout=10 "$VPS_USER@$VPS_IP" "cd /opt/fortress && pm2 restart fortress-bot --update-env && pm2 save"

if [ $? -eq 0 ]; then
  echo "✅ Bot restarted successfully"
  echo ""
  echo "=== DEPLOYMENT SUMMARY ==="
  echo "✅ Fortress bot updated with EXACT standalone logic"
  echo "✅ Fixes applied:"
  echo "   - 0-3 day recency filter (was 0-1 days only)"
  echo "   - All 6 EMAs calculated (was 3 only)"
  echo "   - Dynamic EMA target/SL selection (was hardcoded)"
  echo "✅ Bot should now find ~57 signals instead of 0"
  echo "✅ Check signals at: https://fortressintelligence.space/momentum-radar"
else
  echo "❌ PM2 restart failed"
  exit 1
fi
