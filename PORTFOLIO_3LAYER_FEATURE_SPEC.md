# Portfolio 3-Layer System — Technical Specification
**Status:** Feature Specification  
**Date:** May 26, 2026  
**Phase:** 2 (Implementation)  
**Owner:** Bharat Samant  

---

## 📋 FEATURE OVERVIEW

**Goal:** Allow users to manage multi-layer portfolios (Pre-existing + Fortress Strategies + Personal Convictions) with Edit/Delete capabilities and optional deletion feedback for Phase 3 learning.

**Key Decisions:**
- ✅ 3-layer model (Pre-existing, Fortress, Convictions)
- ✅ Edit button for position changes
- ✅ Delete button (permanent) with optional feedback
- ✅ No "pause" feature (use Edit/Delete instead)
- ✅ Portfolio page as main hub (discoverable from nav)

---

## 🏗 ARCHITECTURE

### Data Model

**Table: `portfolios`** (already exists)
```sql
CREATE TABLE portfolios (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Table: `portfolio_strategies`** (extends existing)
```sql
CREATE TABLE portfolio_strategies (
  id UUID PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  
  -- Layer & type
  layer_type VARCHAR(50) NOT NULL, -- "PREEXISTING" | "FORTRESS" | "CONVICTION"
  source VARCHAR(50), -- "INVESTMENT_GENIE" | "MANUAL" | "USER"
  
  -- Strategy metadata
  name VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Allocation tracking
  original_allocation JSONB, -- {"India": 30, "US": 50, "Gold": 20}
  current_allocation JSONB, -- Current target (after user amendments)
  
  -- Amendments tracking
  amendments JSONB, -- [{ field, original, final, reason, timestamp }]
  
  -- Genie integration
  genie_session_id UUID,
  
  -- Deletion tracking
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  
  -- Performance
  ytd_return DECIMAL(10, 2),
  ytd_return_percent DECIMAL(5, 2)
);

