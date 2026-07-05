/**
 * Database queries for Fortress Thesis Engine
 *
 * SURGICAL: These queries only read/write sector_thesis* tables
 * Zero mutations to existing tables (strategies, stocks, etc.)
 *
 * TESTABLE: All functions are pure queries (no side effects)
 * TYPED: Full TypeScript inference from schema
 */

import { db } from "@/lib/db";
import { sectorTheses, sectorThesisStocks, sectorThesisValidations } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type {
  SectorThesis,
  SectorThesisStock,
  SectorThesisValidation,
  SectorThesisWithDetails,
} from "@/lib/types/thesis";

/**
 * Get all active theses (for browsing)
 */
export async function getAllTheses(): Promise<SectorThesis[]> {
  return db.query.sectorTheses.findMany({
    where: eq(sectorTheses.isActive, true),
    orderBy: desc(sectorTheses.convictionScore),
  });
}

/**
 * Get a single thesis with its stocks + latest validation
 */
export async function getThesisWithDetails(
  thesisId: string
): Promise<SectorThesisWithDetails | null> {
  // Fetch thesis
  const thesis = await db.query.sectorTheses.findFirst({
    where: eq(sectorTheses.id, thesisId),
  });

  if (!thesis) return null;

  // Fetch stocks (top 30, ordered by rank)
  const stocks = await db.query.sectorThesisStocks.findMany({
    where: eq(sectorThesisStocks.thesisId, thesisId),
    orderBy: (stocks) => stocks.rankInThesis,
  });

  // Fetch latest validation
  const validation = await db.query.sectorThesisValidations.findFirst({
    where: eq(sectorThesisValidations.thesisId, thesisId),
    orderBy: desc(sectorThesisValidations.validationDate),
  });

  return {
    ...thesis,
    stocks,
    latestValidation: validation || undefined,
  };
}

/**
 * Get stocks for a thesis (for API endpoint)
 */
export async function getThesisStocks(thesisId: string): Promise<SectorThesisStock[]> {
  return db.query.sectorThesisStocks.findMany({
    where: eq(sectorThesisStocks.thesisId, thesisId),
    orderBy: (stocks) => stocks.rankInThesis,
  });
}

/**
 * Get backtest validation for a thesis
 */
export async function getThesisValidation(
  thesisId: string
): Promise<SectorThesisValidation | null> {
  return db.query.sectorThesisValidations.findFirst({
    where: eq(sectorThesisValidations.thesisId, thesisId),
    orderBy: desc(sectorThesisValidations.validationDate),
  });
}

/**
 * Create a new thesis (admin/seed data only)
 */
export async function createThesis(
  data: Omit<SectorThesis, "id" | "createdAt" | "updatedAt">
): Promise<SectorThesis> {
  const result = await db
    .insert(sectorTheses)
    .values({
      ...data,
      convictionScore: data.convictionScore || 0.5,
      convictionStatus: data.convictionStatus || "WORKING",
    })
    .returning();

  return result[0];
}

/**
 * Add stocks to a thesis (bulk insert)
 */
export async function addStocksToThesis(
  thesisId: string,
  stocks: Array<Omit<SectorThesisStock, "id" | "thesisId" | "createdAt" | "updatedAt">>
): Promise<SectorThesisStock[]> {
  const result = await db
    .insert(sectorThesisStocks)
    .values(
      stocks.map((stock) => ({
        ...stock,
        thesisId,
      }))
    )
    .returning();

  return result;
}

/**
 * Update thesis conviction score (called by daily cron job)
 */
export async function updateThesisConviction(
  thesisId: string,
  convictionScore: number,
  convictionStatus: "WORKING" | "FALTERING" | "BROKEN",
  notes?: string
): Promise<SectorThesis> {
  // Update conviction in thesis table
  const thesis = await db
    .update(sectorTheses)
    .set({
      convictionScore,
      convictionStatus,
      updatedAt: new Date(),
    })
    .where(eq(sectorTheses.id, thesisId))
    .returning();

  // Also record validation snapshot
  await db.insert(sectorThesisValidations).values({
    thesisId,
    validationDate: new Date(),
    validationStatus: convictionStatus,
    notes: notes || undefined,
  });

  return thesis[0];
}

/**
 * Seed initial theses (Phase 1 MVP - 5 theses)
 * Run once on deployment
 */
export async function seedTheses(): Promise<void> {
  const existingTheses = await getAllTheses();
  if (existingTheses.length > 0) {
    console.log("✅ Theses already seeded, skipping");
    return;
  }

  const seedData = [
    {
      name: "Healthcare Growth (India)",
      slug: "healthcare-growth-india",
      description:
        "India healthcare spending inflection at $25k per capita GDP. 50-year runway, 13x returns vs Nifty.",
      macroCatalyst:
        "GDP per capita inflection → individuals shift spending from food/clothing to healthcare",
      timeframeYears: 50,
      historicalCagr: 13.0,
      convictionScore: 0.8,
      convictionStatus: "WORKING" as const,
      isActive: true,
    },
    {
      name: "NBFC Lending Cycle",
      slug: "nbfc-lending-cycle",
      description:
        "Household credit upcycle starting. Indian households have repaired balance sheets post-COVID.",
      macroCatalyst:
        "Indian households entering credit upcycle after COVID deleveraging. RBI rate cuts ahead.",
      timeframeYears: 5,
      historicalCagr: 15.0,
      convictionScore: 0.7,
      convictionStatus: "WORKING" as const,
      isActive: true,
    },
    {
      name: "Commodities/Inflation Hedge",
      slug: "commodities-inflation-hedge",
      description:
        "Inflation likely rising 18-24 months. Commodities benefit when currency debasement occurs.",
      macroCatalyst:
        "Global liquidity injection without corresponding goods production → inflation cycle ahead",
      timeframeYears: 3,
      historicalCagr: 12.0,
      convictionScore: 0.65,
      convictionStatus: "WORKING" as const,
      isActive: true,
    },
    {
      name: "Infrastructure/Capex Cycle",
      slug: "infra-capex-cycle",
      description:
        "Indian government capex spending surge. 5G rollout, highway expansion, renewable energy.",
      macroCatalyst:
        "Government capex cycle: roads, railways, 5G infrastructure spending peaked in prior cycle",
      timeframeYears: 7,
      historicalCagr: 14.0,
      convictionScore: 0.7,
      convictionStatus: "WORKING" as const,
      isActive: true,
    },
    {
      name: "Geopolitical Supply Chain Shift",
      slug: "geopolitical-shift",
      description:
        "De-risking from China. Pharma APIs, rare earths, semiconductors moving to India/West.",
      macroCatalyst:
        "US-China decoupling accelerates. India positioned as alternative supplier for critical inputs.",
      timeframeYears: 10,
      historicalCagr: 18.0,
      convictionScore: 0.6,
      convictionStatus: "WORKING" as const,
      isActive: true,
    },
  ];

  for (const data of seedData) {
    await createThesis(data);
  }

  console.log("✅ Seeded 5 initial theses");
}
