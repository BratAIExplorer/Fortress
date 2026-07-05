import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { macroSnapshots, intelligenceReports } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { buildIntelligenceReport } from '@/lib/intelligence/engine';

// POST /api/intelligence/generate
// Reads the two most recent macro snapshots, generates a clarity report,
// stores it, and returns it. Requires x-cron-secret header.

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await db
      .select()
      .from(macroSnapshots)
      .orderBy(desc(macroSnapshots.snapshotDate))
      .limit(2);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No macro snapshots found. Run a macro fetch first.' },
        { status: 404 }
      );
    }

    const current = rows[0];
    const previous = rows[1] ?? null;

    const report = buildIntelligenceReport(current, previous);

    await db.insert(intelligenceReports).values({
      snapshotId: current.id,
      snapshotDate: current.snapshotDate,
      signals: report.signals,
      sectorImpacts: report.sectorImpacts,
      environment: report.environment,
      summary: report.summary,
    });

    return NextResponse.json({ success: true, report });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
