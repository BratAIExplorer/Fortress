# Phase 3A: Stock Intelligence Depth — Detailed Technical Specs

**Status:** Ready for Month 2 Implementation  
**Duration:** Week 1–2 (10 business days)  
**Owner:** Claude (autonomous implementation)  
**Deliverables:** API integration specs, database schema, GEM SCORE algorithm, test suite

---

## Overview

Phase 3A transforms Fortress 30 from a basic screener into a **Hidden Gem Discovery Engine** by:
1. Integrating institutional data (FactSet, screener.in)
2. Implementing 4-layer Hidden Gem framework
3. Computing GEM SCORE (0–100) for ranking
4. Displaying "Why This Stock" explainability

**Success Criteria:**
- ✅ Fortress 30 shows 5+ new metrics per stock (institutional holding %, analyst coverage, insider trends)
- ✅ GEM SCORE computed and ranked for all 1,085 NSE + 346 US stocks
- ✅ "Why This Stock Is a Gem" explanation visible to user
- ✅ Filter by gem tier (Elite 80–100 / Promising 60–79 / Watch 40–59)

---

## 1. Data Integration Layer

### 1.1 FactSet API Integration

**Endpoint:** `https://mcp.factset.com/mcp`  
**Data Points Needed:**

| Metric | Purpose | Source | Fallback |
|--------|---------|--------|----------|
| Institutional Holding % | Blindspot detection | FactSet | screener.in |
| Insider Transactions | Conviction signal | FactSet filings | Company filings |
| Analyst Count | Coverage gap | FactSet | Yahoo Finance |
| Revenue Growth (YoY) | Fundamentals | FactSet | Yahoo Finance |
| ROIC / ROE | Capital efficiency | FactSet | screener.in |
| Net Debt / Market Cap | Leverage | FactSet | Balance sheet |
| Free Cash Flow Yield | Cash generation | FactSet | 10-K/20-F filings |

**Implementation:**
```python
# Pseudo-code structure
class FactSetConnector:
    def __init__(self, api_key):
        self.mcp_url = "https://mcp.factset.com/mcp"
    
    def get_institutional_holding(self, ticker, market):
        """Fetch % institutional ownership"""
        # Query FactSet MCP
        # Cache for 24h
        # Return: float (0-100)
    
    def get_analyst_coverage(self, ticker):
        """Fetch number of analysts covering stock"""
        # Query FactSet
        # Return: int (count)
    
    def get_insider_transactions(self, ticker, days=180):
        """Fetch insider buys/sells last 6 months"""
        # Query FactSet
        # Return: {buys: int, sells: int, net_sentiment: str}
```

### 1.2 Screener.in API Integration (Fallback)

**Endpoint:** Screener.in public pages + API  
**Data Points:**
- P/E ratio
- P/B ratio
- Debt-to-Equity
- Dividend yield
- 3Y revenue CAGR

**Implementation:**
```python
class ScreenerConnector:
    def get_valuation_metrics(self, ticker):
        """Fallback if FactSet unavailable"""
        # Web scrape screener.in or API
        # Return: {pe: float, pb: float, de: float, div_yield: float, rev_cagr: float}
```

### 1.3 Database Schema Extension

**New tables:**

```sql
CREATE TABLE stock_metrics (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10),
    market VARCHAR(5), -- 'NSE' or 'US'
    date DATE,
    
    -- Institutional Data
    institutional_holding_pct FLOAT,
    analyst_count INT,
    insider_buys INT,
    insider_sells INT,
    insider_net_sentiment VARCHAR(10), -- 'BULLISH', 'NEUTRAL', 'BEARISH'
    
    -- Fundamentals
    pe_ratio FLOAT,
    pb_ratio FLOAT,
    revenue_growth_yoy FLOAT,
    roic FLOAT,
    roe FLOAT,
    fcf_yield FLOAT,
    net_debt_to_market_cap FLOAT,
    debt_to_equity FLOAT,
    
    -- Historical for trend detection
    institutional_holding_pct_prev_quarter FLOAT,
    insider_net_sentiment_prev_quarter VARCHAR(10),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ticker, market) REFERENCES scan_results(symbol, market)
);

CREATE TABLE gem_scores (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10),
    market VARCHAR(5),
    date DATE,
    
    -- 4-Layer Scores (0-25 each)
    valuation_edge_score INT,      -- 0-25
    institutional_blindspot_score INT, -- 0-25
    fundamental_strength_score INT,   -- 0-25
    momentum_divergence_score INT,    -- 0-25
    
    -- Overall
    gem_score INT,                 -- 0-100 (sum of above)
    gem_tier VARCHAR(20),          -- 'Elite' / 'Promising' / 'Watch'
    
    -- Explanation fields
    why_gem_text VARCHAR(500),     -- "Why this stock is a gem"
    what_could_go_wrong VARCHAR(300), -- Risk factors
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ticker, market) REFERENCES scan_results(symbol, market)
);

CREATE INDEX idx_gem_score_tier ON gem_scores(gem_tier, date);
CREATE INDEX idx_gem_score_rank ON gem_scores(gem_score DESC, date);
```

