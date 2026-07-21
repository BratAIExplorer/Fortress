import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface SessionData {
  userId: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("fortress-session");

  if (!sessionCookie?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const sessionData: SessionData = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf-8")
    );

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: sessionData.userId,
          email: sessionData.email,
          name: sessionData.name,
          isAdmin: sessionData.isAdmin,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
