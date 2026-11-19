// apps/gateway/src/tests/gateway.int.test.ts
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import type { Express } from "express";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const SECRET = "test-internal-secret-0123456789abcdef";
const ISSUER = "http://issuer.test";
const AUDIENCE = "gateway-test";
const KID = "test-key";

type KeyPair = Awaited<ReturnType<typeof generateKeyPair>>;

let keys: KeyPair;
let authServer: Server;
let testServer: Server;
let app: Express;
let createGatewayApp: () => Express;

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk as Uint8Array));
  return Buffer.concat(chunks).toString("utf8");
}

async function echo(req: IncomingMessage, res: ServerResponse): Promise<void> {
  json(res, 200, {
    path: req.url,
    method: req.method,
    userId: req.headers["x-user-id"] ?? null,
    userRole: req.headers["x-user-role"] ?? null,
    internalSecret: req.headers["x-internal-secret"] ?? null,
    requestId: req.headers["x-request-id"] ?? null,
    body: await readBody(req),
  });
}

const listen = (server: Server) =>
  new Promise<number>((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve((server.address() as AddressInfo).port)),
  );

const close = (server: Server) =>
  new Promise<void>((resolve) => {
    if (!server.listening) return resolve();
    server.closeAllConnections();
    server.close(() => resolve());
  });

async function sign(
  options: {
    sub?: string;
    role?: string;
    issuer?: string;
    audience?: string;
    exp?: string | number;
    key?: KeyPair["privateKey"];
  } = {},
): Promise<string> {
  return new SignJWT({ role: options.role ?? "user" })
    .setProtectedHeader({ alg: "EdDSA", kid: KID })
    .setSubject(options.sub ?? "user-1")
    .setIssuer(options.issuer ?? ISSUER)
    .setAudience(options.audience ?? AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(options.exp ?? "5m")
    .sign(options.key ?? keys.privateKey);
}

beforeAll(async () => {
  keys = await generateKeyPair("EdDSA");
  const publicJwk = { ...(await exportJWK(keys.publicKey)), kid: KID, alg: "EdDSA", use: "sig" };

  const authHandler = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const url = req.url ?? "";
    const hasSecret = req.headers["x-internal-secret"] === SECRET;
    if (url === "/health") return json(res, 200, { status: "ok" });
    if (url === "/api/auth/jwks") {
      return hasSecret ? json(res, 200, { keys: [publicJwk] }) : json(res, 401, {});
    }
    if (url === "/api/auth/token") {
      if (!hasSecret) return json(res, 401, {});
      const cookie = req.headers.cookie ?? "";
      if (cookie.includes("session=user"))
        return json(res, 200, { token: await sign({ sub: "user-1" }) });
      if (cookie.includes("session=admin")) {
        return json(res, 200, { token: await sign({ sub: "admin-1", role: "admin" }) });
      }
      return json(res, 401, {});
    }
    return echo(req, res);
  };

  authServer = createServer((req, res) => void authHandler(req, res));
  testServer = createServer((req, res) => {
    if (req.url === "/health") return json(res, 200, { status: "ok" });
    void echo(req, res);
  });

  const [authPort, testPort] = await Promise.all([listen(authServer), listen(testServer)]);

  Object.assign(process.env, {
    NODE_ENV: "test",
    PORT: "4999",
    LOG_LEVEL: "silent",
    INTERNAL_SECRET: SECRET,
    CORS_ORIGINS: "http://localhost:3000",
    AUTH_SERVICE_URL: `http://127.0.0.1:${authPort}`,
    TEST_SERVICE_URL: `http://127.0.0.1:${testPort}`,
    JWKS_URL: `http://127.0.0.1:${authPort}/api/auth/jwks`,
    JWT_ISSUER: ISSUER,
    JWT_AUDIENCE: AUDIENCE,
    COOKIE_EXCHANGE_CACHE_TTL_MS: "0",
    AUTH_RATE_LIMIT_MAX: "3",
  });

  // لازم بعد ضبط الـ env لأن env.ts بيتحمّل وقت الـ import
  ({ createGatewayApp } = await import("../app.js"));
  app = createGatewayApp();
});

