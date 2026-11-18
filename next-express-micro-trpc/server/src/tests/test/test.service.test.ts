import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTestService } from "@/services/test/test.service";
import { findTestByIdQuery } from "@/queries/test/test.query";
import { TRPCError } from "@trpc/server";

vi.mock("@/queries/test/test.query", () => ({
  findTestByIdQuery: vi.fn(),
}));

describe("getTestService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns formatted test data when item exists", async () => {
    vi.mocked(findTestByIdQuery).mockResolvedValue({ id: "123", name: "World" });

    const result = await getTestService("123");
    expect(result).toEqual({ id: "123", message: "Hello, World!" });
    expect(findTestByIdQuery).toHaveBeenCalledWith("123");
  });

  it("throws TRPCError NOT_FOUND when item is not found", async () => {
    vi.mocked(findTestByIdQuery).mockResolvedValue(undefined);

    await expect(getTestService("999")).rejects.toThrow(TRPCError);
  });

  it("throws TRPCError BAD_REQUEST when id is invalid", async () => {
    await expect(getTestService("invalid")).rejects.toThrow(TRPCError);
  });
});
