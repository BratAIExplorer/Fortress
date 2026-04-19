import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { db, schema } from "@/lib/db/client";
import { eq, and, desc, notInArray, ne, count } from "drizzle-orm";
import { getScanDeltas } from "@/lib/db/scanner-utils";
import { auth } from "@/auth";

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
 * Spawns the Python scan engine and writes results to the DB.
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
    return new Promise((resolve, reject) => {
        const pythonArgs = [
            "scanner/engine.py",
            "--market", market,
            "--weights", JSON.stringify(weights)
        ];

        if (!isCron && (market === "US" || market === "HKEX")) {
            pythonArgs.push("--limit", "200");
        }

        const pythonBin = process.env.PYTHON_BIN ?? ".venv/bin/python3";
        const pythonProcess = spawn(pythonBin, pythonArgs);

        let totalStocks = 0;
        let scannedCount = 0;
        let stdoutBuffer = "";

        pythonProcess.stdout.on("data", async (data) => {
            stdoutBuffer += data.toString();
            const lines = stdoutBuffer.split("\n");
            stdoutBuffer = lines.pop() ?? "";

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const message = JSON.parse(line);

                    if (message.type === "start") {
                        totalStocks = message.total;
                        onEvent?.({ type: "start", total: totalStocks });
                    } else if (message.type === "progress") {
                        scannedCount++;
                        const progress = Math.round((scannedCount / totalStocks) * 100);

                        const stockData = message.data;
                        await db.insert(schema.scanResults).values({
                            scanId,
                            symbol: stockData.symbol,
                            market,
                            priceAtScan: stockData.price.toString(),
                            l1Pass: stockData.l1 >= (weights.l1 * 0.6),
                            l2Pass: stockData.l2 >= (weights.l2 * 0.6),
                            l3Pass: stockData.l3 >= (weights.l3 * 0.6),
                            l4Pass: stockData.l4 >= (weights.l4 * 0.6),
                            l5Pass: stockData.l5 >= (weights.l5 * 0.6),
                            l6Pass: stockData.l6 != null ? stockData.l6 >= (weights.l6 * 0.6) : null,
                            totalScore: stockData.total_score,
                            category: stockData.category,
                            mbScore: stockData.mb_score ?? null,
                            mbTier: stockData.mb_tier ?? null,
                            megatrendTag: stockData.megatrend ?? null,
                            megatrendEmoji: stockData.megatrend_emoji ?? null,
                            fcfYieldPct: stockData.fcf_yield_pct != null ? stockData.fcf_yield_pct.toString() : null,
                            earningsQuality: stockData.earnings_quality != null ? stockData.earnings_quality.toString() : null,
                            pegRatio: stockData.peg != null ? stockData.peg.toString() : null,
                            deDirection: stockData.de_direction ?? null,
                            marginDirection: stockData.margin_direction ?? null,
                            ccScore: stockData.cc_score ?? null,
                            ccTier: stockData.cc_tier ?? null,
                            ccRevenueCagr: stockData.cc_revenue_cagr != null ? stockData.cc_revenue_cagr.toString() : null,
                            ccYearsChecked: stockData.cc_years_checked ?? null,
                        });

                        onEvent?.({
                            type: "progress",
                            progress,
                            symbol: stockData.symbol,
                            score: stockData.total_score
                        });
                    } else if (message.type === "complete") {
                        const [goodRow] = await db
                            .select({ n: count() })
                            .from(schema.scanResults)
                            .where(and(
                                eq(schema.scanResults.scanId, scanId),
                                ne(schema.scanResults.category, "OFFLINE")
                            ));
                        const goodResultsCount = goodRow?.n ?? 0;

                        await db.update(schema.scans)
                            .set({
                                status: "COMPLETED",
                                totalScanned: message.count,
                                durationMs: Date.now() - scanRunAt.getTime(),
                                goodResultsCount,
                            })
                            .where(eq(schema.scans.id, scanId));

                        await pruneOldScans(market);

                        const deltas = await getScanDeltas(scanId, market);

                        onEvent?.({
                            type: "complete",
                            scanId,
                            market,
                            newCount: deltas.newEntries.length,
                            droppedCount: deltas.droppedStocks.length,
                            deltas
                        });

                        resolve();
                    }
                } catch (e) {
                    console.error("Error parsing Python output:", e, line);
                }
            }
        });

        pythonProcess.stderr.on("data", (data) => {
            console.error(`Python stderr: ${data}`);
        });

        pythonProcess.on("close", async (code) => {
            if (code !== 0) {
                await db.update(schema.scans)
                    .set({ status: "FAILED", errorMessage: `Process exited with code ${code}` })
                    .where(eq(schema.scans.id, scanId));
                onEvent?.({ type: "error", message: `Process exited with code ${code}` });
                reject(new Error(`Process exited with code ${code}`));
            }
        });
    });
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
        const isAdmin = (session?.user as any)?.isAdmin;
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

export async function GET() {
    const lastScan = await db.query.scans.findFirst({
        orderBy: [desc(schema.scans.runAt)],
    });

    if (!lastScan) return NextResponse.json({ status: "IDLE" });

    if (lastScan.status === "RUNNING") {
        const results = await db.select()
            .from(schema.scanResults)
            .where(eq(schema.scanResults.scanId, lastScan.id));

        return NextResponse.json({
            ...lastScan,
            currentCount: results.length,
            progress: lastScan.totalScanned ? Math.round((results.length / lastScan.totalScanned) * 100) : null
        });
    }

    return NextResponse.json(lastScan);
}