---

## 2. Hidden Gem Framework Implementation

### 2.1 GEM SCORE Algorithm

**Layer 1: Valuation Edge (0–25 points)**

```python
def score_valuation_edge(stock_metrics):
    """
    Valuation Edge = Stock trading below sector median on key multiples
    """
    sector_median_pe = get_sector_median_pe(stock_metrics.sector)
    sector_median_pb = get_sector_median_pb(stock_metrics.sector)
    
    pe_discount = (sector_median_pe - stock_metrics.pe_ratio) / sector_median_pe
    pb_discount = (sector_median_pb - stock_metrics.pb_ratio) / sector_median_pb
    
    # Average discount
    avg_discount = (pe_discount + pb_discount) / 2
    
    # Score mapping
    if avg_discount >= 0.50:  # 50%+ discount
        return 25
    elif avg_discount >= 0.35:
        return 18
    elif avg_discount >= 0.20:
        return 12
    elif avg_discount >= 0.10:
        return 6
    else:
        return 0
```

**Layer 2: Institutional Blindspot (0–25 points)**

```python
def score_institutional_blindspot(stock_metrics, sector):
    """
    Institutional Blindspot = Low institutional ownership + recent FII exit/underweight
    + Low analyst coverage
    """
    score = 0
    
    # Institutional holding
    if stock_metrics.institutional_holding_pct < 10:
        score += 10  # <10% = major blindspot
    elif stock_metrics.institutional_holding_pct < 20:
        score += 6   # 10-20% = moderate
    
    # FII/DII trend (India-specific)
    if stock_metrics.market == 'NSE':
        fii_trend = get_fii_trend(stock_metrics.ticker, days=90)
        if fii_trend == 'SELLING':
            score += 8   # Recent FII selling = institutional disinterest
        elif fii_trend == 'BUYING':
            score -= 5   # Recent FII buying = already discovered
    
    # Analyst coverage
    if stock_metrics.analyst_count < 3:
        score += 7   # <3 analysts = undercover
    elif stock_metrics.analyst_count < 7:
        score += 3   # 3-7 analysts = light coverage
    
    return min(score, 25)  # Cap at 25
```

**Layer 3: Fundamental Strength (0–25 points)**

```python
def score_fundamental_strength(stock_metrics):
    """
    Fundamental Strength = Revenue growth + ROE + FCF + Manageable debt
    """
    score = 0
    
    # Revenue growth
    if stock_metrics.revenue_growth_yoy >= 0.20:  # 20%+ growth
        score += 8
    elif stock_metrics.revenue_growth_yoy >= 0.15:
        score += 5
    elif stock_metrics.revenue_growth_yoy >= 0.10:
        score += 2
    
    # ROE
    if stock_metrics.roe >= 0.20:  # 20%+ ROE
        score += 8
    elif stock_metrics.roe >= 0.15:
        score += 5
    elif stock_metrics.roe >= 0.10:
        score += 2
    
    # Free Cash Flow
    if stock_metrics.fcf_yield >= 0.05:  # 5%+ FCF yield
        score += 5
    elif stock_metrics.fcf_yield >= 0.03:
        score += 2
    
    # Debt
    if stock_metrics.debt_to_equity <= 1.0:  # <1.0 D/E = healthy
        score += 4
    elif stock_metrics.debt_to_equity <= 1.5:
        score += 2
    else:
        score -= 2  # High leverage = risk
    
    return min(score, 25)
```

**Layer 4: Momentum Divergence (0–25 points)**

