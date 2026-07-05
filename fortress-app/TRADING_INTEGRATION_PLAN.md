# Fortress Intelligence — Trading Integration Plan
**Created:** May 21, 2026  
**Status:** Phase 1 COMPLETE ✅ | Phase 2 Ready | Phase 3 Planned

---

## ✅ PHASE 1 — COMPLETE (Skills Installed Today)

### What Was Installed

#### NSE Trading Skills (9 skills) → `~/.claude/skills/`
Zero dependencies. Pure analytical frameworks for Indian markets.

| Skill | Use With Fortress |
|-------|-------------------|
| `nse-trading-toolkit` | Master orchestrator — run all NSE analysis in one command |
| `nse-technical-analysis` | Chart interpretation, support/resistance for NSE stocks |
| `rsi-divergence` | Detect RSI divergences in Fortress 30 NSE candidates |
| `multi-timeframe-analysis` | 3-screen method (weekly/daily/hourly) for conviction scoring |
| `fibonacci-trading` | Entry zones + extension targets for NSE breakouts |
| `position-sizing` | ATR-based + Kelly criterion sizing for any trade |
| `stop-loss-strategies` | Structure/ATR/MA stops for Fortress 30 picks |
| `trailing-stops` | Dynamic stops — chandelier exits, ATR trails |
| `risk-reward-ratio` | R:R filter, expected value, minimum threshold by win rate |

**How to use now:**
```
/nse-trading-toolkit HDFC      → Full NSE analysis on any stock
/rsi-divergence RELIANCE       → RSI divergence detection
/multi-timeframe-analysis INFY → 3-screen confluence score
```

---

#### InvestSkill (21 skills) → `~/.claude/skills/`
Institutional-grade research frameworks. No runtime — pure prompts.

| Skill | Use With Fortress |
|-------|-------------------|
| `invest-stock-eval` | Piotroski F-Score + ROIC + quality rating → upgrades mbScore |
| `invest-fundamental-analysis` | Income statement + balance sheet + cash flow |
| `invest-dcf-valuation` | DCF with WACC sensitivity + bull/base/bear scenarios |
| `invest-stock-valuation` | P/E, P/S, EV/EBITDA comparables |
| `invest-technical-analysis` | Chart patterns + moving averages + RSI/MACD |
| `invest-financial-report-analyst` | Parse 10-K/10-Q with red flag identification |
| `invest-earnings-call-analysis` | Management tone + guidance changes + hidden risks |
| `invest-insider-trading` | SEC Form 4 patterns + net buy/sell sentiment |
| `invest-institutional-ownership` | 13F holdings changes + smart money flows |
| `invest-dividend-analysis` | Payout safety + yield trap detection |
| `invest-short-interest` | Short ratio + days-to-cover + squeeze probability |
| `invest-competitor-analysis` | Moat scoring + Porter's Five Forces |
| `invest-options-analysis` | Greeks + IV rank + earnings strategies |
| `invest-sector-analysis` | Rotation signals + relative strength |
| `invest-economics-analysis` | Macro indicators + recession probability |
| `invest-portfolio-review` | Allocation health + concentration risk |
| `invest-research-bundle` | Chains all frameworks into unified thesis |
| `invest-full-report` | Runs ALL modules → exports HTML report |
| `invest-report-generator` | Professional HTML/PDF output |
| `invest-chart-master` | Mermaid + Chart.js visualizations |
| `invest-result-validator` | Scores analysis on data quality + methodology |

**How to use now:**
```
/invest-stock-eval AAPL           → Piotroski F-Score + quality signals
/invest-fundamental-analysis TSLA → Full financials breakdown
/invest-full-report HDFC          → Complete institutional report (HTML)
/invest-research-bundle RELIANCE  → Unified investment thesis
```

---

#### Equity Research Command → `.claude/commands/equity-research/`
```
/equity-research/research SYMBOL → Institutional buy/sell recommendation
                                    with DCF, scenarios, options flow,
                                    insider activity, SEC filings, price target
```

---

## PHASE 2 — READY TO START (Add FMP API Key)

### What You Need
```bash
# Add to .env on VPS and locally:
FMP_API_KEY=your_key_here   # Free tier: 250 req/day at financialmodelingprep.com
```

