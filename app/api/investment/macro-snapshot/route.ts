import { NextResponse } from "next/server";
import { fetchMacroSnapshot } from "../../../../lib/portfolio/yfinance";

export async function GET() {
  try {
    const data = await fetchMacroSnapshot();
    return NextResponse.json(data, { 
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
