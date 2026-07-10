import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { authUser } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import { sendVerificationEmail } from "@/lib/email/service";

const PASSWORD_MIN_LENGTH = 8;

export async function POST(req: NextRequest) {
  try {
    console.log("[REGISTER] Starting registration...");
    const { email, password, name, consents } = await req.json();
    console.log("[REGISTER] Parsed JSON:", { email, password: "***", name });

    // Validation
    if (!email || !password) {
      console.log("[REGISTER] Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      console.log("[REGISTER] Invalid email format");
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (!consents?.dataCollection || !consents?.feedbackUsage) {
      console.log("[REGISTER] Missing consents");
      return NextResponse.json(
        { error: "You must agree to data collection and feedback usage" },
        { status: 400 }
      );
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      console.log("[REGISTER] Password too short");
      return NextResponse.json(
        { error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("[REGISTER] Normalized email:", normalizedEmail);

    // Check if email already exists
    console.log("[REGISTER] Checking for existing user...");
    const existingUser = await db
      .select()
      .from(authUser)
      .where(eq(authUser.email, normalizedEmail))
      .limit(1);

    console.log("[REGISTER] Existing user check result:", existingUser.length);
    if (existingUser.length > 0) {
      console.log("[REGISTER] Email already registered");
      return NextResponse.json(
        { error: "Email already registered. Try logging in instead." },
        { status: 409 }
      );
    }

    // Hash password
    console.log("[REGISTER] Hashing password...");
    const hashedPassword = await hash(password, 10);
    console.log("[REGISTER] Password hashed successfully");

    // Create user in database
    console.log("[REGISTER] Inserting user into database...");
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

    console.log("[REGISTER] Insert result:", { returnedRows: newUser.length, data: newUser });
    if (!newUser[0]) {
      console.log("[REGISTER] ERROR: Insert returned empty array");
      return NextResponse.json(
        { error: "Failed to create account", debug: "Insert returned no rows" },
        { status: 500 }
      );
    }
    console.log("[REGISTER] User created successfully:", newUser[0].id);

    // TODO: Send verification email (non-blocking) - disabled for testing
    // try {
    //   await sendVerificationEmail(normalizedEmail, newUser[0].id);
    // } catch (emailError) {
    //   console.error("Email send failed (non-blocking):", emailError);
    // }

    return NextResponse.json(
      {
        success: true,
        user: newUser[0],
        message: "Account created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[REGISTER ERROR]", errorMsg, error);

    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // TEMPORARY: Return actual error for debugging
    return NextResponse.json(
      { error: "Failed to create account", debug: errorMsg.substring(0, 200) },
      { status: 500 }
    );
  }
}
