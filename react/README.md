# React SPA Template

A clean, production-ready React 19 Single Page Application (SPA) powered by Vite, React Router v7, and Tailwind CSS.

## Stack

- **Core**: React 19, Vite, TypeScript
- **Routing**: React Router v7 (`react-router-dom`)
- **Server State**: TanStack Query v5
- **Client State**: Zustand with Immer
- **Forms & Validation**: React Hook Form + Zod
- **Components**: shadcn with Base UI (`@base-ui/react`), Tailwind CSS v4
- **Tooling**: Oxlint (type-aware), Prettier, Husky, lint-staged
- **Testing**: Vitest + Testing Library (jsdom)

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Run tests and checks:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   pnpm build
   ```
