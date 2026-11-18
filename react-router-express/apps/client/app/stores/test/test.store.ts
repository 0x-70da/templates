import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface TestState {
  count: number;
  increment: () => void;
  reset: () => void;
}

export const useTestStore = create<TestState>()(
  immer((set) => ({
    count: 0,
    increment: () =>
      set((state) => {
        state.count += 1;
      }),
    reset: () =>
      set((state) => {
        state.count = 0;
      }),
  })),
);
