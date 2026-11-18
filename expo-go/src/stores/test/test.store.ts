import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Test } from "@/types/test.types";

interface TestState {
  items: Test[];
  addTest: (item: Test) => void;
  removeTest: (id: string) => void;
  clear: () => void;
}

export const useTestStore = create<TestState>()(
  immer((set) => ({
    items: [],
    addTest: (item) =>
      set((state) => {
        state.items.push(item);
      }),
    removeTest: (id) =>
      set((state) => {
        state.items = state.items.filter((i) => i.id !== id);
      }),
    clear: () =>
      set((state) => {
        state.items = [];
      }),
  })),
);
