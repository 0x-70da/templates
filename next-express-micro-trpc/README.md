# Next.js + Express Microservices with tRPC

An enterprise microservices template featuring an independent **Next.js 16** frontend and an independent **Express 5** backend communicating through **tRPC v11** with full end-to-end type safety, TanStack Query v5 integration, and contract drift verification.

## Features

- **End-to-End Type Safety**: Server procedures directly infer input and output types for the client.
- **Independent Services**: No Turborepo or monorepo packages. `client/` and `server/` have separate `package.json` files, lockfiles, and Dockerfiles.
- **Contract Drift Checking**: Shared contracts live in `client/contracts` and `server/src/contracts`, continuously validated by `pnpm test:contract`.
- **Server and Client Components**: Call tRPC in React Client Components via `trpc.<domain>.<procedure>.useQuery()` or in Server Components via `trpcCaller`.
- **Health Checks & Resilience**: Express `/health` pings PostgreSQL; Next.js `/api/health` validates frontend readiness; Docker Compose coordinates health status.

## Quick Start

### 1. Development

```bash
# Install dependencies in both services
cd server && pnpm install
cd ../client && pnpm install
cd .. && pnpm install

# Start development database
pnpm docker:dev

# Start both services concurrently
pnpm dev
```

Frontend runs on `http://localhost:3000` and tRPC backend runs on `http://localhost:5000/trpc`.

### 2. Quality & Contract Checks

```bash
# Verify contract synchronization
pnpm test:contract

# Run all quality checks across services
pnpm lint:ci
pnpm typecheck
pnpm test
pnpm build
```
