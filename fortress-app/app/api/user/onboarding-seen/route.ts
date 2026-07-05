import { db } from "@/lib/db";
import { authUser } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update user onboarding flag
    await db
      .update(authUser)
      .set({
        hasSeenOnboarding: true,
        onboardingViewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(authUser.id, session.user.id));

    return NextResponse.json({
      success: true,
      message: "Onboarding marked as seen",
    });
  } catch (error) {
    console.error("Onboarding API error:", error);
    return NextResponse.json(
      { error: "Failed to update onboarding status" },
      { status: 500 }
    );
  }
}
