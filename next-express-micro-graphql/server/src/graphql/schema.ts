import { createSchema } from "graphql-yoga";
import { resolvers } from "@/resolvers/index";
import fs from "node:fs";
import path from "node:path";

const typeDefs = fs.readFileSync(
  path.resolve(import.meta.dirname, "../contracts/schema.graphql"),
  "utf-8",
);

export const schema = createSchema({
  typeDefs,
  resolvers,
});
