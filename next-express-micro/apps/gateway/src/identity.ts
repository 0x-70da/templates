import { createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { AppError, GatewayTimeoutError, ServiceUnavailableError } from "@workspace/service-kit";
import type { ServiceAccess } from "./services.registry.js";

type Identity = { id: string; role?: string };
const cookieCache = new Map<string, { expiresAt: number; token: string }>();

export function identityMiddleware(
  access: ServiceAccess,
  env: {
    AUTH_SERVICE_URL: string;
    INTERNAL_SECRET: string;
    JWKS_URL: string;
    JWT_ISSUER: string;
    JWT_AUDIENCE: string;
    COOKIE_EXCHANGE_CACHE_TTL_MS: number;
  },
) {
  const jwks = createRemoteJWKSet(new URL(env.JWKS_URL));
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (access === "public") {
        next();
        return;
      }
      const bearer = req.header("authorization");
      if (bearer) {
        if (!bearer.toLowerCase().startsWith("bearer ")) throw new AppError("Unauthorized", 401);
        req.user = await verifyToken(bearer.slice(7), jwks, env);
      } else {
        const cookie = req.header("cookie");
        if (!cookie) {
          if (access === "optional") {
            next();
            return;
          }
          throw new AppError("Unauthorized", 401);
        }
        const token = await exchangeCookie(cookie, env);
        req.user = await verifyToken(token, jwks, env);
      }
      if (access === "admin" && req.user?.role !== "admin") throw new AppError("Forbidden", 403);
      next();
    } catch (error) {
      next(error);
    }
  };
}

async function exchangeCookie(
  cookie: string,
  env: { AUTH_SERVICE_URL: string; INTERNAL_SECRET: string; COOKIE_EXCHANGE_CACHE_TTL_MS: number },
) {
  const key = createHash("sha256").update(cookie).digest("hex");
  const cached = cookieCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.token;
  try {
    const response = await fetch(new URL("/api/auth/token", env.AUTH_SERVICE_URL), {
      headers: { cookie, "x-internal-secret": env.INTERNAL_SECRET },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      if (response.status >= 500) throw new ServiceUnavailableError("Auth service unavailable");
      throw new AppError("Unauthorized", 401);
    }
    const body = (await response.json()) as { token?: string };
    if (!body.token) throw new ServiceUnavailableError("Auth service returned no token");
    cookieCache.set(key, {
      token: body.token,
      expiresAt: Date.now() + env.COOKIE_EXCHANGE_CACHE_TTL_MS,
    });
    return body.token;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof DOMException && error.name === "TimeoutError")
      throw new GatewayTimeoutError();
    throw new ServiceUnavailableError("Auth service unavailable", error);
  }
}

async function verifyToken(
  token: string,
  jwks: ReturnType<typeof createRemoteJWKSet>,
  env: { JWT_ISSUER: string; JWT_AUDIENCE: string },
): Promise<Identity> {
  let payload: JWTPayload;
  try {
    ({ payload } = await jwtVerify(token, jwks, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      algorithms: ["EdDSA"],
    }));
  } catch (error) {
    if (error instanceof TypeError || error instanceof Error)
      throw new AppError("Unauthorized", 401, error);
    throw new ServiceUnavailableError("JWKS unavailable", error);
  }
  if (!payload.sub) throw new AppError("Unauthorized", 401);
  return { id: payload.sub, role: typeof payload.role === "string" ? payload.role : undefined };
}
