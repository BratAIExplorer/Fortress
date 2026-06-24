import { db } from "@/lib/db";
import { authUser, passwordResetRequests } from "@/lib/db/schema/auth";
import { eq, and, gt, isNull } from "drizzle-orm";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

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

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (newPassword.length < PASSWORD_MIN_LENGTH || newPassword.length > PASSWORD_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Validate token and find associated user
    const resetRequest = await db
      .select()
      .from(passwordResetRequests)
      .where(
        and(
          eq(passwordResetRequests.token, token),
          gt(passwordResetRequests.expiresAt, new Date()),
          isNull(passwordResetRequests.usedAt)
        )
      )
      .limit(1);

    if (!resetRequest.length) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
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
        .where(eq(authUser.id, resetRequest[0].userId));

      // Mark current token as used
      await tx
        .update(passwordResetRequests)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetRequests.id, resetRequest[0].id));

      // Invalidate all other pending reset tokens for this user for security
      await tx
        .update(passwordResetRequests)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(passwordResetRequests.userId, resetRequest[0].userId),
            isNull(passwordResetRequests.usedAt)
          )
        );
    });

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
