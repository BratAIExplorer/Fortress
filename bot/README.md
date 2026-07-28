# MACD Crossover Bot

**Purpose:** Scan Nifty 500 stocks for MACD (daily & weekly) bullish crossovers and feed signals to Fortress Momentum Radar tab.

**Status:** Production (runs on VPS via PM2)

**Frequency:** Every 5 minutes during NSE market hours (9:15 AM - 3:30 PM IST, Mon-Fri)

---

## Quick Start

### Local Development
```bash
source venv/bin/activate
pip install -r requirements.txt
python macd_excel_bot.py
```

### VPS Deployment
See `../BOT_DEPLOYMENT.md` for full instructions.

```bash
cd /opt/fortress
source bot/venv/bin/activate
pip install -r bot/requirements.txt
python bot/healthcheck.py
pm2 restart fortress-bot --update-env
```

---

## Architecture

Bot scans 500 Nifty stocks every 5 minutes (during market hours):
1. Fetch live prices via yfinance
2. Download 1Y daily + 5Y weekly historical candles
3. Calculate MACD (12, 26, 9) + EMAs (9, 20, 50, 100, 150, 200)
4. Detect bullish crossovers (0-1 days old, both timeframes)
5. Calculate targets, stop loss, position size for ₹25k capital
6. POST active signals to Fortress API `/api/analysis/momentum-signals`
7. Telegram alerts for owner (if broker integrated)
8. Write to Excel log for archival

---

## Components

- **macd_excel_bot.py** (1,550 lines) — Main scan loop + signal logic
- **zerodha_client.py** — Optional: Zerodha broker API integration
- **mstock_client.py** — Optional: mStock broker API integration
- **healthcheck.py** — Pre-deployment verification script
- **requirements.txt** — Python dependencies

---

## Environment Variables

**Required:**
```
TELEGRAM_BOT_TOKEN      Telegram bot token
TELEGRAM_ADMIN_ID       Your Telegram chat ID
FORTRESS_API_URL        https://fortressintelligence.space/api/analysis/momentum-signals
FORTRESS_CRON_SECRET    Shared secret (same as CRON_SECRET)
```

**Optional (auto-trading):**
```
ZERODHA_API_KEY         Zerodha API key
ZERODHA_API_SECRET      Zerodha API secret
ZERODHA_CLIENT_ID       Zerodha client ID
```

---

## Runtime Files (not committed)

- `macd_bot_state.json` — Tracks alerted crossovers, P&L, sessions
- `MACD_Signals.xlsx` — Excel log (currently active + permanent log sheets)
- `nifty500_cache.csv` — Cached Nifty 500 symbol list

---

## Monitoring

```bash
# Check bot is running
pm2 status fortress-bot

# Watch logs
pm2 logs fortress-bot

# Verify Momentum Radar shows data
curl https://fortressintelligence.space/api/analysis/momentum-signals
```

---

## Troubleshooting

1. **Bot crashes:** `pm2 logs fortress-bot` → check logs for errors
2. **No signals:** Is it market hours? (9:15-15:30 IST, Mon-Fri)
3. **Missing dependencies:** `pip install -r requirements.txt`
4. **Fortress API error:** Check `FORTRESS_CRON_SECRET` matches `.env.production`

---

For full deployment guide, see [BOT_DEPLOYMENT.md](../BOT_DEPLOYMENT.md).
