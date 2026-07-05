import { db } from "@/lib/db";
import { authUser, passwordResetRequests } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate input
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await db
      .select()
      .from(authUser)
      .where(eq(authUser.email, normalizedEmail))
      .limit(1);

    // Security: Don't reveal if email exists
    if (!user.length) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a reset link will be sent shortly.",
      });
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minute expiry

    // Clean up old tokens for this user
    await db
      .delete(passwordResetRequests)
      .where(eq(passwordResetRequests.userId, user[0].id));

    // Store new reset request
    await db.insert(passwordResetRequests).values({
      userId: user[0].id,
      token,
      expiresAt,
    });

    // Send email
    // Use the base URL from env if available, else fallback to a default for dev
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password/${token}`;
    
    try {
      await sendPasswordResetEmail({
        email: user[0].email,
        resetLink,
        expiryMinutes: 15,
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      // Still return success to user (don't reveal email send failure)
    }

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
