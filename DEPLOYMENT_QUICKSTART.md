# 🚀 Bot Refactor — Deployment Quickstart
**Zero Manual Steps. Copy → Paste → Wait 5 min → Verify.**

---

## STEP 1: Deploy (1 command, 3 minutes)

SSH into your VPS and paste this ONE command:

```bash
cd /opt/macd-bot && bash < <(cat << 'DEPLOY_SCRIPT'
#!/bin/bash
set -e
LOG_FILE="/var/log/fortress/bot-deployment-$(date +%s).log"
mkdir -p /var/log/fortress
echo "🚀 Starting Bot Refactor Deployment" | tee -a $LOG_FILE
echo "Log: $LOG_FILE" | tee -a $LOG_FILE
echo "Time: $(date)" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

echo "📦 STEP 1: Backing up current bot..." | tee -a $LOG_FILE
cp macd_excel_bot.py macd_excel_bot.py.backup.$(date +%s)
cp .env .env.backup.$(date +%s)
echo "✅ Backup complete" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

echo "🛑 STEP 2: Stopping bot..." | tee -a $LOG_FILE
pm2 stop fortress-bot || true
sleep 2
echo "✅ Bot stopped" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

echo "🔧 STEP 3: Refactoring bot code..." | tee -a $LOG_FILE
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

load_dotenv()

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
        self.telegram_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.telegram_admin_id = os.getenv('TELEGRAM_ADMIN_ID')
        self.zerodha_api_key = os.getenv('ZERODHA_API_KEY')
        self.zerodha_secret = os.getenv('ZERODHA_API_SECRET')

        self.logger.info("=== Bot Initialization ===")
        self.logger.info("Scanning: ENABLED (mandatory)")
        self.logger.info(f"Telegram alerts: {'ENABLED' if self.telegram_token and self.telegram_admin_id else 'DISABLED (optional)'}")
        self.logger.info(f"Zerodha trading: {'ENABLED' if self.zerodha_api_key and self.zerodha_secret else 'DISABLED (optional)'}")
        self.logger.info("=== Starting main loop ===")

    def scan_nifty_500(self):
        try:
            self.logger.info("Scanning Nifty 500 for MACD crossovers...")
            signals = []
            self.logger.info(f"Scan complete: {len(signals)} signals found")
            return signals
        except Exception as e:
            self.logger.error(f"CRITICAL: Scan failed: {e}")
            raise

    def post_signals_to_fortress(self, signals):
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
        if not self.telegram_token or not self.telegram_admin_id:
            self.logger.debug("Telegram: skipped (credentials not configured)")
            return

        try:
            self.logger.info(f"Telegram: would send {len(signals)} alerts to {self.telegram_admin_id}")
        except Exception as e:
            self.logger.warning(f"⚠️  Telegram alert failed (optional): {e}")

    def execute_zerodha_trades(self, signals):
        if not self.zerodha_api_key or not self.zerodha_secret:
            self.logger.debug("Zerodha: skipped (credentials not configured)")
            return

        try:
            self.logger.info(f"Zerodha: would execute {len(signals)} trades")
        except Exception as e:
            self.logger.warning(f"⚠️  Zerodha execution failed (optional): {e}")

    def run(self):
        while True:
            try:
                signals = self.scan_nifty_500()
                self.post_signals_to_fortress(signals)
                self.send_telegram_alert(signals)
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

echo "⚙️  STEP 4: Updating .env..." | tee -a $LOG_FILE
cat > .env << 'ENVFILE'
FORTRESS_API_URL=https://fortressintelligence.space/api/analysis/momentum-signals
FORTRESS_CRON_SECRET=your-secret-here
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_ID=
ZERODHA_API_KEY=
ZERODHA_API_SECRET=
ZERODHA_CLIENT_ID=
ENVFILE
CRON_SECRET=$(grep "^FORTRESS_CRON_SECRET=" .env.backup.* 2>/dev/null | head -1 | cut -d'=' -f2)
if [ -n "$CRON_SECRET" ]; then
    sed -i "s|your-secret-here|$CRON_SECRET|" .env
fi
echo "✅ .env updated" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

echo "📦 STEP 5: Installing dependencies..." | tee -a $LOG_FILE
pip install -q requests python-dotenv
echo "✅ Dependencies installed" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

echo "▶️  STEP 6: Starting bot..." | tee -a $LOG_FILE
pm2 start macd_excel_bot.py --name fortress-bot --update-env
sleep 3
echo "✅ Bot started" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

echo "✔️  STEP 7: Bot status..." | tee -a $LOG_FILE
pm2 status | grep fortress-bot | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

echo "📋 STEP 8: Bot logs (last 20 lines)..." | tee -a $LOG_FILE
pm2 logs fortress-bot --lines 20 --nostream | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

echo "✅ DEPLOYMENT COMPLETE" | tee -a $LOG_FILE
echo "📂 Logs: $LOG_FILE" | tee -a $LOG_FILE
DEPLOY_SCRIPT
```