CREATE INDEX idx_portfolio_strategies_portfolio_id ON portfolio_strategies(portfolio_id);
CREATE INDEX idx_portfolio_strategies_layer_type ON portfolio_strategies(layer_type);
```

**Table: `portfolio_holdings`** (already exists)
```sql
CREATE TABLE portfolio_holdings (
  id UUID PRIMARY KEY,
  strategy_id UUID NOT NULL REFERENCES portfolio_strategies(id) ON DELETE CASCADE,
  ticker VARCHAR(10) NOT NULL,
  quantity DECIMAL(20, 8),
  buy_price DECIMAL(10, 2),
  buy_date DATE,
  target_weight DECIMAL(5, 2), -- As % of strategy
  current_price DECIMAL(10, 2),
  current_value DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_portfolio_holdings_strategy_id ON portfolio_holdings(strategy_id);
```

**Table: `strategy_deletion_feedback`** (NEW)
```sql
CREATE TABLE strategy_deletion_feedback (
  id UUID PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL, -- ForeignKey soft (strategy already deleted)
  strategy_name VARCHAR(255),
  
  -- Feedback data
  reasons VARCHAR[] NOT NULL, -- ["not_confident", "market_changed", ...]
  additional_feedback TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_deletion_feedback_portfolio_id ON strategy_deletion_feedback(portfolio_id);
```

---

## 🔌 API ENDPOINTS

### 1. **GET /api/portfolio**
Fetch all strategies for authenticated user

**Response:**
```json
{
  "success": true,
  "portfolio": {
    "id": "uuid",
    "total_value": 800000,
    "ytd_return": 27500,
    "ytd_return_percent": 3.5,
    "layers": {
      "preexisting": [
        {
          "id": "uuid",
          "name": "Pre-existing Holdings",
          "holdings": [
            {
              "ticker": "HDFC",
              "quantity": 100,
              "current_price": 1500,
              "current_value": 150000,
              "buy_price": 1400,
              "buy_date": "2025-01-15",
              "ytd_return": 5000
            }
          ],
          "allocation": { "INR": 60, "CASH": 40 },
          "rebalance_rule": "HOLD"
        }
      ],
      "fortress": [
        {
          "id": "uuid",
          "name": "10X Moonshot",
          "status": "APPROVED",
          "created_at": "2026-05-26",
          "original_allocation": { "India": 30, "US": 50, "Gold": 20 },
          "current_allocation": { "India": 35, "US": 45, "Gold": 20 },
          "amendments": [
            {
              "field": "India",
              "original": 30,
              "final": 35,
              "reason": "Dividend thesis",
              "timestamp": "2026-05-26"
            }
          ],
          "holdings": [
            { "ticker": "QQQ", "quantity": 10, "target_weight": 45, "current_value": 3500 }
          ],
          "ytd_return": 27500,
          "rebalance_rule": "QUARTERLY",
          "drift": { "India": 1, "US": -1, "Gold": 0 }
        }
      ],
      "conviction": []
    }
  }
}
```

### 2. **POST /api/portfolio/strategy**
Create new strategy (from Genie, manual, or conviction)

**Request:**
```json
{
  "layer_type": "FORTRESS",
  "name": "10X Moonshot",
  "source": "INVESTMENT_GENIE",
  "genie_session_id": "uuid",
  "original_allocation": { "India": 30, "US": 50, "Gold": 20 },
  "current_allocation": { "India": 30, "US": 50, "Gold": 20 },
  "holdings": [
    { "ticker": "QQQ", "quantity": 10, "target_weight": 45 }
  ]
}
```

### 3. **PUT /api/portfolio/strategy/[id]**
Update strategy (amendments, holdings, allocation %)

**Request:**
```json
{
  "current_allocation": { "India": 35, "US": 45, "Gold": 20 },
  "amendments": [
    {
      "field": "India",
      "original": 30,
      "final": 35,
      "reason": "Dividend thesis"
    }
  ],
  "holdings": [
    { "ticker": "QQQ", "quantity": 5, "target_weight": 45 }
  ]
}
```

### 4. **DELETE /api/portfolio/strategy/[id]**
Delete strategy with optional feedback

**Request:**
```json
{
  "feedback": {
    "reasons": ["not_confident", "market_changed"],
    "additional_feedback": "Market volatility made me reconsider..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Strategy deleted. Thanks for the feedback!"
}
```

---

## 🎨 COMPONENTS

### **PortfolioPage** (`/portfolio`)
Main hub showing all 3 layers

**Props:**
```typescript
interface PortfolioPageProps {
  portfolioId: UUID
  userId: string
}
```

**Renders:**
- Portfolio summary (total value, YTD return)
- 3 layer sections (collapsible)
- Empty state CTAs

---

### **StrategyCard** (existing, enhanced)
Shows single strategy with actions

**New features:**
- Display amendments
- Edit button (inline or modal)
- Delete button with feedback modal

---

### **EditStrategyModal** (NEW)
Edit allocation % and holdings

**Features:**
- Sliders for allocation %
- Holdings table with quantity inputs
- Amendment reason text field
- Save/Cancel buttons

---

### **StrategyDeleteModal** (NEW)
Delete with optional feedback

**Features:**
- Pre-defined reason checkboxes (9 options)
- Free text feedback field
- "Delete & Send Feedback" button
- "Delete Anyway" button
- "Cancel" button

---

### **HoldingsTable** (enhanced)
Shows holdings with live prices and performance

**Columns:**
- Ticker
- Quantity
- Buy Price
- Current Price
- Current Value
- YTD Return
- Edit | Delete

---

## 🔄 USER FLOWS

### **Flow 1: Create Strategy from Genie**
```
Investment Genie Form
  ↓
Results Page
  ├─ "Approve & Add to Portfolio" → POST /api/portfolio/strategy
  ├─ "Adjust Percentages" → EditStrategyModal
  └─ "Save for Later"
  
Strategy Created in Layer 2 (FORTRESS)
  ↓
Redirect to /portfolio
  ↓
Show new strategy in Layer 2
```

### **Flow 2: Edit Strategy**
```
Portfolio Page → Strategy Card
  ↓
Click [Edit]
  ↓
EditStrategyModal Opens
  ├─ Show current allocation %
  ├─ Show current holdings
  ├─ User changes % / quantities
  └─ User enters amendment reason
  ↓
Click [Save]
  ↓
PUT /api/portfolio/strategy/[id]
  ↓
System updates:
  - current_allocation
  - amendments array
  - holdings quantities
  ↓
Show success: "✅ Strategy updated"
```

### **Flow 3: Delete Strategy (with feedback)**
```
Portfolio Page → Strategy Card
  ↓
Click [Delete]
  ↓
StrategyDeleteModal Opens
  ├─ Show 9 pre-defined reasons
  ├─ Show free text field (optional)
  └─ Two buttons: "Delete & Send Feedback" | "Delete Anyway"
  
User Path A: "Delete & Send Feedback"
  ↓
DELETE /api/portfolio/strategy/[id]
  ├─ Create entry in strategy_deletion_feedback
  ├─ Delete strategy (is_deleted = true)
  └─ Return success message
  ↓
Show: "✅ Strategy deleted. Thanks for the feedback!"

User Path B: "Delete Anyway"
  ↓
DELETE /api/portfolio/strategy/[id]
  ├─ Skip feedback
  └─ Delete strategy
  ↓
Show: "✅ Strategy deleted"
```

---

## 📊 REBALANCE LOGIC

Each layer has different rebalance rules:

**Layer 1 (Pre-existing):**
- Rule: HOLD (no rebalancing)
- Tracking: Monitor for reference only

**Layer 2 (Fortress):**
- Rule: QUARTERLY rebalance
- Threshold: Drift > 5%
- Nudge: "Your India allocation drifted 35% → 36%, consider trimming"

**Layer 3 (Conviction):**
- Rule: ON_CONVICTION_CHANGE
- Tracking: User decides when to rebalance

---

## ✅ VALIDATION CHECKLIST

**Before Deploy:**
- [ ] Database schema created (`portfolio_strategies` amendments, `strategy_deletion_feedback`)
- [ ] All 4 API endpoints coded & tested
- [ ] EditStrategyModal component built
- [ ] StrategyDeleteModal component built
- [ ] Portfolio page links in nav
- [ ] Genie → Portfolio flow wired
- [ ] Edit/Delete buttons functional
- [ ] Feedback capture working
- [ ] Error handling complete
- [ ] Performance optimized (queries, caching)

**After Deploy:**
- [ ] Test all 3 flows on production
- [ ] Monitor for errors (check logs)
- [ ] Verify feedback stored correctly
- [ ] Test edge cases (empty portfolio, single holding, etc.)
- [ ] Validate UX/CX (smooth, intuitive, no friction)

---

## 📅 TIMELINE

- **Day 1:** Create feature spec (this doc) + database schema
- **Day 2:** Build components (EditStrategyModal, StrategyDeleteModal)
- **Day 3:** Build API endpoints + wire Genie flow
- **Day 4:** Integration testing + bug fixes
- **Day 5:** Production deployment + validation

---

**Last Updated:** May 26, 2026  
**Next Phase:** Implementation & Code Review
