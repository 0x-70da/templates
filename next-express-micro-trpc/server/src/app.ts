import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { db } from "./db/index.js";
import { sql } from "drizzle-orm";
import { appRouter } from "./routers/index.js";
import { createContext } from "./trpc/context.js";

const app: express.Application = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.get("/health", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (err) {
    res.status(503).json({
      status: "error",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: err instanceof Error ? err.message : "Database unavailable",
    });
  }
});

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.use(notFoundHandler);

export default app;
