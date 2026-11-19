// src/env.ts
import { z } from "zod";

export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  INTERNAL_SECRET: z.string().min(16),
});

export function loadEnv<S extends z.ZodType>(schema: S): z.output<S> {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
    console.error(`Invalid environment variables:\n${lines.join("\n")}`);
    process.exit(1);
  }
  if (process.env.NODE_ENV === "production" && (process.env.INTERNAL_SECRET ?? "").length < 32) {
    console.error("INTERNAL_SECRET must be at least 32 characters in production");
    process.exit(1);
  }
  return result.data;
}
