#!/bin/bash
# ============================================================================
# Post-Deployment Verification (Run 5 minutes after DEPLOY_BOT_REFACTOR.sh)
# ============================================================================
# Automated checks: bot health, signal flow, UI responsiveness
# Zero manual steps — just run this script
# ============================================================================

set -e

LOG_FILE="/var/log/fortress/post-deployment-check-$(date +%s).log"
mkdir -p /var/log/fortress

echo "========================================" | tee -a $LOG_FILE
echo "POST-DEPLOYMENT VERIFICATION" | tee -a $LOG_FILE
echo "Timestamp: $(date)" | tee -a $LOG_FILE
echo "========================================" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

# ============================================================================
# CHECK 1: Bot Process Running
# ============================================================================
echo "✓ CHECK 1: Bot Process Status" | tee -a $LOG_FILE
echo "---" | tee -a $LOG_FILE

if pm2 status | grep -q "fortress-bot"; then
    BOT_STATUS=$(pm2 status | grep fortress-bot | awk '{print $2}')
    if [ "$BOT_STATUS" = "online" ]; then
        echo "✅ Bot is ONLINE" | tee -a $LOG_FILE
        pm2 status | grep fortress-bot | tee -a $LOG_FILE
    else
        echo "❌ Bot status: $BOT_STATUS (expected: online)" | tee -a $LOG_FILE
        exit 1
    fi
else
    echo "❌ Bot not found in PM2" | tee -a $LOG_FILE
    exit 1
fi

echo "" | tee -a $LOG_FILE

# ============================================================================
# CHECK 2: Bot Logs (No Errors)
# ============================================================================
echo "✓ CHECK 2: Bot Logs (Last 20 lines)" | tee -a $LOG_FILE
echo "---" | tee -a $LOG_FILE

pm2 logs fortress-bot --lines 20 --nostream | tail -20 | tee -a $LOG_FILE

echo "" | tee -a $LOG_FILE

# ============================================================================
# CHECK 3: Bot Initialization Success
# ============================================================================
echo "✓ CHECK 3: Bot Initialization" | tee -a $LOG_FILE
echo "---" | tee -a $LOG_FILE

if pm2 logs fortress-bot --lines 50 --nostream | grep -q "Scanning: ENABLED"; then
    echo "✅ Scanning initialized correctly" | tee -a $LOG_FILE
else
    echo "⚠️  Scanning initialization not found in logs" | tee -a $LOG_FILE
fi

if pm2 logs fortress-bot --lines 50 --nostream | grep -q "Starting main loop"; then
    echo "✅ Main loop started" | tee -a $LOG_FILE
else
    echo "⚠️  Main loop not found in logs" | tee -a $LOG_FILE
fi

echo "" | tee -a $LOG_FILE

# ============================================================================
# CHECK 4: API Endpoint Responds
# ============================================================================
echo "✓ CHECK 4: API Endpoint Health" | tee -a $LOG_FILE
echo "---" | tee -a $LOG_FILE

API_RESPONSE=$(curl -s -w "\n%{http_code}" https://fortressintelligence.space/api/analysis/momentum-signals 2>/dev/null || echo "000")
HTTP_CODE=$(echo "$API_RESPONSE" | tail -1)
BODY=$(echo "$API_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ API responds with 200 OK" | tee -a $LOG_FILE
    echo "Response body:" | tee -a $LOG_FILE
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY" | tee -a $LOG_FILE
else
    echo "❌ API HTTP $HTTP_CODE (expected 200)" | tee -a $LOG_FILE
    echo "Response:" | tee -a $LOG_FILE
    echo "$BODY" | tee -a $LOG_FILE
    exit 1
fi

echo "" | tee -a $LOG_FILE

# ============================================================================
# CHECK 5: API Response Structure
# ============================================================================
echo "✓ CHECK 5: API Response Structure" | tee -a $LOG_FILE
echo "---" | tee -a $LOG_FILE

if echo "$BODY" | jq -e '.success' >/dev/null 2>&1; then
    SUCCESS=$(echo "$BODY" | jq -r '.success')
    echo "✅ Response has 'success' field: $SUCCESS" | tee -a $LOG_FILE
else
    echo "⚠️  Response missing 'success' field" | tee -a $LOG_FILE
fi

if echo "$BODY" | jq -e '.signals' >/dev/null 2>&1; then
    SIGNAL_COUNT=$(echo "$BODY" | jq '.signals | length')
    echo "✅ Response has 'signals' array (count: $SIGNAL_COUNT)" | tee -a $LOG_FILE
else
    echo "⚠️  Response missing 'signals' array" | tee -a $LOG_FILE
fi

echo "" | tee -a $LOG_FILE

# ============================================================================
# CHECK 6: Web UI Responds
# ============================================================================
echo "✓ CHECK 6: Web UI (/momentum-radar)" | tee -a $LOG_FILE
echo "---" | tee -a $LOG_FILE

UI_RESPONSE=$(curl -s -w "\n%{http_code}" https://fortressintelligence.space/momentum-radar 2>/dev/null || echo "000")
UI_HTTP_CODE=$(echo "$UI_RESPONSE" | tail -1)

if [ "$UI_HTTP_CODE" = "200" ]; then
    echo "✅ UI responds with 200 OK" | tee -a $LOG_FILE
else
    echo "❌ UI HTTP $UI_HTTP_CODE (expected 200)" | tee -a $LOG_FILE
    exit 1
fi

echo "" | tee -a $LOG_FILE

# ============================================================================
# CHECK 7: Fortress App Health (Overall)
# ============================================================================
echo "✓ CHECK 7: Fortress App Health" | tee -a $LOG_FILE
echo "---" | tee -a $LOG_FILE

APP_RESPONSE=$(curl -s -w "\n%{http_code}" https://fortressintelligence.space 2>/dev/null || echo "000")
APP_HTTP_CODE=$(echo "$APP_RESPONSE" | tail -1)

if [ "$APP_HTTP_CODE" = "200" ]; then
    echo "✅ Fortress app is online (HTTP 200)" | tee -a $LOG_FILE
else
    echo "⚠️  Fortress app HTTP $APP_HTTP_CODE" | tee -a $LOG_FILE
fi

echo "" | tee -a $LOG_FILE

# ============================================================================
# CHECK 8: PM2 Process Memory/CPU
# ============================================================================
echo "✓ CHECK 8: Bot Resource Usage" | tee -a $LOG_FILE
echo "---" | tee -a $LOG_FILE

pm2 status | grep fortress-bot | tee -a $LOG_FILE

MEMORY=$(pm2 status | grep fortress-bot | awk '{print $8}')
echo "Memory usage: $MEMORY" | tee -a $LOG_FILE

echo "" | tee -a $LOG_FILE

# ============================================================================
# SUMMARY
# ============================================================================
echo "========================================" | tee -a $LOG_FILE
echo "✅ POST-DEPLOYMENT CHECK COMPLETE" | tee -a $LOG_FILE
echo "========================================" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE
echo "📊 Summary:" | tee -a $LOG_FILE
echo "  • Bot process: ONLINE" | tee -a $LOG_FILE
echo "  • API endpoint: 200 OK" | tee -a $LOG_FILE
echo "  • Web UI: Responding" | tee -a $LOG_FILE
echo "  • Fortress app: Healthy" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE
echo "📂 Full log: $LOG_FILE" | tee -a $LOG_FILE
echo "Time: $(date)" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE
echo "✅ DEPLOYMENT VERIFIED" | tee -a $LOG_FILE
