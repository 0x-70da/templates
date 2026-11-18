# Next.js + Express Microservices Template

An enterprise microservices template featuring an independent **Next.js 16** frontend and an independent **Express 5** REST API backend in a unified repository with Docker Compose orchestration and automated contract drift checking.

## Architecture

- **Independent Services**: `client/` and `server/` have separate `package.json` files, dependencies, build processes, and Dockerfiles.
- **Contract Sharing with Zero Drift**: Shared types and Zod schemas live in `client/contracts` and `server/src/contracts`, checked by `pnpm test:contract`.
- **Health Checks & Resilience**: Express `/health` pings PostgreSQL; Next.js `/api/health` validates frontend readiness; Docker Compose sequences container startup via health checks.
- **Graceful Shutdown**: Server cleanly closes HTTP connections and the PostgreSQL pool on termination signals (`SIGTERM`, `SIGINT`).
- **Modern UI & Backend**: Next.js 16 (App Router, React 19, Tailwind CSS v4, Base UI), Express 5 (Drizzle ORM v1, PostgreSQL, Better Auth).

## Quick Start

### 1. Development (Concurrent)

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

Frontend runs on `http://localhost:3000` and backend runs on `http://localhost:5000`.

### 2. Standalone Development

You can work on either service independently:

```bash
# Server only
cd server
pnpm dev

# Client only
cd client
pnpm dev
```

### 3. Verification & Contract Testing

```bash
# Run contract drift check
pnpm test:contract

# Run all quality checks across services
pnpm lint:ci
pnpm typecheck
pnpm test
pnpm build
```

### 4. Production Docker Deployment

```bash
pnpm docker:up
```
