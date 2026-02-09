import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

// Create postgres connection
const client = postgres(env.DATABASE_URL);

// Create drizzle instance with schema for type inference
export const db = drizzle(client, { schema });

// Re-export schema for convenience
export { schema };
