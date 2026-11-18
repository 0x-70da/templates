# Next.js + Express GraphQL Monorepo Template

A production-ready Turborepo monorepo featuring **Next.js 16** (App Router, React 19, Tailwind CSS v4, Base UI) and **Express 5** powered by **GraphQL Yoga**, **DataLoader**, **Drizzle ORM v1**, **PostgreSQL**, and **Better Auth**.

## Features

- **GraphQL Yoga on Express 5**: Modern GraphQL execution engine mounted at `/graphql`.
- **DataLoader Integration**: N+1 query prevention pattern with per-request DataLoader instances.
- **Service & Query Layering**: Clean separation of concerns (`Resolver -> Service -> Query -> Database`).
- **GraphQL Code Generator**: Automated client-side type and operation generation from server SDL.
- **Turborepo Workspace**: Shared UI components (`@workspace/ui`), TypeScript configs (`@workspace/typescript-config`), types, and validation schemas.
- **Modern Tooling**: Oxlint, Prettier, Husky, lint-staged, and Vitest.

## Quick Start

```bash
# Install all dependencies across the monorepo
pnpm install

# Start PostgreSQL container
pnpm db:up

# Run Next.js and Express concurrently
pnpm dev

# Quality checks
pnpm lint:ci
pnpm typecheck
pnpm test
pnpm build
```

- Web Client: `http://localhost:3000`
- GraphQL API & GraphiQL Playground: `http://localhost:5000/graphql`
- Healthcheck: `http://localhost:5000/health`
