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
