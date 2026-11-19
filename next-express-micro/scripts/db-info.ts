// scripts/db-info.ts   (pnpm db:info <app>   e.g. pnpm db:info test-service)
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";
import pg from "pg";

const app = process.argv[2];
if (!app) {
  console.error("Usage: pnpm db:info <app-dir>   (e.g. test-service)");
  process.exit(1);
}

const envFile = path.resolve(import.meta.dirname, "..", "apps", app, ".env");
const fileUrl = existsSync(envFile)
  ? parseEnv(readFileSync(envFile, "utf8")).DATABASE_URL
  : undefined;
const shellUrl = process.env.DATABASE_URL;
const effective = shellUrl ?? fileUrl; // dotenv مش بيكتب فوق متغيرات الـ shell

const mask = (value: string | undefined): string => {
  if (!value) return "(not set)";
  const url = new URL(value);
  if (url.password) url.password = "***";
  return url.toString();
};

console.log(`apps/${app}/.env  DATABASE_URL = ${mask(fileUrl)}`);
console.log(`shell/system      DATABASE_URL = ${mask(shellUrl)}`);
if (shellUrl && fileUrl && shellUrl !== fileUrl) {
  console.log(
    "\n⚠ The shell/system variable OVERRIDES .env (dotenv never overwrites). drizzle-kit and the app will use it.",
  );
}
if (!effective) {
  console.error("\nNo DATABASE_URL anywhere.");
  process.exit(1);
}
console.log(`\neffective target = ${mask(effective)}\n`);

const client = new pg.Client({ connectionString: effective });
await client.connect();
const info = await client.query<{
  db: string;
  addr: string | null;
  port: number | null;
  version: string;
}>(
  "select current_database() as db, inet_server_addr()::text as addr, inet_server_port() as port, split_part(version(), ' on ', 1) as version",
);
const tables = await client.query<{ tablename: string }>(
  "select tablename from pg_tables where schemaname = 'public' order by 1",
);
const journal = await client
  .query<{ n: number }>('select count(*)::int as n from "drizzle"."__drizzle_migrations"')
  .then((r) => r.rows[0]?.n ?? 0)
  .catch(() => "no drizzle migrations table");
await client.end();

console.log("connected to   :", info.rows[0]);
console.log("public tables  :", tables.rows.map((r) => r.tablename).join(", ") || "(none)");
console.log("migrations run :", journal);
