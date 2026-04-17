import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      vixIndex: { current: 18.5, trend: "stable", interpretation: "low volatility" },
      goldPrice: { current: 2025.40, dayChange: 0.2, interpretation: "safe haven demand steady" },
      oilPrice: { current: 78.30, dayChange: -0.5, interpretation: "supply concerns easing" },
      inflationRate: { current: 3.2, trend: "falling", interpretation: "inflation cooling" },
      currencyStrength: { USD: 103.5, INR: 82.9, interpretation: "dollar stabilizing" },
      bondYields: { UST10Y: 4.15, UST2Y: 4.55, spread: -0.40, interpretation: "yield curve inverted" },
      riskAssessment: "low"
    }, { 
      status: 200,
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
    });
  } catch (error: any) {
    console.error("[Macro Snapshot]", error);
    return NextResponse.json({
      error: "Failed to fetch macro data",
      details: error.message
    }, { status: 500 });
  }
}
