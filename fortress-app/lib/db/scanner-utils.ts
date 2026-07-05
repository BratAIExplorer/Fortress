import { db, schema } from "./client";
import { eq, and, ne, desc } from "drizzle-orm";

export async function getScanDeltas(currentScanId: string, market: string = "NSE") {
    // 1. Get the previous completed scan for this market
    const previousScan = await db.query.scans.findFirst({
        where: and(
            eq(schema.scans.status, "COMPLETED"),
            eq(schema.scans.market, market),
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

export async function getLatestScanSummary(market: string = "NSE") {
    const lastScan = await db.query.scans.findFirst({
        where: and(
            eq(schema.scans.status, "COMPLETED"),
            eq(schema.scans.market, market)
        ),
        orderBy: [desc(schema.scans.runAt)],
    });

    if (!lastScan) return null;

    const deltas = await getScanDeltas(lastScan.id, market);

    return {
        ...lastScan,
        newCount: deltas.newEntries.length,
        droppedCount: deltas.droppedStocks.length,
    };
}
