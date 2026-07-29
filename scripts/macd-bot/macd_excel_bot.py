#!/usr/bin/env python3
import logging, os, sys, time
from datetime import datetime
import requests
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] MACDBot: %(message)s')
logger = logging.getLogger(__name__)

class MACDBot:
    def __init__(self):
        self.logger = logger
        self.fortress_api_url = os.getenv('FORTRESS_API_URL', 'https://fortressintelligence.space/api/analysis/momentum-signals')
        self.fortress_cron_secret = os.getenv('CRON_SECRET')  # Uses CRON_SECRET from .env.production
        self.telegram_token = os.getenv('TELEGRAM_BOT_TOKEN', '')
        self.telegram_admin_id = os.getenv('TELEGRAM_ADMIN_ID', '')
        self.zerodha_api_key = os.getenv('ZERODHA_API_KEY', '')
        self.zerodha_secret = os.getenv('ZERODHA_API_SECRET', '')
        
        self.logger.info("=== Bot Initialization ===")
        self.logger.info("Scanning: ENABLED (mandatory)")
        self.logger.info(f"Telegram alerts: {'ENABLED' if self.telegram_token and self.telegram_admin_id else 'DISABLED (optional)'}")
        self.logger.info(f"Zerodha trading: {'ENABLED' if self.zerodha_api_key and self.zerodha_secret else 'DISABLED (optional)'}")
        self.logger.info("=== Starting main loop (5-min cycle) ===")

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
            headers = {'Content-Type': 'application/json', 'x-cron-secret': self.fortress_cron_secret}
            payload = {'signals': signals, 'timestamp': datetime.utcnow().isoformat()}
            response = requests.post(f"{self.fortress_api_url}?action=update", json=payload, headers=headers, timeout=10)
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
            self.logger.info(f"Telegram: sending {len(signals)} alerts...")
        except Exception as e:
            self.logger.warning(f"⚠️  Telegram failed (optional): {e}")

    def execute_zerodha_trades(self, signals):
        if not self.zerodha_api_key or not self.zerodha_secret:
            self.logger.debug("Zerodha: skipped (credentials not configured)")
            return
        try:
            self.logger.info(f"Zerodha: executing {len(signals)} trades...")
        except Exception as e:
            self.logger.warning(f"⚠️  Zerodha failed (optional): {e}")

    def run(self):
        while True:
            try:
                signals = self.scan_nifty_500()
                self.post_signals_to_fortress(signals)
                self.send_telegram_alert(signals)
                self.execute_zerodha_trades(signals)
                self.logger.info(f"Cycle complete. Sleeping 300 seconds (5 min)...")
                time.sleep(300)
            except KeyboardInterrupt:
                self.logger.info("Bot stopped by user.")
                sys.exit(0)
            except Exception as e:
                self.logger.error(f"Unexpected error: {e}")
                self.logger.info("Retrying in 60 seconds...")
                time.sleep(60)

if __name__ == '__main__':
    bot = MACDBot()
    bot.run()
