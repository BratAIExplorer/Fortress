#!/usr/bin/env python3
import logging, os, sys, time, io, datetime, pytz, json
import requests, pandas as pd, numpy as np, yfinance as yf
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] MACDBot: %(message)s')
logger = logging.getLogger(__name__)

IST = pytz.timezone('Asia/Kolkata')
CACHE_FILE = "/tmp/nifty500_cache.csv"
STATE_FILE = "/opt/fortress/scripts/macd-bot/.bot_state.json"

class MACDBot:
    def __init__(self):
        self.logger = logger
        self.fortress_api_url = os.getenv('FORTRESS_API_URL', 'https://fortressintelligence.space/api/analysis/momentum-signals')
        self.fortress_cron_secret = os.getenv('CRON_SECRET')
        self.telegram_token = os.getenv('TELEGRAM_BOT_TOKEN', '')
        self.telegram_admin_id = os.getenv('TELEGRAM_ADMIN_ID', '')
        self.zerodha_api_key = os.getenv('ZERODHA_API_KEY', '')
        self.zerodha_secret = os.getenv('ZERODHA_API_SECRET', '')
        self.state = self.load_state()

        self.logger.info("=== Bot Initialization ===")
        self.logger.info("Scanning: ENABLED (mandatory)")
        self.logger.info(f"Telegram alerts: {'ENABLED' if self.telegram_token and self.telegram_admin_id else 'DISABLED (optional)'}")
        self.logger.info(f"Zerodha trading: {'ENABLED' if self.zerodha_api_key and self.zerodha_secret else 'DISABLED (optional)'}")
        self.logger.info("=== Starting main loop (5-min cycle) ===")

    def load_state(self):
        """Load state tracking to prevent duplicate signals."""
        if os.path.exists(STATE_FILE):
            try:
                with open(STATE_FILE, 'r') as f:
                    return json.load(f)
            except:
                pass
        return {"alerted_crossovers": {}}

    def save_state(self):
        """Save state to prevent duplicate signals on next cycle."""
        try:
            os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
            with open(STATE_FILE, 'w') as f:
                json.dump(self.state, f)
        except Exception as e:
            self.logger.warning(f"Failed to save state: {e}")

    def get_nifty500_symbols(self):
        """Fetch Nifty 500 symbols from NSE or fallback to cache/hardcoded."""
        url = "https://archives.nseindia.com/content/indices/ind_nifty500list.csv"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        try:
            r = requests.get(url, headers=headers, timeout=15)
            if r.status_code == 200:
                df = pd.read_csv(io.StringIO(r.text))
                if 'Symbol' in df.columns:
                    symbols = df['Symbol'].dropna().unique().tolist()
                    df.to_csv(CACHE_FILE, index=False)
                    self.logger.info(f"Loaded {len(symbols)} symbols from NSE")
                    return symbols
        except Exception as e:
            self.logger.warning(f"NSE fetch failed: {e}")

        if os.path.exists(CACHE_FILE):
            try:
                df = pd.read_csv(CACHE_FILE)
                symbols = df['Symbol'].dropna().unique().tolist()
                self.logger.info(f"Loaded {len(symbols)} symbols from cache")
                return symbols
            except:
                pass

        self.logger.info("Using fallback Nifty 500 hardcoded list")
        return ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "HINDUNILVR", "ITC", "SBIN", "BHARTIARTL", "KOTAKBANK"]

    def fetch_live_price(self, symbol):
        """Fetch single stock LTP from Yahoo Finance."""
        try:
            yf_symbol = f"{symbol}.NS"
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{yf_symbol}?interval=1m&range=1d"
            headers = {"User-Agent": "Mozilla/5.0", "Referer": "https://finance.yahoo.com/"}
            r = requests.get(url, headers=headers, timeout=10)
            if r.status_code == 200:
                data = r.json()
                ltp = data.get("chart", {}).get("result", [{}])[0].get("meta", {}).get("regularMarketPrice")
                if ltp:
                    return symbol, float(ltp)
        except Exception as e:
            self.logger.debug(f"LTP fetch failed for {symbol}: {e}")
        return symbol, None

    def fetch_all_prices(self, symbols):
        """Fetch live prices in parallel."""
        prices = {}
        with ThreadPoolExecutor(max_workers=20) as executor:
            futures = {executor.submit(self.fetch_live_price, sym): sym for sym in symbols}
            for future in as_completed(futures):
                sym, ltp = future.result()
                if ltp:
                    prices[sym] = ltp
        self.logger.info(f"Fetched prices for {len(prices)}/{len(symbols)} symbols")
        return prices

    def fetch_historical_data(self, symbols):
        """Download 1 year of daily data in chunks."""
        all_data = {}
        for i in range(0, len(symbols), 50):
            chunk = symbols[i:i+50]
            yf_symbols = [f"{s}.NS" for s in chunk]
            try:
                data = yf.download(yf_symbols, period="1y", interval="1d", progress=False)
                if not data.empty:
                    if len(chunk) == 1:
                        all_data[chunk[0]] = data['Close']
                    else:
                        for sym in chunk:
                            if sym in data['Close'].columns:
                                all_data[sym] = data['Close'][sym]
            except Exception as e:
                self.logger.debug(f"Historical fetch failed for chunk: {e}")
        return all_data

    def analyze_stock(self, symbol, close_series, ltp):
        """EXACT COPY from standalone bot: Detect MACD crossovers with 0-3 day recency and dynamic EMA target/SL."""
        if isinstance(close_series, pd.DataFrame):
            close_series = close_series.squeeze()

        close_series = close_series.copy()
        close_series.index = pd.to_datetime(close_series.index).tz_localize(None)

        if close_series.empty:
            return None

        # Match standalone: append today's price with proper IST timezone handling
        today_ist = datetime.datetime.now(IST).date()
        is_weekday = today_ist.weekday() < 5
        now_ist_time = datetime.datetime.now(IST).time()
        is_after_market_open = now_ist_time >= datetime.time(9, 15)

        if is_weekday and is_after_market_open:
            target_date = today_ist
        else:
            target_date = close_series.index[-1].date()

        target_dt = pd.to_datetime(target_date)
        close_series[target_dt] = ltp
        close_series = close_series.dropna()
        close_series = close_series[~close_series.index.duplicated(keep='last')].sort_index()

        if len(close_series) < 200:
            return None

        # Calculate MACD(12,26,9) - EXACT STANDALONE LOGIC
        ema12 = close_series.ewm(span=12, adjust=False).mean()
        ema26 = close_series.ewm(span=26, adjust=False).mean()
        macd_line = ema12 - ema26
        signal_line = macd_line.ewm(span=9, adjust=False).mean()

        # Calculate ALL 6 EMAs (EXACT STANDALONE) - NOT just 3!
        ema9 = close_series.ewm(span=9, adjust=False).mean().iloc[-1]
        ema20 = close_series.ewm(span=20, adjust=False).mean().iloc[-1]
        ema50 = close_series.ewm(span=50, adjust=False).mean().iloc[-1]
        ema100 = close_series.ewm(span=100, adjust=False).mean().iloc[-1]
        ema150 = close_series.ewm(span=150, adjust=False).mean().iloc[-1]
        ema200 = close_series.ewm(span=200, adjust=False).mean().iloc[-1]

        macd_vals = macd_line.tolist()
        sig_vals = signal_line.tolist()
        dates = close_series.index.tolist()

        # Check crossovers UP TO 3 DAYS AGO (EXACT STANDALONE - NOT just 0-1 days!)
        crossover_today = (macd_vals[-1] > sig_vals[-1]) and (macd_vals[-2] <= sig_vals[-2])
        crossover_yesterday = (macd_vals[-2] > sig_vals[-2]) and (macd_vals[-3] <= sig_vals[-3])
        crossover_2_days = (macd_vals[-3] > sig_vals[-3]) and (macd_vals[-4] <= sig_vals[-4])
        crossover_3_days = (macd_vals[-4] > sig_vals[-4]) and (macd_vals[-5] <= sig_vals[-5])

        is_bullish_today = macd_vals[-1] > sig_vals[-1]

        if not is_bullish_today:
            return None

        crossover_date = None
        days_since = None

        if crossover_today:
            crossover_date = dates[-1].strftime('%Y-%m-%d')
            days_since = 0
        elif crossover_yesterday:
            crossover_date = dates[-2].strftime('%Y-%m-%d')
            days_since = 1
        elif crossover_2_days:
            crossover_date = dates[-3].strftime('%Y-%m-%d')
            days_since = 2
        elif crossover_3_days:
            crossover_date = dates[-4].strftime('%Y-%m-%d')
            days_since = 3
        else:
            return None

        # Trend Filter (EXACT STANDALONE)
        if ltp <= ema200 or ema50 <= ema200:
            return None

        # Position Sizing (EXACT STANDALONE)
        capital = 25000
        qty = int(np.floor(capital / ltp))
        if qty <= 0:
            return None
        invested = qty * ltp

        # DYNAMIC EMA TARGET/SL SELECTION (EXACT STANDALONE - NOT hardcoded!)
        emas = {
            "EMA 20": float(ema20),
            "EMA 50": float(ema50),
            "EMA 100": float(ema100),
            "EMA 150": float(ema150),
            "EMA 200": float(ema200)
        }

        targets = {k: v for k, v in emas.items() if v > ltp}
        supports = {k: v for k, v in emas.items() if v < ltp}

        # First Target = nearest EMA above CMP
        if targets:
            first_target_ema_key = min(targets, key=targets.get)
            first_target_price = round(targets[first_target_ema_key], 2)
            first_target_ema = first_target_ema_key
        else:
            first_target_ema = "5% Default (Blue Sky)"
            first_target_price = round(ltp * 1.05, 2)

        # Final Target = highest EMA above CMP
        if targets:
            final_target_ema_key = max(targets, key=targets.get)
            final_target_price = round(targets[final_target_ema_key], 2)
            final_target_ema = final_target_ema_key
        else:
            final_target_ema = "15% Default (Blue Sky)"
            final_target_price = round(ltp * 1.15, 2)

        # Stop Loss = nearest EMA below CMP
        if supports:
            sl_ema_key = max(supports, key=supports.get)
            sl_price = round(supports[sl_ema_key], 2)
            sl_ema = sl_ema_key
        else:
            sl_ema = "5% Default (SL)"
            sl_price = round(ltp * 0.95, 2)

        return {
            "symbol": symbol,
            "cmp": round(ltp, 2),
            "crossoverDate": crossover_date,
            "daysSinceCrossover": days_since,
            "quantity": qty,
            "investedAmount": round(invested, 2),
            "firstTargetPrice": first_target_price,
            "firstTargetEma": first_target_ema,
            "finalTargetPrice": final_target_price,
            "finalTargetEma": final_target_ema,
            "stopLossPrice": sl_price,
            "stopLossEma": sl_ema,
        }

    def scan_nifty_500(self):
        try:
            self.logger.info("Scanning Nifty 500 for MACD crossovers...")
            symbols = self.get_nifty500_symbols()
            live_prices = self.fetch_all_prices(symbols)
            valid_symbols = list(live_prices.keys())

            if not valid_symbols:
                self.logger.warning("No valid symbols found")
                return []

            historical_data = self.fetch_historical_data(valid_symbols)
            signals = []
            new_crossovers = []
            alerted_crossovers = self.state.get("alerted_crossovers", {})

            for sym in valid_symbols:
                close_series = historical_data.get(sym)
                if close_series is None or close_series.empty:
                    continue
                try:
                    result = self.analyze_stock(sym, close_series, live_prices[sym])
                    if result:
                        signals.append(result)
                        crossover_date = result.get("crossoverDate")
                        last_alerted = alerted_crossovers.get(sym)
                        # Only mark as new if we haven't alerted on this crossover date
                        if last_alerted != crossover_date:
                            new_crossovers.append(result)
                            alerted_crossovers[sym] = crossover_date
                except Exception as e:
                    self.logger.debug(f"Analysis failed for {sym}: {e}")

            self.state["alerted_crossovers"] = alerted_crossovers
            self.logger.info(f"Scan complete: {len(signals)} active signals, {len(new_crossovers)} new crossovers")
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
                self.save_state()  # Persist state to avoid duplicate alerts
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
