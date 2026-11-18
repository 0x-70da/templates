import express, { type Application, type RequestHandler, type Router } from "express";
import helmet from "helmet";
import { errorHandler, notFound, requireInternal } from "./middlewares.js";
import { httpLogger } from "./logger.js";
import { requestContext } from "./context.js";

export function createApp(options: {
  name: string;
  routes: Router;
  readinessChecks?: Record<string, () => Promise<boolean>>;
  beforeBody?: (app: Application) => void;
}): Application {
  const app = express();
  app.use(requestContext);
  app.use(httpLogger(options.name) as RequestHandler);
  app.use(helmet());
  options.beforeBody?.(app);
  app.use(express.json({ limit: "1mb" }));
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/health/ready", async (_req, res, next) => {
    try {
      const checks = await Promise.all(
        Object.entries(options.readinessChecks ?? {}).map(
          async ([name, check]) => [name, await check()] as const,
        ),
      );
      const failed = checks.filter(([, healthy]) => !healthy);
      res
        .status(failed.length ? 503 : 200)
        .json({ status: failed.length ? "error" : "ok", checks: Object.fromEntries(checks) });
    } catch (error) {
      next(error);
    }
  });
  app.use("/api", requireInternal(), options.routes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