afterAll(async () => {
  await Promise.all([close(authServer), close(testServer)]);
});

describe("authentication", () => {
  it("rejects requests without credentials", async () => {
    const res = await request(app).get("/api/test/ping");
    expect(res.status).toBe(401);
  });

  it("exchanges a session cookie for identity headers", async () => {
    const res = await request(app).get("/api/test/ping").set("Cookie", "session=user");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ userId: "user-1", userRole: "user" });
  });

  it("rejects a cookie the auth service does not recognise", async () => {
    const res = await request(app).get("/api/test/ping").set("Cookie", "session=nope");
    expect(res.status).toBe(401);
  });

  it("accepts a valid Bearer JWT and forwards id and role", async () => {
    const token = await sign({ sub: "u-9", role: "admin" });
    const res = await request(app).get("/api/test/ping").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ userId: "u-9", userRole: "admin" });
  });

  const invalidTokens: Array<[string, () => Promise<string>]> = [
    ["an expired token", () => sign({ exp: Math.floor(Date.now() / 1000) - 60 })],
    ["a wrong issuer", () => sign({ issuer: "http://evil.test" })],
    ["a wrong audience", () => sign({ audience: "someone-else" })],
    [
      "a token signed with another key",
      async () => sign({ key: (await generateKeyPair("EdDSA")).privateKey }),
    ],
    ["a malformed token", async () => "not-a-jwt"],
  ];

  it.each(invalidTokens)("rejects %s", async (_name, makeToken) => {
    const res = await request(app)
      .get("/api/test/ping")
      .set("Authorization", `Bearer ${await makeToken()}`);
    expect(res.status).toBe(401);
  });

  it("does not fall back to the cookie when the Bearer token is invalid", async () => {
    const res = await request(app)
      .get("/api/test/ping")
      .set("Authorization", "Bearer garbage")
      .set("Cookie", "session=user");
    expect(res.status).toBe(401);
  });
});

describe("header hygiene and proxying", () => {
  it("strips spoofed identity/internal headers on protected routes", async () => {
    const res = await request(app)
      .get("/api/test/ping")
      .set("Cookie", "session=user")
      .set("x-user-id", "hacker")
      .set("x-user-role", "admin")
      .set("x-internal-secret", "forged")
      .set("x-request-id", "forged-id");
    expect(res.body).toMatchObject({ userId: "user-1", userRole: "user", internalSecret: SECRET });
    expect(res.body).not.toMatchObject({ requestId: "forged-id" });
  });

  it("strips spoofed headers on public routes too", async () => {
    const res = await request(app).get("/api/auth/ping").set("x-user-id", "hacker");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ userId: null, internalSecret: SECRET });
  });

  it("streams request bodies to the upstream untouched", async () => {
    const res = await request(app)
      .post("/api/test/items")
      .set("Cookie", "session=user")
      .send({ name: "x" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ method: "POST", body: JSON.stringify({ name: "x" }) });
  });

  it("rate-limits /api/auth", async () => {
    const limited = createGatewayApp(); // instance جديدة = عدّاد جديد
    const statuses: number[] = [];
    for (let i = 0; i < 5; i++)
      statuses.push((await request(limited).get("/api/auth/ping")).status);
    expect(statuses).toEqual([200, 200, 200, 429, 429]);
  });
});

// لازم آخر describe: بيقفل الـ stubs
describe("upstream failures", () => {
  it("reports every registered service as ready", async () => {
    const res = await request(app).get("/health/ready");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ services: { auth: true, test: true } });
  });

  it("returns 502/504 and degraded readiness when an upstream is down", async () => {
    await close(testServer);
    const res = await request(app).get("/api/test/ping").set("Cookie", "session=user");
    expect([502, 504]).toContain(res.status); // 504 لو الـ socket الـ keep-alive اتقفل فجأة
    const ready = await request(app).get("/health/ready");
    expect(ready.status).toBe(503);
    expect(ready.body).toMatchObject({ services: { test: false } });
  });

  it("returns 503 (not 401) when the auth service is down", async () => {
    await close(authServer);
    const res = await request(app).get("/api/test/ping").set("Cookie", "session=user");
    expect(res.status).toBe(503);
  });
});
