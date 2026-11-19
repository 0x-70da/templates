import { execSync } from "node:child_process";
import dotenv from "dotenv";

export default function setup() {
  dotenv.config({ path: [".env.test", ".env"], quiet: true }); // الأول يكسب، و.env.test اختياري

  const url = process.env.TEST_DATABASE_URL;
  if (!url)
    throw new Error("TEST_DATABASE_URL is required for integration tests (run: pnpm env:setup)");

  // حماية: اسم الـ DB لازم يخلص بـ _test (test_service نفسها هي الـ dev DB)
  const dbName = new URL(url).pathname.slice(1);
  if (!/_test$/i.test(dbName)) {
    throw new Error(`Refusing to run integration tests on non-test database "${dbName}"`);
  }

  execSync("pnpm exec drizzle-kit migrate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
}
