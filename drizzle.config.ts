import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./lib/db/schema.ts", "./lib/db/schema-feedback.ts"],
  out: "./drizzle",
  driver: "postgresql",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "postgresql://fortress_user:fortress_password@localhost:5432/fortress",
  },
});
