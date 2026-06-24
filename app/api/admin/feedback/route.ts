import { db } from "@/lib/db";
import { feedback } from "@/lib/db/schema/feedback";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Verify admin access
    if (!(session?.user as any)?.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const status = req.nextUrl.searchParams.get("status");
    const type = req.nextUrl.searchParams.get("type");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

    // Build query builder
    let qb = db.select().from(feedback);
    
    // Total count query builder
    let countQb = db.select().from(feedback);

    // Apply filters (simple for now, can be improved with complex conditions)
    const results = await db
      .select()
      .from(feedback)
      // If status provided, filter by it, else show all
      .where(status ? eq(feedback.status, status) : undefined)
      .orderBy(feedback.createdAt)
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select()
      .from(feedback)
      .where(status ? eq(feedback.status, status) : undefined);

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

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    // Verify admin access
    if (!(session?.user as any)?.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id, status, internalNotes } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Feedback ID is required" },
        { status: 400 }
      );
    }

    // Update record
    const result = await db
      .update(feedback)
      .set({
        status: status || undefined,
        internalNotes: internalNotes || undefined,
        reviewedAt: status ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(feedback.id, id))
      .returning();

    if (!result.length) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Feedback update error:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }
}
