# Phase 3B: Trading Skill Integration — Skill-to-Signal Mapping

**Status:** Ready for Month 2 Implementation  
**Duration:** Week 2–3 (integration + testing)  
**Owner:** Claude (autonomous implementation)  
**Reference:** agiprolabs/claude-trading-skills + tradermonty frameworks

---

## Overview

Phase 3B connects your 30 trading skills to the **agiprolabs/tradermonty framework** and integrates them into **Fortress 30 ranking algorithm**.

**Current state:** 30 trading skills exist but are unused  
**Goal:** Each skill generates a signal (bullish/neutral/bearish) that inputs to GEM SCORE computation

**Result:**
```
Fortress 30 Stock Card (Phase 3A):
  GEM SCORE: 87/100
  Why: Valuation edge + institutional blindspot + fundamentals

Fortress 30 Stock Card (Phase 3B):
  GEM SCORE: 87/100
  + TRADING SIGNALS: RSI Divergence (BULLISH) | Multi-Timeframe (BULLISH) | Position Sizing (LOW RISK)
  + BACKTEST VALIDATION: Similar patterns returned 12% avg return over 3Y
```

---

## 1. Your 30 Trading Skills Inventory

### NSE-Specific Skills (9)
1. **nse-trading-toolkit** — General NSE market mechanics
2. **rsi-divergence** — RSI (Relative Strength Index) divergence signals
3. **multi-timeframe-analysis** — Combining 1D / 4H / 1H signals
4. **fibonacci-trading** — Fibonacci retracement / expansion levels
5. **position-sizing** — Kelly criterion, risk-per-trade sizing
6. **stop-loss-strategies** — Placement + tightening rules
7. **trailing-stops** — Dynamic stop levels for trending stocks
8. **risk-reward-ratio** — Assessing R:R before entry
9. **nse-technical-analysis** — Candlestick patterns, trend identification

### InvestSkill Items (21)
10–30. DCF valuation, Piotroski F-Score, earnings call analysis, insider tracking, sector rotation, institutional reports, etc.

---

## 2. Skill-to-Signal Mapping

### 2.1 RSI Divergence Signal

**Skill:** `rsi-divergence`  
**Input:** Stock price (last 60 days) + RSI (last 60 days)  
**Computation:**

```python
def generate_rsi_divergence_signal(price_data, rsi_data):
    """
    RSI Divergence = Price makes lower low but RSI makes higher low (or vice versa)
    Bullish divergence = potential reversal to upside
    Bearish divergence = potential reversal to downside
    """
    # Identify lower low in price (2 swings)
    recent_low_1 = find_local_minimum(price_data[-30:])
    recent_low_2 = find_local_minimum(price_data[-60:-30])
    
    # Identify corresponding RSI
    rsi_at_low_1 = rsi_data[recent_low_1['index']]
    rsi_at_low_2 = rsi_data[recent_low_2['index']]
    
    if recent_low_1['price'] < recent_low_2['price'] and rsi_at_low_1 > rsi_at_low_2:
        # BULLISH DIVERGENCE: Price lower but RSI higher = buying opportunity
        return {
            'signal': 'BULLISH',
            'strength': (rsi_at_low_1 - rsi_at_low_2) / 100,  # 0-1 scale
            'explanation': f"Bullish divergence: price made lower low at {recent_low_1['price']:.2f} but RSI recovered to {rsi_at_low_1:.1f}"
        }
    elif recent_low_1['price'] > recent_low_2['price'] and rsi_at_low_1 < rsi_at_low_2:
        # BEARISH DIVERGENCE
        return {
            'signal': 'BEARISH',
            'strength': (rsi_at_low_2 - rsi_at_low_1) / 100,
            'explanation': f"Bearish divergence: price made higher high but RSI weakened"
        }
    else:
        return {
            'signal': 'NEUTRAL',
            'strength': 0,
            'explanation': "No clear RSI divergence detected"
        }
```

**Output to GEM SCORE:**
- BULLISH: +8 points to momentum divergence score
- NEUTRAL: +0 points
- BEARISH: -5 points (warning flag)

---

### 2.2 Multi-Timeframe Analysis Signal

**Skill:** `multi-timeframe-analysis`  
**Input:** Price data (1D / 4H / 1H timeframes)  
**Computation:**

