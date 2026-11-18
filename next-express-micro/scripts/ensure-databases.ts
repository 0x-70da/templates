import { Client } from "pg";
import { readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const apps = await readdir(path.join(root, "apps"), { withFileTypes: true });
const databases = apps
  .filter((entry) => entry.isDirectory() && entry.name.endsWith("-service"))
  .map((entry) => entry.name.replace(/-/g, "_"));

const client = new Client({
  connectionString:
    process.env.DATABASE_ADMIN_URL ?? "postgresql://postgres:postgres@localhost:5432/postgres",
});
await client.connect();
for (const database of databases) {
  const escaped = database.replaceAll('"', '""');
  const exists = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [database]);
  if (exists.rowCount === 0) await client.query(`CREATE DATABASE "${escaped}"`);
}
await client.end();
