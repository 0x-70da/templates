# Express Template

A clean, production-ready Express 5 backend template following the layered domain architecture of `next-express`.

## Stack

- **Runtime & Server**: Node.js (`>=24`), Express 5, TypeScript
- **Database & ORM**: PostgreSQL, Drizzle ORM v1, `pg` (node-postgres)
- **Authentication**: Better Auth with Drizzle adapter and admin plugin
- **Validation**: Zod
- **Tooling**: Oxlint (type-aware), Prettier, Husky, lint-staged, tsup
- **Testing**: Vitest, Supertest (unit + integration test split)

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

## Scripts

- `pnpm dev` - Start dev server with tsx watch
- `pnpm build` - Build production bundle with tsup
- `pnpm start` - Run built server
- `pnpm typecheck` - Run `tsc --noEmit`
- `pnpm lint` - Run Oxlint
- `pnpm format:check` - Check code formatting with Prettier
- `pnpm test` - Run all Vitest tests
- `pnpm test:unit` - Run unit tests
- `pnpm test:int` - Run integration tests (requires PostgreSQL)
- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Apply Drizzle migrations
- `pnpm auth:generate` - Generate Better Auth schema
