import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { relations } from "./relations";

const connectionString =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/micro_db";
const pool = new Pool({ connectionString });

export const db = drizzle({ client: pool, relations });
