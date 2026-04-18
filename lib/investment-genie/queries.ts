import { ScanData, MacroState, Signal, MacroSnapshot } from "./contracts";

export async function queryScanResults(markets: string[]): Promise<ScanData> {
  try {
    const marketsQuery = markets.join(",");
    const res = await fetch(`/api/scan/results?markets=${marketsQuery}`);
    if (!res.ok) {
        throw new Error("HTTP error " + res.status);
    }
    const data = await res.json();

    return {
      scanDate: new Date(data.scanDate) || new Date(),
      market: data.market || markets.join(","),
      totalStocks: data.total || 0,
      results: (data.results || []).map((r: any) => ({
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
    
    // Attempt to extract the snapshot from the response or assume it's the response itself
    const snapshot: MacroSnapshot = data.snapshot || data; 
    
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
