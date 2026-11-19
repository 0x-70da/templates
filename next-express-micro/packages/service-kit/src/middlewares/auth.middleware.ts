// src/middlewares/auth.middleware.ts   (بدل الـ session-based القديم)
import type { RequestHandler } from "express";
import { AppError } from "../errors";

export type AuthUser = { id: string; role: string };

declare global {
  // oxlint-disable-next-line typescript/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const id = req.header("x-user-id");
  if (!id) return next(new AppError("Unauthorized", 401));
  req.user = { id, role: req.header("x-user-role") ?? "user" };
  next();
};

export const requireAdmin: RequestHandler = (req, res, next) =>
  requireAuth(req, res, (error) => {
    if (error) return next(error);
    if (req.user?.role !== "admin") return next(new AppError("Forbidden", 403));
    next();
  });
