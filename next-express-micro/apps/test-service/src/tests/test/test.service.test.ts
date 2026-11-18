import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTestService } from "../../services/test/test.service.js";
import { findTestByIdQuery } from "../../queries/test/test.query.js";
import { AppError } from "@workspace/service-kit";

vi.mock("../../queries/test/test.query.js", () => ({
  findTestByIdQuery: vi.fn(),
}));

describe("getTestService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns formatted test data when item exists", async () => {
    vi.mocked(findTestByIdQuery).mockResolvedValue({ id: "123", name: "Sample" });

    const result = await getTestService("123");
    expect(result).toEqual({ id: "123", test: "Sample" });
    expect(findTestByIdQuery).toHaveBeenCalledWith("123");
  });

  it("throws AppError 404 when item is not found", async () => {
    vi.mocked(findTestByIdQuery).mockResolvedValue(undefined);

    await expect(getTestService("not-found")).rejects.toThrow(AppError);
  });

  it("throws AppError 400 when id is invalid", async () => {
    await expect(getTestService("invalid")).rejects.toThrow(AppError);
  });
});
