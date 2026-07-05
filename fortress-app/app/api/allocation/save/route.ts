import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { allocations } from "@/lib/db/schema";
import { z } from "zod";

const AllocationSaveSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  riskAppetite: z.number().min(0).max(100),
  horizon: z.enum(["short", "medium", "long", "retirement"] as const),
  experience: z.enum(["beginner", "intermediate", "experienced"] as const),
  countries: z.array(z.enum(["United States", "India"] as const)).min(1),
  allocation: z.any(), // Full allocation object
});

type AllocationSaveInput = z.infer<typeof AllocationSaveSchema>;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsedData = AllocationSaveSchema.parse(body);

    // Save allocation to database
    const saved = await db
      .insert(allocations)
      .values({
        userId: session.user.id as any,
        amount: parsedData.amount.toString(),
        riskAppetite: parsedData.riskAppetite.toString(),
        horizon: parsedData.horizon,
        experience: parsedData.experience,
        countries: parsedData.countries as any,
        allocation: parsedData.allocation as any,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: saved[0],
        message: "Allocation saved successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving allocation:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save allocation" },
      { status: 500 }
    );
  }
}
