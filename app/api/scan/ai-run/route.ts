import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { eq, and, desc, ne, count } from "drizzle-orm";
import { auth } from "@/auth";
import { scoreTicker } from "@/lib/scanners/us-technical-scorer";

export const dynamic = "force-dynamic";

// Tickers to scan if no prior US scan exists in DB
const FALLBACK_US_TICKERS = [
  "AAPL","MSFT","NVDA","GOOGL","AMZN","META","TSLA","AMD","INTC","QCOM",
  "SMH","QQQ","TQQQ","SOXL","INDA","GLD","SPY","XLK","XLF","XLE",
];

const RATE_LIMIT_MS = 200; // pause between Massive API calls

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getUSTickersFromDB(): Promise<string[]> {
  const lastScan = await db.query.scans.findFirst({
    where: and(
      eq(schema.scans.status, "COMPLETED"),
      eq(schema.scans.market, "US")
    ),
    orderBy: [desc(schema.scans.runAt)],
  });

  if (!lastScan) return FALLBACK_US_TICKERS;

  const rows = await db
    .select({ symbol: schema.scanResults.symbol })
    .from(schema.scanResults)
    .where(and(
      eq(schema.scanResults.scanId, lastScan.id),
      ne(schema.scanResults.category, "OFFLINE")
    ))
    .limit(100);

  const tickers = rows.map(r => r.symbol).filter(Boolean);
  return tickers.length > 0 ? tickers : FALLBACK_US_TICKERS;
}

export async function POST(req: NextRequest) {
  // Auth: cron secret OR admin session
  const cronSecret = req.headers.get("x-cron-secret");
  const isCron = cronSecret === process.env.CRON_SECRET;

  if (!isCron) {
    const session = await auth();
    const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin;
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  const apiKey = process.env.MASSIVE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "MASSIVE_API_KEY not configured" }, { status: 500 });
  }

  // Prevent concurrent AI scans
  const running = await db.query.scans.findFirst({
    where: and(eq(schema.scans.status, "RUNNING"), eq(schema.scans.market, "US")),
  });
  if (running) {
    return NextResponse.json({ error: "US scan already running" }, { status: 409 });
  }

  const tickers = await getUSTickersFromDB();

  // Create scan record
  const [scan] = await db.insert(schema.scans).values({
    status: "RUNNING",
    triggeredBy: isCron ? "CRON" : "MANUAL",
    market: "US",
  }).returning();

  const scanRunAt = Date.now();
  let scored = 0;
  let failed = 0;

  // Score each ticker sequentially with a small pause to respect rate limits
  for (const ticker of tickers) {
    const result = await scoreTicker(ticker, apiKey);
    await sleep(RATE_LIMIT_MS);

    if (result.error) {
      failed++;
      continue;
    }

    await db.insert(schema.scanResults).values({
      scanId:   scan.id,
      symbol:   result.symbol,
      market:   "US",
      priceAtScan: result.price.toString(),
      l1Pass:   result.l1Pass,
      l2Pass:   result.l2Pass,
      l3Pass:   result.l3Pass,
      l4Pass:   result.l4Pass,
      l5Pass:   result.l5Pass,
      l6Pass:   null,
      mbScore:  result.mbScore,
      mbTier:   result.mbTier,
      totalScore: result.mbScore,
      category: "TECHNICAL",
    });

    scored++;
  }

  // Finalise scan record
  const [goodRow] = await db
    .select({ n: count() })
    .from(schema.scanResults)
    .where(eq(schema.scanResults.scanId, scan.id));

  await db.update(schema.scans)
    .set({
      status: "COMPLETED",
      totalScanned: tickers.length,
      durationMs: Date.now() - scanRunAt,
      goodResultsCount: goodRow?.n ?? 0,
    })
    .where(eq(schema.scans.id, scan.id));

  return NextResponse.json({
    scanId: scan.id,
    market: "US",
    scored,
    failed,
    total: tickers.length,
    durationMs: Date.now() - scanRunAt,
  });
}
