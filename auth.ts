import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    };
  }
}

// Get current session from cookies
async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("fortress-session")?.value;

  if (sessionCookie) {
    try {
      const user = JSON.parse(Buffer.from(sessionCookie, "base64").toString());
      return { user };
    } catch {}
  }

  return { user: null };
}

// Minimal auth stub for demo mode - HTTP handler
async function handleAuth(req?: NextRequest | any) {
  const path = req?.nextUrl?.pathname || "";

  // Routes that don't require authentication
  if (path.includes("signin") || path.includes("callback")) {
    return NextResponse.json({
      ok: true,
      providers: {
        credentials: {
          id: "credentials",
          name: "Credentials",
          type: "credentials",
          signinUrl: "http://localhost:3000/login",
          callbackUrl: "http://localhost:3000/portfolio",
        },
      },
    });
  }

  // Session endpoint - return current session
  if (path.includes("session")) {
    const session = await getSession();
    return NextResponse.json({ ...session, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() });
  }

  // Default response
  return NextResponse.json({ ok: true });
}

export const handlers = {
  GET: handleAuth,
  POST: handleAuth,
};

// Alias for backward compatibility with code calling auth()
export const auth = getSession;
