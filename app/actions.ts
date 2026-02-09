"use server";

import { db, schema } from "@/lib/db/client";
import { eq, ilike, sql } from "drizzle-orm";
import { mockStocks } from "@/lib/mock-data";
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
                currentPrice: String(stock.price),
                marketCapCrores: String(stock.market_cap),
                qualityScore: stock.quality_score,
                megatrend: stock.megatrend,
                isActive: stock.status === 'Active'
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
    const results = await db.select().from(schema.concepts);

    if (results.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * results.length);
    const c = results[randomIndex];

    return {
        id: c.id,
        term: c.term,
        definition: c.definition,
        category: c.category ?? undefined,
        source: c.source ?? undefined,
    };
}
