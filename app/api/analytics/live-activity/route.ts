import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { pageViews } from "@/lib/db/schema/analytics";
import { sql, desc, gte } from "drizzle-orm";

let cache: { data: any; timestamp: number } | null = null;

export async function GET(req: Request) {
  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.headers.get("x-admin-secret");

  if (adminSecret && providedSecret !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  if (cache && now - cache.timestamp < 15000) {
    return NextResponse.json(cache.data);
  }

  try {
    const oneHourAgo = new Date(now - 60 * 60 * 1000);

    // 1. Users Online (Unique IPs in last hour)
    const usersOnlineResult = await db.select({
      count: sql<number>`count(distinct ${pageViews.userIp})`
    }).from(pageViews).where(gte(pageViews.createdAt, oneHourAgo));

    // 2. Most Popular pages (top 5 in last hour)
    const mostPopular = await db.select({
      pagePath: pageViews.pagePath,
      count: sql<number>`count(*)`
    })
    .from(pageViews)
    .where(gte(pageViews.createdAt, oneHourAgo))
    .groupBy(pageViews.pagePath)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

    const data = {
      usersOnline: Number(usersOnlineResult[0]?.count || 0),
      mostPopular,
      recentActivity: new Date().toISOString()
    };

    cache = { data, timestamp: now };
    return NextResponse.json(data);
  } catch (error) {
    console.error("Live activity fetch error:", error);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
