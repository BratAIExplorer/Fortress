import { db } from "@/lib/db";
import { authUser, passwordResetRequests, emailTokens } from "@/lib/db/schema/auth";
import { eq, and, gt, isNull } from "drizzle-orm";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { validatePassword } from "@/lib/validation/password";
import { checkResetRateLimit, recordResetAttempt } from "@/lib/auth/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    // Validate input
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid reset token" },
        { status: 400 }
      );
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: passwordCheck.error }, { status: 400 });
    }

    // Validate token and find associated user
    const resetToken = await db
      .select()
      .from(emailTokens)
      .where(
        and(
          eq(emailTokens.token, token),
          eq(emailTokens.tokenType, "PASSWORD_RESET"),
          gt(emailTokens.expiresAt, new Date()),
          isNull(emailTokens.usedAt)
        )
      )
      .limit(1);

    if (!resetToken.length) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    const tokenRecord = resetToken[0];

    // Rate limiting: prevent brute-force on reset endpoint
    const rateCheck = checkResetRateLimit(tokenRecord.email);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many reset attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // Update user password and invalidate tokens in a transaction
    await db.transaction(async (tx) => {
      // Update password
      await tx
        .update(authUser)
        .set({
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(authUser.id, tokenRecord.userId));

      // Mark current token as used
      await tx
        .update(emailTokens)
        .set({ usedAt: new Date() })
        .where(eq(emailTokens.id, tokenRecord.id));

      // Invalidate all other pending reset tokens for this user for security
      await tx
        .update(emailTokens)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(emailTokens.userId, tokenRecord.userId),
            eq(emailTokens.tokenType, "PASSWORD_RESET"),
            isNull(emailTokens.usedAt)
          )
        );
    });

    recordResetAttempt(tokenRecord.email);

    return NextResponse.json({
      success: true,
      message: "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
