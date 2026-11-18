import { Pool } from "pg";
import { afterAll, describe, expect, it } from "vitest";

const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });

afterAll(() => pool.end());

describe("test database", () => {
  it("is reachable", async () => {
    const { rows } = await pool.query<{ ok: number }>("select 1 as ok");
    expect(rows[0]?.ok).toBe(1);
  });

  it("has been migrated", async () => {
    const { rows } = await pool.query<{ count: number }>(
      "select count(*)::int as count from information_schema.tables where table_schema = 'public'",
    );
    expect(rows[0]?.count).toBeGreaterThan(0);
  });
});
