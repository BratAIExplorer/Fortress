import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { queryScanResults, queryMacroSnapshot, queryIntelligence } from "./queries";

// Mock fetch globally
const unmockedFetch = global.fetch;

describe("API Query Functions", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("queryScanResults", () => {
    it("returns correct ScanData type and handles success", async () => {
      const mockData = {
        scanDate: new Date().toISOString(),
        market: "NSE",
        totalStocks: 100,
        results: [{ symbol: "RELIANCE", totalScore: 85, mbTier: "Launcher", mbScore: 90, priceAtScan: 2900, sector: "Energy", market: "NSE" }]
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const res = await queryScanResults(["NSE"]);
      expect(global.fetch).toHaveBeenCalledWith("/api/scan/results?markets=NSE");
      expect(res.totalStocks).toBe(100);
      expect(res.results.length).toBe(1);
    });

    it("handles fallback if API fails", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, status: 500 });
      const res = await queryScanResults(["US"]);
      expect(res.totalStocks).toBe(0);
      expect(res.results.length).toBe(0);
      expect(res.market).toBe("US");
    });
  });

  describe("queryMacroSnapshot", () => {
    it("returns MacroState and computes derived fields", async () => {
      const mockData = {
        snapshot: {
          snapshotDate: new Date().toISOString(),
          nifty50: 22500,
          bankNifty: 48000,
          usdInr: 83.6,
          goldUsd: 2200,
          crudeOilUsd: 85,
          us10yYield: 4.5,
          cboeVix: 22,
          indiaVix: 15
        }
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const res = await queryMacroSnapshot();
      expect(global.fetch).toHaveBeenCalledWith("/api/macro?limit=1");
      expect(res.vixState).toBe("elevated");
      expect(res.goldTrend).toBe("flight-to-safety");
      expect(res.currencyTrend).toBe("inr-weak");
      expect(res.equityTrend).toBe("bullish");
    });

    it("handles fallback gracefully", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network Error"));
      const res = await queryMacroSnapshot();
      expect(res.vixState).toBe("normal");
      expect(res.snapshot.nifty50).toBe(0);
    });
  });

  describe("queryIntelligence", () => {
    it("returns Signal[] type", async () => {
      const mockData = {
        report: {
          signals: [
            { name: "Global trend", direction: "bullish", impactLevel: "high", affectedSectors: [] }
          ]
        }
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const res = await queryIntelligence();
      expect(global.fetch).toHaveBeenCalledWith("/api/intelligence/latest");
      expect(Array.isArray(res)).toBe(true);
      expect(res.length).toBe(1);
      expect(res[0].name).toBe("Global trend");
    });

    it("handles empty arrays and errors gracefully", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, status: 404 });
      const res = await queryIntelligence();
      expect(res).toEqual([]);
    });
  });
});
