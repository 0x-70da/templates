import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { requireAuth, requireInternal } from "./middlewares.js";

describe("service middleware", () => {
  it("rejects a missing internal secret", async () => {
    const app = express();
    app.use(requireInternal("secret"));
    app.get("/", (_req, res) => res.sendStatus(204));
    expect((await request(app).get("/")).status).toBe(401);
  });

  it("reads gateway identity headers", async () => {
    const app = express();
    app.use(requireAuth);
    app.get("/", (req, res) => res.json(req.user));
    const response = await request(app)
      .get("/")
      .set("x-user-id", "user-1")
      .set("x-user-role", "admin");
    expect(response.body).toEqual({ id: "user-1", role: "admin" });
  });
});
