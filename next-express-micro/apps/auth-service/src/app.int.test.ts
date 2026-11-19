// apps/auth-service/src/app.int.test.ts
import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./app";

const secret = process.env.INTERNAL_SECRET ?? "";

describe("auth-service", () => {
  it("GET /health is public", async () => {
    expect((await request(app).get("/health")).status).toBe(200);
  });

  it("rejects auth routes without the internal secret", async () => {
    expect((await request(app).get("/api/auth/get-session")).status).toBe(401);
  });

  it("serves a JWKS document (jwt plugin + database are wired)", async () => {
    const res = await request(app).get("/api/auth/jwks").set("x-internal-secret", secret);
    expect(res.status).toBe(200);
    expect(res.body.keys).toBeInstanceOf(Array);
  });
});
