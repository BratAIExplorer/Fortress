# Bot Scan Validation Checklist
**Date:** July 30, 2026  
**Test Window:** 5-minute bot cycle  
**Validation Points:** UI, Excel Export, Telegram Alerts  

---

## What We're Checking

The bot runs on a 5-minute cycle:
1. Scan Nifty 500 for MACD crossovers
2. Calculate targets/SL using dynamic EMA selection
3. Post signals to Fortress API
4. Send Telegram alerts (if credentials configured)
5. Save to state file (prevent duplicate alerts)

---

## Validation Points

### ✅ Point 1: Bot Scans Successfully
**Where to Check:** Bot logs via SSH
```bash
pm2 logs fortress-bot --lines 30
```
**Look for:**
- `Scanning Nifty 500 for MACD crossovers...` ✅
- `Loaded 500 symbols from NSE` ✅
- `Fetched prices for 500/500 symbols` ✅
- `Scan complete: N active signals, M new crossovers` ✅
- `✅ Fortress API: N signals posted` ✅ (NOT `❌ Fortress API failed`)

**Expected Output (if signals found):**
```
Scan complete: 57 active signals, 57 new crossovers
✅ Fortress API: 57 signals posted
```

---

### ✅ Point 2: Signals Visible in UI
**Where to Check:** https://fortressintelligence.space/momentum-radar

**Look for:**
- Page loads without errors ✅
- Status indicator shows "Fresh" (green pulsing dot) ✅
- Timestamp shows recent scan time (e.g., "Jul 30, 10:45:20 AM") ✅
- Signal table displays (if signals found):
  - Symbol column
  - CMP (Current Market Price)
  - Crossover Date
  - Quantity
  - First Target Price
  - Final Target Price
  - Stop Loss Price

**If No Signals:**
- Status indicator shows "No active crossovers" ✅
- Timestamp still shows recent scan ✅
- Message explains: "No signals match current criteria" ✅

---

### ✅ Point 3: Signals in API Response
**Where to Check:** Direct API call
```bash
curl -s -H "x-cron-secret: fortress-scan-secret-2026" \
  "https://fortressintelligence.space/api/analysis/momentum-signals" | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "signals": [
    {
      "symbol": "SYMBOL1",
      "cmp": 150.25,
      "crossoverDate": "2026-07-30",
      "daysSinceCrossover": 0,
      "quantity": 166,
      "investedAmount": 24916.5,
      "firstTargetPrice": 152.30,
      "firstTargetEma": "EMA 20",
      "finalTargetPrice": 155.40,
      "finalTargetEma": "EMA 50",
      "stopLossPrice": 147.50,
      "stopLossEma": "EMA 200"
    }
    // ... more signals
  ],
  "lastUpdated": "2026-07-30T10:45:20Z",
  "count": 57
}
```

---

### ✅ Point 4: Telegram Alerts Sent
**Where to Check:** Bot logs + Telegram app

**In Bot Logs:**
```
Telegram: sending N alerts...
```

**In Telegram:**
- Check the admin group chat (ID: 794546792)
- Should receive alerts for each new signal
- Format: Symbol, CMP, targets, stop loss, quantity

**Example Alert:**
```
🚀 MACD CROSSOVER DETECTED
Symbol: AAPL
CMP: ₹150.25
First Target: ₹152.30 (EMA20)
Final Target: ₹155.40 (EMA50)
Stop Loss: ₹147.50 (EMA200)
Quantity: 166 units
Invested: ₹24,916.50
```

---

### ✅ Point 5: Excel Export (if available)
**Where to Check:** Bot's local MACD_Signals.xlsx (if enabled)

**In "Currently Active" Sheet:**
- Columns: Symbol, CMP, Crossover Date, Quantity, Targets, Stop Loss
- One row per active signal
- Timestamps show scan time

**In "Permanent Log" Sheet:**
- Chronological history of all signals
- Each signal logged once on first detection
- Timestamps show when detected

---

## Expected Behavior Scenarios

### Scenario A: Signals Found (~57 expected)
```
✅ Bot logs: "Scan complete: 57 active signals, 57 new crossovers"
✅ API response: signals array with 57 objects
✅ UI: Table shows 57 rows
✅ Telegram: 57 alert messages sent
✅ Excel: 57 rows in "Currently Active" sheet
```

### Scenario B: No Signals Found (Market didn't produce crossovers)
```
✅ Bot logs: "Scan complete: 0 active signals, 0 new crossovers"
✅ API response: signals array empty []
✅ UI: "No active crossovers" message shown
✅ Telegram: No alerts sent (nothing to alert)
✅ Excel: Empty sheet (or previous signals if still active)
```

### Scenario C: Partial Signals (New ones detected, some carry over from previous day)
```
✅ Bot logs: "Scan complete: 57 active signals, 5 new crossovers"
✅ API response: 57 signals (5 new + 52 from yesterday)
✅ UI: 57 rows visible
✅ Telegram: Only 5 new alerts sent (duplicate prevention)
✅ Excel: 57 rows in "Currently Active"
```

---

## Debugging If Issues Found

| Issue | Check | Solution |
|-------|-------|----------|
| **0 signals when 57 expected** | Bot logs for errors | Check if market is open / historical data available |
| **UI shows stale data** | Timestamp in UI | Refresh page (Ctrl+Shift+R) or check API directly |
| **API returns error** | Curl response | Check x-cron-secret header is correct |
| **No Telegram alerts** | Bot logs / .env file | Verify TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_ID set |
| **Excel file not updated** | Bot logs for path errors | Check write permissions to bot directory |

---

## Success Criteria

✅ **Full Success:**
- Bot scans complete without errors
- Signals posted to API (count > 0)
- UI displays signals with correct data
- Telegram alerts received
- All data flows end-to-end

✅ **Partial Success (Acceptable for MVP):**
- Bot scans complete
- Signals posted to API
- UI displays signals
- One of: Telegram alerts OR Excel export working

❌ **Failure State:**
- Bot crashes or hangs
- 0 signals when market data exists
- API returns errors
- UI shows old/stale data

---

## Data Validation

For each signal, verify:
- ✅ Symbol: Valid NSE ticker (e.g., AAPL, HDFC, TCS)
- ✅ CMP: Positive number, reasonable market price range
- ✅ Crossover Date: YYYY-MM-DD format, recent (today or last 3 days)
- ✅ Quantity: Positive integer (capital ÷ price)
- ✅ First Target: > CMP (above current price)
- ✅ Final Target: > First Target
- ✅ Stop Loss: < CMP (below current price)
- ✅ EMA Labels: Match calculation (EMA20, EMA50, EMA100, EMA150, EMA200 or "% Default")

---

## Next Steps After Validation

1. **If all checks pass:** Proceed to 2-week observation period (monitor accuracy)
2. **If partial success:** Document what works, plan fixes for missing pieces
3. **If failure:** Check bot logs, restart bot, run diagnostics
4. **Once validated:** Update CLAUDE.md with "BOT FULLY OPERATIONAL" status

---

**Validation window:** 5-minute bot scan cycle. Check back at T+5min.
