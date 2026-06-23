# Fortress Intelligence — Skill Command Reference
**Quick Command Lookup for Phase 1 Toolkit**  
**Keep this open while trading. All commands ready post-installation.**

---

## 🚀 QUICK START (Copy-Paste Commands)

### **1-Minute Portfolio Check**
```bash
/global-asset-allocation REVIEW
/macro-regime-detect
/etf-momentum-scan
```

### **Deep Stock Analysis (NSE)**
```bash
/nse-technical-analysis HDFC
/equity-research RELIANCE
/insider-tracking AAPL
/dcf-valuation TCS
```

### **US + ETF Strategy**
```bash
/canslim-screen
/etf-rotation-check
/sector-momentum-scan
```

### **Real-Time Sentiment**
```bash
/analyze-sentiment AAPL
/etf-sentiment VTI
/india-sentiment INDA
```

---

## 📚 COMPLETE COMMAND INDEX

### **NSE Trading Skills (9 Commands)**

| Command | What It Does | Example |
|---------|-------------|---------|
| `/nse-technical-analysis SYMBOL` | RSI, MACD, SMA trends, signals | `/nse-technical-analysis HDFC` |
| `/nse-trading-toolkit` | Combined technical + fundamental | `/nse-trading-toolkit` |
| `/rsi-divergence SYMBOL` | Find divergence patterns | `/rsi-divergence RELIANCE` |
| `/multi-timeframe-analysis SYMBOL` | 5min/15min/1hr/4hr/daily signals | `/multi-timeframe-analysis INFY` |
| `/fibonacci-trading SYMBOL` | Support/resistance levels | `/fibonacci-trading WIPRO` |
| `/position-sizing RISK_PERCENT` | Calculate lot size for risk | `/position-sizing 2` |
| `/stop-loss-strategies SYMBOL` | Trailing stop, fixed stop logic | `/stop-loss-strategies HDFC` |
| `/trailing-stops SYMBOL PERCENT` | Dynamic stop placement | `/trailing-stops RELIANCE 5` |
| `/risk-reward-ratio ENTRY EXIT TARGET` | R:R calculation | `/risk-reward-ratio 100 95 120` |

### **Fundamental Analysis Skills (6 Commands)**

| Command | What It Does | Example |
|---------|-------------|---------|
| `/equity-research SYMBOL` | Full buy/sell rec + price target | `/equity-research AAPL` |
| `/dcf-valuation SYMBOL` | Intrinsic value calculation | `/dcf-valuation MSFT` |
| `/piotroski-f-score SYMBOL` | Financial quality score (0-9) | `/piotroski-f-score RELIANCE` |
| `/earnings-call-analysis SYMBOL` | Key takeaways + guidance | `/earnings-call-analysis APPLE` |
| `/insider-tracking SYMBOL` | Insider buys/sells | `/insider-tracking GOOGL` |
| `/sector-rotation` | Best/worst sectors this month | `/sector-rotation` |

### **LunarCrush Sentiment (5 Commands)**

| Command | What It Does | Example |
|---------|-------------|---------|
| `/analyze-sentiment SYMBOL` | Social media sentiment -100 to +100 | `/analyze-sentiment AAPL` |
| `/etf-sentiment SYMBOL` | ETF social score | `/etf-sentiment VTI` |
| `/india-sentiment INDA` | India-focused sentiment | `/india-sentiment INDA` |
| `/lunar-stocks SYMBOL` | LunarCrush stock data | `/lunar-stocks TSLA` |
| `/lunar-topic TOPIC` | Trending topic sentiment | `/lunar-topic "rate-hikes"` |

### **Claude Trading Skills — US Screening (8 Commands)**

| Command | What It Does | Example |
|---------|-------------|---------|
| `/canslim-screen` | Stocks meeting CANSLIM criteria | `/canslim-screen` |
| `/vpc-scan` | Volatility Contraction Pattern | `/vpc-scan` |
| `/finviz-screener` | FinViz screening results | `/finviz-screener` |
| `/economic-calendar-next-30-days` | Fed, CPI, jobs, earnings dates | `/economic-calendar-next-30-days` |
| `/etf-rotation-check` | Buy/hold/sell for ETF portfolio | `/etf-rotation-check` |
| `/sector-momentum-scan` | Best performing sectors (1yr) | `/sector-momentum-scan` |
| `/dividend-screener` | High-yield dividend stocks | `/dividend-screener` |
| `/technical-charting SYMBOL` | Candlestick patterns, support/resistance | `/technical-charting AAPL` |

### **Global Macro + ETF Skills (7 Commands)**

| Command | What It Does | Example |
|---------|-------------|---------|
| `/global-asset-allocation REBALANCE` | Stocks/bonds/commodities % | `/global-asset-allocation REBALANCE` |
| `/macro-regime-detect` | Risk-on/risk-off indicator | `/macro-regime-detect` |
| `/currency-hedge-check PAIR` | INR/USD, USD/EUR risk | `/currency-hedge-check INR` |
| `/etf-momentum-scan` | VTI, VEA, INDA, AGG, TLT, DBC | `/etf-momentum-scan` |
| `/diaspora-portfolio-risk-review` | NRI-specific risk check | `/diaspora-portfolio-risk-review` |
| `/global-sector-rotation` | Tech/Finance/Cyclicals by region | `/global-sector-rotation` |
| `/macro-catalyst-calendar` | What's happening this week (macro) | `/macro-catalyst-calendar` |

