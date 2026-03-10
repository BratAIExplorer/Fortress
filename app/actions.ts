"use server";

import { db, schema } from "@/lib/db/client";
import { eq, ilike, sql } from "drizzle-orm";
import { v5LowStocks, v5PennyStocks, v5SubTenStocks, mockStocks } from "@/lib/mock-data";
import { V5Stock } from "@/lib/types";
import { concepts as seedConcepts } from "@/lib/seed-concepts";
import { Stock, StockWithThesis, Concept } from "@/lib/types";

export async function getStocks(): Promise<Stock[]> {
    const stocks = await db
        .select()
        .from(schema.stocks)
        .orderBy(sql`${schema.stocks.qualityScore} DESC NULLS LAST`);

    // Map Drizzle result to our interface
    return stocks.map(s => ({
        id: s.id,
        symbol: s.symbol,
        name: s.name,
        sector: s.sector,
        logo_url: s.logoUrl ?? undefined,
        current_price: Number(s.currentPrice) || 0,
        quality_score: s.qualityScore || 0,
        market_cap_crores: Number(s.marketCapCrores) || 0,
        pe_ratio: s.peRatio ? Number(s.peRatio) : undefined,
        roce_5yr_avg: s.roce5yrAvg ? Number(s.roce5yrAvg) : undefined,
        debt_to_equity: s.debtToEquity ? Number(s.debtToEquity) : undefined,
        megatrend: s.megatrend || [],
        is_active: s.isActive ?? true,
        created_at: s.createdAt?.toISOString(),
        updated_at: s.updatedAt?.toISOString(),
    }));
}

export async function getStockBySymbol(symbol: string): Promise<StockWithThesis | null> {
    const stockResults = await db
        .select()
        .from(schema.stocks)
        .where(ilike(schema.stocks.symbol, symbol))
        .limit(1);

    if (stockResults.length === 0) {
        return null;
    }

    const s = stockResults[0];

    // Fetch thesis
    const thesisResults = await db
        .select()
        .from(schema.theses)
        .where(eq(schema.theses.stockId, s.id))
        .limit(1);

    const t = thesisResults[0];

    const stock: Stock = {
        id: s.id,
        symbol: s.symbol,
        name: s.name,
        sector: s.sector,
        logo_url: s.logoUrl ?? undefined,
        current_price: Number(s.currentPrice) || 0,
        quality_score: s.qualityScore || 0,
        market_cap_crores: Number(s.marketCapCrores) || 0,
        pe_ratio: s.peRatio ? Number(s.peRatio) : undefined,
        roce_5yr_avg: s.roce5yrAvg ? Number(s.roce5yrAvg) : undefined,
        debt_to_equity: s.debtToEquity ? Number(s.debtToEquity) : undefined,
        megatrend: s.megatrend || [],
        is_active: s.isActive ?? true,
        created_at: s.createdAt?.toISOString(),
        updated_at: s.updatedAt?.toISOString(),
    };

    const thesis = t ? {
        id: t.id,
        stock_id: t.stockId,
        one_liner: t.oneLiner,
        megatrend: t.megatrend ?? undefined,
        moat_source: t.moatSource ?? undefined,
        financial_strength_score: t.financialStrengthScore ?? undefined,
        investment_logic: t.investmentLogic,
        risks: t.risks,
        author_id: t.authorId ?? undefined,
        published_at: t.publishedAt?.toISOString(),
        updated_at: t.updatedAt?.toISOString(),
    } : null;

    return { ...stock, thesis };
}

export async function seedDatabase() {
    // 1. Insert Stocks
    for (const stock of mockStocks) {
        const existing = await db
            .select({ id: schema.stocks.id })
            .from(schema.stocks)
            .where(eq(schema.stocks.symbol, stock.symbol))
            .limit(1);

        if (existing.length === 0) {
            const [newStock] = await db.insert(schema.stocks).values({
                symbol: stock.symbol,
                name: stock.name,
                sector: stock.sector,
                currentPrice: String(stock.current_price),
                marketCapCrores: String(stock.market_cap_crores),
                qualityScore: stock.quality_score,
                megatrend: stock.megatrend,
                isActive: stock.is_active
            }).returning();

            if (newStock) {
                await db.insert(schema.theses).values({
                    stockId: newStock.id,
                    oneLiner: `The default thesis for ${stock.name}`,
                    investmentLogic: "Full investment analysis goes here...",
                    risks: "Key risks include...",
                    megatrend: stock.megatrend,
                    financialStrengthScore: 9,
                    moatSource: "Scale Economies"
                });
            }
        }
    }

    // 2. Insert Concepts
    for (const concept of seedConcepts) {
        const existing = await db
            .select({ id: schema.concepts.id })
            .from(schema.concepts)
            .where(eq(schema.concepts.term, concept.term))
            .limit(1);

        if (existing.length === 0) {
            await db.insert(schema.concepts).values(concept);
        }
    }

    return { success: true };
}

