import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { telegramSubscribers } from "@/lib/db/schema/telegram-subscribers";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env";

// GET — bot-facing, same shared-secret pattern as /api/analysis/momentum-signals.
// Returns only active subscriber chat IDs; the bot always sends to
// TELEGRAM_ADMIN_ID in addition to whatever this returns.
export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get("x-cron-secret");
  if (!env.CRON_SECRET || cronSecret !== env.CRON_SECRET) {
    return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const rows = await db
    .select({ chatId: telegramSubscribers.chatId })
    .from(telegramSubscribers)
    .where(eq(telegramSubscribers.active, true));

  return NextResponse.json({ success: true, chatIds: rows.map((r) => r.chatId) });
}

// POST — admin-page-facing, same password pattern as /api/admin/bot-config.
// Actions: "list" | "add" | "remove".
export async function POST(request: NextRequest) {
  if (!env.ADMIN_PANEL_PASSWORD) {
    return NextResponse.json({ success: false, error: "ADMIN_PANEL_NOT_CONFIGURED" }, { status: 503 });
  }

  const body = await request.json();
  if (body.password !== env.ADMIN_PANEL_PASSWORD) {
    return NextResponse.json({ success: false, error: "INVALID_PASSWORD" }, { status: 401 });
  }

  if (body.action === "add") {
    const chatId = String(body.chatId ?? "").trim();
    if (!chatId) {
      return NextResponse.json({ success: false, error: "CHAT_ID_REQUIRED" }, { status: 400 });
    }
    await db
      .insert(telegramSubscribers)
      .values({ chatId, label: body.label ? String(body.label).trim() : null })
      .onConflictDoUpdate({
        target: telegramSubscribers.chatId,
        set: { active: true, label: body.label ? String(body.label).trim() : null },
      });
  } else if (body.action === "remove") {
    const id = String(body.id ?? "");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID_REQUIRED" }, { status: 400 });
    }
    await db.delete(telegramSubscribers).where(eq(telegramSubscribers.id, id));
  }
  // "list" (or any other action) falls through to just returning current state.

  const subscribers = await db.select().from(telegramSubscribers);
  return NextResponse.json({ success: true, subscribers });
}
