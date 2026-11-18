import { createYoga } from "graphql-yoga";
import { schema } from "./schema";
import { buildGraphQLContext } from "./context";
import type { Request, Response } from "express";

export const yoga = createYoga<{ req: Request; res: Response }>({
  schema,
  context: async ({ req, res }) => buildGraphQLContext(req, res),
  graphqlEndpoint: "/graphql",
});
