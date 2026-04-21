import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { count, gt, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        // 1. Get Live User Count (Unique sessions in last 5 mins)
        // Note: For a real app, you'd use the liveActivity table or a Redis store.
        // For now, we'll estimate from recent page views.
        const recentViews = await db.select({
            count: count(),
        })
        .from(schema.pageViews)
        .where(gt(schema.pageViews.timestamp, fiveMinutesAgo));

        const liveUsers = recentViews[0]?.count || 0;

        // 2. Get Trending Pages (last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 1000 * 60);
        const trendingPages = await db.select({
            pagePath: schema.pageViews.pagePath,
            views: count(),
        })
        .from(schema.pageViews)
        .where(gt(schema.pageViews.timestamp, twentyFourHoursAgo))
        .groupBy(schema.pageViews.pagePath)
        .orderBy(desc(count()))
        .limit(5);

        return NextResponse.json({
            liveUsers: Math.max(Math.floor(Number(liveUsers) / 1.5), 1), // Heuristic since page views != unique users
            trendingPages,
            timestamp: new Date()
        });
    } catch (error) {
        console.error("Failed to fetch live activity:", error);
        return NextResponse.json({ 
            liveUsers: 0, 
            trendingPages: [],
            error: "Failed to fetch live activity" 
        }, { status: 500 });
    }
}
