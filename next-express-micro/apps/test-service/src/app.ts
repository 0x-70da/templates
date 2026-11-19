// apps/test-service/src/app.ts
import { createApp } from "@workspace/service-kit";
import { sql } from "drizzle-orm";
import { db } from "./db/index";
import { env } from "./env.js";
import routes from "./routes/index";

export const app = createApp({
  name: "test-service",
  internalSecret: env.INTERNAL_SECRET,
  routes,
  readinessChecks: [
    async () => {
      await db.execute(sql`select 1`);
    },
  ],
});
