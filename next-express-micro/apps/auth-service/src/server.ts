import "dotenv/config";
import { baseEnvSchema, loadEnv, startServer } from "@workspace/service-kit";
import { z } from "zod";
import { app } from "./app";

const env = loadEnv(
  baseEnvSchema.extend({
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
    TRUSTED_ORIGINS: z.string().min(1),
    JWT_ISSUER: z.string().url(),
    JWT_AUDIENCE: z.string().min(1),
    JWT_EXPIRES_IN: z.string().default("15m"),
  }),
);

startServer({ app, name: "auth-service", port: env.PORT || 4001 });
