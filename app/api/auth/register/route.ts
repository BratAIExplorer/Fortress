import { db } from "@/lib/db";
import { authUser } from "@/lib/db/schema/auth";
import { privacyConsent } from "@/lib/db/schema/consent";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

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

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(authUser)
      .where(eq(authUser.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user and consent records in transaction
    const userResult = await db
      .insert(authUser)
      .values({
        email: normalizedEmail,
        password: hashedPassword,
        name: name || null,
        isAdmin: false,
        hasSeenOnboarding: false,
      })
      .returning();

    const newUser = userResult[0];

    // Store consent preferences
    try {
      await db.insert(privacyConsent).values({
        userId: newUser.id,
        dataCollection: consents.dataCollection,
        feedbackUsage: consents.feedbackUsage,
        emailNotifications: consents.emailNotifications || false,
      });
    } catch (consentError) {
      console.error("Failed to store consent:", consentError);
      // Don't fail registration if consent storage fails
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
        message: "Account created successfully"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
