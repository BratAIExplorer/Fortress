import nodemailer from "nodemailer";
import crypto from "crypto";
import { db } from "@/lib/db";
import { emailTokens, authUser } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const VERIFICATION_TOKEN_EXPIRES_MS = 24 * 60 * 60 * 1000; // 24 hours
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRES_MS);

  // Store token in database
  await db.insert(emailTokens).values({
    userId,
    email,
    token,
    tokenType: "VERIFY_EMAIL",
    expiresAt,
  });

  const verificationUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@fortressintelligence.space",
      to: email,
      subject: "Verify your Fortress Intelligence account",
      html: `
        <h1>Verify Your Email</h1>
        <p>Click the link below to verify your email and activate your account:</p>
        <a href="${verificationUrl}" style="background-color: #8B5CF6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block;">
          Verify Email
        </a>
        <p>Or copy this link: ${verificationUrl}</p>
        <p>This link expires in 24 hours.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Don't throw — user is created, email is just a notification
  }
}

export async function verifyEmailToken(token: string) {
  const result = await db
    .select()
    .from(emailTokens)
    .where(
      and(
        eq(emailTokens.token, token),
        eq(emailTokens.tokenType, "VERIFY_EMAIL"),
        gt(emailTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (result.length === 0) {
    throw new Error("Invalid or expired verification token");
  }

  const emailToken = result[0];

  // Mark token as used
  await db
    .update(emailTokens)
    .set({ usedAt: new Date() })
    .where(eq(emailTokens.id, emailToken.id));

  // Mark user email as verified
  await db
    .update(authUser)
    .set({ emailVerified: new Date() })
    .where(eq(authUser.id, emailToken.userId));

  return emailToken;
}
