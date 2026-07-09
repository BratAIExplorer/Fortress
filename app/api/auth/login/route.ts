import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Validate inputs
    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    if (!username.includes("@")) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (password.length < 1) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    // Demo mode: accept any valid email/password combo
    // In production: query database, verify password hash, implement real authentication
    const user = {
      id: username.split("@")[0],
      email: username,
      name: username.split("@")[0],
      isAdmin: username === "admin@fortress.local",
    };

    // Create session cookie
    const sessionData = Buffer.from(JSON.stringify(user)).toString("base64");

    const response = NextResponse.json(
      { success: true, user },
      { status: 200 }
    );

    response.cookies.set("fortress-session", sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
