# AGENTS.md (React Vite SPA)

This is a standalone React single-page application (SPA) built with Vite, React 19, React Router v7, and Tailwind CSS.
It adapts the frontend architecture from `next-express` for client-side SPA development without Turborepo or Next.js App Router.

> How to extend this file: add a new numbered section at the bottom, or a new numbered rule inside the matching section. Keep each rule short and actionable.

---

## 1. Stack

1.1 Vite, React 19, TypeScript, Tailwind CSS v4.
1.2 Router: **React Router v7** in library mode (`react-router-dom`).
1.3 Server-State: **TanStack Query v5** (`@tanstack/react-query`) wrapping the requests layer.
1.4 Client-Side State: **Zustand with Immer** (`zustand/middleware/immer`).
1.5 Forms: `react-hook-form` with `@hookform/resolvers/zod`.
1.6 Components: **shadcn with Base UI** (`@base-ui/react`), installed locally in `src/components/ui`.
1.7 Auth: `better-auth` client in `src/lib/auth-client.ts`.
1.8 Testing: **Vitest** + Testing Library in a `jsdom` environment.
1.9 Tooling: Oxlint (type-aware) + Prettier + Husky + lint-staged.

---

## 2. Deviations from next-express

2.1 **No Server Components or `app/` Directory:** As a client-side SPA, there is no Next.js App Router, SSR, or RSC streaming.
- Replaced by: **React Router v7** declarative routes in `src/router.tsx` and views in `src/pages/`.
2.2 **Data Fetching:** No server-component data fetching or Next.js `use cache`.
- Replaced by: **TanStack Query v5** (`useQuery`, `useMutation`) consuming typed functions in `src/requests/<domain>/`.
2.3 **Error & Not-Found Boundaries:** No Next.js `error.tsx` or `not-found.tsx`.
- Replaced by: `errorElement: <RouteErrorBoundary />` in React Router and a catch-all `*` route for 404 pages.
2.4 **Standalone Packages:** No `@workspace/types` or `@workspace/validation`.
- Replaced by: Local top-level `src/types/` and `src/validation/`.

---

## 3. Structure (Root-Level Folders with Domain Sub-Folders)

```
react/
├── src/
│   ├── components/
│   │   ├── helper-components/     # ThemeProvider, ThemeToggle, etc.
│   │   ├── ui/                    # shadcn Base UI primitives (button, dialog, etc.)
│   │   └── <domain>/              # XY.tsx domain components and XYSkeleton.tsx
│   ├── constants/                 # flat constant files
│   ├── hooks/                     # flat hook files (useXY.ts)
│   ├── lib/
│   │   ├── api.ts                 # generic HTTP request wrapper
│   │   ├── auth-client.ts         # better-auth client
│   │   └── utils.ts               # cn helper
│   ├── pages/                     # top-level page components (composed of domain components)
│   ├── requests/
│   │   └── <domain>/              # typed request functions calling lib/api.ts
│   ├── stores/
│   │   └── <domain>/              # zustand + immer stores: xY.store.ts
│   ├── types/                     # app and domain types: xY.types.ts
│   ├── validation/                # zod schemas: xY.validation.ts
│   ├── router.tsx                 # React Router v7 configuration
│   ├── App.tsx                    # Root providers (QueryClient, Theme, Router)
│   ├── main.tsx                   # DOM entry point
│   └── globals.css                # Tailwind CSS v4 variables and styles
├── test/                          # Unit and component tests per domain
│   ├── <domain>/                  # <source file>.test.ts(x)
│   └── stores/                    # store tests
├── Dockerfile
├── oxlint.config.ts               # Oxlint configuration
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── vitest.setup.ts
```

3.1 `components/<domain>/`, `requests/<domain>/`, and `stores/<domain>/` contain one sub-folder per domain.
3.2 **One unit per file:** one component per file, one request per file, one store per file, one hook per file.
3.3 Never call `lib/api.ts` directly from components. All API requests go through `src/requests/<domain>/`.

---

## 4. State Management (Zustand + Immer)

4.1 Client-only state (cart, drawer state, multi-step flows) uses **Zustand with Immer**.
4.2 Never use `createContext` / `useContext` for application state.
4.3 Server-cached state belongs in TanStack Query, not copied into Zustand.
4.4 One store per file: `src/stores/<domain>/xY.store.ts`, exporting `useXYStore`.

---

## 5. Forms and Validation

5.1 Every form uses `react-hook-form` with `@hookform/resolvers/zod`.
5.2 Zod schemas live in `src/validation/<domain>.validation.ts`. Never define inline schemas.
5.3 No manual `useState` for form fields, errors, or loading flags. Use `register`, `handleSubmit`, `formState.errors`, and `formState.isSubmitting`.

---

## 6. Tooling & Commands

| Command             | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `pnpm install`      | Install dependencies and configure Husky          |
| `pnpm dev`          | Start Vite dev server                             |
| `pnpm build`        | Build production SPA to `dist/`                   |
| `pnpm preview`      | Preview production build locally                  |
| `pnpm lint`         | Run type-aware Oxlint                             |
| `pnpm lint:fix`     | Run Oxlint with autofix                           |
| `pnpm lint:ci`      | Run Oxlint in strict CI mode (`--deny-warnings`)  |
| `pnpm format`       | Run Prettier formatting                           |
| `pnpm format:check` | Check Prettier formatting (read-only)             |
| `pnpm typecheck`    | Run `tsc --noEmit`                                |
| `pnpm test`         | Run Vitest tests                                  |
| `pnpm test:watch`   | Vitest watch mode                                 |

---

## 7. Self-Check Before Reporting a Task as Done

7.1 Does every form use `react-hook-form` + `zodResolver` with a schema from `src/validation/`?
7.2 Is client-side state managed with Zustand + Immer (no React Context for app state)?
7.3 Do all API calls go through `src/requests/<domain>/` functions?
7.4 Are shadcn Base UI primitives used without Radix UI?
7.5 Does every route handle errors with `errorElement` and 404 with `*`?
7.6 Do `pnpm lint`, `pnpm typecheck`, and `pnpm test` pass cleanly?
