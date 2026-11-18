import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  out: "./db/migrations",
  schema: ["./db/schema.ts", "./db/auth-schema.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
