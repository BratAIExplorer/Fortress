import { NextResponse } from "next/server";

const MASSIVE_BASE = "https://api.massive.com";

export type MarketStatus = "open" | "pre" | "after" | "closed";

export interface MarketStatusResponse {
  status: MarketStatus;
  serverTime: string;
  nasdaq: string;
  nyse: string;
}

export async function GET() {
  const key = process.env.MASSIVE_API_KEY;

  if (!key) {
    return NextResponse.json<MarketStatusResponse>(
      { status: "closed", serverTime: new Date().toISOString(), nasdaq: "unknown", nyse: "unknown" },
      { status: 200 }
    );
  }

  try {
    const res = await fetch(`${MASSIVE_BASE}/v1/marketstatus/now`, {
      headers: { Authorization: `Bearer ${key}` },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Massive API ${res.status}`);
    }

    const text = await res.text();
    const [headerLine, valueLine] = text.trim().split("\n");
    const headers = headerLine.split(",");
    const values = valueLine.split(",");

    const data: Record<string, string> = {};
    headers.forEach((h, i) => { data[h.trim()] = (values[i] ?? "").trim(); });

    const isAfterHours = data["afterHours"] === "True";
    const isEarlyHours = data["earlyHours"] === "True";
    const marketOpen  = data["market"] === "open";

    let status: MarketStatus;
    if (isEarlyHours)                         status = "pre";
    else if (marketOpen && !isAfterHours)     status = "open";
    else if (isAfterHours)                    status = "after";
    else                                      status = "closed";

    return NextResponse.json<MarketStatusResponse>(
      {
        status,
        serverTime: data["serverTime"] ?? new Date().toISOString(),
        nasdaq: data["exchanges_nasdaq"] ?? "unknown",
        nyse:   data["exchanges_nyse"]   ?? "unknown",
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch {
    return NextResponse.json<MarketStatusResponse>(
      { status: "closed", serverTime: new Date().toISOString(), nasdaq: "unknown", nyse: "unknown" },
      { status: 200 }
    );
  }
}
