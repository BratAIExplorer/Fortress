import { NextResponse } from "next/server";
import { fetchMarketIntelligence } from "../../../../lib/portfolio/yfinance";

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

    const data = await fetchMarketIntelligence(market);

    return NextResponse.json(data, { 
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
