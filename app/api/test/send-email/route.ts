import { sendEmailAlert } from "@/lib/email";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await sendEmailAlert({
      to: "bharatsamant@gmail.com",
      subject: "Test Email from Fortress",
      body: "<p>This is a test email. If you see this, email is working!</p>",
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
