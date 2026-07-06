#!/bin/bash
# Run NSE market scan (triggered by cron at 11:00 UTC / 4:30 PM IST)
# This script is run by: crontab -e → 0 11 * * 1-5 /opt/fortress/scripts/run-nse-scan.sh

set -e

CRON_SECRET="${CRON_SECRET:-fortress-scan-secret-2026}"
APP_URL="${APP_URL:-https://fortressintelligence.space}"
LOG_FILE="/var/log/fortress/nse-scan-$(date +%Y%m%d-%H%M%S).log"

# Ensure log dir exists
mkdir -p /var/log/fortress

{
  echo "[$(date)] Starting NSE market scan..."
  echo "URL: $APP_URL"

  # Trigger scan
  HTTP_CODE=$(curl -s -X POST "$APP_URL/api/scan/run" \
    -H "x-cron-secret: $CRON_SECRET" \
    -H "Content-Type: application/json" \
    -d '{"market":"NSE"}' \
    -w "%{http_code}" \
    -o /tmp/nse-scan-response.json)

  if [ "$HTTP_CODE" = "202" ]; then
    echo "[$(date)] ✅ Scan accepted (HTTP 202). Running in background..."
    cat /tmp/nse-scan-response.json | jq . 2>/dev/null || cat /tmp/nse-scan-response.json
  else
    echo "[$(date)] ⚠️ Unexpected HTTP $HTTP_CODE"
    cat /tmp/nse-scan-response.json
  fi

  echo "[$(date)] NSE scan request completed."
} | tee -a "$LOG_FILE"

exit 0
