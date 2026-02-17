
import { seedDatabase } from "@/app/actions";
import { NextResponse } from "next/server";

export async function GET() {
    try {
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
