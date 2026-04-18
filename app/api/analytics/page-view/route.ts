import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { pageViews } from "@/lib/db/schema/analytics";

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const limitInfo = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  // Reset every minute
  if (now - limitInfo.lastReset > 60000) {
    limitInfo.count = 0;
    limitInfo.lastReset = now;
  }

  if (limitInfo.count >= 100) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  limitInfo.count++;
  rateLimitMap.set(ip, limitInfo);

  try {
    const body = await req.json();
    const { pagePath, userAgent, referrer } = body;

    const result = await db.insert(pageViews).values({
      pagePath,
      userIp: ip,
      userAgent: userAgent || req.headers.get("user-agent"),
      referrer: referrer || req.headers.get("referer"),
    }).returning({ id: pageViews.id });

    return NextResponse.json({ success: true, id: result[0].id });
  } catch (error) {
    console.error("Page view tracking error:", error);
    return NextResponse.json({ success: false, error: "Insert failed" }, { status: 500 });
  }
}
