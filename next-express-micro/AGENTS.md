# AGENTS.md (Next.js + Express Microservices)

This repository contains two **independent microservices** in one repo:

1. `client/`: Next.js 16 App Router frontend.
2. `server/`: Express 5 REST API backend.

Each service is completely self-contained with its own `package.json`, lockfile, Dockerfile, and verification commands.

---

## 1. Working Agreement

1.1 Follow the instructions in this file and in each service's `AGENTS.md`.
1.2 Never introduce `@workspace/*` dependencies or cross-service runtime dependencies.
1.3 Shared API contracts are maintained in `client/contracts` and `server/src/contracts`. Run `pnpm test:contract` to verify synchronization.
1.4 Run `pnpm lint:ci`, `pnpm typecheck`, and `pnpm test` across all services before completing tasks.

---

## 2. Directory Layout

```
next-express-micro/
├── client/                   # Independent Next.js 16 frontend
├── server/                   # Independent Express 5 backend
├── scripts/
│   └── check-contracts.ts    # Drift check ensuring contract sync
├── docker-compose.yaml       # Multi-container production deployment with healthchecks
├── docker-compose.dev.yaml   # Local PostgreSQL development container
├── package.json              # Root orchestration scripts
├── AGENTS.md
└── README.md
```

---

## 3. Microservice Contract Management

3.1 Both services maintain their own local copy of shared contracts (`client/contracts/` and `server/src/contracts/`).
3.2 Whenever an endpoint or validation schema changes:

1. Update `server/src/contracts/<domain>.types.ts` and `<domain>.validation.ts`.
2. Update `client/contracts/<domain>.types.ts` and `<domain>.validation.ts`.
3. Run `pnpm test:contract` to ensure 0 drift.
   3.3 The drift-check script runs during `pnpm test` to block uncoordinated API changes.

---

## 4. Container Health & Orchestration

4.1 The server provides a `/health` endpoint that pings PostgreSQL.
4.2 Docker Compose (`docker-compose.yaml`) specifies healthcheck dependencies:

- `server` starts after `postgres` is healthy.
- `client` starts after `server` is healthy.
  4.3 Graceful shutdown in Express releases the HTTP listener and database pool on `SIGTERM` and `SIGINT`.

---

## 5. Deviations from next-express

5.1 **Decoupled Architecture**: No Turborepo or monorepo workspace dependencies. Each service can be deployed, scaled, or developed independently.
5.2 **Contract Strategy**: Uses synchronized contract directories validated by `pnpm test:contract` instead of a monorepo shared package.
5.3 **Resilience**: Independent Dockerfiles, container healthcheck integration in `docker-compose.yaml`, and server graceful shutdown handlers.
