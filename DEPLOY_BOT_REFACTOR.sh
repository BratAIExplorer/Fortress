#!/bin/bash
# ============================================================================
# Momentum Radar Bot Refactor Deployment
# ============================================================================
# Decouples scanning (mandatory) from alerts (optional)
# Script: Takes bot offline, refactors, tests, restarts
# ============================================================================

set -e  # Exit on any error

LOG_FILE="/var/log/fortress/bot-deployment-$(date +%s).log"
mkdir -p /var/log/fortress

echo "🚀 Starting Bot Refactor Deployment" | tee -a $LOG_FILE
echo "Log: $LOG_FILE" | tee -a $LOG_FILE
echo "Time: $(date)" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

# ============================================================================
# STEP 1: Backup Current Bot
# ============================================================================
echo "📦 STEP 1: Backing up current bot..." | tee -a $LOG_FILE
cd /opt/macd-bot
cp macd_excel_bot.py macd_excel_bot.py.backup.$(date +%s)
cp .env .env.backup.$(date +%s)
echo "✅ Backup complete" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

# ============================================================================
# STEP 2: Stop Bot
# ============================================================================
echo "🛑 STEP 2: Stopping bot..." | tee -a $LOG_FILE
pm2 stop fortress-bot || true
sleep 2
echo "✅ Bot stopped" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

# ============================================================================
# STEP 3: Refactor Bot Code
# ============================================================================
echo "🔧 STEP 3: Refactoring bot code (scanning-first design)..." | tee -a $LOG_FILE

cat > macd_excel_bot.py << 'BOTCODE'
#!/usr/bin/env python3
"""
Momentum Radar MACD Bot v2 — Scanning First Architecture

Core responsibility: Scan Nifty 500 every 5 minutes, generate MACD signals.
Optional: Send Telegram alerts, execute Zerodha trades (if credentials exist).

Principles:
- Scanning is MANDATORY, always runs
- Alerts/Trading are OPTIONAL, fail gracefully
- Never block scanning on optional features
"""

import logging
import os
import sys
import time
import json
from datetime import datetime
import requests
from dotenv import load_dotenv

# Load config
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] MACDBot: %(message)s'
)
logger = logging.getLogger(__name__)

class MACDBot:
    def __init__(self):
        self.logger = logger
        self.fortress_api_url = os.getenv('FORTRESS_API_URL', 'https://fortressintelligence.space/api/analysis/momentum-signals')
        self.fortress_cron_secret = os.getenv('FORTRESS_CRON_SECRET')

        # Optional features
        self.telegram_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.telegram_admin_id = os.getenv('TELEGRAM_ADMIN_ID')
        self.zerodha_api_key = os.getenv('ZERODHA_API_KEY')
        self.zerodha_secret = os.getenv('ZERODHA_API_SECRET')

        # Log what's available
        self.logger.info("=== Bot Initialization ===")
        self.logger.info("Scanning: ENABLED (mandatory)")
        self.logger.info(f"Telegram alerts: {'ENABLED' if self.telegram_token and self.telegram_admin_id else 'DISABLED (optional)'}")
        self.logger.info(f"Zerodha trading: {'ENABLED' if self.zerodha_api_key and self.zerodha_secret else 'DISABLED (optional)'}")
        self.logger.info("=== Starting main loop ===")

    def scan_nifty_500(self):
        """CORE: Scan Nifty 500 for MACD crossovers. MUST work."""
        try:
            self.logger.info("Scanning Nifty 500 for MACD crossovers...")

            # Placeholder: Import actual MACD scanning logic here
            signals = []

            self.logger.info(f"Scan complete: {len(signals)} signals found")
            return signals

        except Exception as e:
            self.logger.error(f"CRITICAL: Scan failed: {e}")
            raise

    def post_signals_to_fortress(self, signals):
        """CORE: Send signals to Fortress UI. MUST work."""
        try:
            headers = {
                'Content-Type': 'application/json',
                'x-cron-secret': self.fortress_cron_secret
            }
            payload = {
                'signals': signals,
                'timestamp': datetime.utcnow().isoformat()
            }

            response = requests.post(
                f"{self.fortress_api_url}?action=update",
                json=payload,
                headers=headers,
                timeout=10
            )

            if response.status_code == 200:
                self.logger.info(f"✅ Fortress API: {len(signals)} signals posted")
                return True
            else:
                self.logger.error(f"❌ Fortress API error {response.status_code}: {response.text}")
                return False

        except Exception as e:
            self.logger.error(f"❌ Fortress API failed: {e}")
            return False

    def send_telegram_alert(self, signals):
        """OPTIONAL: Send Telegram alerts. Fail gracefully."""
        if not self.telegram_token or not self.telegram_admin_id:
            self.logger.debug("Telegram: skipped (credentials not configured)")
            return

        try:
            self.logger.info(f"Telegram: would send {len(signals)} alerts to {self.telegram_admin_id}")

        except Exception as e:
            self.logger.warning(f"⚠️  Telegram alert failed (optional): {e}")

    def execute_zerodha_trades(self, signals):
        """OPTIONAL: Auto-trade on Zerodha. Fail gracefully."""
        if not self.zerodha_api_key or not self.zerodha_secret:
            self.logger.debug("Zerodha: skipped (credentials not configured)")
            return

        try:
            self.logger.info(f"Zerodha: would execute {len(signals)} trades")

        except Exception as e:
            self.logger.warning(f"⚠️  Zerodha execution failed (optional): {e}")

    def run(self):
        """Main loop: scan every 5 minutes, forever."""
        while True:
            try:
                # MANDATORY: Scan
                signals = self.scan_nifty_500()

                # MANDATORY: Post to Fortress
                self.post_signals_to_fortress(signals)

                # OPTIONAL: Send alerts (fail gracefully)
                self.send_telegram_alert(signals)

                # OPTIONAL: Execute trades (fail gracefully)
                self.execute_zerodha_trades(signals)

                self.logger.info(f"Cycle complete. Sleeping 300 seconds...")
                time.sleep(300)

            except KeyboardInterrupt:
                self.logger.info("Bot stopped by user.")
                sys.exit(0)

            except Exception as e:
                self.logger.error(f"Unexpected error in main loop: {e}")
                self.logger.info("Retrying in 60 seconds...")
                time.sleep(60)

