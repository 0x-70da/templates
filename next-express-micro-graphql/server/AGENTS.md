# AGENTS.md (Microservice Server - GraphQL)

This is an **Express 5 + GraphQL Yoga** microservice backend template built with TypeScript, Drizzle ORM v1, PostgreSQL, Better Auth, and DataLoader.

---

## 1. Working Agreement

1.1 Follow the instructions in this file strictly.
1.2 Never guess when something is unclear. Ask first.
1.3 Put the right file in the right location with the right name.
1.4 Always run `pnpm typecheck`, `pnpm lint:ci`, and `pnpm test` before declaring work done.

---

## 2. Project Structure

```
server/
├── src/
│   ├── contracts/            # Explicit contract types and SDL schema
│   │   ├── schema.graphql    # GraphQL schema definition
│   │   ├── test.types.ts
│   │   └── test.validation.ts
│   ├── graphql/              # GraphQL Yoga setup, context, dataloaders
│   │   ├── dataloaders/      # DataLoader instances
│   │   ├── context.ts        # Request context & Better Auth session
│   │   ├── schema.ts         # createSchema with resolvers & SDL
│   │   └── yoga.ts           # Yoga instance mounted at /graphql
│   ├── resolvers/            # Query, Mutation, and field resolvers
│   ├── services/             # Business logic layer
│   ├── queries/              # Database access layer (Drizzle queries)
│   ├── db/                   # Drizzle schema, relations, and connection
│   ├── lib/                  # Helpers (auth, errors, nullToUndefined)
│   ├── tests/                # Unit and resolver tests
│   ├── app.ts                # Express app configuration & /health endpoint
│   └── server.ts             # Server entry point with graceful shutdown
├── Dockerfile                # Multi-stage production container
├── package.json
└── tsconfig.json
```

---

## 3. GraphQL Architectural Rules & Deviations from next-express

3.1 **Resolvers over Controllers**:

- Express REST controllers and routes are replaced by **GraphQL Resolvers** (`src/resolvers/`).
- Resolvers validate arguments using Zod schemas (`src/contracts/`) and delegate to `services/`.
  3.2 **Layering Preserved**:
- `Resolver -> Service -> Query -> Database`. Resolvers never execute database queries directly.
  3.3 **Batch Loading via DataLoader**:
- DataLoader instances in `src/graphql/dataloaders/` prevent N+1 queries.
  3.4 **Native GraphQLError**:
- Uses `GraphQLError` with extension codes (`BAD_USER_INPUT`, `NOT_FOUND`, `UNAUTHENTICATED`).
  3.5 **Healthcheck & Resilience**:
- Express `/health` endpoint checks database connectivity.
- Graceful shutdown handles `SIGTERM` and `SIGINT`.
