import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { authUser, emailTokens } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import { normalizeEmail } from "@/lib/validation/email";

// Admin-only manual reset link generator — bypasses SMTP entirely.
// ponytail: workaround for SMTP not yet configured on the VPS (see CLAUDE.md
// Phase 3 backlog); remove once sendPasswordResetEmail is reliably delivering.
export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const normalizedEmail = normalizeEmail(email);
  const users = await db
    .select()
    .from(authUser)
    .where(eq(authUser.email, normalizedEmail))
    .limit(1);

  if (users.length === 0) {
    return NextResponse.json({ error: "No account with that email" }, { status: 404 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.insert(emailTokens).values({
    userId: users[0].id,
    email: normalizedEmail,
    token,
    tokenType: "PASSWORD_RESET",
    expiresAt,
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return NextResponse.json({
    success: true,
    resetUrl: `${baseUrl}/reset-password/${token}`,
    expiresAt,
  });
}
