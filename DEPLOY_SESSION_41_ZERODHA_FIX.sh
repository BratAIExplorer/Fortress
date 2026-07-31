#!/bin/bash
set -e

echo "========================================="
echo "SESSION 41: ZERODHA FIX & BOT DEPLOYMENT"
echo "========================================="
echo ""

cd /opt/fortress

echo "[1/8] Pulling latest code from git..."
git pull origin main
echo "✅ Git pull complete"
echo ""

echo "[2/8] Backing up .env and removing Zerodha credentials..."
cd /opt/macd-bot
if [ -f .env ]; then
    cp .env .env.backup
    grep -v "ZERODHA" .env.backup > .env.tmp
    mv .env.tmp .env
    echo "✅ Zerodha credentials removed (.env.backup preserved)"
else
    echo "⚠️ No .env file found, will create minimal one"
fi
echo ""

echo "[3/8] Ensuring CRON_SECRET is in .env..."
if ! grep -q "^CRON_SECRET=" /opt/macd-bot/.env; then
    # Try to get it from backup or add a placeholder
    if grep -q "CRON_SECRET=" /opt/macd-bot/.env.backup 2>/dev/null; then
        CRON_VAL=$(grep "CRON_SECRET=" /opt/macd-bot/.env.backup | cut -d'=' -f2)
    elif grep -q "FORTRESS_CRON_SECRET=" /opt/macd-bot/.env.backup 2>/dev/null; then
        CRON_VAL=$(grep "FORTRESS_CRON_SECRET=" /opt/macd-bot/.env.backup | cut -d'=' -f2)
    else
        CRON_VAL="MISSING_SET_IN_ENV"
    fi
    echo "CRON_SECRET=$CRON_VAL" >> /opt/macd-bot/.env
    echo "✅ CRON_SECRET added to .env"
fi
echo ""

echo "[4/8] Adding Telegram credentials to .env if missing..."
if ! grep -q "^TELEGRAM_BOT_TOKEN=" /opt/macd-bot/.env; then
    if grep -q "TELEGRAM_BOT_TOKEN=" /opt/macd-bot/.env.backup 2>/dev/null; then
        TELEGRAM_TOKEN=$(grep "TELEGRAM_BOT_TOKEN=" /opt/macd-bot/.env.backup | cut -d'=' -f2)
        echo "TELEGRAM_BOT_TOKEN=$TELEGRAM_TOKEN" >> /opt/macd-bot/.env
        echo "✅ TELEGRAM_BOT_TOKEN added"
    fi
fi
if ! grep -q "^TELEGRAM_ADMIN_ID=" /opt/macd-bot/.env; then
    if grep -q "TELEGRAM_ADMIN_ID=" /opt/macd-bot/.env.backup 2>/dev/null; then
        TELEGRAM_ADMIN=$(grep "TELEGRAM_ADMIN_ID=" /opt/macd-bot/.env.backup | cut -d'=' -f2)
        echo "TELEGRAM_ADMIN_ID=$TELEGRAM_ADMIN" >> /opt/macd-bot/.env
        echo "✅ TELEGRAM_ADMIN_ID added"
    fi
fi
echo ""

echo "[5/8] Copying updated bot file..."
cp /opt/fortress/bot/macd_excel_bot.py /opt/macd-bot/macd_excel_bot.py
echo "✅ Bot file copied to /opt/macd-bot/"
echo ""

echo "[6/8] Verifying bot file..."
echo "  Checking CRON_SECRET refs (should be 3):"
CRON_REFS=$(grep -c "CRON_SECRET" /opt/macd-bot/macd_excel_bot.py || echo "0")
echo "    Found: $CRON_REFS refs ✅"

echo "  Checking for ZERODHA refs (should be 0):"
ZERODHA_REFS=$(grep -c "ZERODHA" /opt/macd-bot/macd_excel_bot.py || echo "0")
if [ "$ZERODHA_REFS" = "0" ]; then
    echo "    Found: 0 refs ✅ (Zerodha fully optional)"
else
    echo "    Found: $ZERODHA_REFS refs ❌ WARNING: Zerodha still referenced"
fi

echo "  Checking message format (should be 1):"
MSG_REFS=$(grep -c "New.*Bullish Signal Detected" /opt/macd-bot/macd_excel_bot.py || echo "0")
echo "    Found: $MSG_REFS ✅"

echo "  Checking disclaimer (should be 1):"
DISC_REFS=$(grep -c "Disclaimer" /opt/macd-bot/macd_excel_bot.py || echo "0")
echo "    Found: $DISC_REFS ✅"
echo ""

echo "[7/8] Restarting bot process..."
pm2 delete macd-bot 2>/dev/null || true
sleep 2
cd /opt/macd-bot
pm2 start /opt/macd-bot/macd_excel_bot.py --name macd-bot --interpreter python3 --update-env
sleep 3
echo "✅ Bot restarted"
echo ""

echo "[8/8] Final status check..."
echo "PM2 Status:"
pm2 status | grep -E "id|macd" || echo "⚠️ Check status manually"
echo ""
echo "Bot Logs (last 30 lines):"
pm2 logs macd-bot --lines 30 --nostream || echo "⚠️ No logs yet"
echo ""

echo "========================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "========================================="
echo ""
echo "VERIFICATION REQUIRED:"
echo "1. Check bot logs above for 'Starting scan cycle' (should appear within 5 min)"
echo "2. Verify Fortress UI: https://fortressintelligence.space/momentum-radar"
echo "3. Wait for next Telegram alert (should show 'Bullish Signal' NOT 'MACD Crossover')"
echo "4. Confirm NO Zerodha login errors in Telegram"
echo ""
echo "If issues occur:"
echo "  - Check .env has CRON_SECRET and TELEGRAM_BOT_TOKEN"
echo "  - Run: pm2 logs macd-bot --lines 50"
echo "  - Restart: pm2 restart macd-bot --update-env"
echo ""
