// src/createApp.ts
import express, { type Express, type Router } from "express";
import helmet from "helmet";
import { createLogger } from "./logger";
import { requestContext } from "./context";
import { requestLogger } from "./middlewares/requestLogger.middleware";
import { createRequireInternal } from "./middlewares/internal.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";

export type CreateAppOptions = {
  name: string;
  internalSecret: string;
  routes: Router;
  apiPrefix?: string;
  readinessChecks?: Array<() => Promise<void>>;
  /** يتنفذ قبل express.json() — لازم لـ better-auth handler */
  beforeBody?: (app: Express) => void;
};

export function createApp(options: CreateAppOptions): Express {
  const {
    name,
    internalSecret,
    routes,
    apiPrefix = "/api",
    readinessChecks = [],
    beforeBody,
  } = options;
  const app = express();

  app.disable("x-powered-by");
  app.use(requestContext);
  app.use(requestLogger(createLogger(name)));
  app.use(helmet());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: name });
  });
  app.get("/health/ready", async (_req, res) => {
    try {
      await Promise.all(readinessChecks.map((check) => check()));
      res.json({ status: "ready", service: name });
    } catch {
      res.status(503).json({ status: "unavailable", service: name });
    }
  });

  beforeBody?.(app);
  app.use(express.json({ limit: "1mb" }));
  app.use(apiPrefix, createRequireInternal(internalSecret), routes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
