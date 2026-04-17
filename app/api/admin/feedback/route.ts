import { db } from "@/lib/db";
import { feedback } from "@/lib/db/schema/feedback";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Verify admin access (requires isAdmin flag on user)
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const status = req.nextUrl.searchParams.get("status") || "new";
    const type = req.nextUrl.searchParams.get("type");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

    // Build query
    let query = db.select().from(feedback);

    // Apply filters
    const conditions = [eq(feedback.status, status)];
    if (type) {
      conditions.push(eq(feedback.type, type));
    }

    // Execute query
    const results = await db
      .select()
      .from(feedback)
      .where(eq(feedback.status, status))
      .orderBy(feedback.createdAt)
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select()
      .from(feedback)
      .where(eq(feedback.status, status));

    return NextResponse.json({
      data: results,
      total: countResult.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Feedback query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
