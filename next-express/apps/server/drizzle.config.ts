import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  out: "./src/db/migrations",
  schema: ["./src/db/schema.ts", "./src/db/auth-schema.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
