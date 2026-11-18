# AGENTS.md (Next.js + Express GraphQL Monorepo)

This is a Turborepo monorepo featuring **Next.js 16** (client) and **Express 5 + GraphQL Yoga** (server).

---

## 1. Working Agreement

1.1 Follow the instructions in this file and in each app's `AGENTS.md`.
1.2 Never guess when something is unclear. Ask first.
1.3 Always run `pnpm typecheck`, `pnpm lint:ci`, and `pnpm test` before declaring work done.

---

## 2. Deviations from next-express

Per the "technology wins over rules" principle:
2.1 **GraphQL Schema & Resolvers over REST Controllers & Routes**:

- _Rule Changed_: Express REST controllers and route files are replaced by GraphQL Yoga resolvers (`apps/server/src/resolvers/`).
- _Why_: GraphQL allows declarative query selection and consolidated endpoints (`/graphql`).
  2.2 **Batch Loading via DataLoader**:
- _Rule Changed_: Introduced DataLoader instances in GraphQL context (`src/graphql/dataloaders/`).
- _Why_: Solves the classic N+1 query problem inherent to relational GraphQL field execution.
  2.3 **Native GraphQLError Handling**:
- _Rule Changed_: Replaced `AppError` with `GraphQLError` carrying extension codes (`BAD_USER_INPUT`, `NOT_FOUND`).
- _Why_: GraphQL-native clients expect errors formatted in the standard GraphQL error envelope.
  2.4 **Client GraphQL Requests & Codegen**:
- _Rule Changed_: Replaced REST fetch wrappers with `graphql-request` and GraphQL Code Generator (`@graphql-codegen/cli`).
- _Why_: Delivers typed operations and variables matching the server SDL schema.
  2.5 **Service-Query Layering Preserved**:
- Resolvers validate arguments with `@workspace/validation` and delegate business logic to `services/`, which interact with `queries/`.
