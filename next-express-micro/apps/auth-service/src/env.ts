// src/env.ts
import "dotenv/config";
import { baseEnvSchema, loadEnv } from "@workspace/service-kit";
import { z } from "zod";

export const env = loadEnv(
  baseEnvSchema.extend({
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(), // الـ URL العام (origin الـ client)، مش عنوان الـ service الداخلي
    TRUSTED_ORIGINS: z.string().transform((v) =>
      v
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    ),
    JWT_ISSUER: z.string().min(1),
    JWT_AUDIENCE: z.string().min(1),
    JWT_EXPIRES_IN: z.string().default("15m"),
  }),
);
