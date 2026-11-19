// src/app.ts
import { ServerResponse } from "node:http";
import {
  createLogger,
  errorHandler,
  notFoundHandler,
  requestContext,
  requestLogger,
} from "@workspace/service-kit";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "./env";
import { createIdentityMiddleware } from "./middlewares/identity.middleware";
import { stripSpoofableHeaders } from "./middlewares/stripSpoofable.middleware";
import { serviceUrl, services } from "./services.registry";

const limiter = (limit: number) =>
  rateLimit({
    windowMs: 60_000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later" },
  });

export function createGatewayApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", env.TRUST_PROXY);

  app.use(stripSpoofableHeaders); // لازم أول حاجة
  app.use(requestContext);
  app.use(requestLogger(createLogger("gateway")));
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "gateway" });
  });
  app.get("/health/ready", async (_req, res) => {
    const results = await Promise.all(
      services.map(async (s) => {
        try {
          const r = await fetch(`${serviceUrl(s.urlEnv)}/health`, {
            signal: AbortSignal.timeout(2000),
          });
          return [s.name, r.ok] as const;
        } catch {
          return [s.name, false] as const;
        }
      }),
    );
    const ok = results.every(([, up]) => up);
    res
      .status(ok ? 200 : 503)
      .json({ status: ok ? "ok" : "degraded", services: Object.fromEntries(results) });
  });

  app.use(limiter(env.RATE_LIMIT_MAX));
  app.use("/api/auth", limiter(env.AUTH_RATE_LIMIT_MAX));

  for (const service of services) {
    if (service.access !== "public") {
      app.use(service.prefix, createIdentityMiddleware(service.access));
    }
    app.use(
      createProxyMiddleware({
        target: serviceUrl(service.urlEnv),
        pathFilter: service.prefix,
        changeOrigin: false,
        xfwd: true,
        proxyTimeout: env.PROXY_TIMEOUT_MS,
        timeout: env.PROXY_TIMEOUT_MS,
        on: {
          proxyReq: (proxyReq) => {
            proxyReq.setHeader("x-internal-secret", env.INTERNAL_SECRET);
          },
          error: (error, _req, res) => {
            if (!(res instanceof ServerResponse)) return;
            if (res.headersSent) return void res.end();
            const code = (error as NodeJS.ErrnoException).code;
            const status = code === "ETIMEDOUT" || code === "ECONNRESET" ? 504 : 502;
            res.writeHead(status, { "content-type": "application/json" });
            // عدّل الشكل ليطابق lib/response.ts عندك
            res.end(
              JSON.stringify({
                success: false,
                message: status === 504 ? "Upstream timeout" : "Upstream unavailable",
              }),
            );
          },
        },
      }),
    );
  }

  // مهم: مفيش express.json() هنا، الـ body بيعدي للـ upstream كما هو
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
