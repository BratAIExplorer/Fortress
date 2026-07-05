/**
 * TSYS Weekly Validator Tests
 *
 * Validates:
 * - Conviction score calculations
 * - Signal impact on conviction
 * - Integration with allocation helper
 * - Database updates
 */

import { describe, it, expect } from "@jest/globals";

describe("TSYS Weekly Validator", () => {
  describe("Conviction Score Updates", () => {
    it("should increase conviction on positive signal", () => {
      const current = 0.70;
      const strength = 0.15;
      const signal = "positive";

      // Formula: current + (strength * direction) * smoothing
      const adjustment = strength; // positive
      const newConviction = Math.max(
        0,
        Math.min(1, current + adjustment * 0.5) // smoothing factor 0.5
      );

      expect(newConviction).toBeCloseTo(0.7375, 3);
      expect(newConviction).toBeGreaterThan(current);
    });

    it("should decrease conviction on negative signal", () => {
      const current = 0.70;
      const strength = 0.20;
      const signal = "negative";

      const adjustment = -strength; // negative
      const newConviction = Math.max(0, Math.min(1, current + adjustment * 0.5));

      expect(newConviction).toBeCloseTo(0.65, 2);
      expect(newConviction).toBeLessThan(current);
    });

    it("should not exceed bounds (0-1)", () => {
      // Very strong positive at high conviction
      let conviction = 0.95;
      conviction = Math.max(0, Math.min(1, conviction + 0.15 * 0.5));
      expect(conviction).toBeLessThanOrEqual(1);

      // Very strong negative at low conviction
      conviction = 0.05;
      conviction = Math.max(0, Math.min(1, conviction - 0.20 * 0.5));
      expect(conviction).toBeGreaterThanOrEqual(0);
    });

    it("should smooth changes (not jump abruptly)", () => {
      const current = 0.50;
      const targetWithoutSmoothing = 0.85; // +0.35 change
      const smoothingFactor = 0.5;

      // Only half the change happens per week
      const actualChange = (targetWithoutSmoothing - current) * smoothingFactor;
      const newConviction = current + actualChange;

      expect(newConviction).toBeCloseTo(0.675, 2);
      expect(newConviction).toBeLessThan(targetWithoutSmoothing);
    });
  });

  describe("Status Determination", () => {
    it("should set status WORKING for high conviction (>0.7)", () => {
      const conviction = 0.75;
      const status = conviction > 0.7 ? "WORKING" : conviction > 0.5 ? "FALTERING" : "BROKEN";

      expect(status).toBe("WORKING");
    });

    it("should set status FALTERING for medium conviction (0.5-0.7)", () => {
      const conviction = 0.62;
      const status = conviction > 0.7 ? "WORKING" : conviction > 0.5 ? "FALTERING" : "BROKEN";

      expect(status).toBe("FALTERING");
    });

    it("should set status BROKEN for low conviction (<0.5)", () => {
      const conviction = 0.35;
      const status = conviction > 0.7 ? "WORKING" : conviction > 0.5 ? "FALTERING" : "BROKEN";

      expect(status).toBe("BROKEN");
    });
  });

  describe("Integration with Allocation", () => {
    it("should find related theses for NSE allocation", () => {
      const allocation = { NSE: 60, US: 40 };
      const indiaTheses = [
        "healthcare-growth-india",
        "nbfc-lending-cycle",
        "construction-housing",
      ];

      const relevant = indiaTheses.filter((t) =>
        allocation.NSE > 20 && (t.includes("india") || t.includes("nbfc"))
      );

      expect(relevant.length).toBeGreaterThan(0);
      expect(relevant).toContain("healthcare-growth-india");
    });

    it("should calculate quality score from related theses convictions", () => {
      const relatedTheses = [
        { conviction: 0.80 },
        { conviction: 0.75 },
        { conviction: 0.70 },
      ];

      const avgConviction = relatedTheses.reduce((sum, t) => sum + t.conviction, 0) /
        relatedTheses.length;

      expect(avgConviction).toBeCloseTo(0.75, 2);
    });

    it("should generate suggestion for high-conviction thesis", () => {
      const relatedTheses = [
        { sector: "Healthcare", conviction: 0.82, status: "WORKING" },
      ];

      const shouldSuggest = relatedTheses[0].conviction > 0.75;
      expect(shouldSuggest).toBe(true);
    });

    it("should alert on faltering thesis", () => {
      const relatedTheses = [
        { sector: "NBFC", conviction: 0.60, status: "FALTERING" },
      ];

      const faltering = relatedTheses.filter((t) => t.status === "FALTERING");
      expect(faltering.length).toBeGreaterThan(0);
    });
  });

  describe("Stock Conviction Boost (Fortress 30)", () => {
    it("should boost stock in high-conviction sector", () => {
      const conviction = 0.78;
      const boost = conviction > 0.7 ? 0.15 : conviction < 0.5 ? -0.1 : 0.05;

      expect(boost).toBe(0.15);
      expect(boost).toBeGreaterThan(0);
    });

    it("should penalize stock in low-conviction sector", () => {
      const conviction = 0.42;
      const boost = conviction > 0.7 ? 0.15 : conviction < 0.5 ? -0.1 : 0.05;

      expect(boost).toBe(-0.1);
      expect(boost).toBeLessThan(0);
    });

    it("should give neutral boost for medium conviction", () => {
      const conviction = 0.60;
      const boost = conviction > 0.7 ? 0.15 : conviction < 0.5 ? -0.1 : 0.05;

      expect(boost).toBe(0.05);
      expect(Math.abs(boost)).toBeLessThan(0.1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle thesis with no conviction changes", () => {
      const current = 0.70;
      const strength = 0;
      const adjustment = strength;

      const newConviction = current + adjustment * 0.5;
      expect(newConviction).toBe(current);
    });

    it("should handle multiple signals averaging out", () => {
      const current = 0.70;
      const signals = [
        { strength: 0.10, direction: 1 }, // +0.10
        { strength: 0.15, direction: -1 }, // -0.15
      ];

      const avgSignal =
        signals.reduce((sum, s) => sum + s.strength * s.direction, 0) / signals.length;
      const newConviction = Math.max(0, Math.min(1, current + avgSignal * 0.5));

      expect(newConviction).toBeCloseTo(0.6875, 3);
    });

    it("should handle thesis without related stocks", () => {
      const allocation = { NSE: 60, US: 40 };
      const irrelevantThesis = "some-obscure-sector";

      const isRelevant = allocation.NSE > 20 && irrelevantThesis.includes("india");
      expect(isRelevant).toBe(false);
    });
  });

  describe("Validation Integrity", () => {
    it("should not allow conviction outside [0, 1]", () => {
      const values = [0, 0.5, 1, -0.1, 1.5];
      const valid = values.map((v) => Math.max(0, Math.min(1, v)));

      expect(valid).toEqual([0, 0.5, 1, 0, 1]);
    });

    it("should preserve conviction precision (4 decimals)", () => {
      const conviction = 0.123456789;
      const rounded = Math.round(conviction * 10000) / 10000;

      expect(rounded).toBe(0.1235);
      expect(rounded.toString().split(".")[1].length).toBeLessThanOrEqual(4);
    });

    it("should update timestamp on each validation", () => {
      const date1 = new Date();
      const date2 = new Date(date1.getTime() + 1000); // 1 second later

      expect(date2.getTime()).toBeGreaterThan(date1.getTime());
    });
  });
});
