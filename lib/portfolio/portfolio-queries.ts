import { db, schema } from "@/lib/db/client";
import { eq, and } from "drizzle-orm";
import type { Strategy, StrategyHolding, UpsertHoldingInput } from "./types";

function toStrategy(row: typeof schema.strategies.$inferSelect): Strategy {
  return {
    ...row,
    totalCapitalUsd: Number(row.totalCapitalUsd),
    targetMultiple: Number(row.targetMultiple ?? 5),
    targetHorizonYears: row.targetHorizonYears ?? 10,
    emoji: row.emoji ?? "📈",
    isActive: row.isActive ?? true,
    riskTier: row.riskTier as Strategy["riskTier"],
    createdAt: row.createdAt ?? new Date(),
    updatedAt: row.updatedAt ?? new Date(),
  };
}

function toHolding(row: typeof schema.strategyHoldings.$inferSelect): StrategyHolding {
  return {
    ...row,
    targetWeightPct: Number(row.targetWeightPct),
    unitsHeld: Number(row.unitsHeld ?? 0),
    avgBuyPrice: Number(row.avgBuyPrice ?? 0),
  };
}

export async function getStrategiesByUserId(userId: string): Promise<Strategy[]> {
  const rows = await db
    .select()
    .from(schema.strategies)
    .where(
      and(
        eq(schema.strategies.userId, userId),
        eq(schema.strategies.isActive, true)
      )
    );
  return rows.map(toStrategy);
}

export async function getStrategyById(
  strategyId: string,
  userId: string
): Promise<Strategy | null> {
  const rows = await db
    .select()
    .from(schema.strategies)
    .where(
      and(
        eq(schema.strategies.id, strategyId),
        eq(schema.strategies.userId, userId)
      )
    )
    .limit(1);
  return rows[0] ? toStrategy(rows[0]) : null;
}

export async function getHoldingsByStrategyId(
  strategyId: string
): Promise<StrategyHolding[]> {
  const rows = await db
    .select()
    .from(schema.strategyHoldings)
    .where(eq(schema.strategyHoldings.strategyId, strategyId));
  return rows.map(toHolding);
}

export async function createStrategy(
  userId: string,
  data: {
    name: string;
    description?: string;
    emoji?: string;
    riskTier: string;
    totalCapitalUsd: number;
    targetMultiple?: number;
    targetHorizonYears?: number;
  }
): Promise<Strategy> {
  const [row] = await db
    .insert(schema.strategies)
    .values({
      userId,
      name: data.name,
      description: data.description ?? null,
      emoji: data.emoji ?? "📈",
      riskTier: data.riskTier,
      totalCapitalUsd: String(data.totalCapitalUsd),
      targetMultiple: String(data.targetMultiple ?? 5),
      targetHorizonYears: data.targetHorizonYears ?? 10,
    })
    .returning();
  return toStrategy(row);
}

export async function upsertHoldings(
  strategyId: string,
  holdings: UpsertHoldingInput[]
): Promise<StrategyHolding[]> {
  // Delete existing and re-insert for simplicity — holdings are small sets
  await db
    .delete(schema.strategyHoldings)
    .where(eq(schema.strategyHoldings.strategyId, strategyId));

  if (holdings.length === 0) return [];

  const rows = await db
    .insert(schema.strategyHoldings)
    .values(
      holdings.map((h) => ({
        strategyId,
        ticker: h.ticker,
        name: h.name,
        targetWeightPct: String(h.targetWeightPct),
        unitsHeld: String(h.unitsHeld),
        avgBuyPrice: String(h.avgBuyPrice),
      }))
    )
    .returning();

  return rows.map(toHolding);
}
