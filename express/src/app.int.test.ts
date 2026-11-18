import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "@/app";

describe("app", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/__does-not-exist__");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
