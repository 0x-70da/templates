// src/db/relations.ts
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  categories: {
    todos: r.many.todos(),
  },
  todos: {
    category: r.one.categories({
      from: r.todos.categoryId,
      to: r.categories.id,
    }),
  },
}));
