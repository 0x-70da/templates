# AGENTS.md (Server - GraphQL Monorepo)

This is an **Express 5 + GraphQL Yoga** server inside a Turborepo monorepo with Drizzle ORM v1, PostgreSQL, Better Auth, and DataLoader.

---

## 1. Working Agreement

1.1 Follow the instructions in this file strictly.
1.2 Never guess when something is unclear. Ask first.
1.3 Put the right file in the right location with the right name.
1.4 Always run `pnpm typecheck`, `pnpm lint:ci`, and `pnpm test` before declaring work done.

---

## 2. Project Structure

```
apps/server/
├── src/
│   ├── graphql/              # GraphQL Yoga setup, schema SDL, context, dataloaders
│   │   ├── dataloaders/      # DataLoader instances for batching/caching
│   │   ├── context.ts        # GraphQL context with auth session and loaders
│   │   ├── schema.graphql    # GraphQL SDL schema
│   │   ├── schema.ts         # createSchema with typeDefs & resolvers
│   │   └── yoga.ts           # Yoga instance mounted at /graphql
│   ├── resolvers/            # Query, Mutation, and field resolvers
│   ├── services/             # Business logic layer
│   ├── queries/              # Database access layer (Drizzle queries)
│   ├── db/                   # Drizzle schema, relations, and connection
│   ├── lib/                  # Helpers (auth, errors, nullToUndefined)
│   ├── tests/                # Unit and integration tests
│   ├── app.ts                # Express app configuration & /health endpoint
│   └── server.ts             # Server entry point
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## 3. GraphQL Architectural Rules & Deviations from next-express

3.1 **Resolvers over Controllers**:

- Express REST controllers and route files are replaced by **GraphQL Resolvers** (`src/resolvers/`).
- Resolvers validate arguments with `@workspace/validation` schemas, then delegate to `services/`.
  3.2 **Layering Preserved**:
- `Resolver -> Service -> Query -> Database`. Resolvers never access database queries directly.
  3.3 **N+1 Prevention with DataLoader**:
- Batching and caching are handled via **DataLoader** in `src/graphql/dataloaders/` injected via context.
  3.4 **Error Handling**:
- Errors are thrown using `GraphQLError` with structured codes (`BAD_USER_INPUT`, `NOT_FOUND`, `UNAUTHENTICATED`).
  3.5 **Healthcheck**:
- Express `/health` endpoint remains available for infrastructure container health checks.
