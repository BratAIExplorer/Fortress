# Bugfix & Market-Awareness Report (April 22, 2026)

## 🎯 Executive Summary
The platform has been upgraded to support multi-market awareness (NSE & US). Critical UI bugs related to empty states and market data leakage (NSE stocks showing in US views) have been resolved.

## 🛠️ Issues Resolved

### 1. US Market Scan Empty State
- **Problem**: When the US market was selected on the Fortress 30 page, it showed a generic or confusing empty state.
- **Fix**: Updated `app/fortress-30/page.tsx` with a user-friendly message: 
  > "No 🇺🇸 United States scan data yet. The daily scanner will populate this list automatically. Check back after the next scheduled scan."
- **Impact**: Provides clear expectations to the user about why data might be missing.

### 2. Market Clarity Report Frequency
- **Problem**: Users were unsure how often the Market Clarity Report was updated.
- **Fix**: Added "Updates Weekly" text in `components/fortress/ClarityPanel.tsx`.
- **Impact**: Improved user transparency and trust.

### 3. V5 Extension Market Leakage (CRITICAL)
- **Problem**: The "Specialized Deep Value Scans" (V5 Extension) exhibited hardcoded behavior, showing Indian (NSE) stocks even when the US market was selected.
- **Fixes**:
    - **Server Actions**: Refactored `getV5LowStocks`, `getV5PennyStocks`, `getV5SubTenStocks`, and live scanner functions in `app/actions.ts` to accept a `market` parameter.
    - **Database Filtering**: Query results are now strictly filtered by the market.
    - **Mock Data Safety**: Fallback mock data is now restricted to the NSE market only. US queries return an empty array if no database results exist, preventing data leakage.
    - **URL Synced Routing**: Added `/v5-extension` to the `MarketSelector.tsx` list. The page now reads market from the URL `?market=US`.
    - **Clean State Management**: Removed redundant local market selectors in `V5ExtensionTabs.tsx` to prevent desync between UI and data fetching.
    - **Dynamic Formatting**: Fixed hardcoded Rupee (₹) symbol in `V5StockCard.tsx`. It now uses `formatPrice` from `lib/markets/config.ts` to dynamically show `$` or `₹` based on the active market.

## 🏗️ Technical Notes for Future Agents
- **Always pass `market`**: Every new data-fetching action must take a `market` parameter (defaulting to "NSE").
- **URL as Source of Truth**: UI components should read market state from props or the URL, not local state, to ensure consistent navigation experience across pages.
- **Currency Helper**: Use `formatPrice(price, market)` instead of template literals.

## ✅ Verification
- **Build**: Successfully compiled and passed TypeScript checks.
- **Integration**: Navigating between markets via the Navbar now correctly updates both Fortress 30 and V5 Extension data.
