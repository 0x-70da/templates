import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "react", "nextjs", "import", "jsx-a11y", "unicorn", "promise"],

  categories: {
    correctness: "error",
    suspicious: "warn",
  },

  rules: {
    // type-aware: أهم القواعد اللي بتمسك bugs حقيقية
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
    "typescript/await-thenable": "error",
    "typescript/no-unnecessary-type-assertion": "warn",
    "typescript/no-unsafe-type-assertion": "off",
    "typescript/no-unnecessary-type-parameters": "off",

    // TypeScript عام
    "typescript/consistent-type-imports": "error",
    "typescript/no-explicit-any": "warn",
    "typescript/no-extraneous-class": ["warn", { allowWithDecorator: true }],

    // JS عام
    eqeqeq: ["error", "always"],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

    // React / Next
    "react/react-in-jsx-scope": "off",
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "warn",

    // Imports
    "import/no-unassigned-import": "off",

    // Unicorn
    "unicorn/no-empty-file": "off",
  },

  overrides: [
    {
      files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
      rules: {
        "typescript/no-explicit-any": "off",
        "no-console": "off",
      },
    },
    {
      files: ["**/*.config.{js,ts,mjs}", "**/server.ts", "**/main.ts"],
      rules: { "no-console": "off" },
    },
  ],

  ignorePatterns: [
    "**/node_modules",
    "**/.next",
    "**/.turbo",
    "**/dist",
    "**/build",
    "**/coverage",
    "env.d.ts",
  ],
});
