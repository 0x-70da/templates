// apps/test-service/src/env.ts
import "dotenv/config";
import { baseEnvSchema, loadEnv } from "@workspace/service-kit";
import { z } from "zod";

export const env = loadEnv(baseEnvSchema.extend({ DATABASE_URL: z.string().min(1) }));
