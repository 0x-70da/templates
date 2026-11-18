import type { z } from "zod";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { createProxyMiddleware } from "http-proxy-middleware";
import IORedis from "ioredis";
import { errorHandler, httpLogger, notFound, requestContext } from "@workspace/service-kit";
import { gatewayEnvSchema } from "./env.js";
import { identityMiddleware } from "./identity.js";
import { services } from "./services.registry.js";

export function createGatewayApp(env: z.output<typeof gatewayEnvSchema>) {
  const app = express();
  const redis = new IORedis(env.REDIS_URL!, { maxRetriesPerRequest: null });
  app.use((req, _res, next) => {
    for (const header of ["x-user-id", "x-user-role", "x-internal-secret", "x-request-id"]) {
      delete req.headers[header];
    }
    next();
  });
  app.use(requestContext);
  app.use(httpLogger("gateway"));
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS!.split(",").map((origin) => origin.trim()),
      credentials: true,
    }),
  );
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/health/ready", async (_req, res) => {
    const checks: Record<string, boolean> = { redis: false };
    try {
      checks.redis = (await redis.ping()) === "PONG";
    } catch {
      checks.redis = false;
    }
    await Promise.all(
      services.map(async (service) => {
        try {
          const response = await fetch(new URL("/health", env[service.urlEnv]), {
            signal: AbortSignal.timeout(2000),
          });
          checks[service.name] = response.ok;
        } catch {
          checks[service.name] = false;
        }
      }),
    );
    const healthy = Object.values(checks).every(Boolean);
    res.status(healthy ? 200 : 503).json({ status: healthy ? "ok" : "error", checks });
  });
  for (const service of services) {
    const target = env[service.urlEnv]!;
    app.use(
      service.prefix,
      identityMiddleware(service.access, {
        AUTH_SERVICE_URL: env.AUTH_SERVICE_URL!,
        INTERNAL_SECRET: env.INTERNAL_SECRET!,
        JWKS_URL: env.JWKS_URL!,
        JWT_ISSUER: env.JWT_ISSUER!,
        JWT_AUDIENCE: env.JWT_AUDIENCE!,
        COOKIE_EXCHANGE_CACHE_TTL_MS: Number(env.COOKIE_EXCHANGE_CACHE_TTL_MS ?? 5000),
      }),
      createProxyMiddleware({
        target,
        changeOrigin: true,
        proxyTimeout: Number(env.PROXY_TIMEOUT_MS ?? 10000),
        timeout: Number(env.PROXY_TIMEOUT_MS ?? 10000),
        pathRewrite: (path) => service.prefix + path,
        on: {
          proxyReq: (proxyReq, req) => {
            if (req.user) {
              proxyReq.setHeader("x-user-id", req.user.id);
              if (req.user.role) proxyReq.setHeader("x-user-role", req.user.role);
            }
            proxyReq.setHeader("x-internal-secret", env.INTERNAL_SECRET!);
          },
        },
      }),
    );
  }
  app.use(notFound);
  app.use(errorHandler);
  app.locals.redis = redis;
  return app;
}

export const env = gatewayEnvSchema.parse(process.env);
export const app = createGatewayApp(env);
