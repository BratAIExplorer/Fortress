import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { db, schema } from "@/lib/db/client";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/macro?limit=8 — latest snapshots ordered by date desc
export async function GET(req: NextRequest) {
    try {
        const limit = Math.min(parseInt(new URL(req.url).searchParams.get("limit") ?? "8"), 52);

        const snapshots = await db
            .select()
            .from(schema.macroSnapshots)
            .orderBy(desc(schema.macroSnapshots.snapshotDate))
            .limit(limit);

        return NextResponse.json({ snapshots });
    } catch (error) {
        console.error("Failed to fetch macro snapshots:", error);
        return NextResponse.json({ 
            snapshots: [], 
            warning: "Database unreachable. Showing cached or empty results." 
        });
    }
}

// POST /api/macro — fetch fresh macro data (requires x-cron-secret header)
export async function POST(req: NextRequest) {
    const cronSecret = req.headers.get("x-cron-secret");
    if (cronSecret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pythonBin = process.env.PYTHON_BIN ?? ".venv/bin/python3";

    return new Promise<NextResponse>((resolve) => {
        const proc = spawn(pythonBin, ["scanner/macro_fetcher.py"]);
        let output = "";
        let errOutput = "";

        proc.stdout.on("data", (d) => { output += d.toString(); });
        proc.stderr.on("data", (d) => { errOutput += d.toString(); });

        proc.on("close", async (code) => {
            if (code !== 0) {
                console.error("macro_fetcher stderr:", errOutput);
                resolve(NextResponse.json({ error: "Fetcher failed", detail: errOutput }, { status: 500 }));
                return;
            }

            try {
                const data = JSON.parse(output.trim());
                if (data.error) {
                    resolve(NextResponse.json({ error: data.error }, { status: 500 }));
                    return;
                }

                const values = {
                    snapshotDate: data.snapshot_date,
                    nifty50:      data.nifty_50     != null ? String(data.nifty_50)      : null,
                    bankNifty:    data.bank_nifty   != null ? String(data.bank_nifty)    : null,
                    usdInr:       data.usd_inr      != null ? String(data.usd_inr)       : null,
                    goldUsd:      data.gold_usd     != null ? String(data.gold_usd)      : null,
                    crudeOilUsd:  data.crude_oil_usd!= null ? String(data.crude_oil_usd) : null,
                    us10yYield:   data.us_10y_yield != null ? String(data.us_10y_yield)  : null,
                    cboeVix:      data.cboe_vix     != null ? String(data.cboe_vix)      : null,
                    indiaVix:     data.india_vix    != null ? String(data.india_vix)     : null,
                };

                await db.insert(schema.macroSnapshots)
                    .values(values)
                    .onConflictDoUpdate({
                        target: schema.macroSnapshots.snapshotDate,
                        set: values,
                    });

                resolve(NextResponse.json({ success: true, snapshot: data }));
            } catch (e) {
                resolve(NextResponse.json({ error: "Failed to parse fetcher output", detail: String(e) }, { status: 500 }));
            }
        });
    });
}
