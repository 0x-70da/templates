// src/logger.ts
import pino, { type Logger } from "pino";
import { getRequestId } from "./context";

export type { Logger };

export function createLogger(name: string): Logger {
  return pino({
    name,
    level: process.env.LOG_LEVEL ?? "info",
    mixin: () => ({ requestId: getRequestId() }),
    redact: ["req.headers.authorization", "req.headers.cookie", 'req.headers["x-internal-secret"]'],
    ...(process.env.NODE_ENV === "development" ? { transport: { target: "pino-pretty" } } : {}),
  });
}
