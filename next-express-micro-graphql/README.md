# Next.js + Express Microservices with GraphQL

An enterprise microservices template featuring an independent **Next.js 16** frontend and an independent **Express 5** backend communicating through **GraphQL Yoga** with **DataLoader**, **Drizzle ORM v1**, and automated schema contract drift checking.

## Features

- **GraphQL Yoga on Express 5**: Modern execution engine mounted at `/graphql`.
- **DataLoader N+1 Prevention**: Per-request DataLoader instances for efficient database batching.
- **Independent Services**: No Turborepo or monorepo packages. Separate `package.json`, lockfiles, and Dockerfiles.
- **Contract Drift Checking**: Shared `schema.graphql` and contract types live in `client/contracts` and `server/src/contracts`, continuously validated by `pnpm test:contract`.
- **GraphQL Code Generator**: Automated client-side type and operation generation from server SDL.
- **Health Checks & Resilience**: Express `/health` pings PostgreSQL; Next.js `/api/health` validates frontend readiness.

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

- Web Client: `http://localhost:3000`
- GraphQL API & GraphiQL Playground: `http://localhost:5000/graphql`
- Healthcheck: `http://localhost:5000/health`

### 2. Quality & Contract Checks

```bash
# Verify schema synchronization
pnpm test:contract

# Run all quality checks across services
pnpm lint:ci
pnpm typecheck
pnpm test
pnpm build
```
