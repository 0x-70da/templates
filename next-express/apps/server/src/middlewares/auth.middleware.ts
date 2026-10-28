import { auth } from "@/lib/auth.js";
import { error } from "@/lib/response.js";
import { Session } from "@/types/auth.types.js";
import { fromNodeHeaders } from "better-auth/node";
import { NextFunction, Request, Response } from "express";

export const authMiddleware = async (
  req: Request,
  res: Response<{}, { session: Session }>,
  next: NextFunction,
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session || !session.user) {
    return error(res, "Unauthorized", 401);
  }

  res.locals.session = session;
  next();
};
