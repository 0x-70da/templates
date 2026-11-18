import { describe, expect, it, vi } from "vitest";
import { createCaller } from "@/routers/index";
import * as testService from "@/services/test/test.service";
import { TRPCError } from "@trpc/server";

vi.mock("@/services/test/test.service", () => ({
  getTestService: vi.fn(),
}));

describe("testRouter", () => {
  const caller = createCaller({
    user: null,
    session: null,
    req: {} as never,
    res: {} as never,
  });

  it("returns test data successfully", async () => {
    vi.mocked(testService.getTestService).mockResolvedValue({
      id: "1",
      message: "Hello, Mock!",
    });

    const result = await caller.test.getTest({ id: "1" });
    expect(result).toEqual({ id: "1", message: "Hello, Mock!" });
    expect(testService.getTestService).toHaveBeenCalledWith("1");
  });

  it("propagates TRPCError from service", async () => {
    vi.mocked(testService.getTestService).mockRejectedValue(
      new TRPCError({ code: "BAD_REQUEST", message: "Invalid test ID" }),
    );

    await expect(caller.test.getTest({ id: "invalid" })).rejects.toThrow(TRPCError);
  });
});
