
"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { mockStocks } from "@/lib/mock-data";
import { concepts } from "@/lib/seed-concepts";
import { Stock, StockWithThesis, Concept } from "@/lib/types";

// Helper to reduce duplication
async function getSupabase() {
    const cookieStore = await cookies();
    return createClient(cookieStore);
}

export async function getStocks(): Promise<Stock[]> {
    const supabase = await getSupabase();

    const { data: stocks, error } = await supabase
        .from("stocks")
        .select("*")
        .order("quality_score", { ascending: false });

    if (error) {
        console.error("Error fetching stocks:", error);
        throw new Error(`Failed to fetch stocks: ${error.message}`);
    }

    return stocks || [];
}

export async function getStockBySymbol(symbol: string): Promise<StockWithThesis | null> {
    const supabase = await getSupabase();

    // First fetch the stock
    const { data: stock, error: stockError } = await supabase
        .from("stocks")
        .select("*")
        .ilike("symbol", symbol)
        .single();

    if (stockError) {
        console.error("Error fetching stock:", stockError);
        // If row not found, return null (404), otherwise throw
        if (stockError.code === 'PGRST116') return null;
        throw new Error(`Failed to fetch stock ${symbol}: ${stockError.message}`);
    }

    // Then fetch the thesis
    const { data: thesis, error: thesisError } = await supabase
        .from("theses")
        .select("*")
        .eq("stock_id", stock.id)
        .single();

    // It's possible a stock exists without a thesis? If so, handle gracefully.
    // However, if DB error (not just missing), we should log it.
    if (thesisError && thesisError.code !== 'PGRST116') {
        console.error("Error fetching thesis:", thesisError);
    }

    return { ...stock, thesis: thesis || null };
}

export async function seedDatabase() {
    const supabase = await getSupabase();

    // 1. Insert Stocks
    for (const stock of mockStocks) {
        // Check if exists
        const { data: existing } = await supabase.from('stocks').select('id').eq('symbol', stock.symbol).single();

        if (!existing) {
            const { data: newStock, error } = await supabase.from('stocks').insert({
                symbol: stock.symbol,
                name: stock.name,
                sector: stock.sector,
                current_price: stock.price,
                market_cap_crores: stock.market_cap,
                quality_score: stock.quality_score,
                megatrend: stock.megatrend,
                is_active: stock.status === 'Active'
            }).select().single();

            if (error) {
                console.error("Error inserting stock:", error);
            } else if (newStock) {
                // 2. Insert Mock Thesis
                await supabase.from('theses').insert({
                    stock_id: newStock.id,
                    one_liner: `The default thesis for ${stock.name}`,
                    investment_logic: "Full investment analysis goes here...",
                    risks: "Key risks include...",
                    megatrend: stock.megatrend,
                    financial_strength_score: 9,
                    moat_source: "Scale Economies"
                });
            }
        }
    }

    // 3. Insert Concepts (The Super Learning Layer)
    for (const concept of concepts) {
        const { data: existing } = await supabase.from('concepts').select('id').eq('term', concept.term).single();

        if (!existing) {
            await supabase.from('concepts').insert(concept);
        }
    }

    return { success: true };
}

// Data Fetching for Concepts
export async function getConcepts(): Promise<Concept[]> {
    const supabase = await getSupabase();

    const { data, error } = await supabase.from('concepts').select('*');
    if (error) {
        console.error("Error fetching concepts:", error);
        throw new Error(`Failed to fetch concepts: ${error.message}`);
    }
    return data || [];
}

export async function getRandomWisdom(): Promise<Concept | null> {
    const supabase = await getSupabase();

    // In production, use .rpc('get_random_concept') if available
    const { data, error } = await supabase.from('concepts').select('*');

    if (error) {
        console.error("Error fetching wisdom:", error);
        return null; // Graceful degradation for widgets
    }

    if (!data || data.length === 0) {
        return null;
    }

    return data[Math.floor(Math.random() * data.length)];
}
