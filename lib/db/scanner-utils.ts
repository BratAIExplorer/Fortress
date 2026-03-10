import { db, schema } from "./client";
import { eq, and, ne, desc, sql } from "drizzle-orm";

export async function getScanDeltas(currentScanId: string) {
    // 1. Get the previous completed scan
    const previousScan = await db.query.scans.findFirst({
        where: and(
            eq(schema.scans.status, "COMPLETED"),
            ne(schema.scans.id, currentScanId)
        ),
        orderBy: [desc(schema.scans.runAt)],
    });

    if (!previousScan) {
        return { newEntries: [], droppedStocks: [] };
    }

    // 2. Get results for both scans
    const currentResults = await db.query.scanResults.findMany({
        where: eq(schema.scanResults.scanId, currentScanId),
    });

    const previousResults = await db.query.scanResults.findMany({
        where: eq(schema.scanResults.scanId, previousScan.id),
    });

    const currentSymbols = new Set(currentResults.map(r => r.symbol));
    const previousSymbols = new Set(previousResults.map(r => r.symbol));

    // 3. Compare
    const newSymbols = [...currentSymbols].filter(s => !previousSymbols.has(s));
    const droppedSymbols = [...previousSymbols].filter(s => !currentSymbols.has(s));

    return {
        newEntries: currentResults.filter(r => newSymbols.includes(r.symbol)),
        droppedStocks: previousResults.filter(r => droppedSymbols.includes(r.symbol)),
    };
}

export async function getLatestScanSummary() {
    const lastScan = await db.query.scans.findFirst({
        where: eq(schema.scans.status, "COMPLETED"),
        orderBy: [desc(schema.scans.runAt)],
    });

    if (!lastScan) return null;

    const deltas = await getScanDeltas(lastScan.id);

    return {
        ...lastScan,
        newCount: deltas.newEntries.length,
        droppedCount: deltas.droppedStocks.length,
    };
}
