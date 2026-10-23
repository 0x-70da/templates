import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { error } from "../lib/response.js";
import { APIError as AuthError } from "better-auth/api";
import { DrizzleQueryError } from "drizzle-orm";
import { AppError } from "@/lib/errors.js";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AuthError) {
    return error(res, err.message, err.statusCode);
  }

  if (err instanceof DrizzleQueryError) {
    console.log(err.cause?.message);
    return error(res, "Database Error", 500);
  }

  if (err instanceof AppError) {
    return error(res, err.message, err.statusCode);
  }

  return error(res, err.message, 500);
};
