---
name: global-stock-etf-trader
description: Build and manage trade execution systems, sync real-time portfolio holdings, place orders via broker APIs (IBKR, Zerodha Kite), and handle transaction risk management.
risk: medium
source: community
date_added: "2026-06-16"
---

# Global Stock and ETF Trader Skill

This skill outlines patterns for building agentic trade execution and broker synchronization systems. Use this skill when implementing direct order routing, fetching live holdings, calculating transaction slippage, or managing API integrations with platforms like Interactive Brokers (IBKR) and Zerodha Kite.

## Use this skill when

- Integrating Interactive Brokers (IBKR) or Zerodha Kite REST APIs.
- Designing a read-only or read-write portfolio synchronization pipeline.
- Building a rebalance execution engine (translating target weights into specific buy/sell orders).
- Handling trade execution errors (e.g., margin calls, exchange closed, stale quotes, route rejection).
- Implementing pre-trade validation (verifying sufficient buying power, volume limits, and price ranges).

## Core Patterns

### 1. Safe Multi-Market Order Routing (US & India)
Implement separate order queues for US and Indian exchanges to respect market timing, currencies, and routing protocols.

```typescript
// Example order construction pattern
interface OrderRequest {
  symbol: string;      // E.g., "AAPL" (US) or "RELIANCE.NS" (India)
  action: "BUY" | "SELL";
  quantity: number;
  orderType: "LIMIT" | "MARKET";
  limitPrice?: number;
  currency: "USD" | "INR";
  exchange: "NASDAQ" | "NYSE" | "NSE" | "BSE";
}
```

### 2. Bidirectional holdings sync
Verify user manual positions by cross-checking against the broker APIs. When divergence is detected, notify the user with a structural reconciliation.

### 3. Rate-Limiting & Slippage Guardrails
- **Slippage Cap:** Set strict limit orders (e.g., within 0.5% of the last traded price) rather than executing market orders in illiquid hours.
- **Circuit Breaker:** Halt all orders if 2 consecutive trades fail due to execution route issues.

## Anti-Patterns

### ❌ Naked Market Orders
Do not use market orders for large allocations, especially on NSE where spreads for specific mid-caps can be wide. Always prioritize Limit Orders.

### ❌ Stateless Trade Loops
Never let an agent place a trade in a stateless loop. The trade state must be persisted in a database (e.g. `durable-execution`) to prevent duplicate orders if the system crashes mid-route.

## Verification Checklist
- [ ] Confirm market hours before attempting order placement.
- [ ] Verify buying power exceeds `(price * qty) * 1.05` to cover exchange fees and slippage buffer.
- [ ] Implement dry-run (paper trading) mode by default.
