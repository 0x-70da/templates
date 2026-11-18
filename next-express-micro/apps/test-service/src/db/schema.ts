import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const test = pgTable("test", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
