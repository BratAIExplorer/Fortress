import crypto from "crypto";
import { db } from "@/lib/db";
import { csrfTokens } from "@/lib/db/schema";
import { eq, gt, lt, and } from "drizzle-orm";

const TOKEN_LENGTH = 32;
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function generateCSRFToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(TOKEN_LENGTH).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await db.insert(csrfTokens).values({
    userId,
    token,
    expiresAt,
  });

  return token;
}

export async function validateCSRFToken(userId: string, token: string): Promise<boolean> {
  const result = await db
    .select()
    .from(csrfTokens)
    .where(
      and(
        eq(csrfTokens.userId, userId),
        eq(csrfTokens.token, token),
        gt(csrfTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (result.length === 0) {
    return false;
  }

  // Consume token (one-time use)
  await db.delete(csrfTokens).where(eq(csrfTokens.token, token));

  return true;
}

export async function cleanupExpiredTokens() {
  await db.delete(csrfTokens).where(lt(csrfTokens.expiresAt, new Date()));
}
