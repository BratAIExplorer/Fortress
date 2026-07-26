import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Unconditionally delete session cookies in the Next.js cookie store
    cookieStore.delete("fortress-session");
    cookieStore.delete("next-auth.session-token");
    cookieStore.delete("__Secure-next-auth.session-token");
    cookieStore.delete("next-auth.callback-url");
    cookieStore.delete("__Secure-next-auth.callback-url");
    cookieStore.delete("next-auth.csrf-token");
    cookieStore.delete("__Host-next-auth.csrf-token");

    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Also explicitly set expiration headers on NextResponse for compatibility
    const cookiesToClear = [
      "fortress-session",
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.callback-url",
      "__Secure-next-auth.callback-url",
      "next-auth.csrf-token",
      "__Host-next-auth.csrf-token",
    ];

    for (const cookieName of cookiesToClear) {
      response.cookies.set(cookieName, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        expires: new Date(0),
        path: "/",
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}

