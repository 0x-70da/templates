import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { getTestController } from "@/controllers/test/test.controller";
import { getTestService } from "@/services/test/test.service";

vi.mock("@/services/test/test.service", () => ({
  getTestService: vi.fn(),
}));

const app = express();
app.use(express.json());
app.get("/api/test/:id", getTestController);

describe("getTestController", () => {
  it("returns 200 with test data on success", async () => {
    vi.mocked(getTestService).mockResolvedValue({ id: "1", message: "Hello, World!" });

    const res = await request(app).get("/api/test/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Test fetched successfully",
      data: { id: "1", message: "Hello, World!" },
    });
  });

  it("returns 400 on validation failure", async () => {
    const res = await request(app).get("/api/test/%20");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
