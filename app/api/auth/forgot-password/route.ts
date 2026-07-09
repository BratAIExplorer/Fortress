import { NextRequest, NextResponse } from "next/server";

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

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Demo mode: Don't reveal if email exists (security best practice)
    // In production: lookup in database, generate token, send email
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
