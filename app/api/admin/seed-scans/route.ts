import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";

export async function POST(req: NextRequest) {
  try {
    // Insert NSE scan
    const nseScanId = `scan-nse-${Date.now()}`;
    await db.insert(schema.scans).values({
      id: nseScanId,
      market: "NSE",
      status: "COMPLETED",
      runAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      totalScanned: 2000,
      goodResultsCount: 8,
    });

    // Insert US scan
    const usScanId = `scan-us-${Date.now()}`;
    await db.insert(schema.scans).values({
      id: usScanId,
      market: "US",
      status: "COMPLETED",
      runAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      totalScanned: 5000,
      goodResultsCount: 8,
    });

    // NSE stocks
    const nseStocks = [
      { symbol: "HDFC", price: "2500", mbScore: 78, mbTier: "Rocket", totalScore: 82 },
      { symbol: "INFY", price: "1800", mbScore: 72, mbTier: "Launcher", totalScore: 75 },
      { symbol: "RELIANCE", price: "2800", mbScore: 65, mbTier: "Builder", totalScore: 70 },
      { symbol: "TCS", price: "3500", mbScore: 80, mbTier: "Rocket", totalScore: 85 },
      { symbol: "BAJAJFINSV", price: "1400", mbScore: 68, mbTier: "Launcher", totalScore: 72 },
      { symbol: "ITC", price: "450", mbScore: 70, mbTier: "Launcher", totalScore: 73 },
      { symbol: "ASIANPAINT", price: "3200", mbScore: 75, mbTier: "Rocket", totalScore: 78 },
      { symbol: "SBIN", price: "650", mbScore: 62, mbTier: "Builder", totalScore: 65 },
    ];

    for (const stock of nseStocks) {
      await db.insert(schema.scanResults).values({
        scanId: nseScanId,
        symbol: stock.symbol,
        market: "NSE",
        priceAtScan: stock.price,
        mbScore: stock.mbScore,
        mbTier: stock.mbTier,
        totalScore: stock.totalScore,
        category: "52W_LOW",
        l1Pass: true,
        l2Pass: true,
        l3Pass: true,
        l4Pass: true,
        l5Pass: true,
        l6Pass: true,
      });
    }

    // US stocks
    const usStocks = [
      { symbol: "AAPL", price: "180", mbScore: 75, mbTier: "Launcher", totalScore: 78 },
      { symbol: "MSFT", price: "380", mbScore: 82, mbTier: "Rocket", totalScore: 85 },
      { symbol: "GOOGL", price: "140", mbScore: 70, mbTier: "Builder", totalScore: 72 },
      { symbol: "NVDA", price: "850", mbScore: 85, mbTier: "Rocket", totalScore: 88 },
      { symbol: "META", price: "500", mbScore: 72, mbTier: "Launcher", totalScore: 74 },
      { symbol: "TSLA", price: "260", mbScore: 68, mbTier: "Builder", totalScore: 70 },
      { symbol: "AMZN", price: "180", mbScore: 76, mbTier: "Rocket", totalScore: 79 },
      { symbol: "NFLX", price: "425", mbScore: 65, mbTier: "Builder", totalScore: 68 },
    ];

    for (const stock of usStocks) {
      await db.insert(schema.scanResults).values({
        scanId: usScanId,
        symbol: stock.symbol,
        market: "US",
        priceAtScan: stock.price,
        mbScore: stock.mbScore,
        mbTier: stock.mbTier,
        totalScore: stock.totalScore,
        category: "52W_LOW",
        l1Pass: true,
        l2Pass: true,
        l3Pass: true,
        l4Pass: true,
        l5Pass: true,
        l6Pass: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${nseStocks.length} NSE + ${usStocks.length} US stocks`,
      nseScanId,
      usScanId,
    });
  } catch (error) {
    console.error("Seed failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
