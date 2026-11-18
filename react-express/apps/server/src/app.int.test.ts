import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "@/app"; // لازم app.ts يعمل export من غير listen

describe("app", () => {
  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/__does-not-exist__");
    expect(res.status).toBe(404);
  });
});
