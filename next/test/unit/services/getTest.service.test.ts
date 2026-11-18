import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTestService } from "@/services/test/getTest.service";
import { getTestQuery } from "@/queries/test/getTest.query";
import { AppError } from "@/lib/errors";

vi.mock("@/queries/test/getTest.query", () => ({
  getTestQuery: vi.fn(),
}));

describe("getTestService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns formatted test data when record exists", async () => {
    vi.mocked(getTestQuery).mockResolvedValue({ id: "1", name: "Sample Item" });

    const result = await getTestService("1");
    expect(result).toEqual({ id: "1", test: "Sample Item" });
    expect(getTestQuery).toHaveBeenCalledWith("1");
  });

  it("throws AppError 404 when record does not exist", async () => {
    vi.mocked(getTestQuery).mockResolvedValue(undefined);

    await expect(getTestService("not-found")).rejects.toThrow(AppError);
  });

  it("throws AppError 400 when id is invalid", async () => {
    await expect(getTestService("invalid")).rejects.toThrow(AppError);
  });
});
