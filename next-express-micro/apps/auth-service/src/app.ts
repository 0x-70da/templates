// src/app.ts
import { createApp, createRequireInternal } from "@workspace/service-kit";
import { toNodeHandler } from "better-auth/node";
import { sql } from "drizzle-orm";
import { auth } from "./lib/auth";
import { db } from "./db";
import { env } from "./env";
import routes from "./routes";

const requireInternal = createRequireInternal(env.INTERNAL_SECRET);

export const app = createApp({
  name: "auth-service",
  internalSecret: env.INTERNAL_SECRET,
  routes,
  readinessChecks: [
    async () => {
      await db.execute(sql`select 1`);
    },
  ],
  beforeBody: (app) => {
    // Express 5 syntax. لو Express 4 خليها "/api/auth/*"
    app.all("/api/auth/*splat", requireInternal, toNodeHandler(auth));
  },
});
