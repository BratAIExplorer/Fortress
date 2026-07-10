import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { authUser } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import { sendVerificationEmail } from "@/lib/email/service";

const PASSWORD_MIN_LENGTH = 8;

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, consents } = await req.json();

    // Validation
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

    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(authUser)
      .where(eq(authUser.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email already registered. Try logging in instead." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user in database
    const newUser = await db
      .insert(authUser)
      .values({
        email: normalizedEmail,
        name: name || normalizedEmail.split("@")[0],
        password: hashedPassword,
        isAdmin: false,
        emailVerified: null,
      })
      .returning({
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
      });

    if (!newUser[0]) {
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    // Send verification email (non-blocking)
    try {
      await sendVerificationEmail(normalizedEmail, newUser[0].id);
    } catch (emailError) {
      console.error("Email send failed (non-blocking):", emailError);
      // Don't fail signup if email fails
    }

    return NextResponse.json(
      {
        success: true,
        user: newUser[0],
        message: "Account created successfully. Check your email to verify.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER ERROR]", error instanceof Error ? error.message : error);

    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
