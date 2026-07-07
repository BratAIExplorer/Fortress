import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { eq, desc, and, isNotNull, gte } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Minimum non-OFFLINE results for a scan to be considered healthy.
const MIN_GOOD_RESULTS = 25;

// GET /api/scan/results?scanId=<id>&sort=mb_score|total_score|cc_score&tier=Rocket&megatrend=Defence
// Returns results for the best available scan with all engine v3 fields.
// When no scanId is given, walks back through completed scans to find the most
// recent one with goodResultsCount >= MIN_GOOD_RESULTS (quality gate).
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const market = searchParams.get("market") ?? "NSE";
        let scanId = searchParams.get("scanId");
        let degraded = false;

        if (!scanId) {
            // Find the most recent healthy scan for the requested market
            const goodScan = await db.query.scans.findFirst({
                where: and(
                    eq(schema.scans.status, "COMPLETED"),
                    eq(schema.scans.market, market),
                    gte(schema.scans.goodResultsCount, MIN_GOOD_RESULTS)
                ),
                orderBy: [desc(schema.scans.runAt)],
            });

            if (!goodScan) {
                // No healthy scan found — fall back to most recent completed scan for THIS market
                const fallback = await db.query.scans.findFirst({
                    where: and(
                        eq(schema.scans.status, "COMPLETED"),
                        eq(schema.scans.market, market)
                    ),
                    orderBy: [desc(schema.scans.runAt)],
                });
                if (!fallback) {
                    return NextResponse.json({ results: [], scanId: null, total: 0, degraded: false });
                }
                scanId = fallback.id;
                degraded = true;
            } else {
                // Check if there's a more recent (degraded) scan we're skipping over
                const latest = await db.query.scans.findFirst({
                    where: and(
                        eq(schema.scans.status, "COMPLETED"),
                        eq(schema.scans.market, market)
                    ),
                    orderBy: [desc(schema.scans.runAt)],
                });
                degraded = latest ? latest.id !== goodScan.id : false;
                scanId = goodScan.id;
            }
        } else {
            // Explicit scanId — report quality based on stored count
            const scan = await db.query.scans.findFirst({
                where: eq(schema.scans.id, scanId),
            });
            if (scan?.goodResultsCount != null && scan.goodResultsCount < MIN_GOOD_RESULTS) {
                degraded = true;
            }
        }

        const sort = searchParams.get("sort") ?? "mb_score";
        const tierFilter = searchParams.get("tier");
        const megatrendFilter = searchParams.get("megatrend");
        const categoryFilter = searchParams.get("category");
        const ccTierFilter = searchParams.get("cc_tier");
        const limit = Math.min(parseInt(searchParams.get("limit") ?? "200"), 500);
        const offset = parseInt(searchParams.get("offset") ?? "0");

        const conditions = [eq(schema.scanResults.scanId, scanId)];
        if (tierFilter) conditions.push(eq(schema.scanResults.mbTier, tierFilter));
        if (megatrendFilter) conditions.push(eq(schema.scanResults.megatrendTag, megatrendFilter));
        if (categoryFilter) conditions.push(eq(schema.scanResults.category, categoryFilter));
        if (ccTierFilter) conditions.push(eq(schema.scanResults.ccTier, ccTierFilter));

        const orderCol = sort === "total_score"
            ? desc(schema.scanResults.totalScore)
            : sort === "cc_score"
            ? desc(schema.scanResults.ccScore)
            : desc(schema.scanResults.mbScore);

        const rows = await db
            .select()
            .from(schema.scanResults)
            .where(and(...conditions))
            .orderBy(orderCol)
            .limit(limit)
            .offset(offset);

        const allRows = await db
            .select({ id: schema.scanResults.id })
            .from(schema.scanResults)
            .where(and(...conditions));

        return NextResponse.json({
            scanId,
            degraded,
            results: rows.map(r => ({
                symbol: r.symbol,
                price: Number(r.priceAtScan),
                totalScore: r.totalScore,
                category: r.category,
                market: r.market,
                l1Pass: r.l1Pass, l2Pass: r.l2Pass, l3Pass: r.l3Pass, l4Pass: r.l4Pass, l5Pass: r.l5Pass, l6Pass: r.l6Pass,
                mbScore: r.mbScore,
                mbTier: r.mbTier,
                megatrend: r.megatrendTag,
                megatrendEmoji: r.megatrendEmoji,
                fcfYieldPct: r.fcfYieldPct != null ? Number(r.fcfYieldPct) : null,
                earningsQuality: r.earningsQuality != null ? Number(r.earningsQuality) : null,
                pegRatio: r.pegRatio != null ? Number(r.pegRatio) : null,
                deDirection: r.deDirection,
                marginDirection: r.marginDirection,
                ccScore: r.ccScore,
                ccTier: r.ccTier,
                ccRevenueCagr: r.ccRevenueCagr != null ? Number(r.ccRevenueCagr) : null,
                ccYearsChecked: r.ccYearsChecked,
            })),
            total: allRows.length,
            offset,
            limit,
        });
    } catch (error) {
        console.error("Failed to fetch scan results:", error);
        return NextResponse.json({
            results: [],
            scanId: null,
            total: 0,
            degraded: false,
            error: "Database error"
        }, { status: 500 });
    }
}
