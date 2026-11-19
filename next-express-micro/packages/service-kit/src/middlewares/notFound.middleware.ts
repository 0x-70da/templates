import type { RequestHandler } from "express";
import { error } from "../response";

export const notFoundHandler: RequestHandler = (req, res) => {
  return error(res, `Route ${req.method} ${req.originalUrl} not found`, null, 404);
};
