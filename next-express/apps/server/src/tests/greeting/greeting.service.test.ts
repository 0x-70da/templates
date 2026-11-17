import { describe, expect, it, vi } from "vitest";
import { findNameById } from "./greeting.query";
import { getGreeting } from "./greeting.service";

vi.mock("./greeting.query", () => ({ findNameById: vi.fn() }));

describe("getGreeting", () => {
  it("returns a greeting when the user exists", async () => {
    vi.mocked(findNameById).mockResolvedValue("Mahmoud");

    await expect(getGreeting("1")).resolves.toBe("Hello, Mahmoud!");
    expect(findNameById).toHaveBeenCalledWith("1");
  });

  it("throws when the user does not exist", async () => {
    vi.mocked(findNameById).mockResolvedValue(undefined);

    await expect(getGreeting("404")).rejects.toThrow("NOT_FOUND");
  });
});
