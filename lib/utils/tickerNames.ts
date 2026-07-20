// ponytail: hardcoded company/ETF names for major tickers
// ceiling: works for ~500 popular stocks/ETFs
// upgrade: fetch from yfinance metadata when available

const TICKER_NAMES: Record<string, string> = {
  // ETFs (Broad Market & Popular)
  SPY: "SPDR S&P 500 ETF",
  QQQ: "Invesco QQQ Trust",
  IVV: "iShares Core S&P 500 ETF",
  VOO: "Vanguard S&P 500 ETF",
  EFA: "iShares MSCI EAFE ETF",
  AGG: "iShares Core U.S. Aggregate Bond",
  GLD: "SPDR Gold Shares",
  TLT: "iShares 20+ Year Treasury Bond",
  EEM: "iShares MSCI Emerging Markets",
  VWO: "Vanguard FTSE Emerging Markets",
  VTV: "Vanguard Value ETF",
  VUG: "Vanguard Growth ETF",
  VB: "Vanguard Small-Cap ETF",
  VXUS: "Vanguard Total International Stock",
  BND: "Vanguard Total Bond Market",

  // Sector ETFs
  XLK: "Technology Select Sector SPDR",
  XLF: "Financial Select Sector SPDR",
  XLY: "Consumer Discretionary Select Sector",
  XLP: "Consumer Staples Select Sector SPDR",
  XLE: "Energy Select Sector SPDR",
  XLI: "Industrial Select Sector SPDR",
  XLU: "Utilities Select Sector SPDR",
  XLRE: "Real Estate Select Sector SPDR",
  XLC: "Communication Services Select Sector",

  // Leveraged & Inverse ETFs
  TQQQ: "ProShares UltraPro QQQ",
  SQQQ: "ProShares UltraShort QQQ",
  UPRO: "ProShares UltraPro S&P 500",
  SPXU: "ProShares UltraShort S&P 500",
  SSO: "ProShares Ultra S&P 500",
  SDS: "ProShares UltraShort S&P 500",

  // Popular Growth ETFs
  ARKK: "ARK Innovation ETF",
  ARKQ: "ARK Autonomous Tech & Robotics",
  ARKG: "ARK Genomic Revolution ETF",
  ARKF: "ARK Fintech Innovation ETF",
  DIA: "SPDR Dow Jones Industrial Average",
  IWM: "iShares Russell 2000 ETF",
  SCHD: "Schwab U.S. Dividend Equity ETF",
  JEPI: "JPMorgan Equity Premium Income",
  INDA: "iShares MSCI India ETF",

  // Mega-cap stocks
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corporation",
  GOOGL: "Alphabet Inc.",
  AMZN: "Amazon.com Inc.",
  NVDA: "NVIDIA Corporation",
  META: "Meta Platforms Inc.",
  TSLA: "Tesla Inc.",
  BRK: "Berkshire Hathaway Inc.",
  JNJ: "Johnson & Johnson",
  V: "Visa Inc.",

  // India (NSE)
  HDFC: "HDFC Bank Limited",
  INFY: "Infosys Limited",
  TCS: "Tata Consultancy Services",
  RELIANCE: "Reliance Industries Limited",
  BAJAJFINSV: "Bajaj Finserv Limited",
  HDFCBANK: "HDFC Bank Limited",
  ICICIBANK: "ICICI Bank Limited",
  SBIN: "State Bank of India",
  MARUTI: "Maruti Suzuki India Limited",
  BPCL: "Bharat Petroleum Corporation Limited",
};

/**
 * Get full company/ETF name for a ticker
 * Returns company name or ticker if not found
 */
export function getTickerName(ticker: string): string {
  const upper = ticker.toUpperCase();
  return TICKER_NAMES[upper] || upper;
}
