import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { authUser } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query database for user
    const users = await db
      .select()
      .from(authUser)
      .where(eq(authUser.email, normalizedEmail))
      .limit(1);

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Email or password is incorrect" },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    const passwordValid = await compare(password, user.password || "");

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Email or password is incorrect" },
        { status: 401 }
      );
    }

    // Check email verification (TODO: enforce in Phase 1.1)
    // if (!user.emailVerified) {
    //   return NextResponse.json(
    //     { error: "Please verify your email first" },
    //     { status: 403 }
    //   );
    // }

    // Create JWT session (simplified — use NextAuth for production)
    const sessionData = JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        },
      },
      { status: 200 }
    );

    // Set HTTP-only session cookie
    response.cookies.set("fortress-session", Buffer.from(sessionData).toString("base64"), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