```python
def generate_multiframe_signal(price_1d, price_4h, price_1h):
    """
    Multi-timeframe = All timeframes aligned in same direction
    Higher conviction if 1D + 4H + 1H all bullish
    """
    trend_1d = detect_trend(price_1d[-60:])  # 'UPTREND' / 'DOWNTREND' / 'SIDEWAYS'
    trend_4h = detect_trend(price_4h[-60:])
    trend_1h = detect_trend(price_1h[-60:])
    
    # Count bullish timeframes
    bullish_count = sum([t == 'UPTREND' for t in [trend_1d, trend_4h, trend_1h]])
    bearish_count = sum([t == 'DOWNTREND' for t in [trend_1d, trend_4h, trend_1h]])
    
    if bullish_count == 3:
        return {
            'signal': 'BULLISH',
            'strength': 1.0,  # Max conviction
            'explanation': "All timeframes aligned bullish (1D uptrend + 4H uptrend + 1H uptrend)"
        }
    elif bullish_count == 2:
        return {
            'signal': 'BULLISH',
            'strength': 0.67,
            'explanation': f"2 of 3 timeframes bullish"
        }
    elif bearish_count >= 2:
        return {
            'signal': 'BEARISH',
            'strength': 0.67,
            'explanation': f"{bearish_count} timeframe(s) in downtrend"
        }
    else:
        return {
            'signal': 'NEUTRAL',
            'strength': 0,
            'explanation': "Timeframes conflicting or sideways"
        }
```

**Output to GEM SCORE:**
- BULLISH (3/3): +10 points
- BULLISH (2/3): +6 points
- BEARISH: -8 points
- NEUTRAL: +0 points

---

### 2.3 Position Sizing Signal

**Skill:** `position-sizing`  
**Input:** Account size, stock volatility, risk tolerance  
**Computation:**

```python
def generate_position_sizing_signal(stock_volatility, account_size, stock_price, stop_loss_price):
    """
    Position Sizing = Kelly criterion + Risk-per-trade
    Low volatility + large position size = GREEN signal (high conviction playable)
    High volatility + forced small position = YELLOW warning
    """
    # Kelly Criterion
    position_size = kelly_position_size(
        win_rate=0.55,  # Assuming 55% win rate
        avg_win=0.03,   # 3% avg win
        avg_loss=0.02   # 2% avg loss
    )
    
    # Risk per trade (%)
    risk_pct = abs(stock_price - stop_loss_price) / stock_price
    
    if risk_pct <= 0.02:  # <=2% risk = tight stop = playable
        return {
            'signal': 'GREEN',  # Position-able
            'position_size': position_size,
            'risk_per_trade_pct': risk_pct * 100,
            'explanation': f"Low risk setup: {risk_pct*100:.2f}% stop loss"
        }
    elif risk_pct <= 0.04:
        return {
            'signal': 'YELLOW',
            'position_size': position_size * 0.7,  # Reduce size
            'risk_per_trade_pct': risk_pct * 100,
            'explanation': f"Moderate risk: {risk_pct*100:.2f}% stop loss"
        }
    else:
        return {
            'signal': 'RED',  # Skip
            'position_size': 0,
            'risk_per_trade_pct': risk_pct * 100,
            'explanation': f"High risk: {risk_pct*100:.2f}% stop loss — avoid"
        }
```

**Output to GEM SCORE:**
- GREEN: +4 points (playable setup)
- YELLOW: +0 points (neutral, needs larger conviction)
- RED: -5 points (risk flag)

---

### 2.4 Fibonacci Trading Signal

**Skill:** `fibonacci-trading`  
**Input:** Recent swing high/low (identifying impulse wave)  
**Computation:**

```python
def generate_fibonacci_signal(swing_high, swing_low, current_price):
    """
    Fibonacci = Support/resistance at .382, .50, .618 retracements
    If price bounces off .618 (golden ratio), high probability rally
    """
    range_size = swing_high - swing_low
    
    fib_618 = swing_high - (range_size * 0.618)
    fib_50 = swing_high - (range_size * 0.50)
    fib_382 = swing_high - (range_size * 0.382)
    
    # Check if price is near strong support
    if abs(current_price - fib_618) < (range_size * 0.02):  # Within 2% of 0.618
        return {
            'signal': 'BULLISH',
            'level': 'FIB_618',
            'explanation': f"Price at golden ratio (0.618 retracement) — high probability support bounce"
        }
    elif abs(current_price - fib_50) < (range_size * 0.02):
        return {
            'signal': 'NEUTRAL',
            'level': 'FIB_50',
            'explanation': f"Price at midpoint (0.50 retracement) — 50/50 odds"
        }
    else:
        return {
            'signal': 'NEUTRAL',
            'level': 'NONE',
            'explanation': f"Price not aligned with Fibonacci support"
        }
```