### What It Unlocks
- `tradermonty/claude-trading-skills` — 40+ skills including CANSLIM, VCP, macro regime
- `invest-insider-trading` — live SEC Form 4 data
- `invest-institutional-ownership` — live 13F filings
- `invest-earnings-call-analysis` — live earnings transcript parsing

### Installation (when ready)
```bash
cd ~/.claude/skills
git clone https://github.com/tradermonty/claude-trading-skills.git
cp -r claude-trading-skills/skills/* .
```

---

## PHASE 3 — AUTONOMOUS TRADING → ⚠️ MOVED TO ARUN'S PROJECT

> **Decision (May 21, 2026):** The autonomous trading agent does NOT belong in Fortress Intelligence.
> Fortress is a research + screening platform. Autonomous execution belongs in the ARUN Trading Bot ecosystem.
>
> **TODO file:** `C:/Antigravity/TradingBots-Aruns Project/TODO.md`
> **Agent source:** `C:/Antigravity/trading-repos/autonomous_trading_agent/`
>
> Everything below is kept for reference only.

---
### (REFERENCE ONLY — See ARUN Project)
#### Autonomous Trading Agent (andy-12-08)

### Repo
`C:/Antigravity/trading-repos/autonomous_trading_agent`

### Architecture Summary
```
main.py → bootstrap.py → scheduler
                          ├── Morning Study (9:15–9:34 ET)     Claude reads market context
                          ├── Scan & Trade (every 10 min)      Score → enrich → Claude decides
                          ├── Position Mgmt (every 2 min)      ATR stops, partial profits, force-close
                          └── Weekly Backtest (Sunday 8 AM)    180-day simulation + expectancy update
```

### Signal Scoring (7 dimensions, 0–10 scale)
| Dimension | Max Points | What It Measures |
|-----------|-----------|-----------------|
| Trend | 3.0 | EMA9 > EMA21 > EMA50, VWAP position |
| Momentum | 2.5 | MACD histogram, crossover, 10-bar momentum |
| Volume | 2.0 | vol_ratio vs 20-bar average |
| ATR | 1.5 | Volatility in tradeable sweet spot |
| RSI | 1.0 | Sweet-spot bonus; overbought/oversold penalties |
| Multi-TF | 3.0 | 15-min + daily bias alignment |
| Structural | 5.0 | RS vs SPY, FVG, volume profile, POC |

### Conviction Tiers
| Score | Position Size | Meaning |
|-------|-------------|---------|
| ≥ 8.5 | 60% of daily cap (~$2,400) | High conviction |
| ≥ 7.5 | 50% of daily cap (~$2,000) | Strong |
| < 7.5 | 30% of daily cap (~$1,200) | Standard |

### 7 Hard Risk Gates (runs before EVERY order)
1. Earnings blackout window → SKIP
2. Revenge-trade guard (recent loss) → SKIP
3. Dynamic confidence bar (win rate < 40%) → SKIP
4. Sector exposure limit exceeded → SKIP
5. Position correlation too high → SKIP
6. Good-faith violation (GFV) check → SKIP
7. ATR recomputes stops/take-profit → OVERRIDES Claude

### Hard Caps
- Max daily capital: $4,000
- Max risk per trade: $100 (0.75% target, 1% ceiling)
- Max concurrent positions: 4
- Daily drawdown limit: $200 (2%)
- Max trades/day: 10

### Fortress Integration Path

#### Step 1 — Environment Setup (Week 1 of Month 2)
```bash
# .env additions needed:
ALPACA_KEY=your_paper_key
ALPACA_SECRET=your_paper_secret
ALPACA_ENDPOINT=https://paper-api.alpaca.markets   # PAPER FIRST
ANTHROPIC_API_KEY=already_have_this
```

#### Step 2 — Schema Bridge (map agent output → Fortress DB)
The agent uses SQLite internally. We need a bridge to write signals to Fortress PostgreSQL:

