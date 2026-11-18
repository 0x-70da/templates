# AGENTS.md (Next.js + Express Microservices with tRPC)

This repository contains two **independent microservices** communicating via **tRPC v11**:

1. `client/`: Next.js 16 frontend with TanStack Query and `@trpc/react-query`.
2. `server/`: Express 5 backend with `@trpc/server` procedures, Drizzle ORM v1, and PostgreSQL.

---

## 1. Working Agreement

1.1 Follow the instructions in this file and in each service's `AGENTS.md`.
1.2 Never introduce `@workspace/*` dependencies or cross-service runtime dependencies.
1.3 Shared API contracts are maintained in `client/contracts` and `server/src/contracts`. Run `pnpm test:contract` to verify synchronization.
1.4 Run `pnpm lint:ci`, `pnpm typecheck`, and `pnpm test` across all services before completing tasks.

---

## 2. Directory Layout

```
next-express-micro-trpc/
├── client/                   # Independent Next.js 16 + tRPC client
├── server/                   # Independent Express 5 + tRPC server
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
3.1 **Routers & Procedures over Controllers & Routes**:

- _Rule Changed_: Express controllers and routes are replaced by tRPC procedures and routers (`src/routers/`).
- _Why_: tRPC provides direct end-to-end typed RPCs with automatic type inference, eliminating duplicate DTO mapping.
  3.2 **Direct Procedure Calling over Hand-written Requests**:
- _Rule Changed_: Hand-written `requests/<domain>/<name>.ts` fetch wrappers in the client are replaced by `trpc.<domain>.<procedure>` hooks and `trpcCaller` invocations.
- _Why_: Manually wrapping every endpoint in a fetch function destroys tRPC's end-to-end type inference and breaks TanStack Query cache invalidation helpers.
  3.3 **Middleware & Procedure Authorization**:
- _Rule Changed_: Express auth middleware is replaced by tRPC procedure middleware (`protectedProcedure`, `adminProcedure`).
- _Why_: Procedure middleware attaches typed context (`ctx.user`, `ctx.session`) directly to procedure handlers.
  3.4 **Error Handling via TRPCError**:
- _Rule Changed_: `AppError` and manual `lib/response.ts` wrappers are replaced by `TRPCError`.
- _Why_: tRPC formats errors and status codes across the wire into typed client error objects.
  3.5 **Service-Query Layering Preserved**:
- Procedures strictly validate inputs using Zod schemas and delegate business logic to `services/`, which interact with `queries/`.
