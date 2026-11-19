import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { error } from "../response";
import { AppError } from "../errors";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return error(res, err.message, err.error, err.statusCode);
  }

  return error(res, err.message, err, 500);
};
