import { NextResponse } from "next/server";
import { generatePortfolioRecommendation } from "../../../../lib/portfolio/recommendation-engine";
import { saveGenieSession, saveRecommendations } from "../../../../lib/portfolio/db-helpers";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const input = await req.json();
    
    // MOCK DATA
    const macroMock = {
      vixIndex: { current: 18, trend: "stable", interpretation: "low volatility" },
      goldPrice: { current: 2000, dayChange: 0.5, interpretation: "steady" },
      oilPrice: { current: 75, dayChange: -1, interpretation: "easing" },
      inflationRate: { current: 3.5, trend: "falling", interpretation: "cooling" },
      currencyStrength: { USD: 104, INR: 83, interpretation: "steady" },
      bondYields: { UST10Y: 4.1, UST2Y: 4.5, spread: -0.4, interpretation: "inverted" },
      riskAssessment: "low"
    };

    const intelligenceMock = {
      momentum: { score: 65, interpretation: "positive", detail: "60% above 50-day" },
      breadth: { advance_decline_ratio: 1.6, highlow_ratio: 1.2, interpretation: "broad rally" },
      sentiment: { putcall_ratio: 0.8, vix_term_structure: "contango", retail_positioning: "net_long", institutional_flow: "buying", confidence: 80 },
      sectorRotation: { leadingSector: "tech", laggingSector: "utilities", trend: "into_growth" },
      technicalSignals: { rsi: 60, macd: "bullish_cross", supportResistance: { support: 21000, resistance: 22000 } },
      overallSignal: { rating: "buy", confidence: 75, nextKeyLevel: 22000, riskRewardRatio: 1.5 }
    };

    const recommendation = await generatePortfolioRecommendation(input, macroMock, intelligenceMock);
    
    let sessionId = randomUUID();
    let session;
    
    try {
        session = await saveGenieSession({ ...input, macro: macroMock }, recommendation.recommendation);
        sessionId = session?.id || sessionId;
        await saveRecommendations(sessionId, recommendation.topPicks);
    } catch(e) {
        console.error("Failed to save to DB", e);
    }

    return NextResponse.json({
        ...recommendation,
        sessionId,
        timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error("[Investment Genie]", error);
    return NextResponse.json({
      error: "Portfolio recommendation failed",
      details: process.env.NODE_ENV === "development" ? error.message : "Internal error",
      requestId: randomUUID()
    }, { status: 500 });
  }
}