**Output to GEM SCORE:**
- At 0.618: +5 points (strong setup)
- At 0.50: +2 points (neutral)
- Other: +0 points

---

### 2.5 Risk-Reward Ratio Signal

**Skill:** `risk-reward-ratio`  
**Input:** Entry price, stop loss, take profit target  
**Computation:**

```python
def generate_risk_reward_signal(entry_price, stop_loss_price, tp_price):
    """
    Risk-Reward = Potential profit / Potential loss
    Minimum 1:2 R:R acceptable for trading
    """
    risk = abs(entry_price - stop_loss_price)
    reward = abs(tp_price - entry_price)
    
    ratio = reward / risk if risk > 0 else 0
    
    if ratio >= 2.0:
        return {
            'signal': 'EXCELLENT',
            'ratio': ratio,
            'explanation': f"Excellent R:R of 1:{ratio:.1f} — high expectancy"
        }
    elif ratio >= 1.5:
        return {
            'signal': 'GOOD',
            'ratio': ratio,
            'explanation': f"Good R:R of 1:{ratio:.1f}"
        }
    elif ratio >= 1.0:
        return {
            'signal': 'FAIR',
            'ratio': ratio,
            'explanation': f"Fair R:R of 1:{ratio:.1f} — minimum acceptable"
        }
    else:
        return {
            'signal': 'POOR',
            'ratio': ratio,
            'explanation': f"Poor R:R of 1:{ratio:.1f} — avoid"
        }
```

**Output to GEM SCORE:**
- EXCELLENT (≥2:1): +6 points
- GOOD (≥1.5:1): +4 points
- FAIR (≥1:1): +1 point
- POOR: -3 points

---

### 2.6 Insider Tracking Signal (InvestSkill)

**Skill:** `insider-tracking`  
**Input:** Recent insider buys/sells (last 6 months)  
**Computation:**

```python
def generate_insider_signal(insider_transactions):
    """
    Insider = Management buying = conviction
    Multiple buys by different insiders = strong conviction
    """
    buy_count = insider_transactions['buys']
    sell_count = insider_transactions['sells']
    
    net_sentiment = buy_count - sell_count
    
    if net_sentiment >= 3:
        return {
            'signal': 'STRONG_BULLISH',
            'explanation': f"Strong insider buying: {buy_count} buys vs {sell_count} sells"
        }
    elif net_sentiment == 2:
        return {
            'signal': 'BULLISH',
            'explanation': f"Insider buying: {buy_count} buys vs {sell_count} sells"
        }
    elif net_sentiment >= 0:
        return {
            'signal': 'NEUTRAL',
            'explanation': f"Mixed insider activity"
        }
    else:
        return {
            'signal': 'BEARISH',
            'explanation': f"Insider selling: {sell_count} sells (management exiting)"
        }
```

**Output to GEM SCORE:**
- STRONG_BULLISH: +8 points
- BULLISH: +5 points
- NEUTRAL: +0 points
- BEARISH: -5 points

---

## 3. Signal Integration into GEM SCORE

### Current GEM SCORE (Phase 3A)

```
GEM SCORE = Valuation Edge (25) + Institutional Blindspot (25) + Fundamentals (25) + Momentum Divergence (25)
```

### New GEM SCORE (Phase 3B)

**Momentum Divergence Layer (25 points) now includes:**

```
Momentum Divergence Score = {
    Price-to-Fundamentals Gap: 12 points
    + RSI Divergence Signal: 8 points
    + Multi-Timeframe Alignment: 10 points
    + Fibonacci Support Test: 5 points
} 
Capped at 25 points
```

**New Input Layers:**

```
Technical Strength (25 points) = {
    RSI Divergence: 0-8 points
    + Multi-Timeframe: 0-10 points
    + Position Sizing Playability: 0-4 points
    + Fibonacci Alignment: 0-5 points
}

Conviction Signals (10 points) = {
    Insider Buying: 0-8 points
    + Risk-Reward Ratio: 0-6 points
    + Volume Confirmation: 0-4 points
}

Revised GEM SCORE = Valuation (25) + Institutional (25) + Fundamentals (25) + Technical (25) + Conviction (10)
Scale: 0-135 → Normalize to 0-100
```

---

## 4. Signal Generation Pipeline

