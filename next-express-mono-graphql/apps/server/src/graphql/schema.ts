import { createSchema } from "graphql-yoga";
import { resolvers } from "@/resolvers/index";

export const typeDefs = /* GraphQL */ `
  type Test {
    id: ID!
    test: String!
  }

  type Query {
    getTest(id: ID!): Test
    health: String!
  }
`;

export const schema = createSchema({
  typeDefs,
  resolvers,
});
