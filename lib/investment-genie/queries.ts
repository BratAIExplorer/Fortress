import { ScanData, MacroState, Signal, MacroSnapshot } from "./contracts";

export async function queryScanResults(markets: string[]): Promise<ScanData> {
  try {
    const responses = await Promise.all(
      markets.map(m => fetch(`/api/scan/results?market=${m}`).then(r => r.json()))
    );

    const mergedResults = responses.flatMap(data => data.results || []);
    const firstData = responses[0] || {};

    return {
      scanDate: firstData.scanDate ? new Date(firstData.scanDate) : new Date(),
      market: markets.join(", "),
      totalStocks: mergedResults.length,
      results: mergedResults.map((r: any) => ({
        symbol: r.symbol,
        totalScore: r.total_score,
        mbTier: r.mb_tier,
        mbScore: r.mb_score,
        priceAtScan: r.price,
        sector: r.sector || "Unknown",
        market: r.market,
        l1Pass: r.l1,
        l2Pass: r.l2,
        l3Pass: r.l3,
        l4Pass: r.l4,
        l5Pass: r.l5,
        l6Pass: r.l6,
      }))
    };
  } catch (error) {
    console.error("error fetching scan results", error);
    return {
        scanDate: new Date(),
        market: markets.join(","),
        totalStocks: 0,
        results: []
    } as ScanData;
  }
}

export async function queryMacroSnapshot(): Promise<MacroState> {
  try {
    const res = await fetch("/api/macro?limit=1");
    if (!res.ok) {
        throw new Error("HTTP error " + res.status);
    }
    const data = await res.json();
    
    const rawSnapshot = data.snapshots && data.snapshots.length > 0 ? data.snapshots[0] : (data.snapshot || data);
    
    // Map properties to numbers as required by contracts.ts
    const snapshot: MacroSnapshot = {
      snapshotDate: rawSnapshot.snapshotDate ? new Date(rawSnapshot.snapshotDate) : new Date(),
      nifty50: Number(rawSnapshot.nifty50) || 0,
      bankNifty: Number(rawSnapshot.bankNifty) || 0,
      usdInr: Number(rawSnapshot.usdInr) || 0,
      goldUsd: Number(rawSnapshot.goldUsd) || 0,
      crudeOilUsd: Number(rawSnapshot.crudeOilUsd) || 0,
      us10yYield: Number(rawSnapshot.us10yYield) || 0,
      cboeVix: Number(rawSnapshot.cboeVix) || 0,
      indiaVix: Number(rawSnapshot.indiaVix) || 0,
    };
    
    // Derived values
    const vixState = snapshot.cboeVix > 30 ? "extreme" : snapshot.cboeVix > 20 ? "elevated" : "normal";
    const goldTrend = snapshot.goldUsd > 2400 ? "overbought" : snapshot.goldUsd > 2100 ? "flight-to-safety" : "normal";
    const currencyTrend = snapshot.usdInr > 83.5 ? "inr-weak" : snapshot.usdInr < 82.0 ? "inr-strong" : "inr-stable";
    const equityTrend = snapshot.nifty50 > 22000 ? "bullish" : snapshot.nifty50 < 20000 ? "corrective" : "neutral";
    
    return {
      snapshot,
      vixState,
      goldTrend,
      currencyTrend,
      equityTrend
    };
  } catch (error) {
    console.error("error fetching macro snapshot", error);
    return {
      snapshot: {
        snapshotDate: new Date(),
        nifty50: 0,
        bankNifty: 0,
        usdInr: 0,
        goldUsd: 0,
        crudeOilUsd: 0,
        us10yYield: 0,
        cboeVix: 0,
        indiaVix: 0
      },
      vixState: "normal",
      goldTrend: "normal",
      currencyTrend: "inr-stable",
      equityTrend: "neutral"
    };
  }
}

export async function queryIntelligence(): Promise<Signal[]> {
  try {
    const res = await fetch("/api/intelligence/latest");
    if (!res.ok) {
        throw new Error("HTTP error " + res.status);
    }
    const data = await res.json();

    if (!data.report) {
      return [];
    }

    const signals = data.report.signals || [];
    return (Array.isArray(signals) ? signals : []) as Signal[];
  } catch (error) {
    console.error("error fetching intelligence", error);
    return [];
  }
}
