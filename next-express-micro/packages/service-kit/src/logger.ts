import pino from "pino";
import pinoHttp from "pino-http";
import { getRequestContext } from "./context.js";

export function createLogger(name: string) {
  return pino({
    level: process.env.LOG_LEVEL ?? "info",
    base: { service: name },
    redact: ["req.headers.authorization", "req.headers.cookie", "res.headers['set-cookie']"],
    mixin: () => ({ requestId: getRequestContext()?.requestId }),
    ...(process.env.NODE_ENV === "development" ? { transport: { target: "pino-pretty" } } : {}),
  });
}

export function httpLogger(name: string) {
  return pinoHttp({ logger: createLogger(name) });
}
