// src/middlewares/identity.middleware.ts
import { AppError } from "@workspace/service-kit";
import type { Request, RequestHandler } from "express";
import { exchangeCookie, verifyToken, type Identity } from "../identity";
import type { Access } from "../services.registry";

async function resolveIdentity(req: Request): Promise<Identity | null> {
  const authorization = req.header("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    // Bearer موجود وغلط = 401 دايمًا (حتى مع optional)، ومفيش fallback على الـ cookie
    return verifyToken(authorization.slice(7).trim());
  }
  const cookie = req.header("cookie");
  if (!cookie) return null;
  const token = await exchangeCookie(cookie);
  return token ? verifyToken(token) : null;
}

export const createIdentityMiddleware =
  (access: Exclude<Access, "public">): RequestHandler =>
  async (req, _res, next) => {
    try {
      const identity = await resolveIdentity(req);
      if (!identity) {
        if (access === "optional") return next();
        throw new AppError("Unauthorized", 401);
      }
      if (access === "admin" && identity.role !== "admin") throw new AppError("Forbidden", 403);
      req.headers["x-user-id"] = identity.id;
      req.headers["x-user-role"] = identity.role;
      next();
    } catch (error) {
      next(error);
    }
  };
