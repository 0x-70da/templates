import { z } from "zod";
import { services } from "./services.registry.js";

const serviceUrlShape = Object.fromEntries(
  services.map((service) => [service.urlEnv, z.string().url()]),
);

export const gatewayEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(4000),
    LOG_LEVEL: z.string().default("info"),
    INTERNAL_SECRET: z.string().min(1),
    CORS_ORIGINS: z.string().default("http://localhost:3000"),
    REDIS_URL: z.string().url(),
    JWT_ISSUER: z.string().url(),
    JWT_AUDIENCE: z.string().min(1),
    JWKS_URL: z.string().url(),
    COOKIE_EXCHANGE_CACHE_TTL_MS: z.coerce.number().default(5000),
    PROXY_TIMEOUT_MS: z.coerce.number().default(10000),
  })
  .extend(serviceUrlShape);
