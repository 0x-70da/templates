// src/env.ts
import "dotenv/config";
import { baseEnvSchema, loadEnv } from "@workspace/service-kit";
import { z } from "zod";
import { services } from "./services.registry";

const serviceUrls = Object.fromEntries(services.map((s) => [s.urlEnv, z.url()]));

export const env = loadEnv(
  baseEnvSchema.extend({
    ...serviceUrls,
    AUTH_SERVICE_URL: z.url(),
    CORS_ORIGINS: z.string().transform((v) =>
      v
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    ),
    JWT_ISSUER: z.string().min(1),
    JWT_AUDIENCE: z.string().min(1),
    JWKS_URL: z.url().optional(),
    COOKIE_EXCHANGE_CACHE_TTL_MS: z.coerce.number().int().min(0).default(5000),
    PROXY_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
    TRUST_PROXY: z.coerce.number().int().min(0).default(1),
  }),
);
