
import { seedDatabase, seedV5Stocks } from "@/app/actions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get("target");

    try {
        if (target === "v5") {
            const result = await seedV5Stocks();
            return NextResponse.json({
                message: `v5 stocks seeded successfully`,
                inserted: result.inserted,
            });
        }

        await seedDatabase();
        return NextResponse.json({ message: "Database seeded successfully" });
    } catch (error) {
        console.error("❌ Seeding Error:", error);
        return NextResponse.json({
            error: "Failed to seed database",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