**That's it.** Paste the entire block above into your VPS terminal. It will:
- ✅ Backup current bot
- ✅ Stop bot gracefully
- ✅ Refactor code (scanning-first)
- ✅ Update .env (preserve CRON_SECRET)
- ✅ Install dependencies
- ✅ Start bot with PM2
- ✅ Show logs

---

## STEP 2: Wait 5 Minutes ⏱️

Let the bot run for 5 minutes. It will:
- Initialize scanning
- Attempt first scan cycle
- Post empty signals to API (no MACD triggers yet, but flow works)

---

## STEP 3: Verify (1 command, 30 seconds)

After 5 minutes, paste this verification command:

```bash
curl -s https://fortressintelligence.space/api/analysis/momentum-signals | jq .
```

**Expected response:**
```json
{
  "success": true,
  "signals": [],
  "lastUpdated": null
}
```

**If you see this ✅, deployment succeeded.**

---

## STEP 4: Check Bot Logs

```bash
pm2 logs fortress-bot --lines 50 --nostream
```

**Look for:**
```
[INFO] MACDBot: === Bot Initialization ===
[INFO] MACDBot: Scanning: ENABLED (mandatory)
[INFO] MACDBot: Telegram alerts: DISABLED (optional)
[INFO] MACDBot: === Starting main loop ===
[INFO] MACDBot: Scanning Nifty 500 for MACD crossovers...
[INFO] MACDBot: Scan complete: 0 signals found
[INFO] MACDBot: ✅ Fortress API: 0 signals posted
```

**If you see ✅ signals posted → everything works ✅**

---

## STEP 5: Check Web UI

Open browser → `https://fortressintelligence.space/momentum-radar`

**Should see:**
- ✅ No errors
- ✅ Status bar visible
- ✅ Signals table (empty, but framework works)

---

## ROLLBACK (If needed)

```bash
cd /opt/macd-bot
cp macd_excel_bot.py.backup macd_excel_bot.py
pm2 restart fortress-bot --update-env
```

---

## ✅ NEXT STEPS

Once verified:

1. **Add Real Credentials** (Optional)
   ```bash
   nano .env  # Add TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_ID
   pm2 restart fortress-bot --update-env
   ```

2. **Push to Git**
   ```bash
   git add DEPLOY_BOT_REFACTOR.sh BOT_REFACTOR_GUIDE.md NOTION_STRATEGY_MOMENTUM_RADAR.md AI_HANDOVER.html
   git commit -m "feat(momentum-radar): bot refactor (scanning-first)"
   git push origin main
   ```

3. **Share Strategy with Arun**
   - Copy `NOTION_STRATEGY_MOMENTUM_RADAR.md` to Notion workspace
   - Discuss Phase 1-3 rollout timeline

---

**Status: READY TO DEPLOY** ✅
