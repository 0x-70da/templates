import { describe, expect, it } from "vitest";
import { useTestStore } from "@/stores/test/test.store";

describe("useTestStore", () => {
  it("sets and clears test data", () => {
    useTestStore.getState().setCurrentTest({ id: "1", test: "Hello" });
    expect(useTestStore.getState().currentTest).toEqual({ id: "1", test: "Hello" });

    useTestStore.getState().clearTest();
    expect(useTestStore.getState().currentTest).toBeNull();
  });
});
