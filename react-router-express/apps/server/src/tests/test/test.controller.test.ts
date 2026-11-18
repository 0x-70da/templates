import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { getTestController } from "../../controllers/test/test.controller.js";
import { getTestService } from "../../services/test/test.service.js";

vi.mock("../../services/test/test.service.js", () => ({
  getTestService: vi.fn(),
}));

const app = express();
app.use(express.json());
app.get("/api/test/:id", getTestController);

describe("getTestController", () => {
  it("returns 200 with test data on success", async () => {
    vi.mocked(getTestService).mockResolvedValue({ id: "1", test: "Sample" });

    const res = await request(app).get("/api/test/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Test fetched successfully",
      data: { id: "1", test: "Sample" },
    });
  });

  it("returns 400 on validation failure", async () => {
    const longString = "a".repeat(101);
    const res = await request(app).get(`/api/test/${longString}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
