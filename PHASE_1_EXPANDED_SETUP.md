# PHASE 1 EXPANDED SETUP — Fortress Intelligence Stock Analysis Toolkit
**Status:** Ready to Execute  
**Date:** June 19, 2026  
**Scope:** NSE + US Fundamentals + ETF Rotation + Global Macro  
**Timeline:** ~2 hours hands-on installation

---

## 🎯 PHASE 1 COMPONENTS (4 Tasks)

### **1. Wire Up 30 Custom NSE + InvestSkill Skills**
Your existing skills are here:
```
~/.claude/skills/
├── nse-trading-toolkit/
├── rsi-divergence/
├── multi-timeframe-analysis/
├── fibonacci-trading/
├── position-sizing/
├── stop-loss-strategies/
├── trailing-stops/
├── risk-reward-ratio/
├── nse-technical-analysis/
├── dcf-valuation/
├── piotroski-f-score/
├── earnings-call-analysis/
├── insider-tracking/
├── sector-rotation/
└── [15 more InvestSkill...]
```

**Action:** Register in Cowork skills registry
```bash
# In Cowork settings → Capabilities → Skills
# Add path: ~/.claude/skills/
# Reload chat
```

**Test Command:** Type `/nse-trading-toolkit` in chat

---

### **2. Connect LunarCrush MCP**
Real-time stock sentiment + social data

**Steps:**
1. Go to Cowork → Settings → Connectors
2. Search: "LunarCrush"
3. Click "Connect"
4. Authenticate with LunarCrush API key
5. Verify tools: Stocks, Cryptocurrencies, Topic, Posts

**Test Query:**
```
/analyze-sentiment AAPL
/etf-sentiment VTI
/india-sentiment INDA
```

**What You Get:**
- Real-time social sentiment scores
- Trending topics/hashtags
- Influencer mentions
- 24-48 hour momentum predictions

---

