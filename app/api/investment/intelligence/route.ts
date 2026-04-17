import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const market = searchParams.get("market") || "GLOBAL";
    
    if (!["NSE", "US", "GLOBAL"].includes(market)) {
        return NextResponse.json({
            error: "Invalid market parameter",
            details: "Market must be NSE, US, or GLOBAL"
        }, { status: 400 });
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      market,
      momentum: { score: 68, interpretation: "positive", detail: "65% of stocks above 50-day MA" },
      breadth: { advance_decline_ratio: 1.4, highlow_ratio: 1.1, interpretation: "broad rally" },
      sentiment: { putcall_ratio: 0.85, vix_term_structure: "contango", retail_positioning: "net_long", institutional_flow: "buying" },
      sectorRotation: { leadingSector: "tech", laggingSector: "utilities", trend: "into_growth" },
      technicalSignals: { rsi: 62, macd: "bullish_cross", supportResistance: { support: 21500, resistance: 22200 } },
      overallSignal: { rating: "buy", confidence: 75, nextKeyLevel: 22200, riskRewardRatio: 1.8 }
    }, { 
      status: 200,
      headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400' }
    });
  } catch (error: any) {
    console.error("[Market Intelligence]", error);
    return NextResponse.json({
      error: "Failed to fetch intelligence data",
      details: error.message
    }, { status: 500 });
  }
}
