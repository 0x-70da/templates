# AGENTS.md

This is a pnpm/Turborepo monorepo. Read this file and the nearest app/package
`AGENTS.md` before changing code.

## Microservices rules

- `apps/gateway` is the only public API entry point; services are private.
- Every `apps/*-service` owns its database, Drizzle schema, migrations, and
  `DATABASE_URL`. Never create cross-service foreign keys.
- Apps never import one another. Shared runtime code belongs in `packages/*`;
  contracts belong in `packages/types` and `packages/validation`.
- Services use `requireInternal` before `requireAuth` or `requireAdmin`.
  Gateway-set identity headers are `x-user-id` and `x-user-role`; the gateway
  also sets `x-request-id` and `x-internal-secret`.
- “Cross-service communication: sync via `HTTP/REST`;
- Keep the backend layout: domain subfolders under `controllers`, `services`,
  `queries`, and `tests`; one unit per file; routes are in `routes/`.
- New services use `apps/<name>-service`, starting at the next free port after 4002.
- Keep `oxlint.config.ts`, `packages/typescript-config`, Prettier, Husky,
  lint-staged, and existing Docker/Drizzle conventions unchanged.

## Commands

Use pnpm. Run `pnpm lint`, `pnpm typecheck`, and targeted tests after code
changes. Use pnpm db:up for PostgreSQL.
