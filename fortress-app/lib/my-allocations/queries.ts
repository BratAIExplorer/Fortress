import { db } from "@/lib/db";
import { allocations } from "@/lib/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import type { SavedAllocation, SortKey } from "./types";

function mapToSavedAllocation(record: any): SavedAllocation {
  return {
    id: record.id,
    userId: record.userId,
    amount: record.amount,
    riskAppetite: record.riskAppetite,
    horizon: record.horizon,
    experience: record.experience,
    countries: record.countries,
    allocation: record.allocation,
    createdAt: record.createdAt?.toISOString(),
    savedAt: record.savedAt?.toISOString(),
  };
}

export async function getAllocationsByUserId(userId: string): Promise<SavedAllocation[]> {
  const result = await db
    .select()
    .from(allocations)
    .where(eq(allocations.userId, userId))
    .orderBy(desc(allocations.createdAt));

  return result.map(mapToSavedAllocation);
}

export async function getAllocationsByUserIdWithFilters(
  userId: string,
  filters: {
    sort?: SortKey;
    horizon?: string;
    experience?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<SavedAllocation[]> {
  const conditions = [eq(allocations.userId, userId)];

  if (filters.horizon && filters.horizon !== 'all') {
    conditions.push(eq(allocations.horizon, filters.horizon));
  }

  if (filters.experience && filters.experience !== 'all') {
    conditions.push(eq(allocations.experience, filters.experience));
  }

  if (filters.dateFrom) {
    conditions.push(gte(allocations.createdAt, new Date(filters.dateFrom)));
  }

  if (filters.dateTo) {
    conditions.push(lte(allocations.createdAt, new Date(filters.dateTo)));
  }

  const result = await db
    .select()
    .from(allocations)
    .where(and(...conditions))
    .orderBy(
      filters.sort === 'amount'
        ? desc(allocations.amount)
        : filters.sort === 'horizon'
          ? allocations.horizon
          : desc(allocations.createdAt)
    );

  return result.map(mapToSavedAllocation);
}
