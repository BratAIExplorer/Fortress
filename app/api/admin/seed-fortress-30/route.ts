import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { v4 as uuid } from "uuid";

const SEED_SECRET = process.env.SEED_SECRET || "fortress-seed-dev-only";

// Sample NSE stocks
const nseStocks = [
  { symbol: "HDFC", price: 2850, tier: "Rocket", score: 92, market: "NSE" },
  { symbol: "INFY", price: 1520, tier: "Rocket", score: 88, market: "NSE" },
  { symbol: "RELIANCE", price: 3050, tier: "Launcher", score: 82, market: "NSE" },
  { symbol: "TCS", price: 3680, tier: "Launcher", score: 80, market: "NSE" },
  { symbol: "WIPRO", price: 390, tier: "Builder", score: 72, market: "NSE" },
  { symbol: "ADANIGREEN", price: 1280, tier: "Builder", score: 70, market: "NSE" },
  { symbol: "HDFCBANK", price: 1850, tier: "Rocket", score: 90, market: "NSE" },
  { symbol: "LT", price: 3200, tier: "Launcher", score: 81, market: "NSE" },
  { symbol: "ICICIBANK", price: 1200, tier: "Launcher", score: 79, market: "NSE" },
  { symbol: "SBIN", price: 680, tier: "Builder", score: 68, market: "NSE" },
  { symbol: "MARUTI", price: 8450, tier: "Builder", score: 71, market: "NSE" },
  { symbol: "BAJAJFINSV", price: 1680, tier: "Builder", score: 69, market: "NSE" },
  { symbol: "BHARTIARTL", price: 1140, tier: "Crawler", score: 55, market: "NSE" },
  { symbol: "SUNPHARMA", price: 1780, tier: "Launcher", score: 77, market: "NSE" },
  { symbol: "ASIAPAINT", price: 3580, tier: "Builder", score: 73, market: "NSE" },
];

// Sample US stocks
const usStocks = [
  { symbol: "AAPL", price: 230.5, tier: "Rocket", score: 91, market: "US" },
  { symbol: "MSFT", price: 445.2, tier: "Rocket", score: 89, market: "US" },
  { symbol: "NVDA", price: 875.3, tier: "Launcher", score: 85, market: "US" },
  { symbol: "TSLA", price: 285.4, tier: "Launcher", score: 83, market: "US" },
  { symbol: "META", price: 510.2, tier: "Launcher", score: 81, market: "US" },
  { symbol: "GOOGL", price: 195.8, tier: "Builder", score: 76, market: "US" },
  { symbol: "AMZN", price: 205.4, tier: "Builder", score: 74, market: "US" },
  { symbol: "JPM", price: 198.5, tier: "Builder", score: 71, market: "US" },
  { symbol: "V", price: 285.2, tier: "Launcher", score: 82, market: "US" },
  { symbol: "MA", price: 520.8, tier: "Launcher", score: 80, market: "US" },
  { symbol: "JNJ", price: 152.3, tier: "Builder", score: 72, market: "US" },
  { symbol: "PG", price: 165.4, tier: "Builder", score: 70, market: "US" },
  { symbol: "KO", price: 68.2, tier: "Crawler", score: 45, market: "US" },
  { symbol: "MCD", price: 305.1, tier: "Builder", score: 68, market: "US" },
  { symbol: "DIS", price: 102.5, tier: "Builder", score: 66, market: "US" },
];

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    if (secret !== SEED_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create NSE scan
    const nseScans = await db
      .insert(schema.scans)
      .values({
        market: "NSE",
        runAt: new Date(),
        status: "COMPLETED",
        totalScanned: nseStocks.length,
        goodResultsCount: nseStocks.length,
      })
      .returning();
    const nseScanId = nseScans[0].id;

    // Insert NSE results
    for (const stock of nseStocks) {
      await db.insert(schema.scanResults).values({
        scanId: nseScanId,
        symbol: stock.symbol,
        market: stock.market,
        priceAtScan: String(stock.price),
        mbScore: stock.score,
        mbTier: stock.tier,
        totalScore: stock.score,
        l1Pass: stock.score >= 70,
        l2Pass: stock.score >= 65,
        l3Pass: stock.score >= 60,
        l4Pass: stock.score >= 50,
        l5Pass: stock.score >= 40,
        l6Pass: stock.score >= 30,
        category: "Technical",
      });
    }

    // Create US scan
    const usScans = await db
      .insert(schema.scans)
      .values({
        market: "US",
        runAt: new Date(),
        status: "COMPLETED",
        totalScanned: usStocks.length,
        goodResultsCount: usStocks.length,
      })
      .returning();
    const usScanId = usScans[0].id;

    // Insert US results
    for (const stock of usStocks) {
      await db.insert(schema.scanResults).values({
        scanId: usScanId,
        symbol: stock.symbol,
        market: stock.market,
        priceAtScan: String(stock.price),
        mbScore: stock.score,
        mbTier: stock.tier,
        totalScore: stock.score,
        l1Pass: stock.score >= 70,
        l2Pass: stock.score >= 65,
        l3Pass: stock.score >= 60,
        l4Pass: stock.score >= 50,
        l5Pass: stock.score >= 40,
        l6Pass: stock.score >= 30,
        category: "Technical",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${nseStocks.length} NSE stocks and ${usStocks.length} US stocks`,
      nseScanId,
      usScanId,
    });
  } catch (error) {
    console.error("Seed failed:", error);
    return NextResponse.json(
      { error: "Seeding failed", details: String(error) },
      { status: 500 }
    );
  }
}
