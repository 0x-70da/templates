// src/middlewares/internal.middleware.ts
import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { AppError } from "../errors";

export const createRequireInternal = (secret: string): RequestHandler => {
  const expected = Buffer.from(secret);
  return (req, _res, next) => {
    const provided = Buffer.from(req.header("x-internal-secret") ?? "");
    const valid = provided.length === expected.length && timingSafeEqual(provided, expected);
    if (!valid) return next(new AppError("Unauthorized", 401));
    next();
  };
};
