import { GraphQLClient } from "graphql-request";

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:5000/graphql";

export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT);
