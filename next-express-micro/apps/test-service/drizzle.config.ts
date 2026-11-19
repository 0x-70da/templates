import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const target = new URL(url);
console.log(`[drizzle] target: ${target.hostname}:${target.port || "5432"}${target.pathname}`);

export default defineConfig({
  out: "./src/db/migrations",
  schema: ["./src/db/schema.ts"],
  dialect: "postgresql",
  dbCredentials: { url },
});
