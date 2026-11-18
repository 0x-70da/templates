import { beforeEach, describe, expect, it } from "vitest";
import { useTestStore } from "@/stores/test/test.store";

describe("useTestStore", () => {
  beforeEach(() => {
    useTestStore.getState().reset();
  });

  it("initializes with count 0", () => {
    expect(useTestStore.getState().count).toBe(0);
  });

  it("increments count", () => {
    useTestStore.getState().increment();
    expect(useTestStore.getState().count).toBe(1);
  });

  it("resets count", () => {
    useTestStore.getState().increment();
    useTestStore.getState().reset();
    expect(useTestStore.getState().count).toBe(0);
  });
});
