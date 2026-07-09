import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, consents } = await req.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (!consents?.dataCollection || !consents?.feedbackUsage) {
      return NextResponse.json(
        { error: "You must agree to data collection and feedback usage" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Demo mode: Accept any valid input and create session
    // In production: hash password, store in database, send confirmation email
    const user = {
      id: email.split("@")[0],
      email: email.toLowerCase().trim(),
      name: name || email.split("@")[0],
      isAdmin: false,
    };

    // Create session cookie (auto-login after registration)
    const sessionData = Buffer.from(JSON.stringify(user)).toString("base64");

    const response = NextResponse.json(
      {
        success: true,
        user,
        message: "Account created successfully. Redirecting to portfolio...",
      },
      { status: 201 }
    );

    response.cookies.set("fortress-session", sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
