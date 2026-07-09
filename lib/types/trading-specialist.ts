// Types for Hidden Gem Finder / Trading Specialist analysis
// Designed for extensibility: mock data → real API, real calculations

export interface TradeSignal {
  timeframe: "intraday" | "shortTerm" | "longTerm";
  direction: "bullish" | "bearish" | "neutral";
  label: string;
  confidence: number; // 0-100
}

export interface BottomLineInsight {
  headline: string;
  body: string;
  sentiment: "bullish" | "bearish" | "neutral";
}

export interface MultiTimeframeEntry {
  timeframe: string;
  ema_or_sma: string;
  value: string;
  trigger: string;
  triggerType: "bullish" | "neutral" | "bearish";
}

export interface ChartDataPoint {
  date: string;
  close: number;
  sma50: number;
  sma200: number;
}

export interface GemScoreResponse {
  success: boolean;
  ticker: string;
  timestamp: string;
  signals: TradeSignal[];
  bottomLine: BottomLineInsight;
  multiTimeframe: MultiTimeframeEntry[];
  chartData?: ChartDataPoint[];
  error?: string;
}

export interface AnalysisState {
  ticker: string;
  loading: boolean;
  error: string | null;
  data: GemScoreResponse | null;
}

export interface TradeLog {
  ticker: string;
  gemScore: number;
  action: "BOUGHT" | "SKIPPED" | "LOSS";
  date: string;
  result?: "WIN" | "LOSS";
}

export interface TradeStats {
  totalTrades: number;
  boughtCount: number;
  overallWins: number;
  overallWinRate: number | null;
  byScoreRange: Array<{
    range: string;
    totalTrades: number;
    boughtTrades: number;
    wins: number;
    winRate: number | null;
  }>;
}