### **Data Analysis Skills (Built-in)**

| Command | What It Does | Example |
|---------|-------------|---------|
| `/data-analyze QUESTION` | Quick metric lookup | `/data-analyze "AAPL avg return last 1yr"` |
| `/data-create-viz DATA` | Chart builder | `/data-create-viz [AAPL daily closes]` |
| `/data-sql-queries QUERY` | SQL on your DB | `/data-sql-queries "SELECT * FROM scan_results"` |

### **Portfolio Tracker (Fortress App)**

| Command | What It Does | Example |
|---------|-------------|---------|
| `/portfolio` | List all strategies | `/portfolio` |
| `/portfolio-detail STRATEGY_ID` | Holdings + rebalance actions | `/portfolio-detail 10x-moonshot` |
| `/portfolio-rebalance-check` | Blood rule + drift alerts | `/portfolio-rebalance-check` |
| `/portfolio-edit STRATEGY_ID` | Update holdings | `/portfolio-edit 10x-moonshot` |

---

## 🎯 USE CASES (Ready-Made Workflows)

### **"I want to find the next hidden gem (NSE + global)"**
```
1. /hidden-gem-hunter
2. /nse-technical-analysis [symbol from results]
3. /analyze-sentiment [symbol]
4. /equity-research [symbol]
→ Output: Buy/sell rec with technical + sentiment + fundamental
```

### **"Should I rebalance my portfolio?"**
```
1. /portfolio-rebalance-check
2. /macro-regime-detect
3. /global-asset-allocation REVIEW
4. /diaspora-portfolio-risk-review
→ Output: Rebalance trigger + allocation shift
```

### **"Quick market health check"**
```
1. /macro-regime-detect
2. /sector-momentum-scan
3. /etf-momentum-scan
4. /economic-calendar-next-30-days
→ Output: Risk-on/off + top/bottom sectors + macro catalysts
```

### **"Deep dive on a stock"**
```
1. /equity-research [SYMBOL]
2. /nse-technical-analysis [SYMBOL]  # if NSE
3. /analyze-sentiment [SYMBOL]
4. /insider-tracking [SYMBOL]
5. /dcf-valuation [SYMBOL]  # if US
→ Output: Full recommendation with 5-layer analysis
```

### **"ETF allocation check"**
```
1. /etf-momentum-scan
2. /etf-rotation-check
3. /currency-hedge-check INR
4. /global-sector-rotation
→ Output: Buy/hold/sell per ETF + hedge recommendations
```

---

## ⚡ KEYBOARD SHORTCUTS

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + /` | Open skill search |
| `Cmd/Ctrl + K` | Command palette |
| `Cmd/Ctrl + Shift + L` | Clear chat history |
| `Up Arrow` | Repeat last command |

---

## 🔍 COMMON QUERIES

**"What's the best stock to buy in NSE right now?"**  
→ `/nse-technical-analysis [scan results]` + `/analyze-sentiment [symbol]`

**"Is it a good time to buy VTI?"**  
→ `/macro-regime-detect` + `/etf-momentum-scan` + `/etf-sentiment VTI`

**"How much should I allocate to India?"**  
→ `/global-asset-allocation REVIEW` + `/macro-regime-detect` + `/india-sentiment INDA`

**"Show me the economic calendar."**  
→ `/economic-calendar-next-30-days` + `/macro-catalyst-calendar`

**"What's the risk-reward for this trade?"**  
→ `/risk-reward-ratio [entry] [stop] [target]`

---

## ❌ COMMON MISTAKES (Avoid These)

| Mistake | Solution |
|---------|----------|
| Command doesn't work | Reload chat (Cmd+R), check skill registration |
| Sentiment shows "N/A" | LunarCrush not connected; verify in Settings → Connectors |
| Slow results | Macro data cached; re-run command to refresh |
| Error: "Unknown symbol" | Check ticker format: NSE = no suffix (HDFC not HDFC.NS) |
| Python error on ETF commands | Install dependencies: `pip install -r requirements.txt` |

---

## 📞 TROUBLESHOOTING

**Command types "/" but doesn't show in autocomplete?**
- Cowork Settings → Capabilities → Skills
- Add path: `~/.claude/skills/`
- Reload (Cmd+R)

**LunarCrush returning "Unauthorized"?**
- Settings → Connectors → LunarCrush
- Re-authenticate with fresh API key

**NSE symbols returning "Invalid"?**
- Use symbol without `.NS` suffix
- ✅ HDFC (correct)
- ❌ HDFC.NS (wrong)

---

## 📊 SYMBOL FORMATS

**NSE (India):** HDFC, RELIANCE, TCS, INFY, WIPRO (no suffix)  
**US Stocks:** AAPL, MSFT, GOOGL, TSLA, AMZN  
**US ETFs:** VTI, VOO, VEA, AGG, TLT, DBC, INDA  

---

**Last Updated:** June 19, 2026  
**Commands Updated:** All Phase 1 skills  
**Status:** ✅ Ready to Use Post-Installation
