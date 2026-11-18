import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";
import path from "node:path";

export default defineConfig({
  plugins: [swc.vite()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.spec.ts", "src/**/*.test.ts"],
          exclude: ["src/**/*.int.test.ts"],
          clearMocks: true,
        },
      },
      {
        test: {
          name: "integration",
          environment: "node",
          include: ["src/**/*.int.test.ts"],
          fileParallelism: false,
          testTimeout: 15_000,
        },
      },
    ],
  },
});
