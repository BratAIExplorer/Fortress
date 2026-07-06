import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { eq, and, desc, notInArray, ne, count } from "drizzle-orm";
import { getScanDeltas } from "@/lib/db/scanner-utils";
import { scoreTicker } from "@/lib/scanners/us-technical-scorer";
import { auth } from "@/auth";
import { unstable_cache as cache } from "next/cache";

const RETENTION_LIMIT = 10;

async function pruneOldScans(market: string) {
    try {
        const completed = await db
            .select({ id: schema.scans.id })
            .from(schema.scans)
            .where(and(eq(schema.scans.status, "COMPLETED"), eq(schema.scans.market, market)))
            .orderBy(desc(schema.scans.runAt))
            .limit(RETENTION_LIMIT);

        if (completed.length < RETENTION_LIMIT) return;

        const keepIds = completed.map(s => s.id);
        await db.delete(schema.scans).where(
            and(
                eq(schema.scans.status, "COMPLETED"),
                eq(schema.scans.market, market),
                notInArray(schema.scans.id, keepIds)
            )
        );
    } catch (e) {
        console.error("pruneOldScans failed:", e);
    }
}

type Weights = { l1: number; l2: number; l3: number; l4: number; l5: number; l6: number };
type ScanEvent = Record<string, unknown>;

/**
 * Runs the TypeScript scan engine and writes results to the DB.
 * onEvent is optional — omit for cron (fire-and-forget), provide for SSE (manual scan).
 */
async function runScan(
    scanId: string,
    scanRunAt: Date,
    market: string,
    weights: Weights,
    isCron: boolean,
    onEvent?: (data: ScanEvent) => void
): Promise<void> {
    try {
        // ponytail: score tickers using TypeScript scanner
        const tickers = market === "US"
            ? ["AAPL", "MSFT", "NVDA", "GOOGL", "TSLA", "META", "AMZN", "NFLX"]
            : ["HDFC", "INFY", "TCS", "RELIANCE", "BAJAJFINSV", "ITC", "ASIANPAINT", "SBIN"];

        const apiKey = process.env.MASSIVE_API_KEY || "";
        const stocks = [];

        onEvent?.({ type: "start", total: tickers.length });

        for (let i = 0; i < tickers.length; i++) {
            const score = await scoreTicker(tickers[i], apiKey);
            stocks.push(score);

            if (!score.error) {
                await db.insert(schema.scanResults).values({
                    scanId,
                    symbol: score.symbol,
                    market,
                    priceAtScan: score.price.toString(),
                    l1Pass: score.l1Pass,
                    l2Pass: score.l2Pass,
                    l3Pass: score.l3Pass,
                    l4Pass: score.l4Pass,
                    l5Pass: score.l5Pass,
                    l6Pass: null,
                    totalScore: score.mbScore,
                    category: "52W_LOW",
                    mbScore: score.mbScore,
                    mbTier: score.mbTier,
                });
            }

            const progress = Math.round(((i + 1) / tickers.length) * 100);
            onEvent?.({ type: "progress", progress, symbol: score.symbol, score: score.mbScore });
        }

        // Mark complete
        const [goodRow] = await db.select({ n: count() }).from(schema.scanResults).where(eq(schema.scanResults.scanId, scanId));
        await db.update(schema.scans).set({
            status: "COMPLETED",
            totalScanned: tickers.length,
            durationMs: Date.now() - scanRunAt.getTime(),
            goodResultsCount: (goodRow?.n ?? 0),
        }).where(eq(schema.scans.id, scanId));

        await pruneOldScans(market);
        const deltas = await getScanDeltas(scanId, market);
        onEvent?.({ type: "complete", scanId, market, newCount: deltas.newEntries.length, droppedCount: deltas.droppedStocks.length, deltas });
    } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        console.error(`[${market} scan] failed:`, error);
        await db.update(schema.scans).set({ status: "FAILED", errorMessage: error }).where(eq(schema.scans.id, scanId));
        onEvent?.({ type: "error", message: error });
        throw e;
    }
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const market = body.market ?? "NSE";
    const weights = body.weights ?? { l1: 25, l2: 20, l3: 10, l4: 25, l5: 15, l6: 5 };

    const cronSecret = req.headers.get("x-cron-secret");
    const isCron = cronSecret === process.env.CRON_SECRET;

    // Manual scan: require admin session
    if (!isCron) {
        const session = await auth();
        const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin;
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized: Only admins can trigger manual scans" }, { status: 403 });
        }
    }

    const triggeredBy = isCron ? "CRON" : "MANUAL";

    const sum = Object.values(weights).reduce((a: number, b) => a + (b as number), 0);
    if (sum !== 100) {
        return NextResponse.json({ error: "Weights must sum to 100" }, { status: 400 });
    }

    const activeScan = await db.query.scans.findFirst({
        where: and(
            eq(schema.scans.status, "RUNNING"),
            eq(schema.scans.market, market)
        ),
    });

    if (activeScan) {
        return NextResponse.json({ error: `A ${market} scan is already in progress` }, { status: 409 });
    }

    if (!isCron) {
        const COOLDOWN_MS = 4 * 60 * 60 * 1000;
        const lastCompleted = await db.query.scans.findFirst({
            where: and(
                eq(schema.scans.status, "COMPLETED"),
                eq(schema.scans.market, market)
            ),
            orderBy: [desc(schema.scans.runAt)],
        });
        if (lastCompleted?.runAt) {
            const elapsed = Date.now() - new Date(lastCompleted.runAt).getTime();
            if (elapsed < COOLDOWN_MS) {
                const remainingMs = COOLDOWN_MS - elapsed;
                const remainingMinutes = Math.ceil(remainingMs / 60000);
                const nextAllowedAt = new Date(Date.now() + remainingMs).toISOString();
                return NextResponse.json(
                    { error: `Scan cooldown active. yfinance needs time to reset rate limits.`, cooldownMinutes: remainingMinutes, nextAllowedAt },
                    { status: 429 }
                );
            }
        }
    }

    const [scan] = await db.insert(schema.scans).values({
        status: "RUNNING",
        triggeredBy,
        market,
    }).returning();

    // Cron: return 202 immediately and run scan in background.
    // Avoids nginx proxy_read_timeout killing the connection during long scans.
    if (isCron) {
        runScan(scan.id, scan.runAt!, market, weights, isCron).catch((e) => {
            console.error(`[cron-scan] background scan failed (${scan.id}):`, e);
        });
        return NextResponse.json({ scanId: scan.id, status: "ACCEPTED" }, { status: 202 });
    }

    // Manual: stream SSE progress to the browser
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (data: ScanEvent) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            try {
                await runScan(scan.id, scan.runAt!, market, weights, isCron, sendEvent);
            } catch (e) {
                sendEvent({ type: "error", message: String(e) });
            } finally {
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}

const getCachedScanStatus = cache(
    async () => {
        const lastScan = await db.query.scans.findFirst({
            orderBy: [desc(schema.scans.runAt)],
        });

        if (!lastScan) return { status: "IDLE" };

        if (lastScan.status === "RUNNING") {
            const results = await db.select()
                .from(schema.scanResults)
                .where(eq(schema.scanResults.scanId, lastScan.id));

            return {
                ...lastScan,
                currentCount: results.length,
                progress: lastScan.totalScanned ? Math.round((results.length / lastScan.totalScanned) * 100) : null
            };
        }

        return lastScan;
    },
    ["scan-status"],
    { revalidate: 1800 } // 30-minute cache window
);

export async function GET() {
    const scanStatus = await getCachedScanStatus();
    return NextResponse.json(scanStatus);
}
