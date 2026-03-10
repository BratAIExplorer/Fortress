import { V5Stock } from "./types";

/**
 * Interface for Market Data Providers
 */
export interface MarketDataProvider {
    getQuote(symbol: string): Promise<{
        price: number;
        change: number;
        pChange: number;
        lastUpdate: string;
    }>;
    batchQuotes(symbols: string[]): Promise<Record<string, number>>;
}

/**
 * Placeholder implementation for live market data.
 * Replace the fetch logic with actual Zerodha, AngelOne, or Yahoo Finance API calls.
 */
export async function getLiveStockPrice(symbol: string): Promise<number | null> {
    try {
        // Example: Using a mock fetch that you can later replace with a real endpoint
        // const res = await fetch(`https://api.marketdata.com/v1/quote/${symbol}?token=${process.env.MARKET_API_KEY}`);
        // const data = await res.json();
        // return data.price;

        console.log(`📡 Fetching live data for ${symbol} (Mocked)`);

        // For now, we simulate a slight price fluctuation from the DB price
        return null; // Return null to fallback to DB price if API fails
    } catch (error) {
        console.error(`❌ Error fetching live data for ${symbol}:`, error);
        return null;
    }
}

/**
 * Utility to sync DB prices with live market data.
 * Can be called via a cron job or a manual admin trigger.
 */
export async function syncMarketPrices(stocks: V5Stock[]) {
    const results = {
        updated: 0,
        failed: 0,
        details: [] as { symbol: string; oldPrice: number; newPrice: number }[]
    };

    for (const stock of stocks) {
        const livePrice = await getLiveStockPrice(stock.symbol);
        if (livePrice && livePrice !== stock.current_price) {
            // Update logic here
            results.updated++;
            results.details.push({
                symbol: stock.symbol,
                oldPrice: stock.current_price,
                newPrice: livePrice
            });
        } else {
            results.failed++;
        }
    }

    return results;
}
