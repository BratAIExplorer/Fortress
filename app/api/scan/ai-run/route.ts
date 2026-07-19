import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { eq, and, count } from "drizzle-orm";
import { auth } from "@/auth";
import { scoreTicker } from "@/lib/scanners/us-technical-scorer";

export const dynamic = "force-dynamic";

// Last-resort static list if the live constituents fetch fails (network down, source moved)
// Include both mega-caps (SP500 core) + growth momentum names
const FALLBACK_US_TICKERS = [
  // Mega-cap core
  "AAPL","MSFT","NVDA","GOOGL","AMZN","META","TSLA","AMD","INTC","QCOM",
  // Growth/momentum names (avoid self-perpetuating narrow universe)
  "DASH","PLTR","DDOG","SPOT","NU","APP","SQ","SE","MELI","SHOP","SOFI","NOW","RDDT","TOST","PANW",
];

const RATE_LIMIT_MS = 200; // pause between Massive API calls

// Free, unauthenticated, community-maintained S&P 500 constituents list — no paid data plan needed.
const SP500_CSV_URL = "https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.csv";
const UNIVERSE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24h — index membership barely changes day to day

let cachedUniverse: { tickers: string[]; fetchedAt: number } | null = null;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ponytail: whole-index scan via a free public CSV instead of a hand-maintained ticker array.
// Upgrade path if this source goes stale/unmaintained: swap SP500_CSV_URL for a paid index-membership API.
async function getUSUniverse(): Promise<string[]> {
  if (cachedUniverse && Date.now() - cachedUniverse.fetchedAt < UNIVERSE_CACHE_TTL) {
    return cachedUniverse.tickers;
  }

  try {
    const res = await fetch(SP500_CSV_URL);
    if (!res.ok) throw new Error(`constituents fetch failed: ${res.status}`);
    const csv = await res.text();
    const tickers = csv
      .split("\n")
      .slice(1) // header row: Symbol,Security,GICS Sector,...
      .map(line => line.split(",")[0].trim())
      .filter(Boolean);

    if (tickers.length < 100) throw new Error("constituents list looked truncated");

    cachedUniverse = { tickers, fetchedAt: Date.now() };
    return tickers;
  } catch {
    return FALLBACK_US_TICKERS;
  }
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

  const tickers = await getUSUniverse();

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
