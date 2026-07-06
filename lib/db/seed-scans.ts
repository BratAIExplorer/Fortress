/**
 * Seed sample scan data for development/testing.
 * Run: npx ts-node lib/db/seed-scans.ts
 */

import { db, schema } from "./client";

const SAMPLE_NSE_STOCKS = [
  { symbol: "HDFC", price: "2500", mbScore: 78, mbTier: "Rocket", totalScore: 82, category: "52W_LOW" },
  { symbol: "INFY", price: "1800", mbScore: 72, mbTier: "Launcher", totalScore: 75, category: "52W_LOW" },
  { symbol: "RELIANCE", price: "2800", mbScore: 65, mbTier: "Builder", totalScore: 70, category: "PENNY" },
  { symbol: "TCS", price: "3500", mbScore: 80, mbTier: "Rocket", totalScore: 85, category: "52W_LOW" },
  { symbol: "BAJAJFINSV", price: "1400", mbScore: 68, mbTier: "Launcher", totalScore: 72, category: "PENNY" },
  { symbol: "ITC", price: "450", mbScore: 70, mbTier: "Launcher", totalScore: 73, category: "52W_LOW" },
  { symbol: "ASIANPAINT", price: "3200", mbScore: 75, mbTier: "Rocket", totalScore: 78, category: "PENNY" },
  { symbol: "SBIN", price: "650", mbScore: 62, mbTier: "Builder", totalScore: 65, category: "52W_LOW" },
];

const SAMPLE_US_STOCKS = [
  { symbol: "AAPL", price: "180", mbScore: 75, mbTier: "Launcher", totalScore: 78, category: "52W_LOW" },
  { symbol: "MSFT", price: "380", mbScore: 82, mbTier: "Rocket", totalScore: 85, category: "52W_LOW" },
  { symbol: "GOOGL", price: "140", mbScore: 70, mbTier: "Builder", totalScore: 72, category: "PENNY" },
  { symbol: "NVDA", price: "850", mbScore: 85, mbTier: "Rocket", totalScore: 88, category: "52W_LOW" },
  { symbol: "META", price: "500", mbScore: 72, mbTier: "Launcher", totalScore: 74, category: "PENNY" },
  { symbol: "TSLA", price: "260", mbScore: 68, mbTier: "Builder", totalScore: 70, category: "52W_LOW" },
  { symbol: "AMZN", price: "180", mbScore: 76, mbTier: "Rocket", totalScore: 79, category: "PENNY" },
  { symbol: "NFLX", price: "425", mbScore: 65, mbTier: "Builder", totalScore: 68, category: "52W_LOW" },
];

async function seedScans() {
  try {
    console.log("🌱 Seeding sample scan data...");

    // Insert NSE scan
    const nseScanId = "scan-nse-" + Date.now();
    await db.insert(schema.scans).values({
      id: nseScanId,
      market: "NSE",
      status: "COMPLETED",
      runAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      totalScanned: 2000,
      goodResultsCount: SAMPLE_NSE_STOCKS.length,
    });
    console.log("✅ NSE scan created:", nseScanId);

    // Insert US scan
    const usScanId = "scan-us-" + Date.now();
    await db.insert(schema.scans).values({
      id: usScanId,
      market: "US",
      status: "COMPLETED",
      runAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      totalScanned: 5000,
      goodResultsCount: SAMPLE_US_STOCKS.length,
    });
    console.log("✅ US scan created:", usScanId);

    // Insert NSE results
    for (const stock of SAMPLE_NSE_STOCKS) {
      await db.insert(schema.scanResults).values({
        scanId: nseScanId,
        symbol: stock.symbol,
        market: "NSE",
        priceAtScan: stock.price,
        mbScore: stock.mbScore,
        mbTier: stock.mbTier,
        totalScore: stock.totalScore,
        category: stock.category,
        l1Pass: true,
        l2Pass: true,
        l3Pass: true,
        l4Pass: true,
        l5Pass: true,
        l6Pass: true,
      });
    }
    console.log(`✅ ${SAMPLE_NSE_STOCKS.length} NSE stocks seeded`);

    // Insert US results
    for (const stock of SAMPLE_US_STOCKS) {
      await db.insert(schema.scanResults).values({
        scanId: usScanId,
        symbol: stock.symbol,
        market: "US",
        priceAtScan: stock.price,
        mbScore: stock.mbScore,
        mbTier: stock.mbTier,
        totalScore: stock.totalScore,
        category: stock.category,
        l1Pass: true,
        l2Pass: true,
        l3Pass: true,
        l4Pass: true,
        l5Pass: true,
        l6Pass: true,
      });
    }
    console.log(`✅ ${SAMPLE_US_STOCKS.length} US stocks seeded`);

    console.log("\n✨ Seeding complete! Fortress 30 should now display data.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedScans();
