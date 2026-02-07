
import { getRandomWisdom } from "@/app/actions";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const wisdom = await getRandomWisdom();
        return NextResponse.json(wisdom);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch wisdom" }, { status: 500 });
    }
}
