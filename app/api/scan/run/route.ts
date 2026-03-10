import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { db, schema } from "@/lib/db/client";
import { eq, desc } from "drizzle-orm";
import { getScanDeltas } from "@/lib/db/scanner-utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    // 1. Check for active scan
    const activeScan = await db.query.scans.findFirst({
        where: eq(schema.scans.status, "RUNNING"),
    });

    if (activeScan) {
        return NextResponse.json({ error: "A scan is already in progress" }, { status: 409 });
    }

    // 2. Initialize new scan in DB
    const [scan] = await db.insert(schema.scans).values({
        status: "RUNNING",
        triggeredBy: "MANUAL",
    }).returning();

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            // 3. Spawn Python process
            // Using 'python' or 'python3' based on environment
            // In Windows, it's usually 'python'
            const pythonProcess = spawn("python", ["scanner/engine.py"]);

            let totalStocks = 0;
            let scannedCount = 0;

            pythonProcess.stdout.on("data", async (data) => {
                const lines = data.toString().split("\n");
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
                                priceAtScan: stockData.price.toString(),
                                l1Pass: stockData.l1 >= 15,
                                l2Pass: stockData.l2 >= 10,
                                l3Pass: stockData.l3 >= 10,
                                l4Pass: stockData.l4 >= 15,
                                l5Pass: true, // Placeholder
                                totalScore: stockData.total_score,
                                category: stockData.category,
                            });

                            sendEvent({
                                type: "progress",
                                progress,
                                symbol: stockData.symbol,
                                score: stockData.total_score
                            });
                        } else if (message.type === "complete") {
                            // Update scan status
                            await db.update(schema.scans)
                                .set({
                                    status: "COMPLETED",
                                    totalScanned: message.count,
                                    durationMs: Date.now() - scan.runAt!.getTime()
                                })
                                .where(eq(schema.scans.id, scan.id));

                            // Calculate deltas
                            const deltas = await getScanDeltas(scan.id);

                            sendEvent({
                                type: "complete",
                                scanId: scan.id,
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
    // For status polling if needed
    const lastScan = await db.query.scans.findFirst({
        orderBy: [desc(schema.scans.runAt)],
    });
    return NextResponse.json(lastScan || { status: "IDLE" });
}
