# AGENTS.md (Next.js + Express Microservices with GraphQL)

This repository contains two **independent microservices** communicating via **GraphQL**:

1. `client/`: Next.js 16 frontend with `graphql-request` and `@graphql-codegen/cli`.
2. `server/`: Express 5 backend with GraphQL Yoga, DataLoader, Drizzle ORM v1, and PostgreSQL.

---

## 1. Working Agreement

1.1 Follow the instructions in this file and in each service's `AGENTS.md`.
1.2 Never introduce `@workspace/*` dependencies or cross-service runtime dependencies.
1.3 Shared API contracts (SDL `schema.graphql`, types, and validation) are maintained in `client/contracts` and `server/src/contracts`. Run `pnpm test:contract` to verify synchronization.
1.4 Run `pnpm lint:ci`, `pnpm typecheck`, and `pnpm test` across all services before completing tasks.

---

## 2. Directory Layout

```
next-express-micro-graphql/
├── client/                   # Independent Next.js 16 + GraphQL client
├── server/                   # Independent Express 5 + GraphQL Yoga server
├── scripts/
│   └── check-contracts.ts    # Drift check ensuring contract sync
├── docker-compose.yaml       # Multi-container production deployment with healthchecks
├── docker-compose.dev.yaml   # Local PostgreSQL development container
├── package.json              # Root orchestration scripts
├── AGENTS.md
└── README.md
```

---

## 3. Deviations from next-express

Per the "technology wins over rules" principle:
3.1 **GraphQL Schema & Resolvers over REST Controllers & Routes**:

- _Rule Changed_: Express REST controllers and route files are replaced by GraphQL Yoga resolvers (`server/src/resolvers/`).
- _Why_: GraphQL allows declarative query selection and a consolidated endpoint (`/graphql`).
  3.2 **Batch Loading via DataLoader**:
- _Rule Changed_: Introduced DataLoader instances in GraphQL context (`server/src/graphql/dataloaders/`).
- _Why_: Solves the classic N+1 query problem in relational schema traversal.
  3.3 **Native GraphQLError Handling**:
- _Rule Changed_: Replaced `AppError` and manual REST response helpers with `GraphQLError`.
- _Why_: GraphQL-native clients expect errors formatted in the standard GraphQL error envelope.
  3.4 **Client GraphQL Requests & Codegen**:
- _Rule Changed_: Replaced REST fetch wrappers with `graphql-request` and GraphQL Code Generator (`@graphql-codegen/cli`).
- _Why_: Delivers typed operations and variables matching the server SDL schema.
  3.5 **Service-Query Layering Preserved**:
- Resolvers validate arguments with Zod schemas from `contracts/` and delegate business logic to `services/`, which interact with `queries/`.
