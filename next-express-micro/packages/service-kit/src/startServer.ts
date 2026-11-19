// src/startServer.ts
import type { Express } from "express";
import { createLogger } from "./logger";

export type StartServerOptions = {
  app: Express;
  name: string;
  port: number;
  onShutdown?: Array<() => Promise<void>>;
};

export function startServer({ app, name, port, onShutdown = [] }: StartServerOptions) {
  const logger = createLogger(name);
  const server = app.listen(port, () => logger.info(`${name} listening on :${port}`));
  let closing = false;

  const shutdown = async (signal: string) => {
    if (closing) return;
    closing = true;
    logger.info({ signal }, "shutting down");
    setTimeout(() => process.exit(1), 10_000).unref();

    const closed = new Promise<void>((resolve) => server.close(() => resolve()));
    server.closeIdleConnections();
    await closed;

    for (const hook of [...onShutdown].reverse()) {
      try {
        await hook();
      } catch (error) {
        logger.error({ err: error }, "shutdown hook failed");
      }
    }
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("unhandledRejection", (reason) => {
    logger.error({ err: reason }, "unhandledRejection");
    void shutdown("unhandledRejection");
  });
  return server;
}
