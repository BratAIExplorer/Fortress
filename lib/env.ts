
import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    ADMIN_SECRET: z.string().optional(),
    CRON_SECRET: z.string().optional(),
    PYTHON_BIN: z.string().optional(),
});

// Validate process.env
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error(
        "❌ Invalid environment variables:",
        _env.error.format()
    );
    throw new Error("Invalid environment variables");
}

export const env = _env.data;
