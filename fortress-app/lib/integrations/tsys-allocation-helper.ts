/**
 * TSYS Integration Helper
 *
 * Investment Genie uses TSYS conviction to:
 * 1. Validate user allocation (does it match high-conviction theses?)
 * 2. Suggest adjustments (shift from faltering to working theses)
 * 3. Explain allocation (here's why we recommend this split)
 */

import { db } from "@/lib/db";
import { sectorTheses, sectorThesisValidations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface AllocationContext {
  allocation: Record<string, number>; // {NSE: 40, US: 60}
  relatedTheses: Array<{
    sector: string;
    conviction: number;
    status: string;
    reason: string;
  }>;
  qualityScore: number; // 0-1: how well allocation aligns with high-conviction theses
  suggestions: string[];
}

/**
 * When user submits allocation in Investment Genie,
 * fetch related TSYS convictions to explain allocation
 */
export async function enrichAllocationWithTSYS(
  allocation: Record<string, number>
): Promise<AllocationContext> {
  // Fetch all active theses with latest conviction
  const theses = await db.query.sectorTheses.findMany({
    where: eq(sectorTheses.isActive, true),
  });

  // Map allocation sectors to theses
  const relatedTheses = theses
    .filter((t) => isThesisRelevantToAllocation(t.slug, allocation))
    .map((t) => ({
      sector: t.name,
      conviction: Number(t.convictionScore),
      status: t.convictionStatus,
      reason: t.macroCatalyst,
    }))
    .sort((a, b) => b.conviction - a.conviction); // Highest conviction first

  // Calculate quality score (are we investing in high-conviction theses?)
  const avgConviction =
    relatedTheses.reduce((sum, t) => sum + t.conviction, 0) / relatedTheses.length || 0;

  // Generate suggestions
  const suggestions = generateSuggestions(relatedTheses, allocation);

  return {
    allocation,
    relatedTheses: relatedTheses.slice(0, 5), // Top 5 related theses
    qualityScore: avgConviction,
    suggestions,
  };
}

/**
 * Check if thesis is relevant to user's allocation
 * e.g., if user picked "NSE", match to India-focused theses
 */
function isThesisRelevantToAllocation(
  thesisSlug: string,
  allocation: Record<string, number>
): boolean {
  // Simple heuristic: India theses if NSE allocation >0
  const isIndiaThesis =
    thesisSlug.includes("india") ||
    thesisSlug.includes("nbfc") ||
    thesisSlug.includes("domestic");

  const isUSThesis =
    thesisSlug.includes("semiconductor") ||
    thesisSlug.includes("cloud") ||
    thesisSlug.includes("ai");

  if (allocation.NSE && allocation.NSE > 20 && isIndiaThesis) return true;
  if (allocation.US && allocation.US > 20 && isUSThesis) return true;

  // Commodity/macro theses are universal
  if (thesisSlug.includes("gold") || thesisSlug.includes("inflation")) return true;

  return false;
}

/**
 * Generate actionable suggestions based on TSYS conviction
 */
function generateSuggestions(
  relatedTheses: Array<{ sector: string; conviction: number; status: string }>,
  allocation: Record<string, number>
): string[] {
  const suggestions: string[] = [];

  // Find highest conviction thesis
  const best = relatedTheses[0];
  if (best && best.conviction > 0.75) {
    suggestions.push(
      `Strong conviction: Consider increasing allocation to ${best.sector} (${(best.conviction * 100).toFixed(0)}% confidence)`
    );
  }

  // Find faltering theses
  const faltering = relatedTheses.filter((t) => t.status === "FALTERING");
  if (faltering.length > 0) {
    suggestions.push(
      `Alert: ${faltering[0].sector} conviction declining. Consider rebalancing.`
    );
  }

  // Diversification hint
  if (relatedTheses.length > 0 && relatedTheses.length < 3) {
    suggestions.push(`Diversify: Your allocation aligns with ${relatedTheses.length} thesis. Consider broadening.`);
  }

  return suggestions;
}

/**
 * For Fortress 30: rank stocks by sector conviction
 * Stocks in high-conviction sectors get ranking boost
 */
export async function getStockConvictionBoost(
  symbol: string,
  sector: string
): Promise<{ boost: number; reason: string }> {
  // Find thesis matching sector
  const thesis = await db.query.sectorTheses.findFirst({
    where: eq(sectorTheses.name, sector),
  });

  if (!thesis) return { boost: 0, reason: "No thesis data" };

  const conviction = Number(thesis.convictionScore);

  // Boost stock score by sector conviction
  // High conviction = +10-20% to stock score
  // Low conviction = -5-10% penalty
  const boost = conviction > 0.7 ? 0.15 : conviction < 0.5 ? -0.1 : 0.05;

  return {
    boost,
    reason: `Sector thesis: ${thesis.name} (${(conviction * 100).toFixed(0)}% conviction)`,
  };
}