### **3. Install Claude Trading Skills (US + ETF Screening)**
**Source:** [github.com/tradermonty/claude-trading-skills](https://github.com/tradermonty/claude-trading-skills)

**Steps:**
```bash
cd ~/.claude/skills
git clone https://github.com/tradermonty/claude-trading-skills.git
cd claude-trading-skills

# Install dependencies
npm install
# or
pip install -r requirements.txt

# Copy skills to Cowork
cp -r skills/* ../
```

**Included Methodologies:**
- ✅ CANSLIM screening (US growth stocks)
- ✅ VCP (Volatility Contraction Pattern)
- ✅ FinViz screeners
- ✅ Economic calendar alerts
- ✅ Sector rotation logic
- ✅ ETF rotation (seasonal, momentum)

**Test Commands:**
```
/canslim-screen
/etf-rotation-check
/sector-momentum-scan
/economic-calendar-alerts
```

---

### **4. Install ETF + Global Macro Skills**
**Primary Source:** [github.com/45ck/llm-quant](https://github.com/45ck/llm-quant) (Macro ETF allocation)  
**Backup Source:** [github.com/agiprolabs/claude-trading-skills](https://github.com/agiprolabs/claude-trading-skills) (62 quant skills)

**Steps:**
```bash
# Macro ETF allocation
cd ~/.claude/skills
git clone https://github.com/45ck/llm-quant.git
cp -r llm-quant/skills/* ../

# Optional: 62 advanced quant skills
git clone https://github.com/agiprolabs/claude-trading-skills.git
cp -r agiprolabs-skills/* ../
```

**Included Capabilities:**
- ✅ Asset allocation rebalancing (stocks/bonds/commodities)
- ✅ Global macro regime detection (Fed, ECB, RBI, BOJ)
- ✅ Currency risk hedging (INR/USD pairs)
- ✅ Sector rotation across US/Europe/Asia
- ✅ ETF momentum screening (VTI, VEA, INDA, AGG, TLT, DBC)
- ✅ Macro catalyst calendar integration

**Test Commands:**
```
/global-asset-allocation REBALANCE
/macro-regime-detect
/currency-hedge-check INR
/etf-momentum-scan
/diaspora-portfolio-review
```

---

## 📋 INTEGRATION CHECKLIST

- [ ] 30 custom NSE/InvestSkill skills registered in Cowork
- [ ] LunarCrush MCP connected + authenticated
- [ ] Claude Trading Skills installed (tradermonty repo)
- [ ] ETF + Global Macro skills installed (45ck + agiprolabs repos)
- [ ] All "/" commands tested and working
- [ ] Memory updated with skill locations
- [ ] Quick-reference guide saved locally

---

## 🧪 END-TO-END TEST WORKFLOW

**Use Case:** Analyze HDFC (NSE) + VTI (US ETF) + Global macro for NRI investor

```
Step 1: NSE Technical Analysis
/nse-technical-analysis HDFC
→ RSI, MACD, SMA trends, entry/exit signals

Step 2: US ETF Momentum
/etf-momentum-scan
→ VTI, VEA, AGG, TLT screening (buy/hold/sell)

Step 3: Real-Time Sentiment
/analyze-sentiment AAPL
→ LunarCrush social sentiment score

Step 4: Global Macro Context
/macro-regime-detect
→ Fed policy, ECB stance, RBI impact, risk-on/risk-off

Step 5: Portfolio Allocation
/global-asset-allocation REVIEW
→ Rebalancing recommendation (stocks %, bonds %, commodities %)

Step 6: Fundamental Deep Dive (Optional)
/equity-research HDFC
→ P/E, PEG, Piotroski F-Score, insider tracking, earnings quality

OUTPUT: Actionable signal with:
- Technical setup (NSE stock)
- Sentiment overlay (LunarCrush)
- Macro context (global regime)
- ETF rotation advice
- Allocation recommendation
```

---

## 🔧 SKILL ACTIVATION COMMANDS (Copy-Paste Ready)

### **To Register Skills in Cowork:**
```
Cowork Settings → Capabilities → Skills Tab
Add Path: ~/.claude/skills/
Reload Chat (Cmd+R)
```

### **To Test 30 Custom Skills:**
```bash
# Test NSE tools
/nse-trading-toolkit
/rsi-divergence
/fibonacci-trading
/position-sizing

# Test InvestSkill tools
/equity-research HDFC
/dcf-valuation AAPL
/piotroski-f-score RELIANCE
/insider-tracking

# Test crypto bot
/kyro-challenge-status
```

### **To Test LunarCrush:**
```bash
/lunar-stocks AAPL
/lunar-cryptocurrencies BTC
/lunar-topic "market-rally"
/lunar-sentiment-trend
```

### **To Test Claude Trading Skills:**
```bash
/canslim-screen
/vpc-chart-scan
/finviz-screener
/economic-calendar-next-30-days
```

### **To Test ETF + Global Macro:**
```bash
/global-asset-allocation REBALANCE
/macro-regime-detect
/etf-rotation-check
/currency-hedge-check INR
/diaspora-portfolio-risk-review
```

---

## 📊 RESULTING TOOLKIT (After Phase 1)

| Category | Tools | Commands |
|----------|-------|----------|
| **NSE Trading** | 9 skills | `/nse-*`, `/rsi-*`, `/fibonacci-*` |
| **US Fundamentals** | 6 InvestSkills | `/equity-research`, `/dcf-*`, `/piotroski-*` |
| **Sentiment** | LunarCrush MCP | `/lunar-*`, `/analyze-sentiment` |
| **US Screening** | Claude Trading Skills | `/canslim-*`, `/etf-*`, `/sector-*` |
| **Global Macro** | ETF + Macro Skills | `/global-*`, `/macro-*`, `/currency-*` |
| **Portfolio Tracking** | Fortress Tracker | `/portfolio`, `/rebalance-check` |
| **Data Analysis** | Built-in skills | `/data-analyze`, `/data-viz`, `/sql-queries` |

**Total: 100+ Commands Ready**

---

## ⚠️ KNOWN ISSUES & SOLUTIONS

| Issue | Solution |
|-------|----------|
| Skills don't show as "/" commands | Reload Cowork (Cmd+R), check ~/.claude/skills/ path |
| LunarCrush auth fails | Verify API key in Cowork Settings → Connectors |
| Python dependencies missing (for ETF skills) | `pip install -r requirements.txt` in skill directory |
| Skill name conflicts (same skill in multiple repos) | Keep newest version, rename others with `-v2` suffix |
| Macro data stale (>24hrs old) | Re-run `/macro-regime-detect` to refresh |

---

## 📝 NEXT STEPS (After Phase 1 Complete)

### **Phase 2 (Week 2) — Depth Layer**
- Fundamental analysis screening (P/E ratios, earnings quality)
- Advanced time-series forecasting (ARIMA, GARCH)
- Insider tracking integration
- Earnings call sentiment analysis

### **Phase 3 (Week 3) — Feedback & Learning Engine**
- Track user allocation preferences over time
- Build personalized scoring model
- A/B test screening methodologies
- Collect diaspora-specific signals

---

## 🎓 DOCUMENTATION REFERENCES

- [Claude Trading Skills Guide](https://github.com/tradermonty/claude-trading-skills)
- [LLM-Quant Macro ETF Framework](https://github.com/45ck/llm-quant)
- [62 Advanced Quant Skills](https://github.com/agiprolabs/claude-trading-skills)
- [Fortress Intelligence Main Docs](./CLAUDE.md)
- [Portfolio Tracker Guide](./PORTFOLIO_TRACKER.md)

---

**Last Updated:** June 19, 2026 | 14:42 UTC  
**Status:** Ready for Execution ✅  
**Estimated Time to Complete:** 2 hours  
**Complexity:** Non-technical (copy-paste installation steps)  
**Hands-off:** Yes — CLI commands only, no coding required
