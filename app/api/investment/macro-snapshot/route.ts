import { NextResponse } from "next/server";
import { fetchMacroSnapshot } from "../../../../lib/portfolio/yfinance";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as { isAdmin?: boolean }).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await fetchMacroSnapshot();
    return NextResponse.json(data, { 
      status: 200,
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
    });
  } catch (error) {
    const err = error as Error;
    console.error("[Macro Snapshot]", err);
    return NextResponse.json({
      error: "Failed to fetch macro data",
      details: err.message
    }, { status: 500 });
  }
}
