// scripts/db-reset.ts
// pnpm db:reset test-service auth-service     (يعمل reset للـ dev DB و _test DB لكل service)
// pnpm db:reset --all
import { readdirSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const ROOT = path.resolve(import.meta.dirname, "..");
const adminUrl =
  process.env.ADMIN_DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/postgres";

function fail(message: string): never {
  console.error(`✖ ${message}`);
  process.exit(1);
}

const admin = new URL(adminUrl);
if (
  !["localhost", "127.0.0.1", "[::1]"].includes(admin.hostname) ||
  process.env.NODE_ENV === "production"
) {
  fail(`Refusing to reset databases on "${admin.hostname}" (local development only)`);
}

const allServices = readdirSync(path.join(ROOT, "apps"), { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name.endsWith("-service"))
  .map((d) => d.name);

const args = process.argv.slice(2);
const requested = args.includes("--all") ? allServices : args.filter((a) => !a.startsWith("--"));
if (requested.length === 0)
  fail("Usage: pnpm db:reset <service...> | --all   (e.g. pnpm db:reset test-service)");

const unknown = requested.filter((s) => !allServices.includes(s));
if (unknown.length > 0)
  fail(`Unknown service(s): ${unknown.join(", ")}. Available: ${allServices.join(", ")}`);

const databases = requested.flatMap((service) => {
  const name = service.replaceAll("-", "_");
  return [name, `${name}_test`];
});
for (const name of databases)
  if (!/^[a-z0-9_]+$/.test(name)) fail(`Unsafe database name "${name}"`);

const client = new pg.Client({ connectionString: adminUrl });
await client.connect();
const server = await client.query<{ addr: string | null; port: number | null; version: string }>(
  "select inet_server_addr()::text as addr, inet_server_port() as port, split_part(version(), ' on ', 1) as version",
);
console.log("server:", server.rows[0]);

for (const name of databases) {
  await client.query(`drop database if exists "${name}" with (force)`);
  await client.query(`create database "${name}" template template0`);
  console.log(`reset ${name}`);
}
await client.end();

// تحقق: لازم كلهم فاضيين
for (const name of databases) {
  const url = new URL(adminUrl);
  url.pathname = `/${name}`;
  const check = new pg.Client({ connectionString: url.toString() });
  await check.connect();
  const { rows } = await check.query<{ n: number }>(
    "select count(*)::int as n from pg_tables where schemaname = 'public'",
  );
  await check.end();
  const count = rows[0]?.n ?? 0;
  console.log(`${name}: ${count} tables ${count === 0 ? "✔" : "✖ NOT EMPTY"}`);
  if (count !== 0) process.exitCode = 1;
}
