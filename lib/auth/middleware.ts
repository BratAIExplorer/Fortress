import { NextRequest } from "next/server";
import { validateCSRFToken } from "./csrf";

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export function getSessionFromRequest(req: NextRequest): SessionData | null {
  try {
    const sessionCookie = req.cookies.get("fortress-session")?.value;
    if (!sessionCookie) return null;

    const sessionData = JSON.parse(
      Buffer.from(sessionCookie, "base64").toString("utf-8")
    );

    if (!sessionData.userId || !sessionData.email) return null;

    return sessionData;
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest): SessionData {
  const session = getSessionFromRequest(req);
  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}

export function requireAuthorizationForResource(
  session: SessionData,
  resourceUserId: string
): void {
  if (session.userId !== resourceUserId && !session.isAdmin) {
    throw new Error("FORBIDDEN");
  }
}

export async function requireCSRFToken(
  req: NextRequest,
  session: SessionData
): Promise<void> {
  const csrfToken = req.headers.get("x-csrf-token");

  if (!csrfToken) {
    throw new Error("CSRF_TOKEN_REQUIRED");
  }

  const isValid = await validateCSRFToken(session.userId, csrfToken);

  if (!isValid) {
    throw new Error("INVALID_CSRF_TOKEN");
  }
}
