// Drizzle tables
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const testTable = pgTable("test_table", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
