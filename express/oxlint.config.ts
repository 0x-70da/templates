import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "import", "unicorn", "promise"],

  categories: {
    correctness: "error",
    suspicious: "warn",
  },

  rules: {
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
    "typescript/await-thenable": "error",
    "typescript/no-unnecessary-type-assertion": "warn",
    "typescript/no-unsafe-type-assertion": "off",
    "typescript/no-unnecessary-type-parameters": "off",

    "typescript/consistent-type-imports": "error",
    "typescript/no-explicit-any": "warn",

    eqeqeq: ["error", "always"],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

    "import/no-unassigned-import": "off",

    "unicorn/no-empty-file": "off",
  },

  overrides: [
    {
      files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/*.int.test.ts"],
      rules: {
        "typescript/no-explicit-any": "off",
        "no-console": "off",
      },
    },
    {
      files: ["**/*.config.{js,ts,mjs}", "**/server.ts"],
      rules: { "no-console": "off" },
    },
  ],

  ignorePatterns: ["**/node_modules", "**/dist", "**/build", "**/coverage", "**/src/db/migrations"],
});
