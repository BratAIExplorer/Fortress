import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { headers } from "next/headers";

// Simple in-memory rate limiting map (IP -> timestamp[])
const rateLimitMap = new Map<string, number[]>();
const LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_VIEWS_PER_WINDOW = 30;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { pagePath, userId } = body;

        if (!pagePath) {
            return NextResponse.json({ error: "Page path is required" }, { status: 400 });
        }

        // 1. Rate Limiting
        const forwardedFor = (await headers()).get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";
        
        const now = Date.now();
        const userViews = rateLimitMap.get(ip) || [];
        const recentViews = userViews.filter(timestamp => now - timestamp < LIMIT_WINDOW);
        
        if (recentViews.length >= MAX_VIEWS_PER_WINDOW) {
            return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
        }
        
        recentViews.push(now);
        rateLimitMap.set(ip, recentViews);

        // 2. Insert into DB
        const result = await db.insert(schema.pageViews).values({
            pagePath,
            userId: userId || null,
            ipAddress: ip,
            userAgent: (await headers()).get("user-agent") || "unknown",
        }).returning({ id: schema.pageViews.id });

        return NextResponse.json({ success: true, id: result[0].id });
    } catch (error) {
        console.error("Failed to track page view:", error);
        return NextResponse.json({ error: "Failed to track page view" }, { status: 500 });
    }
}
