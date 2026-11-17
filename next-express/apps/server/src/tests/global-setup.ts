import { execSync } from "node:child_process";
import dotenv from "dotenv";

export default function setup() {
  dotenv.config({ path: ".env.test" });

  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL is required for integration tests");

  // حماية: ممنوع الـ tests تتشغل على DB مش اسمها test
  if (!/test/i.test(new URL(url).pathname)) {
    throw new Error(`Refusing to run integration tests on non-test database: ${url}`);
  }

  execSync("pnpm exec drizzle-kit migrate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
}
