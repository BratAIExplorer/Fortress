#!/bin/bash
# Run US market scan (triggered by cron at 11:30 UTC / 6:00 PM EST)
# This script is run by: crontab -e → 30 11 * * 1-5 /opt/fortress/scripts/run-us-scan.sh

set -e

CRON_SECRET="${CRON_SECRET:-fortress-scan-secret-2026}"
APP_URL="${APP_URL:-https://fortressintelligence.space}"
LOG_FILE="/var/log/fortress/us-scan-$(date +%Y%m%d-%H%M%S).log"

# Ensure log dir exists
mkdir -p /var/log/fortress

{
  echo "[$(date)] Starting US market scan..."
  echo "URL: $APP_URL"

  # Trigger scan
  HTTP_CODE=$(curl -s -X POST "$APP_URL/api/scan/run" \
    -H "x-cron-secret: $CRON_SECRET" \
    -H "Content-Type: application/json" \
    -d '{"market":"US"}' \
    -w "%{http_code}" \
    -o /tmp/us-scan-response.json)

  if [ "$HTTP_CODE" = "202" ]; then
    echo "[$(date)] ✅ Scan accepted (HTTP 202). Running in background..."
    cat /tmp/us-scan-response.json | jq . 2>/dev/null || cat /tmp/us-scan-response.json
  else
    echo "[$(date)] ⚠️ Unexpected HTTP $HTTP_CODE"
    cat /tmp/us-scan-response.json
  fi

  echo "[$(date)] US scan request completed."
} | tee -a "$LOG_FILE"

exit 0
