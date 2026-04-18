import { sendEmailAlert } from "@/lib/email";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Require admin authentication
    const session = await auth();
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alertEmail = process.env.ALERT_EMAIL;
    if (!alertEmail) {
      return NextResponse.json({ error: "ALERT_EMAIL not configured" }, { status: 500 });
    }

    await sendEmailAlert({
      to: alertEmail,
      subject: "Test Email from Fortress",
      body: "<p>This is a test email. If you see this, email is working!</p>",
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
