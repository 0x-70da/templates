import { auth } from "@/lib/auth.js";
import { error } from "@/lib/response.js";
import { fromNodeHeaders } from "better-auth/node";
import { NextFunction, Request, Response } from "express";

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session || !session.user || session.user.role !== "admin") {
    return error(res, "Unauthorized", 401);
  }

  res.locals.session = session;
  next();
};
