# Next.js + NestJS Microservices Template

A production-ready microservices template featuring **Next.js 16** (App Router, React 19, Tailwind CSS v4, Base UI) and **NestJS 11** with **Drizzle ORM v1**, **PostgreSQL**, and **Better Auth**.

## Features

- **Decoupled Architecture**: Fully isolated `client/` and `server/` microservices with independent `package.json`, lockfiles, and multi-stage Docker builds.
- **Contract Drift Verification**: Automated synchronization checks via `scripts/check-contracts.ts` (`pnpm test:contract`).
- **NestJS 11 Backend**: Enterprise modular architecture with Dependency Injection, Controllers, Services, Queries, Zod Validation Pipes, and Exception Filters.
- **Next.js 16 Frontend**: React 19 App Router with TanStack Query and Zustand.
- **Health Checks & Resilience**: Database ping on server `GET /health`, route handler on client `GET /api/health`, and graceful shutdown handlers on `SIGTERM`/`SIGINT`.
- **Docker Compose**: Orchestration with healthcheck dependency chains (`postgres` -> `server` -> `client`).
- **Modern Tooling**: Oxlint, Prettier, Husky, lint-staged, and Vitest.

## Quick Start

```bash
# Run both services concurrently in development
pnpm dev

# Quality checks across services
pnpm lint:ci
pnpm typecheck
pnpm test

# Verify contract synchronization
pnpm test:contract

# Build both microservices
pnpm build

# Run via Docker Compose
pnpm docker:up
```
