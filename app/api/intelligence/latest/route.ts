import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { intelligenceReports } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

// GET /api/intelligence/latest
// Returns the most recent intelligence report. Public — no auth required.

export async function GET(): Promise<NextResponse> {
  try {
    const rows = await db
      .select()
      .from(intelligenceReports)
      .orderBy(desc(intelligenceReports.generatedAt))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ report: null });
    }

    return NextResponse.json({ report: rows[0] });
  } catch (error: unknown) {
    console.error('Failed to fetch intelligence report:', error);
    return NextResponse.json({ 
      report: null, 
      warning: "Database unreachable. Intelligence report temporarily unavailable." 
    });
  }
}
