# FORENSIC ENGINE - PHASE 1A (Complete Guide)

**Status:** ✅ READY TO TEST  
**Date:** 2026-07-02  
**Purpose:** Determine which stocks are good for intraday day trading  
**Timeline:** 4 days (test → analyze → report)

---

## 📋 WHAT'S BEEN CREATED

| File | Purpose | What It Does |
|------|---------|--------------|
| `base.py` | Core toolkit | Trade, BacktestMetrics, fetch_data, helpers |
| `forensic_analyzer.py` | Main engine | Analyzes stocks for intraday suitability |
| `test_forensic.py` | Quick test | Tests on 3 stocks (HDFC, AAPL, INFY) |
| `run_fortress30_forensic.py` | Batch processor | Runs on all Fortress 30 stocks |

---

## 🚀 HOW TO USE (Step-by-Step)

### **STEP 1: Test on 3 Stocks (Day 1-2)**

Open PowerShell and run:

```bash
cd C:\Antigravity\Fortress
python -m lib.backtesting.test_forensic
```

**What happens:**
1. Downloads 12 months of data for HDFC.NS, AAPL, INFY.NS
2. Simulates: Buy at open, sell at close (every day)
3. Calculates: Win rate, profit factor, Sharpe ratio
4. Outputs: Ranked list + detailed analysis

**Expected output:**
```
HDFC.NS Win Rate: 28% | Profit Factor: 0.65 | Sharpe: 0.42 | Score: 48/100
AAPL Win Rate: 35% | Profit Factor: 1.2 | Sharpe: 0.8 | Score: 72/100
INFY.NS Win Rate: 22% | Profit Factor: 0.55 | Sharpe: 0.25 | Score: 32/100
```

**Time:** 2-3 minutes

---

### **STEP 2: Review Test Results (Day 2)**

Look at `forensic_test_results.csv` in your Fortress folder:

```
Symbol,Win Rate,Profit Factor,Sharpe Ratio,Score,Verdict
HDFC.NS,28.0%,0.65,0.42,48,🟡 RISKY
AAPL,35.0%,1.20,0.80,72,🟡 MODERATE
INFY.NS,22.0%,0.55,0.25,32,🔴 AVOID
```

**What this means:**
- AAPL is best of the three for day trading (72/100)
- HDFC is risky (48/100) but not terrible
- INFY is bad for day trading (32/100) — better for swings

---

### **STEP 3: Run Full Fortress 30 Analysis (Day 3-4)**

Once test looks good, run:

```bash
cd C:\Antigravity\Fortress
python -m lib.backtesting.run_fortress30_forensic
```

**What happens:**
1. Analyzes all Fortress 30 stocks (30 stocks)
2. Generates 2 files:
   - `fortress30_forensic_ranking_[date].csv` — Quick ranked list
   - `fortress30_forensic_detailed_[date].json` — Full details

**Output CSV example:**
```
Rank,Symbol,Win Rate,Profit Factor,Score,Verdict
1,AAPL,35.0%,1.20,72,🟢 GOOD
2,MSFT,33.0%,1.15,68,🟢 GOOD
3,GOOGL,32.0%,1.10,65,🟡 MODERATE
...
30,INFY.NS,22.0%,0.55,32,🔴 AVOID
```

**Time:** 10-15 minutes for all 30

---

## 📊 UNDERSTANDING THE METRICS

| Metric | What It Means | Good Value |
|--------|--------------|-----------|
| **Win Rate** | % of winning trades | >35% is good |
| **Avg Win %** | Average $ gain per winner | >0.8% is good |
| **Avg Loss %** | Average $ loss per loser | Should be <1% |
| **Profit Factor** | Wins / Losses | >1.2 is good, >1.5 is excellent |
| **Sharpe Ratio** | Risk-adjusted return | >1.0 is good |
| **Max Drawdown** | Biggest loss | <-15% is okay |
| **Score** | 0-100 overall rating | >70 = good for day trading |

---

## 🟢 VERDICT LEVELS

| Verdict | Score | Meaning | Action |
|---------|-------|---------|--------|
| 🟢 EXCELLENT | 75+ | Fantastic for intraday | Primary candidate |
| 🟢 GOOD | 65-75 | Very good for intraday | Recommended |
| 🟡 MODERATE | 50-65 | Okay for intraday | Proceed cautiously |
| 🟡 RISKY | 35-50 | Risky for intraday | Better for swings |
| 🔴 AVOID | <35 | Poor for intraday | Use for long-term only |

---

## 🎯 WHAT COMES NEXT (After Phase 1A)

### **Phase 1B: Filter Optimization (Week 2)**

```
Now that we know which stocks are good for intraday,
let's find what filters predict their best days.

Example:
  "AAPL is good for day trading.
   Which technical filters predicted its winning days?"
```

### **Phase 2: Live Dashboard (Week 3-4)**

```
Convert these reports into a web UI where users can:
- See ranked list of stocks
- Add custom stocks
- Compare to Fortress average
- Get alerts when rankings change
```

---

## 🔧 TROUBLESHOOTING

### **"No data found for HDFC.NS"**
- Check your internet connection
- Verify ticker symbol is correct
- Wait a minute, then try again

### **"Module not found: lib.backtesting"**
- Make sure you're in `C:\Antigravity\Fortress` directory
- Run: `python -c "from lib.backtesting import Trade; print('OK')"`

### **Takes too long (>5 min per stock)**
- This is normal — downloading 12 months of data takes time
- Parallel processing coming in Phase 2

---

## 📈 SUCCESS CRITERIA (Phase 1A is "Done" when...)

✅ Test on 3 stocks completes without errors  
✅ Results make intuitive sense (AAPL > INFY for US/India)  
✅ CSV file is generated  
✅ Can run full Fortress 30 analysis  
✅ Reports are readable and actionable  

---

## 🎬 YOUR NEXT MOVE

1. **Run test:** `python -m lib.backtesting.test_forensic`
2. **Review results:** Open `forensic_test_results.csv`
3. **Tell me:** "Results look good" or "Something's wrong"
4. **Then:** Run full analysis on Fortress 30

---

**Questions?** Let me know how it goes!
