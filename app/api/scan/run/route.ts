import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { db, schema } from "@/lib/db/client";
import { eq, and, desc, notInArray } from "drizzle-orm";
import { getScanDeltas } from "@/lib/db/scanner-utils";

// Keep only the most recent N completed scans per market to prevent unbounded growth.
const RETENTION_LIMIT = 10;

async function pruneOldScans(market: string) {
    try {
        const completed = await db
            .select({ id: schema.scans.id })
            .from(schema.scans)
            .where(and(eq(schema.scans.status, "COMPLETED"), eq(schema.scans.market, market)))
            .orderBy(desc(schema.scans.runAt))
            .limit(RETENTION_LIMIT);

        if (completed.length < RETENTION_LIMIT) return; // Nothing to prune yet

        const keepIds = completed.map(s => s.id);
        await db.delete(schema.scans).where(
            and(
                eq(schema.scans.status, "COMPLETED"),
                eq(schema.scans.market, market),
                notInArray(schema.scans.id, keepIds)
            )
        );
    } catch (e) {
        // Non-fatal — log and continue
        console.error("pruneOldScans failed:", e);
    }
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const market = body.market ?? "NSE";
    const weights = body.weights ?? { l1: 25, l2: 20, l3: 10, l4: 25, l5: 15, l6: 5 };

    // Auth Check: Cron vs Manual
    // TODO: re-enable session auth before public launch (Beta: open access)
    const cronSecret = req.headers.get("x-cron-secret");
    const isCron = cronSecret === process.env.CRON_SECRET;
    const triggeredBy = isCron ? "CRON" : "MANUAL";

    // Validate weights sum to 100
    const sum = Object.values(weights).reduce((a: number, b) => a + (b as number), 0);
    if (sum !== 100) {
        return NextResponse.json({ error: "Weights must sum to 100" }, { status: 400 });
    }

    // 1. Check for active scan FOR THIS MARKET ONLY
    const activeScan = await db.query.scans.findFirst({
        where: and(
            eq(schema.scans.status, "RUNNING"),
            eq(schema.scans.market, market)
        ),
    });

    if (activeScan) {
        return NextResponse.json({ error: `A ${market} scan is already in progress` }, { status: 409 });
    }

    // 2. Initialize new scan in DB
    const [scan] = await db.insert(schema.scans).values({
        status: "RUNNING",
        triggeredBy,
        market,
    }).returning();

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (data: Record<string, unknown>) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            // 3. Spawn Python process with market + weights args
            const pythonArgs = [
                "scanner/engine.py",
                "--market", market,
                "--weights", JSON.stringify(weights)
            ];

            // Limit US/HK for manual runs to prevent timeout
            if (!isCron && (market === "US" || market === "HKEX")) {
                pythonArgs.push("--limit", "200");
            }

            const pythonBin = process.env.PYTHON_BIN ?? ".venv/bin/python3";
            const pythonProcess = spawn(pythonBin, pythonArgs);

            let totalStocks = 0;
            let scannedCount = 0;

            // Buffer stdout so JSON lines split across multiple data events
            // are never partially parsed (same issue as SSE chunk splitting).
            let stdoutBuffer = "";

            pythonProcess.stdout.on("data", async (data) => {
                stdoutBuffer += data.toString();
                const lines = stdoutBuffer.split("\n");
                // Last element may be an incomplete line — keep it in the buffer
                stdoutBuffer = lines.pop() ?? "";

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const message = JSON.parse(line);

                        if (message.type === "start") {
                            totalStocks = message.total;
                            sendEvent({ type: "start", total: totalStocks });
                        } else if (message.type === "progress") {
                            scannedCount++;
                            const progress = Math.round((scannedCount / totalStocks) * 100);

                            // Save result to DB
                            const stockData = message.data;
                            await db.insert(schema.scanResults).values({
                                scanId: scan.id,
                                symbol: stockData.symbol,
                                market: market,
                                priceAtScan: stockData.price.toString(),
                                l1Pass: stockData.l1 >= (weights.l1 * 0.6),
                                l2Pass: stockData.l2 >= (weights.l2 * 0.6),
                                l3Pass: stockData.l3 >= (weights.l3 * 0.6),
                                l4Pass: stockData.l4 >= (weights.l4 * 0.6),
                                l5Pass: stockData.l5 >= (weights.l5 * 0.6),
                                l6Pass: stockData.l6 != null ? stockData.l6 >= (weights.l6 * 0.6) : null,
                                totalScore: stockData.total_score,
                                category: stockData.category,
                                // Engine v3 fields
                                mbScore: stockData.mb_score ?? null,
                                mbTier: stockData.mb_tier ?? null,
                                megatrendTag: stockData.megatrend ?? null,
                                megatrendEmoji: stockData.megatrend_emoji ?? null,
                                fcfYieldPct: stockData.fcf_yield_pct != null ? stockData.fcf_yield_pct.toString() : null,
                                earningsQuality: stockData.earnings_quality != null ? stockData.earnings_quality.toString() : null,
                                pegRatio: stockData.peg != null ? stockData.peg.toString() : null,
                                deDirection: stockData.de_direction ?? null,
                                marginDirection: stockData.margin_direction ?? null,
                                // Coffee Can fields
                                ccScore: stockData.cc_score ?? null,
                                ccTier: stockData.cc_tier ?? null,
                                ccRevenueCagr: stockData.cc_revenue_cagr != null ? stockData.cc_revenue_cagr.toString() : null,
                                ccYearsChecked: stockData.cc_years_checked ?? null,
                            });

                            sendEvent({
                                type: "progress",
                                progress,
                                symbol: stockData.symbol,
                                score: stockData.total_score
                            });
                        } else if (message.type === "complete") {
                            await db.update(schema.scans)
                                .set({
                                    status: "COMPLETED",
                                    totalScanned: message.count,
                                    durationMs: Date.now() - scan.runAt!.getTime()
                                })
                                .where(eq(schema.scans.id, scan.id));

                            // Prune old scans to enforce retention policy
                            await pruneOldScans(market);

                            const deltas = await getScanDeltas(scan.id, market);

                            sendEvent({
                                type: "complete",
                                scanId: scan.id,
                                market,
                                newCount: deltas.newEntries.length,
                                droppedCount: deltas.droppedStocks.length,
                                deltas: deltas
                            });
                            controller.close();
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
                        .where(eq(schema.scans.id, scan.id));
                    sendEvent({ type: "error", message: `Process exited with code ${code}` });
                    controller.close();
                }
            });
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
    // 1. Get the most recent scan
    const lastScan = await db.query.scans.findFirst({
        orderBy: [desc(schema.scans.runAt)],
    });

    if (!lastScan) return NextResponse.json({ status: "IDLE" });

    // 2. If it's running, calculate real-time progress
    if (lastScan.status === "RUNNING") {
        const results = await db.select()
            .from(schema.scanResults)
            .where(eq(schema.scanResults.scanId, lastScan.id));

        // The python engine reports 'total' at the start, but we might not have it in the scan record yet
        // If we don't have totalScanned, we can't show percentage, but we can show count
        return NextResponse.json({
            ...lastScan,
            currentCount: results.length,
            // Estimated progress if we know the total (usually around 2000 for full scan)
            progress: lastScan.totalScanned ? Math.round((results.length / lastScan.totalScanned) * 100) : null
        });
    }

    return NextResponse.json(lastScan);
}
