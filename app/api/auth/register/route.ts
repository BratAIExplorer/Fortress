import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { authUser } from "@/lib/db/schema/auth";
import { privacyConsent } from "@/lib/db/schema/consent";
import { eq } from "drizzle-orm";
import { sendVerificationEmail } from "@/lib/email/service";
import { validateEmail, normalizeEmail } from "@/lib/validation/email";
import { validatePassword } from "@/lib/validation/password";

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      password,
      name,
      agreedToTerms,
      countryOfResidence,
      countryOfOrigin,
      signupPurpose,
      referralSource,
    } = await req.json();

    // Validation
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json({ error: emailCheck.error }, { status: 400 });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: passwordCheck.error }, { status: 400 });
    }

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!countryOfResidence) {
      return NextResponse.json({ error: "Country of residence is required" }, { status: 400 });
    }

    if (!signupPurpose) {
      return NextResponse.json({ error: "Please tell us why you're signing up" }, { status: 400 });
    }

    if (!agreedToTerms) {
      return NextResponse.json(
        { error: "You must agree to the Terms & Privacy Policy" },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);

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
        name: String(name).trim(),
        password: hashedPassword,
        isAdmin: false,
        emailVerified: null,
        countryOfResidence,
        countryOfOrigin: countryOfOrigin || null,
        signupPurpose,
        referralSource: referralSource || null,
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

    // Persist consent (a single "agree to terms" checkbox at signup implies
    // both flags below — kept split to match the table's existing shape).
    try {
      await db.insert(privacyConsent).values({
        userId: newUser[0].id,
        dataCollection: true,
        feedbackUsage: true,
      });
    } catch (consentError) {
      console.error("Failed to record consent (non-blocking):", consentError);
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