export async function getConcepts(): Promise<Concept[]> {
    const results = await db.select().from(schema.concepts);
    return results.map(c => ({
        id: c.id,
        term: c.term,
        definition: c.definition,
        category: c.category ?? undefined,
        source: c.source ?? undefined,
    }));
}

export async function getRandomWisdom(): Promise<Concept | null> {
    const results = await db
        .select()
        .from(schema.concepts)
        .orderBy(sql`RANDOM()`)
        .limit(1);

    if (results.length === 0) {
        return null;
    }

    const c = results[0];
    return {
        id: c.id,
        term: c.term,
        definition: c.definition,
        category: c.category ?? undefined,
        source: c.source ?? undefined,
    };
}

function mapV5Row(s: typeof schema.stocks.$inferSelect): V5Stock {
    return {
        id: s.id,
        symbol: s.symbol,
        name: s.name,
        sector: s.sector,
        industry: s.industry ?? undefined,
        logo_url: s.logoUrl ?? undefined,
        current_price: Number(s.currentPrice) || 0,
        quality_score: s.qualityScore || 0,
        market_cap_crores: Number(s.marketCapCrores) || 0,
        pe_ratio: s.peRatio ? Number(s.peRatio) : undefined,
        roce_5yr_avg: s.roce5yrAvg ? Number(s.roce5yrAvg) : undefined,
        debt_to_equity: s.debtToEquity ? Number(s.debtToEquity) : undefined,
        megatrend: s.megatrend || [],
        is_active: s.isActive ?? true,
        tag: s.tag ?? "QUALIFIED",
        risk: s.risk ?? "MEDIUM",
        drop52w: Number(s.drop52w) || 0,
        moat: s.moat ?? s.sector,
        ocf: s.ocf ?? "N/A",
        l1: s.l1 ?? 0,
        l2: s.l2 ?? 0,
        l3: s.l3 ?? 0,
        l4: s.l4 ?? 0,
        l5: s.l5 ?? 0,
        why_down: s.whyDown ?? undefined,
        why_buy: s.whyBuy ?? undefined,
        penny_why: s.pennyWhy ?? undefined,
        multi_bagger_case: s.multiBaggerCase ?? undefined,
        killer_risk: s.killerRisk ?? undefined,
        fortress_note: s.fortressNote ?? undefined,
    };
}

export async function getV5LowStocks(): Promise<V5Stock[]> {
    const results = await db
        .select()
        .from(schema.stocks)
        .where(eq(schema.stocks.v5Category, "low"));

    if (results.length > 0) return results.map(mapV5Row);
    // Fallback to mock until DB is seeded
    return v5LowStocks as V5Stock[];
}

export async function getV5PennyStocks(): Promise<V5Stock[]> {
    const results = await db
        .select()
        .from(schema.stocks)
        .where(eq(schema.stocks.v5Category, "penny"));

    if (results.length > 0) return results.map(mapV5Row);
    return v5PennyStocks as V5Stock[];
}

export async function getV5SubTenStocks(): Promise<V5Stock[]> {
    const results = await db
        .select()
        .from(schema.stocks)
        .where(eq(schema.stocks.v5Category, "sub_ten"));

    if (results.length > 0) return results.map(mapV5Row);
    return v5SubTenStocks as V5Stock[];
}

