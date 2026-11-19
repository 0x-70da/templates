// scripts/ensure-databases.ts
import { readdirSync } from "node:fs";
import pg from "pg";

const adminUrl =
  process.env.ADMIN_DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/postgres";

const names = readdirSync("apps", { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name.endsWith("-service"))
  .map((d) => d.name.replaceAll("-", "_"))
  .filter((n) => /^[a-z0-9_]+$/.test(n))
  .flatMap((n) => [n, `${n}_test`]);

const client = new pg.Client({ connectionString: adminUrl });
await client.connect();
for (const name of names) {
  const { rowCount } = await client.query("select 1 from pg_database where datname = $1", [name]);
  if (!rowCount) {
    await client.query(`create database "${name}"`);
    console.log(`created database ${name}`);
  }
}

await client.end();
