import { NextRequest, NextResponse } from "next/server";
import { GemScoreResponse } from "@/lib/types/trading-specialist";

// ponytail: Mock GEM SCORE calculation
// Replace this function with real scoring logic (Valuation Edge, Institutional Blindspot, etc.)
// when Phase 2 integration happens. Keep the interface stable.
function getMockGemScore(ticker: string): GemScoreResponse {
  const mockData: Record<string, GemScoreResponse> = {
    AAPL: {
      success: true,
      ticker: "AAPL",
      timestamp: new Date().toISOString(),
      signals: [
        {
          timeframe: "intraday",
          direction: "bullish",
          label: "SHORT SQUEEZE ALIGNED",
          confidence: 78,
        },
        {
          timeframe: "shortTerm",
          direction: "bullish",
          label: "BULLISH RALLY HOLD",
          confidence: 72,
        },
        {
          timeframe: "longTerm",
          direction: "neutral",
          label: "WATCH FOR ENTRY",
          confidence: 55,
        },
      ],
      bottomLine: {
        headline: "Institutional CapEx doubled",
        body: "Institutional CapEx doubled due to AI infrastructure expansion. Isolated $1.2B non-recurring gain inflates reported earnings — strip it out and growth is solid but not explosive. Price tested resistance at $192.50 three times in 2 months — next break above triggers institutional momentum. Conservative entry: wait for a dip to $185; aggressive: add on the next 2–3% pullback.",
        sentiment: "bullish",
      },
      multiTimeframe: [
        {
          timeframe: "Daily",
          ema_or_sma: "EMA(21)",
          value: "$190.2",
          trigger: "↑ Break = Go",
          triggerType: "bullish",
        },
        {
          timeframe: "Weekly",
          ema_or_sma: "SMA(50)",
          value: "$187.8",
          trigger: "Monitor",
          triggerType: "neutral",
        },
        {
          timeframe: "Monthly",
          ema_or_sma: "200-SMA",
          value: "$175.5",
          trigger: "Long support",
          triggerType: "neutral",
        },
        {
          timeframe: "ATR (14D)",
          ema_or_sma: "Volatility",
          value: "$2.85",
          trigger: "Stop = $1.9 ×",
          triggerType: "neutral",
        },
      ],
    },
    HDFC: {
      success: true,
      ticker: "HDFC",
      timestamp: new Date().toISOString(),
      signals: [
        {
          timeframe: "intraday",
          direction: "neutral",
          label: "CONSOLIDATING",
          confidence: 65,
        },
        {
          timeframe: "shortTerm",
          direction: "bullish",
          label: "BREAKOUT SETUP",
          confidence: 68,
        },
        {
          timeframe: "longTerm",
          direction: "bullish",
          label: "MULTI-BAGGER CANDIDATE",
          confidence: 82,
        },
      ],
      bottomLine: {
        headline: "Mortgage demand resilient despite rate hikes",
        body: "Asset quality remains pristine (NPA < 0.4%). Deposit mix shifting toward current accounts, reducing cost of funds. Valuation at 1.8x P/B — below historical 2.2x — leaves room for re-rating. Fund houses have been quietly accumulating. Wait for the breakout above ₹2,850 before size position.",
        sentiment: "bullish",
      },
      multiTimeframe: [
        {
          timeframe: "Daily",
          ema_or_sma: "EMA(21)",
          value: "₹2,820",
          trigger: "Watch closely",
          triggerType: "neutral",
        },
        {
          timeframe: "Weekly",
          ema_or_sma: "SMA(50)",
          value: "₹2,750",
          trigger: "Above = accumulate",
          triggerType: "bullish",
        },
        {
          timeframe: "Monthly",
          ema_or_sma: "200-SMA",
          value: "₹2,600",
          trigger: "Strong support",
          triggerType: "bullish",
        },
        {
          timeframe: "ATR (14D)",
          ema_or_sma: "Volatility",
          value: "₹45",
          trigger: "Stop = ₹67.5 ×",
          triggerType: "neutral",
        },
      ],
    },
  };

  return (
    mockData[ticker.toUpperCase()] || {
      success: false,
      ticker,
      timestamp: new Date().toISOString(),
      signals: [],
      bottomLine: {
        headline: "No data available",
        body: "Try AAPL or HDFC for demo data.",
        sentiment: "neutral",
      },
      multiTimeframe: [],
      error: `No analysis available for ${ticker}. (Demo data: AAPL, HDFC)`,
    }
  );
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");

  if (!ticker || ticker.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: "Ticker symbol required" },
      { status: 400 }
    );
  }

  try {
    // ponytail: In Phase 2, replace mock with real calculation:
    // const scoreData = await realGemScoreCalculation(ticker);
    // For now, serve mock data.
    const scoreData = getMockGemScore(ticker);

    return NextResponse.json(scoreData, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