export async function seedV5Stocks(): Promise<{ success: boolean; inserted: number }> {
    const allV5 = [
        ...v5LowStocks.map(s => ({ ...s, v5_category: "low" as const })),
        ...v5PennyStocks.map(s => ({ ...s, v5_category: "penny" as const })),
        ...v5SubTenStocks.map(s => ({ ...s, v5_category: "sub_ten" as const })),
    ];

    let inserted = 0;
    for (const stock of allV5) {
        const existing = await db
            .select({ id: schema.stocks.id })
            .from(schema.stocks)
            .where(eq(schema.stocks.symbol, stock.symbol))
            .limit(1);

        if (existing.length === 0) {
            await db.insert(schema.stocks).values({
                symbol: stock.symbol,
                name: stock.name,
                sector: stock.sector,
                industry: stock.industry,
                currentPrice: String(stock.current_price),
                marketCapCrores: String(stock.market_cap_crores),
                qualityScore: stock.quality_score,
                megatrend: stock.megatrend,
                isActive: stock.is_active,
                v5Category: stock.v5_category,
                tag: stock.tag,
                risk: stock.risk,
                drop52w: stock.drop52w ? String(stock.drop52w) : null,
                moat: stock.moat,
                ocf: stock.ocf,
                l1: stock.l1,
                l2: stock.l2,
                l3: stock.l3,
                l4: stock.l4,
                l5: stock.l5,
                whyDown: stock.why_down,
                whyBuy: stock.why_buy,
                pennyWhy: stock.penny_why,
                multiBaggerCase: stock.multi_bagger_case,
                killerRisk: stock.killer_risk,
                fortressNote: stock.fortress_note,
            });
            inserted++;
        } else {
            // Update v5 fields on existing stock rows
            await db.update(schema.stocks).set({
                v5Category: stock.v5_category,
                tag: stock.tag,
                risk: stock.risk,
                drop52w: stock.drop52w ? String(stock.drop52w) : null,
                moat: stock.moat,
                ocf: stock.ocf,
                l1: stock.l1,
                l2: stock.l2,
                l3: stock.l3,
                l4: stock.l4,
                l5: stock.l5,
                whyDown: stock.why_down,
                whyBuy: stock.why_buy,
                pennyWhy: stock.penny_why,
                multiBaggerCase: stock.multi_bagger_case,
                killerRisk: stock.killer_risk,
                fortressNote: stock.fortress_note,
            }).where(eq(schema.stocks.id, existing[0].id));
            inserted++;
        }
    }

    return { success: true, inserted };
}

export interface ThesisRow {
    id: string;
    symbol: string;
    name: string;
    oneLiner: string;
    investmentLogic: string;
    risks: string;
    financialStrengthScore: number | null;
    moatSource: string | null;
}

export async function getTheses(): Promise<ThesisRow[]> {
    const results = await db
        .select({
            id: schema.theses.id,
            symbol: schema.stocks.symbol,
            name: schema.stocks.name,
            oneLiner: schema.theses.oneLiner,
            investmentLogic: schema.theses.investmentLogic,
            risks: schema.theses.risks,
            financialStrengthScore: schema.theses.financialStrengthScore,
            moatSource: schema.theses.moatSource,
        })
        .from(schema.theses)
        .innerJoin(schema.stocks, eq(schema.theses.stockId, schema.stocks.id));

    return results;
}

export async function updateThesis(id: string, data: Partial<{
    oneLiner: string,
    investmentLogic: string,
    risks: string,
    financialStrengthScore: number,
    moatSource: string
}>) {
    await db.update(schema.theses)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(schema.theses.id, id));

    return { success: true };
}

export async function getV5StocksForAdmin(): Promise<V5Stock[]> {
    const results = await db
        .select()
        .from(schema.stocks)
        .where(sql`${schema.stocks.v5Category} IS NOT NULL`)
        .orderBy(schema.stocks.symbol);

    return results.map(mapV5Row);
}

export async function updateV5Stock(id: string, data: Partial<V5Stock>) {
    // Only allow updating v5-specific fields and common editable fields
    await db.update(schema.stocks)
        .set({
            currentPrice: data.current_price ? String(data.current_price) : undefined,
            qualityScore: data.quality_score,
            tag: data.tag,
            risk: data.risk,
            industry: data.industry,
            drop52w: data.drop52w ? String(data.drop52w) : undefined,
            moat: data.moat,
            ocf: data.ocf,
            l1: data.l1,
            l2: data.l2,
            l3: data.l3,
            l4: data.l4,
            l5: data.l5,
            whyDown: data.why_down,
            whyBuy: data.why_buy,
            pennyWhy: data.penny_why,
            multiBaggerCase: data.multi_bagger_case,
            killerRisk: data.killer_risk,
            fortressNote: data.fortress_note,
            v5Category: data.v5Category as any,
            updatedAt: new Date(),
        })
        .where(eq(schema.stocks.id, id));

    return { success: true };
}
