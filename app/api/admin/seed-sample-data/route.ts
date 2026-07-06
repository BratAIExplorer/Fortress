import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";

// ponytail: single endpoint that seeds one scan per market with hardcoded sample data
// Idempotent: only creates data if no COMPLETED scans exist for that market
export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-seed-secret");
    if (secret !== process.env.SEED_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const sampleData = {
            US: [
                { symbol: "AAPL", l1Pass: true, l2Pass: true, l3Pass: true, l4Pass: true, l5Pass: true, mbScore: 82, mbTier: "Rocket", price: 180 },
                { symbol: "MSFT", l1Pass: true, l2Pass: true, l3Pass: true, l4Pass: true, l5Pass: true, mbScore: 85, mbTier: "Rocket", price: 380 },
                { symbol: "NVDA", l1Pass: true, l2Pass: true, l3Pass: true, l4Pass: true, l5Pass: true, mbScore: 88, mbTier: "Rocket", price: 850 },
                { symbol: "GOOGL", l1Pass: true, l2Pass: true, l3Pass: false, l4Pass: true, l5Pass: true, mbScore: 70, mbTier: "Builder", price: 140 },
                { symbol: "TSLA", l1Pass: true, l2Pass: true, l3Pass: true, l4Pass: false, l5Pass: true, mbScore: 68, mbTier: "Builder", price: 260 },
                { symbol: "META", l1Pass: true, l2Pass: true, l3Pass: true, l4Pass: true, l5Pass: false, mbScore: 72, mbTier: "Launcher", price: 500 },
                { symbol: "AMZN", l1Pass: true, l2Pass: true, l3Pass: true, l4Pass: true, l5Pass: true, mbScore: 79, mbTier: "Rocket", price: 180 },
                { symbol: "NFLX", l1Pass: true, l2Pass: false, l3Pass: true, l4Pass: true, l5Pass: true, mbScore: 68, mbTier: "Builder", price: 425 },
            ],
            NSE: [
                { symbol: "HDFC", l1Pass: true, l2Pass: true, l3Pass: true, l4Pass: true, l5Pass: true, mbScore: 78, mbTier: "Rocket", price: 2500 },
                { symbol: "INFY", l1Pass: true, l2Pass: true, l3Pass: false, l4Pass: true, l5Pass: true, mbScore: 72, mbTier: "Launcher", price: 1800 },
                { symbol: "TCS", l1Pass: true, l2Pass: true, l3Pass: true, l4Pass: true, l5Pass: true, mbScore: 80, mbTier: "Rocket", price: 3500 },
                { symbol: "RELIANCE", l1Pass: true, l2Pass: false, l3Pass: true, l4Pass: true, l5Pass: true, mbScore: 65, mbTier: "Builder", price: 2800 },
                { symbol: "BAJAJFINSV", l1Pass: true, l2Pass: true, l3Pass: false, l4Pass: true, l5Pass: true, mbScore: 68, mbTier: "Launcher", price: 1400 },
                { symbol: "ITC", l1Pass: true, l2Pass: true, l3Pass: true, l4Pass: false, l5Pass: true, mbScore: 70, mbTier: "Launcher", price: 450 },
                { symbol: "ASIANPAINT", l1Pass: true, l2Pass: true, l3Pass: true, l4Pass: true, l5Pass: false, mbScore: 75, mbTier: "Rocket", price: 3200 },
                { symbol: "SBIN", l1Pass: true, l2Pass: false, l3Pass: true, l4Pass: true, l5Pass: true, mbScore: 62, mbTier: "Builder", price: 650 },
            ],
        };

        const results = { seeded: [] as string[] };

        for (const [market, tickers] of Object.entries(sampleData)) {
            // Check if already seeded
            const existing = await db.query.scans.findFirst({
                where: (scans, { eq, and }) => and(
                    eq(scans.status, "COMPLETED"),
                    eq(scans.market, market)
                ),
            });

            if (existing) {
                results.seeded.push(`${market} already has scan data (id: ${existing.id})`);
                continue;
            }

            // Create scan
            const [scan] = await db.insert(schema.scans).values({
                status: "COMPLETED",
                triggeredBy: "SEED",
                market,
                totalScanned: tickers.length,
                goodResultsCount: tickers.length,
                durationMs: 1000,
            }).returning();

            // Insert results
            for (const ticker of tickers) {
                await db.insert(schema.scanResults).values({
                    scanId: scan.id,
                    symbol: ticker.symbol,
                    market,
                    priceAtScan: ticker.price.toString(),
                    l1Pass: ticker.l1Pass,
                    l2Pass: ticker.l2Pass,
                    l3Pass: ticker.l3Pass,
                    l4Pass: ticker.l4Pass,
                    l5Pass: ticker.l5Pass,
                    l6Pass: null,
                    totalScore: ticker.mbScore,
                    category: "52W_LOW",
                    mbScore: ticker.mbScore,
                    mbTier: ticker.mbTier,
                });
            }

            results.seeded.push(`${market}: created scan ${scan.id} with ${tickers.length} results`);
        }

        return NextResponse.json(results, { status: 200 });
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        console.error("[seed-sample-data] failed:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}
