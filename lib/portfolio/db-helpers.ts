import { investmentsGenieSessions, investmentsGenieRecommendations, investmentsGeniePerformance } from "../db/schema";
import { db } from "../db/client";

export async function saveGenieSession(input: any, recommendation: any) {
  const result = await db.insert(investmentsGenieSessions).values({
    riskTolerance: input.riskTolerance,
    investmentHorizon: input.investmentHorizon,
    sectorPreferences: input.sectorPreferences,
    cashPosition: input.cashPosition?.toString() || "0",
    recommendedAllocation: recommendation.allocation,
    confidenceScore: recommendation.confidence,
    rationale: recommendation.rationale,
    macroContextSnapshot: input.macro || null,
  }).returning();
  return result[0];
}

export async function saveRecommendations(sessionId: string, picks: any[]) {
  if (!picks || picks.length === 0) return [];
  const result = await db.insert(investmentsGenieRecommendations).values(
    picks.map(pick => ({
      sessionId,
      symbol: pick.symbol,
      market: pick.market || "US",
      sector: pick.sector,
      allocationPercent: pick.allocationPercent?.toString() || "0",
      pickScore: pick.score?.toString() || "0",
      riskScore: pick.riskScore?.toString() || "0",
      reasoning: pick.reasoning,
      entryPrice: pick.price?.toString() || "0",
    }))
  ).returning();
  return result;
}

export async function getPerformanceSummary() {
  return db.query.investmentsGeniePerformance.findFirst();
}
