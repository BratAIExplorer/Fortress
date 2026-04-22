import { db, schema } from "../lib/db/client";
import { desc } from "drizzle-orm";

async function checkScans() {
    try {
        const latestScans = await db.select()
            .from(schema.scans)
            .orderBy(desc(schema.scans.runAt))
            .limit(5);
        
        console.log("Latest Scans:", JSON.stringify(latestScans, null, 2));

        const resultCount = await db.select({ count: schema.scanResults.id })
            .from(schema.scanResults)
            .limit(1);
        
        console.log("Database status: Connected to " + process.env.DATABASE_URL?.split('@')[1]);
    } catch (error) {
        console.error("Database check failed:", error);
    }
}

checkScans();
