import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { getGreeting } from "./greeting.service";

vi.mock("./greeting.service", () => ({ getGreeting: vi.fn() }));

const app = express();
app.get("/greet/:id", async (req, res) => {
  res.json({ message: await getGreeting(req.params.id) });
});

describe("GET /greet/:id", () => {
  it("responds 200 with the message", async () => {
    vi.mocked(getGreeting).mockResolvedValue("Hello, Mahmoud!");

    const res = await request(app).get("/greet/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Hello, Mahmoud!" });
  });

  it("responds 500 when the service throws", async () => {
    vi.mocked(getGreeting).mockRejectedValue(new Error("boom"));

    const res = await request(app).get("/greet/1");

    expect(res.status).toBe(500);
  });
});
