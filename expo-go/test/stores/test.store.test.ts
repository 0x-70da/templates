import { useTestStore } from "@/stores/test/test.store";

describe("useTestStore", () => {
  beforeEach(() => {
    useTestStore.getState().clear();
  });

  it("adds and removes test items", () => {
    expect(useTestStore.getState().items).toEqual([]);

    useTestStore.getState().addTest({ id: "1", test: "First Test" });
    expect(useTestStore.getState().items).toEqual([{ id: "1", test: "First Test" }]);

    useTestStore.getState().removeTest("1");
    expect(useTestStore.getState().items).toEqual([]);
  });
});
