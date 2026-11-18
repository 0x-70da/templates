import { z } from "zod";

export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.string().default("info"),
  INTERNAL_SECRET: z.string().min(1),
});

export const redisEnvSchema = z.object({
  REDIS_URL: z.string().url(),
});

export function loadEnv<T extends z.ZodType>(schema: T): z.output<T> {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
      .join("\n");
    console.error(`Invalid environment:\n${details}`);
    process.exitCode = 1;
    throw new Error("Invalid environment");
  }
  if (
    process.env.NODE_ENV === "production" &&
    (process.env.INTERNAL_SECRET === "replace-with-a-long-random-secret" ||
      (process.env.INTERNAL_SECRET?.length ?? 0) < 32)
  ) {
    console.error(
      "Invalid environment:\nINTERNAL_SECRET must be at least 32 characters in production",
    );
    process.exitCode = 1;
    throw new Error("Invalid environment");
  }
  return result.data;
}
