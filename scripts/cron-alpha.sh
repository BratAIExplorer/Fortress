#!/usr/bin/env bash
# ─── Fortress Alpha Cron Setup ────────────────────────────────────────────────
# Run this ONCE on the VPS to install the price tracking cron job.
# Prerequisites: Python3, yfinance, requests installed at /opt/fortress/scanner/
#
# Usage on VPS:
# Usage on VPS:
#   chmod +x /opt/fortress/fortress-app/scripts/cron-alpha.sh
#   /opt/fortress/fortress-app/scripts/cron-alpha.sh

set -euo pipefail

FORTRESS_PATH="/opt/fortress/fortress-app"
VENV_PATH="/opt/fortress/fortress-app/venv"
LOG_PATH="/var/log/fortress-alpha-tracker.log"
PYTHON_SCRIPT="$FORTRESS_PATH/scanner/price_tracker.py"
ENV_FILE="$FORTRESS_PATH/.env.local"

echo "=== Fortress Alpha Cron Setup ==="

# 1. Create Python virtual environment if it doesn't exist
if [ ! -d "$VENV_PATH" ]; then
    echo "Creating Python venv at $VENV_PATH..."
    python3 -m venv "$VENV_PATH"
fi

# 2. Install dependencies into venv
echo "Installing Python dependencies..."
"$VENV_PATH/bin/pip" install --quiet --upgrade pip
"$VENV_PATH/bin/pip" install --quiet yfinance requests pandas

# 3. Create log file with correct permissions
touch "$LOG_PATH"
chmod 644 "$LOG_PATH"

# 4. Ensure the script is executable
chmod +x "$PYTHON_SCRIPT"

# 5. Read required secrets from .env.local
if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: $ENV_FILE not found. Trying parent directory..."
    ENV_FILE="/opt/fortress/.env.local"
    if [ ! -f "$ENV_FILE" ]; then
        echo "ERROR: .env.local not found in app or parent directory."
        exit 1
    fi
fi

ADMIN_SECRET=$(grep "^ADMIN_SECRET=" "$ENV_FILE" | cut -d '=' -f2-)

if [ -z "$ADMIN_SECRET" ]; then
    echo "ERROR: ADMIN_SECRET not found in .env.local"
    exit 1
fi

# 6. Write the cron job
CRON_JOB="0 8 * * * FORTRESS_API_URL=http://localhost:3000 ADMIN_SECRET=$ADMIN_SECRET $VENV_PATH/bin/python3 $PYTHON_SCRIPT >> $LOG_PATH 2>&1"

# Remove any existing fortress-alpha cron entry
(crontab -l 2>/dev/null | grep -v "price_tracker.py") | crontab -

# Add new cron entry
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo ""
echo "✓ Cron job installed. Runs daily at 08:00 VPS time."
echo "✓ Log file: $LOG_PATH"
echo ""
echo "Verify with: crontab -l"
echo "Monitor with: tail -f $LOG_PATH"
echo ""
echo "Manual test (safe, non-destructive):"
echo "  FORTRESS_API_URL=http://localhost:3000 ADMIN_SECRET=$ADMIN_SECRET $VENV_PATH/bin/python3 $PYTHON_SCRIPT"
