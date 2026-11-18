import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errors.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role?: string };
    }
  }
}

function headerValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function requireInternal(secret = process.env.INTERNAL_SECRET ?? "") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const supplied = Buffer.from(headerValue(req.headers["x-internal-secret"]) ?? "");
    const expected = Buffer.from(secret);
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      next(new AppError("Unauthorized", 401));
      return;
    }
    next();
  };
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const id = headerValue(req.headers["x-user-id"]);
  if (!id) {
    next(new AppError("Unauthorized", 401));
    return;
  }
  req.user = { id, role: headerValue(req.headers["x-user-role"]) };
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  requireAuth(req, _res, (error) => {
    if (error) {
      next(error);
      return;
    }
    if (req.user?.role !== "admin") {
      next(new AppError("Forbidden", 403));
      return;
    }
    next();
  });
}

export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError("Not found", 404));
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const appError = error instanceof AppError ? error : new AppError("Internal server error", 500);
  if (!(error instanceof AppError)) console.error(error);
  res.status(appError.statusCode).json({ success: false, message: appError.message });
}
