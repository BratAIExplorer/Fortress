
"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { mockStocks } from "@/lib/mock-data";
import { concepts } from "@/lib/seed-concepts";

export async function getStocks() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: stocks, error } = await supabase
        .from("stocks")
        .select("*")
        .order("quality_score", { ascending: false });

    if (error) {
        console.error("Error fetching stocks:", error);
        // Fallback to mock data if DB fails or is empty, to prevent broken UI during dev
        return mockStocks;
    }

    return stocks.length > 0 ? stocks : mockStocks;
}

export async function getStockBySymbol(symbol: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // First fetch the stock
    const { data: stock, error: stockError } = await supabase
        .from("stocks")
        .select("*")
        .ilike("symbol", symbol)
        .single();

    if (stockError || !stock) {
        console.error("Error fetching stock:", stockError);
        // Fallback to mock
        return mockStocks.find(s => s.symbol.toLowerCase() === symbol.toLowerCase()) || null;
    }

    // Then fetch the thesis
    const { data: thesis, error: thesisError } = await supabase
        .from("theses")
        .select("*")
        .eq("stock_id", stock.id)
        .single();

    return { ...stock, thesis: thesis || null };
}

export async function seedDatabase() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

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
                quality_score: stock.quality_score, // We'll map this schema field freely
                megatrend: stock.megatrend, // Postgres array
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
export async function getConcepts() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data } = await supabase.from('concepts').select('*');
    return data || [];
}

export async function getRandomWisdom() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Postgres doesn't have a clean "RANDOM()" in simple Supabase client select without RPC, 
    // so we'll fetch a small batch and random pick in JS for this MVP scale
    // In production, use .rpc('get_random_concept')
    const { data } = await supabase.from('concepts').select('*');

    if (!data || data.length === 0) {
        // Fallback if DB empty
        return concepts[Math.floor(Math.random() * concepts.length)];
    }

    return data[Math.floor(Math.random() * data.length)];
}
