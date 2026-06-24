import { db } from "@/lib/db";
import { feedback } from "@/lib/db/schema/feedback";
import { sendEmailAlert } from "@/lib/email";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

interface FeedbackRequest {
  type: "bug" | "suggestion" | "validation" | "question";
  message: string;
  pageUrl?: string;
  stockTicker?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Verify auth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: FeedbackRequest = await req.json();

    // Validate input
    if (!body.type || !body.message) {
      return NextResponse.json(
        { error: "type and message are required" },
        { status: 400 }
      );
    }

    if (!["bug", "suggestion", "validation", "question"].includes(body.type)) {
      return NextResponse.json(
        { error: "Invalid feedback type" },
        { status: 400 }
      );
    }

    if (body.message.length < 5 || body.message.length > 5000) {
      return NextResponse.json(
        { error: "Message must be between 5 and 5000 characters" },
        { status: 400 }
      );
    }

    // Insert into database
    const result = await db
      .insert(feedback)
      .values({
        userId: session.user.id as string,
        userEmail: session.user.email!,
        type: body.type,
        message: body.message,
        pageUrl: body.pageUrl,
        stockTicker: body.stockTicker,
        status: "new",
      })
      .returning();

    const newFeedback = result[0];

    // Send email alert (non-blocking)
    const alertEmail = process.env.ALERT_EMAIL;
    if (!alertEmail) {
      console.warn("ALERT_EMAIL not configured, skipping email notification");
    }

    try {
      if (alertEmail) {
        await sendEmailAlert({
          to: alertEmail,
          subject: `[Fortress Feedback] ${body.type.toUpperCase()} from ${session.user.name || session.user.email}`,
        body: `
          <h2>New Feedback Submission</h2>
          <p><strong>Type:</strong> ${body.type}</p>
          <p><strong>User:</strong> ${session.user.email}</p>
          <p><strong>Page:</strong> ${body.pageUrl || "N/A"}</p>
          <p><strong>Ticker:</strong> ${body.stockTicker || "N/A"}</p>
          
          <h3>Message:</h3>
          <p>${body.message.replace(/\n/g, "<br>")}</p>
          
          <hr>
          <p><a href="https://fortressintelligence.space/admin/feedback?id=${newFeedback.id}">
            Review in Admin Dashboard
          </a></p>
        `,
        });
      }
    } catch (emailError) {
      console.error("Email alert failed (non-blocking):", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        feedbackId: newFeedback.id,
        message: "Thank you for your feedback! We'll review it shortly.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
