import type { Application } from "express";
import { createLogger } from "./logger.js";

export function startServer(options: {
  app: Application;
  name: string;
  port: number;
  onShutdown?: () => Promise<void>;
}) {
  const logger = createLogger(options.name);
  const server = options.app.listen(options.port, () =>
    logger.info(`Listening on ${options.port}`),
  );
  let stopping = false;
  const shutdown = async () => {
    if (stopping) return;
    stopping = true;
    server.close(() => {
      void (async () => {
        await options.onShutdown?.();
        process.exit(0);
      })();
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.once("SIGTERM", () => void shutdown());
  process.once("SIGINT", () => void shutdown());
  process.once("unhandledRejection", (error) => {
    logger.error(error, "Unhandled rejection");
    process.exit(1);
  });
  process.once("uncaughtException", (error) => {
    logger.error(error, "Uncaught exception");
    process.exit(1);
  });
  return server;
}
