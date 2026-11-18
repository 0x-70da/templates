import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { TestData } from "@/contracts/test.types";

interface TestState {
  currentTest: TestData | null;
  setCurrentTest: (test: TestData | null) => void;
  clearTest: () => void;
}

export const useTestStore = create<TestState>()(
  immer((set) => ({
    currentTest: null,
    setCurrentTest: (test) =>
      set((state) => {
        state.currentTest = test;
      }),
    clearTest: () =>
      set((state) => {
        state.currentTest = null;
      }),
  })),
);
