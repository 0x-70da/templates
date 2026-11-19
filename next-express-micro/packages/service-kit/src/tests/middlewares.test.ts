// packages/service-kit/src/tests/middlewares.test.ts
import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware";
import { errorHandler } from "../middlewares/error.middleware";
import { createRequireInternal } from "../middlewares/internal.middleware";

const SECRET = "0123456789abcdef0123456789abcdef";

function buildApp() {
  const app = express();
  app.use(createRequireInternal(SECRET));
  app.get("/me", requireAuth, (req, res) => {
    res.json(req.user);
  });
  app.get("/admin", requireAdmin, (_req, res) => {
    res.json({ ok: true });
  });
  app.use(errorHandler);
  return app;
}

describe("requireInternal", () => {
  it.each([
    ["no secret", undefined],
    ["wrong secret, same length", "x".repeat(SECRET.length)],
    ["wrong secret, different length", "short"],
  ])("rejects %s", async (_name, secret) => {
    const req = request(buildApp()).get("/me");
    if (secret) req.set("x-internal-secret", secret);
    expect((await req).status).toBe(401);
  });
});

describe("requireAuth / requireAdmin", () => {
  const internal = { "x-internal-secret": SECRET };

  it("401 without identity headers", async () => {
    expect((await request(buildApp()).get("/me").set(internal)).status).toBe(401);
  });

  it("exposes req.user from the gateway headers", async () => {
    const res = await request(buildApp())
      .get("/me")
      .set({ ...internal, "x-user-id": "u1" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "u1", role: "user" });
  });

  it("403 for non-admins, 200 for admins", async () => {
    const asUser = await request(buildApp())
      .get("/admin")
      .set({ ...internal, "x-user-id": "u1", "x-user-role": "user" });
    const asAdmin = await request(buildApp())
      .get("/admin")
      .set({ ...internal, "x-user-id": "u2", "x-user-role": "admin" });
    expect(asUser.status).toBe(403);
    expect(asAdmin.status).toBe(200);
  });
});