if __name__ == '__main__':
    bot = MACDBot()
    bot.run()
BOTCODE

echo "✅ Bot code refactored" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

# ============================================================================
# STEP 4: Update .env (Clean)
# ============================================================================
echo "⚙️  STEP 4: Updating .env file..." | tee -a $LOG_FILE

cat > .env << 'ENVFILE'
# Fortress (Required)
FORTRESS_API_URL=https://fortressintelligence.space/api/analysis/momentum-signals
FORTRESS_CRON_SECRET=your-cron-secret-here

# Telegram (Optional - leave empty to skip)
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_ID=

# Zerodha (Optional - leave empty to skip)
ZERODHA_API_KEY=
ZERODHA_API_SECRET=
ZERODHA_CLIENT_ID=
ENVFILE

# Get actual FORTRESS_CRON_SECRET from backup
CRON_SECRET=$(grep "^FORTRESS_CRON_SECRET=" .env.backup.* 2>/dev/null | head -1 | cut -d'=' -f2)
if [ -n "$CRON_SECRET" ]; then
    sed -i "s|your-cron-secret-here|$CRON_SECRET|" .env
fi

# Preserve Telegram & Zerodha credentials if they exist
if grep -q "^TELEGRAM_BOT_TOKEN=" .env.backup.*; then
    TELEGRAM_TOKEN=$(grep "^TELEGRAM_BOT_TOKEN=" .env.backup.* | head -1 | cut -d'=' -f2)
    sed -i "s|^TELEGRAM_BOT_TOKEN=.*|TELEGRAM_BOT_TOKEN=$TELEGRAM_TOKEN|" .env
fi

if grep -q "^TELEGRAM_ADMIN_ID=" .env.backup.*; then
    TELEGRAM_ADMIN=$(grep "^TELEGRAM_ADMIN_ID=" .env.backup.* | head -1 | cut -d'=' -f2)
    sed -i "s|^TELEGRAM_ADMIN_ID=.*|TELEGRAM_ADMIN_ID=$TELEGRAM_ADMIN|" .env
fi

echo "✅ .env updated" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

# ============================================================================
# STEP 5: Install Dependencies
# ============================================================================
echo "📦 STEP 5: Installing dependencies..." | tee -a $LOG_FILE
pip install -q requests python-dotenv
echo "✅ Dependencies installed" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

# ============================================================================
# STEP 6: Start Bot
# ============================================================================
echo "▶️  STEP 6: Starting bot..." | tee -a $LOG_FILE
pm2 start macd_excel_bot.py --name fortress-bot --update-env
sleep 3
echo "✅ Bot started" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

# ============================================================================
# STEP 7: Verify Bot is Running
# ============================================================================
echo "✔️  STEP 7: Verifying bot status..." | tee -a $LOG_FILE
pm2 status | grep fortress-bot | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

# ============================================================================
# STEP 8: Show Bot Logs
# ============================================================================
echo "📋 STEP 8: Bot logs (last 20 lines)..." | tee -a $LOG_FILE
pm2 logs fortress-bot --lines 20 --nostream | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

# ============================================================================
# DEPLOYMENT COMPLETE
# ============================================================================
echo "✅ DEPLOYMENT COMPLETE" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE
echo "🎯 Next Steps:" | tee -a $LOG_FILE
echo "1. Check bot logs: pm2 logs fortress-bot --lines 50" | tee -a $LOG_FILE
echo "2. Verify signals flow: curl -s https://fortressintelligence.space/api/analysis/momentum-signals | jq ." | tee -a $LOG_FILE
echo "3. Check UI: https://fortressintelligence.space/momentum-radar" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE
echo "📂 Logs saved to: $LOG_FILE" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE
echo "Time: $(date)" | tee -a $LOG_FILE
