export const MARKETS = {
  NSE: {
    label: "India",
    flag: "🇮🇳",
    currency: "₹",
    currencyCode: "INR",
    exchange: "NSE",
    description: "National Stock Exchange of India",
  },
  US: {
    label: "United States",
    flag: "🇺🇸",
    currency: "$",
    currencyCode: "USD",
    exchange: "NYSE / NASDAQ",
    description: "New York Stock Exchange & NASDAQ",
  },
} as const;

export type MarketCode = keyof typeof MARKETS;

export const DEFAULT_MARKET: MarketCode = "NSE";

export const MARKET_LIST = Object.entries(MARKETS).map(([code, config]) => ({
  code: code as MarketCode,
  ...config,
}));

export function getMarket(code: string | null | undefined) {
  const key = (code ?? DEFAULT_MARKET).toUpperCase() as MarketCode;
  return MARKETS[key] ?? MARKETS[DEFAULT_MARKET];
}

export function formatPrice(price: number, market: MarketCode | string): string {
  const m = getMarket(market);
  if (m.currencyCode === "INR") {
    return `${m.currency}${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  }
  return `${m.currency}${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}
