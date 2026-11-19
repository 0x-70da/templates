// src/middlewares/requestLogger.middleware.ts
import type { RequestHandler } from "express";
import type { Logger } from "../logger";

export const requestLogger =
  (logger: Logger): RequestHandler =>
  (req, res, next) => {
    const start = process.hrtime.bigint();
    res.on("finish", () => {
      logger.info(
        {
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          ms: Number(process.hrtime.bigint() - start) / 1e6,
        },
        "request",
      );
    });
    next();
  };
