import { describe, expect, it } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("formats cents as currency", () => {
    expect(formatPrice(1050, "USD", "en-US")).toBe("$10.50");
  });

  it("handles zero", () => {
    expect(formatPrice(0, "USD", "en-US")).toBe("$0.00");
  });
});
