import { auth } from "@/lib/auth";
import { error } from "@/lib/response";
import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session || !session.user || session.user.role !== "admin") {
    error(res, "Unauthorized", null, 401);
    return;
  }

  res.locals.session = session;
  next();
};
