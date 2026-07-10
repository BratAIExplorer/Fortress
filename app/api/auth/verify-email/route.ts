import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/email/service";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Verification token is required" },
      { status: 400 }
    );
  }

  try {
    await verifyEmailToken(token);

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL(
        "/login?verified=true&message=Email%20verified%20successfully.%20You%20can%20now%20log%20in.",
        req.url
      )
    );
  } catch (error) {
    // Redirect to login with error message
    return NextResponse.redirect(
      new URL(
        "/login?error=true&message=Verification%20link%20expired%20or%20invalid.%20Please%20sign%20up%20again.",
        req.url
      )
    );
  }
}
