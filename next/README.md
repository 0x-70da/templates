# Next.js Full-Stack Template

A clean, production-grade Next.js 16 full-stack template featuring App Router, Server Actions, Drizzle ORM v1, PostgreSQL, Better Auth, and shadcn Base UI.

## Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Database & ORM**: PostgreSQL, Drizzle ORM v1, `pg` (node-postgres)
- **Authentication**: Better Auth with Drizzle adapter and admin plugin
- **Server Architecture**: Server Actions -> Services -> Queries (with `server-only`)
- **Forms & Validation**: React Hook Form + Zod
- **Components & Styling**: shadcn Base UI (`@base-ui/react`), Tailwind CSS v4
- **Tooling**: Oxlint (type-aware), Prettier, Husky, lint-staged
- **Testing**: Vitest + Testing Library

## Getting Started

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Start the database:

   ```bash
   pnpm db:up
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Run the development server:

   ```bash
   pnpm dev
   ```

5. Run checks:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test:unit
   pnpm build
   ```
