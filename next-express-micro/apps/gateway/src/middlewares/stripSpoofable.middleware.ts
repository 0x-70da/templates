// src/middlewares/stripSpoofable.middleware.ts
import type { RequestHandler } from "express";

const SPOOFABLE = ["x-user-id", "x-user-role", "x-internal-secret", "x-request-id"];

export const stripSpoofableHeaders: RequestHandler = (req, _res, next) => {
  for (const header of SPOOFABLE) delete req.headers[header];
  next();
};
