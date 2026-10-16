import { ErrorRequestHandler } from "express";
import { error } from "../lib/response.js";
import { APIError as AuthError } from "better-auth/api";
import { DrizzleQueryError } from "drizzle-orm";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AuthError) {
    return error(res, err.message, err.statusCode);
  }

  if (err instanceof DrizzleQueryError) {
    console.log(err.cause);
    return error(res, "Database Error", 500);
  }

  return error(res, "Internal Server Error", 500);
};
