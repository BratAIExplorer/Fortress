import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllocationsByUserIdWithFilters } from "@/lib/my-allocations/queries";
import { z } from "zod";

const AllocationFilterSchema = z.object({
  sort: z.enum(["date", "amount", "horizon"] as const).optional().default("date"),
  horizon: z.string().optional(),
  experience: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      sort: (searchParams.get("sort") as any) || "date",
      horizon: searchParams.get("horizon") || undefined,
      experience: searchParams.get("experience") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
    };

    const parsedFilters = AllocationFilterSchema.parse(filters);

    const allocations = await getAllocationsByUserIdWithFilters(
      session.user.id,
      parsedFilters
    );

    return NextResponse.json(
      {
        success: true,
        data: allocations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching allocations:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid filters",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch allocations" },
      { status: 500 }
    );
  }
}
