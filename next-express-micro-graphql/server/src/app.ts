import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { yoga } from "./graphql/yoga.js";
import { db } from "./db/index.js";
import { sql } from "drizzle-orm";

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

// GraphQL Yoga endpoint
app.use("/graphql", (req, res) => {
  void yoga(req, res);
});

app.use(errorHandler);

app.use(notFoundHandler);

export default app;
