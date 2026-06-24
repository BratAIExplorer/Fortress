import { NextResponse } from "next/server";
import { generatePortfolioRecommendation } from "../../../../lib/portfolio/recommendation-engine";
import { saveGenieSession, saveRecommendations } from "../../../../lib/portfolio/db-helpers";
import { fetchMacroSnapshot, fetchMarketIntelligence } from "../../../../lib/portfolio/yfinance";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const input = await req.json();
    
    // Real Data Fetch
    const macroSnapshot = await fetchMacroSnapshot();
    const intelligenceData = await fetchMarketIntelligence("US"); // Default US for form input

    const recommendation = await generatePortfolioRecommendation(input, macroSnapshot, intelligenceData);

    let sessionId: string = randomUUID().toString();
    let session;

    try {
        session = await saveGenieSession({ ...input, macro: macroSnapshot }, recommendation.recommendation);
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

  } catch (error) {
    const err = error as Error;
    console.error("[Investment Genie]", error);
    return NextResponse.json({
      error: "Portfolio recommendation failed",
      details: process.env.NODE_ENV === "development" ? err.message : "Internal error",
      requestId: randomUUID()
    }, { status: 500 });
  }
}
