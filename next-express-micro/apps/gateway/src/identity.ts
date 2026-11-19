// src/lib/identity.ts
import { createHash } from "node:crypto";
import { AppError } from "@workspace/service-kit";
import { createRemoteJWKSet, errors, jwtVerify } from "jose";
import { env } from "./env";

export type Identity = { id: string; role: string };

const jwks = createRemoteJWKSet(new URL(env.JWKS_URL ?? `${env.AUTH_SERVICE_URL}/api/auth/jwks`), {
  headers: { "x-internal-secret": env.INTERNAL_SECRET },
  timeoutDuration: 3000,
  cooldownDuration: 30_000,
});

export async function verifyToken(token: string): Promise<Identity> {
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });
    if (typeof payload.sub !== "string") throw new AppError("Invalid token", 401);
    return { id: payload.sub, role: typeof payload.role === "string" ? payload.role : "user" };
  } catch (error) {
    if (error instanceof AppError) throw error;
    // أي JOSEError (منتهي/توقيع غلط/issuer غلط) = 401، ما عدا timeout الـ JWKS = 503
    const authFailure = error instanceof errors.JOSEError && !(error instanceof errors.JWKSTimeout);
    throw authFailure
      ? new AppError("Invalid or expired token", 401)
      : new AppError("Auth service unavailable", 503);
  }
}

const exchangeCache = new Map<string, { token: string; expiresAt: number }>();
const EXCHANGE_CACHE_MAX = 1000;

/** يبدّل session cookie بـ JWT قصير العمر (الـ web client بيفضل على cookies) */
export async function exchangeCookie(cookie: string): Promise<string | null> {
  const key = createHash("sha256").update(cookie).digest("hex");
  const cached = exchangeCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  let res: Response;
  try {
    res = await fetch(`${env.AUTH_SERVICE_URL}/api/auth/token`, {
      headers: { cookie, "x-internal-secret": env.INTERNAL_SECRET },
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    throw new AppError("Auth service unavailable", 503);
  }
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new AppError("Auth service unavailable", 503);

  const body = (await res.json()) as { token?: unknown };
  if (typeof body.token !== "string") return null;

  if (exchangeCache.size >= EXCHANGE_CACHE_MAX) {
    const oldest = exchangeCache.keys().next().value;
    if (oldest !== undefined) exchangeCache.delete(oldest);
  }
  exchangeCache.set(key, {
    token: body.token,
    expiresAt: Date.now() + env.COOKIE_EXCHANGE_CACHE_TTL_MS,
  });
  return body.token;
}
