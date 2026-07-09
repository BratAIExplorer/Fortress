import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    let email: string | null = null;

    // Safely parse JSON body
    try {
      const body = await req.json();
      email = body?.email;
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Validate input
    if (!email || typeof email !== "string" || email.trim() === "") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Demo mode: Always return success (don't reveal if email exists)
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
