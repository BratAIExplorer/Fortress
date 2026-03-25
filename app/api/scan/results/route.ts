import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { eq, desc, and, ne, isNotNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Minimum non-OFFLINE results for a scan to be considered healthy.
const MIN_GOOD_RESULTS = 50;

async function countNonOffline(scanId: string): Promise<number> {
    const rows = await db
        .select({ id: schema.scanResults.id })
        .from(schema.scanResults)
        .where(and(
            eq(schema.scanResults.scanId, scanId),
            ne(schema.scanResults.category, "OFFLINE")
        ));
    return rows.length;
}

// GET /api/scan/results?scanId=<id>&sort=mb_score|total_score&tier=Rocket&megatrend=Defence
// Returns scan results for a specific scan (or most recent good one) with all engine v3 fields.
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    // Resolve which scan to fetch
    let scanId = searchParams.get("scanId");
    let degraded = false;
    let requestedScanId: string | null = scanId;

    if (!scanId) {
        // Walk back through completed scans to find the most recent one with good data
        const completedScans = await db.query.scans.findMany({
            where: eq(schema.scans.status, "COMPLETED"),
            orderBy: [desc(schema.scans.runAt)],
            limit: 10,
        });
        if (!completedScans.length) {
            return NextResponse.json({ results: [], scanId: null, total: 0, degraded: false });
        }
        // Find the first scan with enough non-OFFLINE results
        for (const scan of completedScans) {
            const goodCount = await countNonOffline(scan.id);
            if (goodCount >= MIN_GOOD_RESULTS) {
                scanId = scan.id;
                // Mark as degraded if we skipped over more recent scans to get here
                if (scan.id !== completedScans[0].id) {
                    degraded = true;
                }
                break;
            }
        }
        // Fallback: nothing healthy found — just use the most recent
        if (!scanId) {
            scanId = completedScans[0].id;
        }
    } else {
        // Explicit scanId requested — still report quality
        const goodCount = await countNonOffline(scanId);
        if (goodCount < MIN_GOOD_RESULTS) degraded = true;
    }

    const sort = searchParams.get("sort") ?? "mb_score";
    const tierFilter = searchParams.get("tier");
    const megatrendFilter = searchParams.get("megatrend");
    const categoryFilter = searchParams.get("category");
    const ccTierFilter = searchParams.get("cc_tier");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "200"), 500);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    // Build where conditions
    const conditions = [eq(schema.scanResults.scanId, scanId)];
    if (tierFilter) conditions.push(eq(schema.scanResults.mbTier, tierFilter));
    if (megatrendFilter) conditions.push(eq(schema.scanResults.megatrendTag, megatrendFilter));
    if (categoryFilter) conditions.push(eq(schema.scanResults.category, categoryFilter));
    if (ccTierFilter) conditions.push(eq(schema.scanResults.ccTier, ccTierFilter));

    // Fetch with sort
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

    // Also fetch total count for pagination
    const allRows = await db
        .select({ id: schema.scanResults.id })
        .from(schema.scanResults)
        .where(and(...conditions));

    return NextResponse.json({
        scanId,
        requestedScanId,
        degraded,
        results: rows.map(r => ({
            symbol: r.symbol,
            price: r.priceAtScan,
            total_score: r.totalScore,
            category: r.category,
            market: r.market,
            l1: r.l1Pass, l2: r.l2Pass, l3: r.l3Pass, l4: r.l4Pass, l5: r.l5Pass, l6: r.l6Pass,
            mb_score: r.mbScore,
            mb_tier: r.mbTier,
            megatrend: r.megatrendTag,
            megatrend_emoji: r.megatrendEmoji,
            fcf_yield_pct: r.fcfYieldPct != null ? Number(r.fcfYieldPct) : null,
            earnings_quality: r.earningsQuality != null ? Number(r.earningsQuality) : null,
            peg: r.pegRatio != null ? Number(r.pegRatio) : null,
            de_direction: r.deDirection,
            margin_direction: r.marginDirection,
            cc_score: r.ccScore,
            cc_tier: r.ccTier,
            cc_revenue_cagr: r.ccRevenueCagr != null ? Number(r.ccRevenueCagr) : null,
            cc_years_checked: r.ccYearsChecked,
        })),
        total: allRows.length,
        offset,
        limit,
    });
}