```
Daily Job:
  FOR each stock in NSE (1,085) + US (346):
    1. Fetch price data (last 60 days, 1D/4H/1H)
    2. Fetch stock fundamentals (FactSet)
    3. Fetch insider transactions (FactSet)
    4. Compute all 6 signals:
       - RSI Divergence
       - Multi-Timeframe
       - Position Sizing
       - Fibonacci
       - Risk-Reward (vs historical levels)
       - Insider Tracking
    5. Aggregate signals into Technical Strength + Conviction layers
    6. Compute revised GEM SCORE
    7. Update gem_scores table
    8. Update Fortress 30 UI

Cache:
  - Signals cached for 24h
  - Manual refresh available if price moves >3%
```

---

## 5. UI/UX Integration

### Fortress 30 Stock Card (with Phase 3B)

```
Stock Name | Risk Tier | Price | Change%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GEM SCORE: 87/100 (Elite Gem) [Gold badge]

Why This Stock Is a Gem:
• Trading at 45% discount to sector peers
• Institutional investors underweight (8.2% holding)
• Revenue growth 22% YoY, ROE 18%

Trading Signals:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 RSI Divergence: BULLISH (strength: 0.85)
   └─ Bullish divergence: price made lower low but RSI recovered

📊 Multi-Timeframe: BULLISH (3/3)
   └─ All timeframes aligned uptrend (1D + 4H + 1H)

⚙️ Position Sizing: GREEN (playable)
   └─ Low risk setup: 1.8% stop loss

📍 Fibonacci: FIB_618 Support
   └─ Price at golden ratio support level

💡 Risk-Reward: EXCELLENT (1:2.3)
   └─ High expectancy setup

👥 Insider: STRONG BULLISH
   └─ 4 insider buys vs 1 sell (Q2 2026)

Conviction: 8.2/10 (All signals aligned)

What Could Go Wrong:
• Debt-to-equity 1.8x — monitor leverage
```

---

## 6. Testing & Validation

### 6.1 Signal Accuracy Test

```python
# Backtest signals on past 2 years of data
# Verify: Stocks with BULLISH + BULLISH + EXCELLENT scores
# vs Stocks with NEUTRAL scores
# Expected: BULLISH picks outperform by 8-12% annualized

def backtest_signals():
    pass_stocks = []
    for ticker in all_stocks:
        historical_signals = compute_signals(ticker, date_range='2024-2026')
        historical_returns = get_returns(ticker, date_range='2024-2026')
        
        # Correlation: Signal strength vs return
        correlation = pearson_correlation(historical_signals, historical_returns)
        pass_stocks.append({
            'ticker': ticker,
            'signal_return_correlation': correlation
        })
    
    avg_correlation = mean([s['signal_return_correlation'] for s in pass_stocks])
    assert avg_correlation > 0.25  # Positive correlation
```

### 6.2 Signal Independence Test

```python
# Verify signals are not redundant
# RSI Divergence should not perfectly correlate with Multi-Timeframe (or they're redundant)

for signal_pair in ['rsi_vs_multiframe', 'fibonacci_vs_rr', 'insider_vs_technical']:
    correlation = compute_correlation(signal_pair)
    assert correlation < 0.75  # Signals should be somewhat independent
```

### 6.3 Manual Spot Checks

- [ ] Top 10 Elite Gems: All have BULLISH technical signals
- [ ] Trading signals make sense (match visual chart inspection)
- [ ] Insider signals correspond to actual insider transactions
- [ ] Fibonacci levels align with chart resistance

---

## 7. Integration with agiprolabs Framework

**Reference:** agiprolabs/claude-trading-skills (60+ skills)

**We use their:**
- Data pipeline (EODHD / yfinance integration)
- Backtesting framework (walk-forward, Monte Carlo)
- Market screening (CANSLIM, VCP adapters)

**We extend with:**
- Fortress-specific hidden gem scoring
- GEM SCORE input from trading signals
- Portfolio Tracker integration (rebalance signals)

---

## 8. Dependencies

- ✅ Phase 3A complete (GEM SCORE base)
- ✅ Price data pipeline (existing yfinance integration)
- ✅ Insider transaction data (FactSet)
- ✅ Your 30 trading skills (already installed)
- 🔗 agiprolabs framework (reference, not hard dependency)

---

## 9. Success Criteria (Phase 3B)

✅ All 6 trading signals generated for 1,431 stocks daily  
✅ Signals integrated into GEM SCORE algorithm  
✅ Fortress 30 displays trading signals + explanations  
✅ Backtest validation: Signal correlation with returns >0.25  
✅ Manual spot checks pass (signals match chart patterns)  
✅ Top 20 Elite Gems all have mostly BULLISH signals  
✅ Fortress 30 filterable by "All Signals Bullish"  

---

**Ready for implementation Week 2 of Month 2 (after Phase 3A complete).**