```sql
-- New table: autonomous_signals
CREATE TABLE autonomous_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  market TEXT NOT NULL DEFAULT 'US',
  signal_score NUMERIC,           -- 0-10 from SignalScorer
  conviction_tier TEXT,           -- 'high' | 'strong' | 'standard'
  macd_cross TEXT,
  rsi NUMERIC,
  ema_stack TEXT,                 -- 'bullish' | 'bearish' | 'mixed'
  vol_ratio NUMERIC,
  action TEXT,                    -- 'BUY' | 'SELL' | 'HOLD' | 'SKIP'
  skip_reason TEXT,               -- populated if action = 'SKIP'
  claude_reasoning TEXT,          -- Claude's decision rationale
  entry_price NUMERIC,
  stop_price NUMERIC,
  target_price NUMERIC,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed BOOLEAN DEFAULT FALSE,
  paper_only BOOLEAN DEFAULT TRUE  -- SAFETY FLAG: must be set FALSE manually
);
```

#### Step 3 — Paper Trading Validation (30 days minimum)
- Run paper-only for 30 trading days
- Track: win rate, expectancy, max drawdown, Sharpe ratio
- Target before going live: win rate > 45%, expectancy > 0.3R, max DD < 8%

#### Step 4 — Fortress 30 Synergy
Once validated, the agent's signal scores can feed INTO Fortress 30:
- Stocks scoring ≥ 7.5 on the day → promote in Fortress 30 rankings
- Stocks scoring < 4.0 → flag as "Under Pressure" in UI
- Real-time `mbScore` updates from live signal data

### Dependencies to Install (VPS)
```bash
pip install alpaca-py anthropic pandas numpy ta requests python-dotenv apscheduler yfinance pytz
```

---

## QUICK REFERENCE — What You Can Use RIGHT NOW

```bash
# NSE Analysis
/nse-trading-toolkit SYMBOL       # Full India market analysis
/rsi-divergence SYMBOL            # RSI divergence signals
/multi-timeframe-analysis SYMBOL  # 3-screen confluence

# Fundamental Research
/invest-stock-eval SYMBOL         # Piotroski F-Score + quality
/invest-fundamental-analysis SYM  # Full financials
/invest-dcf-valuation SYMBOL      # Intrinsic value calculation
/invest-full-report SYMBOL        # Complete institutional report

# Equity Research
/equity-research/research SYMBOL  # Buy/sell rec with price target

# Screeners (no API key needed)
/invest-sector-analysis           # Which sectors leading/lagging
/invest-economics-analysis        # Macro regime check
```

---

## FILE LOCATIONS
```
C:/Antigravity/trading-repos/
├── nse-trading-skills/          ← Source (already installed to ~/.claude/skills/)
├── InvestSkill/                 ← Source (already installed to ~/.claude/skills/)
├── claude-equity-research/      ← Source (installed to .claude/commands/)
└── autonomous_trading_agent/    ← Source for Phase 3 integration

~/.claude/skills/
├── nse-trading-toolkit/         ✅ LIVE
├── nse-technical-analysis/      ✅ LIVE
├── rsi-divergence/              ✅ LIVE
├── multi-timeframe-analysis/    ✅ LIVE
├── fibonacci-trading/           ✅ LIVE
├── position-sizing/             ✅ LIVE
├── stop-loss-strategies/        ✅ LIVE
├── trailing-stops/              ✅ LIVE
├── risk-reward-ratio/           ✅ LIVE
├── invest-stock-eval/           ✅ LIVE
├── invest-fundamental-analysis/ ✅ LIVE
├── invest-dcf-valuation/        ✅ LIVE
├── invest-stock-valuation/      ✅ LIVE
├── invest-technical-analysis/   ✅ LIVE
├── invest-earnings-call-analysis/ ✅ LIVE
├── invest-financial-report-analyst/ ✅ LIVE
├── invest-insider-trading/      ✅ LIVE
├── invest-institutional-ownership/ ✅ LIVE
├── invest-dividend-analysis/    ✅ LIVE
├── invest-short-interest/       ✅ LIVE
├── invest-competitor-analysis/  ✅ LIVE
├── invest-options-analysis/     ✅ LIVE
├── invest-sector-analysis/      ✅ LIVE
├── invest-economics-analysis/   ✅ LIVE
├── invest-portfolio-review/     ✅ LIVE
├── invest-research-bundle/      ✅ LIVE
├── invest-full-report/          ✅ LIVE
├── invest-report-generator/     ✅ LIVE
├── invest-chart-master/         ✅ LIVE
└── invest-result-validator/     ✅ LIVE

C:/Antigravity/Fortress/.claude/commands/
└── equity-research/research.md  ✅ LIVE
```