```python
def score_momentum_divergence(stock_metrics, price_data):
    """
    Momentum Divergence = Strong fundamentals but price lagging + unusual volume
    """
    score = 0
    
    # Price lag detection
    # Compare: Revenue growth vs stock return over 12 months
    revenue_momentum = stock_metrics.revenue_growth_yoy
    price_return_12m = calculate_return(price_data, days=252)
    
    momentum_gap = revenue_momentum - price_return_12m
    
    if momentum_gap > 0.25:  # Fundamentals outpacing price by 25%+
        score += 12  # Major divergence = buying opportunity
    elif momentum_gap > 0.15:
        score += 8
    elif momentum_gap > 0.10:
        score += 4
    
    # Volume signal
    avg_volume_30d = calculate_avg_volume(price_data, days=30)
    current_volume = price_data[-1]['volume']
    volume_surge = current_volume / avg_volume_30d
    
    if volume_surge > 1.5 and price_data[-1]['close'] > price_data[-5]['close']:
        score += 10  # Volume pickup + price strength = conviction
    elif volume_surge > 1.3:
        score += 5
    
    return min(score, 25)
```

### 2.2 GEM SCORE Computation & Ranking

```python
def compute_gem_score(stock_ticker, market, stock_metrics, price_data):
    """
    Master function: Compute 4-layer score + overall GEM SCORE
    """
    v_score = score_valuation_edge(stock_metrics)
    i_score = score_institutional_blindspot(stock_metrics, market)
    f_score = score_fundamental_strength(stock_metrics)
    m_score = score_momentum_divergence(stock_metrics, price_data)
    
    gem_score = v_score + i_score + f_score + m_score  # 0-100
    
    # Tier classification
    if gem_score >= 80:
        gem_tier = 'Elite Gem'
    elif gem_score >= 60:
        gem_tier = 'Promising Find'
    elif gem_score >= 40:
        gem_tier = 'Watch List'
    else:
        gem_tier = 'Not Recommended'
    
    # Generate explanation
    why_gem = generate_why_gem_text(stock_ticker, v_score, i_score, f_score, m_score)
    risks = generate_risk_text(stock_metrics)
    
    return {
        'gem_score': gem_score,
        'gem_tier': gem_tier,
        'scores': {'valuation': v_score, 'institutional': i_score, 'fundamental': f_score, 'momentum': m_score},
        'why_gem': why_gem,
        'risks': risks
    }
```

### 2.3 Explanation Generation

```python
def generate_why_gem_text(ticker, v_score, i_score, f_score, m_score):
    """
    Generate human-readable explanation of why stock is a gem
    """
    reasons = []
    
    if v_score >= 18:
        reasons.append(f"Trading at {v_score/25*100:.0f}% discount to sector peers")
    
    if i_score >= 18:
        reasons.append(f"Institutional investors underweight ({stock_metrics.institutional_holding_pct:.1f}%)")
    
    if f_score >= 18:
        reasons.append(f"Strong fundamentals: {stock_metrics.revenue_growth_yoy*100:.1f}% revenue growth, {stock_metrics.roe*100:.1f}% ROE")
    
    if m_score >= 12:
        reasons.append("Price lagging strong business momentum — potential rerating")
    
    return " • ".join(reasons)

def generate_risk_text(stock_metrics):
    """
    Generate risk factors
    """
    risks = []
    
    if stock_metrics.debt_to_equity > 1.5:
        risks.append("High leverage — monitor debt levels")
    
    if stock_metrics.analyst_count < 2:
        risks.append("Minimal analyst coverage — less visibility")
    
    if stock_metrics.institutional_holding_pct < 5:
        risks.append("Low liquidity — institutional indifference may reflect concerns")
    
    return " • ".join(risks) if risks else "No major red flags"
```

---

## 3. UI/UX Updates (Fortress 30)

### 3.1 Stock Card Enhancement

**Current state:**
```
Stock Name | Risk Tier | Price | Change%
```

**After Phase 3A:**
```
Stock Name | Risk Tier | Price | Change%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GEM SCORE: 87/100 (Elite Gem) [Gold badge]

Why This Stock Is a Gem:
• Trading at 45% discount to sector peers
• Institutional investors underweight (8.2% holding)
• Revenue growth 22% YoY, ROE 18%
• Price lagging momentum — rerating potential

What Could Go Wrong:
• Debt-to-equity 1.8x — monitor leverage

Key Metrics:
Institutional Holding: 8.2% | Analyst Count: 2 | FCF Yield: 4.8%
Revenue Growth: 22% YoY | ROE: 18% | P/E: 12.5x (vs sector 18.2x)
```

### 3.2 Filter Controls

**New filters:**
- [x] Elite Gems (80–100)
- [ ] Promising Finds (60–79)
- [ ] Watch List (40–59)

- [x] Low Institutional (<10%)
- [x] High Revenue Growth (>15% YoY)
- [x] Strong ROE (>15%)

---

## 4. API Endpoints

### 4.1 GET /api/fortress30/gems

