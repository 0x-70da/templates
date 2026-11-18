# React Router v7 + Express Monorepo Template

A production-ready Turborepo monorepo featuring a **React Router v7 Framework Mode** frontend and an **Express 5** REST API backend.

## Tech Stack

- **Monorepo**: Turborepo, pnpm workspaces
- **Frontend (`apps/client`)**: React Router v7 (Framework Mode with `loader` and `action` routes), React 19, Tailwind CSS v4, Base UI, Zustand + Immer
- **Backend (`apps/server`)**: Express 5, Better Auth, Drizzle ORM, PostgreSQL, Vitest, tsup
- **Packages**:
  - `@workspace/types`: Shared domain contracts and response helpers
  - `@workspace/validation`: Shared Zod schemas
  - `@workspace/ui`: Shared shadcn UI components built with Base UI
  - `@workspace/typescript-config`: Shared tsconfig presets
- **Tooling**: Oxlint, Prettier, Husky, lint-staged, Vitest

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `apps/server/.env` and `apps/client/.env`.

3. **Start Database**:
   ```bash
   pnpm db:up
   ```

4. **Run Development Mode**:
   ```bash
   pnpm dev
   ```

## Scripts

- `pnpm dev`: Start client and server concurrently with Turbo
- `pnpm build`: Build all packages and applications
- `pnpm lint:ci`: Check code quality with Oxlint (type-aware)
- `pnpm format:check`: Verify formatting with Prettier
- `pnpm typecheck`: Run TypeScript typechecks across all workspaces
- `pnpm test`: Run unit and integration test suites
