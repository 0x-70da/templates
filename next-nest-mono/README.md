# Next.js + NestJS Monorepo Template

A production-ready Turborepo monorepo featuring **Next.js 16** (App Router, React 19, Tailwind CSS v4, Base UI) and **NestJS 11** with **Drizzle ORM v1**, **PostgreSQL**, and **Better Auth**.

## Features

- **NestJS 11 Application**: Clean modular architecture with controllers, services, queries, validation pipes, and exception filters.
- **Next.js 16 Client**: Modern React 19 App Router frontend with TanStack Query and Zustand.
- **Service & Query Layering**: Dependency injection with clear separation of concerns (`Controller -> Service -> Query -> Database`).
- **Database & Auth**: PostgreSQL managed via Drizzle ORM v1 with Better-Auth integration.
- **Turborepo Workspace**: Shared UI components (`@workspace/ui`), TypeScript configs (`@workspace/typescript-config`), types (`@workspace/types`), and validation schemas (`@workspace/validation`).
- **Modern Tooling**: Oxlint, Prettier, Husky, lint-staged, and Vitest.

## Quick Start

```bash
# Install all dependencies across the monorepo
pnpm install

# Start PostgreSQL container
pnpm db:up

# Run Next.js and NestJS concurrently
pnpm dev

# Quality checks
pnpm lint:ci
pnpm typecheck
pnpm test
pnpm build
```