```json
GET /api/fortress30/gems?market=NSE&tier=elite&limit=30

Response:
{
  "stocks": [
    {
      "ticker": "HDFC",
      "market": "NSE",
      "price": 2450.50,
      "change_pct": 2.3,
      "gem_score": 87,
      "gem_tier": "Elite Gem",
      "why_gem": "Trading at 45% discount...",
      "metrics": {
        "institutional_holding_pct": 8.2,
        "analyst_count": 2,
        "revenue_growth_yoy": 0.22,
        "roe": 0.18,
        "fcf_yield": 0.048,
        "pe_ratio": 12.5,
        "sector_median_pe": 18.2
      },
      "scores": {
        "valuation_edge": 23,
        "institutional_blindspot": 21,
        "fundamental_strength": 24,
        "momentum_divergence": 19
      }
    }
  ]
}
```

### 4.2 GET /api/fortress30/gems/{ticker}

```json
GET /api/fortress30/gems/HDFC?market=NSE

Response:
{
  "ticker": "HDFC",
  "gem_analysis": {
    "gem_score": 87,
    "gem_tier": "Elite Gem",
    "why_gem": "...",
    "risks": "...",
    "scores": {...},
    "metrics": {...},
    "historical": {
      "gem_score_30d_ago": 82,
      "gem_score_90d_ago": 75,
      "trend": "IMPROVING"
    }
  }
}
```

---

## 5. Testing & Validation

### 5.1 Unit Tests

```python
def test_valuation_edge_score():
    """Test valuation edge scoring"""
    stock = MockStock(pe_ratio=10, sector_median_pe=18)
    score = score_valuation_edge(stock)
    assert score == 25  # 45% discount = max score

def test_gem_score_elite():
    """Test Elite Gem classification"""
    stock = MockStock(v_score=23, i_score=21, f_score=24, m_score=19)
    result = compute_gem_score('HDFC', 'NSE', stock, price_data)
    assert result['gem_score'] == 87
    assert result['gem_tier'] == 'Elite Gem'

def test_institutional_blindspot():
    """Test institutional blindspot scoring"""
    stock = MockStock(institutional_holding_pct=8.2, analyst_count=2)
    score = score_institutional_blindspot(stock, 'NSE')
    assert score >= 18  # <10% holding + low coverage
```

### 5.2 Integration Tests

- [ ] Fetch FactSet data for 50 sample stocks
- [ ] Compute GEM SCORE for all 1,085 NSE + 346 US stocks
- [ ] Verify tier distribution: ~10% Elite, ~30% Promising, ~30% Watch
- [ ] Validate explanations are generated and meaningful
- [ ] Test filters (elite/promising, low institutional, high growth)

### 5.3 Manual QA

- [ ] Review top 10 Elite Gems — verify they make sense
- [ ] Spot-check 3 stocks from each tier
- [ ] Verify metrics match external sources (screener.in, Yahoo Finance)
- [ ] Test UI filters on both desktop + mobile

---

## 6. Success Criteria (Phase 3A)

✅ All 1,085 NSE + 346 US stocks have GEM SCORE computed  
✅ Fortress 30 displays gem tier badge + "Why This Stock" explanation  
✅ New metrics visible: Institutional %, Analyst count, Revenue growth, ROE  
✅ Filters working: Elite/Promising/Watch, Low Institutional, High Growth  
✅ Top 10 Elite Gems verified as reasonable  
✅ Data updates daily (via FactSet + screener.in)  
✅ API endpoints returning correct data  
✅ Zero formula errors in GEM SCORE algorithm  

---

## 7. Dependencies & Risks

| Risk | Mitigation |
|------|-----------|
| FactSet API unavailable | Fallback to screener.in web scraping |
| Institutional data stale | Cache for 24h, manual refresh available |
| GEM SCORE correlates too closely with P/E | Review weighting during test phase |
| Performance (computing 1,431 scores daily) | Pre-compute overnight, cache results |

---

## 8. Deployment Checklist

- [ ] Database migration: Create `stock_metrics` + `gem_scores` tables
- [ ] FactSet credentials configured in `.env.production`
- [ ] screener.in fallback configured
- [ ] GEM SCORE algorithm deployed (no changes to existing code, new module)
- [ ] API endpoints tested
- [ ] Fortress 30 UI updated (show gem tier + metrics)
- [ ] Daily cron job for metric updates + scoring
- [ ] Monitoring: Alert if scores not computed for >4h
- [ ] Documentation updated in README

---

**Ready for implementation. Awaiting approval to proceed Week 1 of Month 2.**
