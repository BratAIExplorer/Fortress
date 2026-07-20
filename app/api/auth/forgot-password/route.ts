import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authUser, passwordResetRequests } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "@/lib/email/service";
import { validateEmail, normalizeEmail } from "@/lib/validation/email";
import { checkResetRateLimit, recordResetAttempt } from "@/lib/auth/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate input
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json({ error: emailCheck.error }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);

    // Rate limiting: prevent brute-force
    const rateCheck = checkResetRateLimit(normalizedEmail);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Look up user
    const users = await db
      .select()
      .from(authUser)
      .where(eq(authUser.email, normalizedEmail))
      .limit(1);

    // Always return success to not reveal if email exists
    if (users.length === 0) {
      recordResetAttempt(normalizedEmail);
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a reset link will be sent shortly.",
      });
    }

    const user = users[0];

    // Send password reset email
    try {
      await sendPasswordResetEmail(normalizedEmail, user.id);
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
      // Don't fail the request, but log it
    }

    recordResetAttempt(normalizedEmail);

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a reset link will be sent shortly.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
