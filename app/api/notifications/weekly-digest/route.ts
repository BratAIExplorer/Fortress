import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db/client";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { transporter } from "@/lib/email/service";

export const dynamic = "force-dynamic";

const TOP_MOVERS_COUNT = 5;
const HIDDEN_GEMS_COUNT = 3;

interface DigestRow {
  symbol: string;
  mbScore: number | null;
  mbTier: string | null;
  megatrendTag: string | null;
}

async function getLatestScanRows(market: string): Promise<DigestRow[]> {
  const lastScan = await db.query.scans.findFirst({
    where: and(eq(schema.scans.status, "COMPLETED"), eq(schema.scans.market, market)),
    orderBy: [desc(schema.scans.runAt)],
  });
  if (!lastScan) return [];

  return db
    .select({
      symbol: schema.scanResults.symbol,
      mbScore: schema.scanResults.mbScore,
      mbTier: schema.scanResults.mbTier,
      megatrendTag: schema.scanResults.megatrendTag,
    })
    .from(schema.scanResults)
    .where(eq(schema.scanResults.scanId, lastScan.id))
    .orderBy(desc(schema.scanResults.mbScore))
    .limit(TOP_MOVERS_COUNT + HIDDEN_GEMS_COUNT);
}

function buildDigestHtml(usRows: DigestRow[], nseRows: DigestRow[]): string {
  const rowsHtml = (rows: DigestRow[], label: string) => {
    const movers = rows.slice(0, TOP_MOVERS_COUNT);
    // ponytail: naive split — next N by score stand in for "hidden gems" until a dedicated screen exists
    const gems = rows.slice(TOP_MOVERS_COUNT, TOP_MOVERS_COUNT + HIDDEN_GEMS_COUNT);
    if (movers.length === 0) return "";
    const li = (r: DigestRow) => `<li>${r.symbol} — MB Score ${r.mbScore ?? "—"} (${r.mbTier ?? "—"}${r.megatrendTag ? `, ${r.megatrendTag}` : ""})</li>`;
    return `
      <h2>${label}</h2>
      <h3>Top movers</h3>
      <ul>${movers.map(li).join("")}</ul>
      ${gems.length > 0 ? `<h3>Hidden gems to watch</h3><ul>${gems.map(li).join("")}</ul>` : ""}
    `;
  };

  return `
    <h1>Fortress Intelligence — Weekly Digest</h1>
    ${rowsHtml(usRows, "🇺🇸 US Market")}
    ${rowsHtml(nseRows, "🇮🇳 NSE (India)")}
    <p style="color:#888;font-size:12px;">Technical screen only, not financial advice.</p>
  `;
}

export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const [usRows, nseRows] = await Promise.all([
    getLatestScanRows("US"),
    getLatestScanRows("NSE"),
  ]);

  if (usRows.length === 0 && nseRows.length === 0) {
    return NextResponse.json({ success: false, error: "No completed scans available" }, { status: 404 });
  }

  const html = buildDigestHtml(usRows, nseRows);

  const recipients = await db
    .select({ email: schema.authUser.email })
    .from(schema.authUser)
    .where(isNotNull(schema.authUser.emailVerified));

  let sent = 0;
  for (const { email } of recipients) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@fortressintelligence.space",
        to: email,
        subject: "Fortress Intelligence — This Week's Top Movers & Hidden Gems",
        html,
      });
      sent++;
    } catch (error) {
      console.error(`Weekly digest failed for ${email}:`, error);
    }
  }

  return NextResponse.json({ success: true, recipientCount: recipients.length, sent }, { status: 200 });
}
