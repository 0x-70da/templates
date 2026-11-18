# AGENTS.md (Root)

This is a Turborepo monorepo (pnpm workspaces) featuring a **React Router v7 Framework Mode** client and an **Express 5** backend.
App-specific rules live in:

- `apps/client/AGENTS.md` — React Router v7 frontend
- `apps/server/AGENTS.md` — Express backend

Read this file first, then the file of the app you are working in. If rules conflict, the more specific file wins.

---

## 1. Working Agreement

1.1 Follow the instructions in these files strictly.
1.2 Never guess when something is unclear. Ask first.
1.3 If there is any conflict, question, or anything related that affects the task, notify the owner before starting work.
1.4 Put the right file in the right location with the right name.
1.5 Do not take shortcuts that skip a rule.

---

## 2. Repository Structure

```
react-router-express/
├── apps/
│   ├── client/              # React Router v7 Framework Mode (see apps/client/AGENTS.md)
│   └── server/              # Express 5 app (see apps/server/AGENTS.md)
├── packages/
│   ├── types/               # @workspace/types      -> shared types & contracts
│   ├── typescript-config/   # Shared tsconfig bases
│   ├── ui/                  # @workspace/ui         -> ALL shadcn components live here
│   └── validation/          # @workspace/validation -> shared zod schemas
├── AGENTS.md
├── docker-compose.yaml
├── docker-compose.dev.yaml
├── oxlint.config.ts         # Oxlint (linting) config
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

2.1 There is **no** shared ESLint config. Linting is done with Oxlint from the root (`pnpm lint:ci`).

---

## 3. Shared Packages and Contracts

3.1 Client and server must stay compatible. Use the shared packages as the single source of truth:
- Shared types and contract types -> `@workspace/types` (`packages/types`)
- Zod schemas -> `@workspace/validation` (`packages/validation`)
- Shared UI (shadcn) -> `@workspace/ui` (`packages/ui`)

3.2 Never duplicate a type or schema in both apps. If both sides need it, it belongs in a package.
3.3 When you change a shared contract, update **both** client and server usages in the same task.
3.4 shadcn is used with **Base UI** (`@base-ui/react`). Every shadcn component is installed into `@workspace/ui`, never directly into an app.
3.5 If a needed zod schema does not exist yet, create it in `@workspace/validation`. Never write an inline or local schema.

---

## 4. TypeScript Rules

4.1 **Never use `any`.** Use proper types, generics, or `unknown` with narrowing.
4.2 Generic helper functions require you to pass the proper type. Never leave them untyped.
4.3 Props types of a component live in the same file as the component, not in a separate file.
4.4 Shared types go to `@workspace/types`; app-only types go in the app's own `types/` folder.

---

## 5. Validation

5.1 Zod is used for validation on both client and server.
5.2 Schemas are always imported from `@workspace/validation`. Never define a schema locally.
5.3 Never write manual validation with `if/else` chains when a zod schema can do the job.

---

## 6. Code Quality (Global)

6.1 Keep logic separate. Every piece of logic gets its own function. Do not write logic directly inside a route component, page, or controller.
6.2 Use clear, descriptive names for functions, components, queries, services, controllers, and everything else.
6.3 Keep code simple, human-readable, scalable, maintainable, and clean.
6.4 Prefer small, single-purpose functions over long ones.
6.5 **No spaghetti code.** Functions that perform multiple steps must be composed of single-responsibility helper functions.

---

## 7. Naming Conventions

| Kind                      | Pattern                     | Example                       |
| ------------------------- | --------------------------- | ----------------------------- |
| Controller                | `xY.controller.ts`          | `getTest.controller.ts`       |
| Service                   | `xY.service.ts`             | `getTest.service.ts`          |
| Query                     | `xY.query.ts`               | `getTest.query.ts`            |
| Routes (server)           | `xY.routes.ts`              | `test.routes.ts`              |
| Route module (client)     | `xY.tsx`                    | `test.tsx`                    |
| Middleware                | `xY.middleware.ts`          | `auth.middleware.ts`          |
| Request                   | `xY.ts`                     | `getTest.ts`                  |
| Types                     | `xY.types.ts`               | `test.types.ts`               |
| Store                     | `xY.store.ts`               | `test.store.ts`               |
| Component                 | `XY.tsx`                    | `TestCard.tsx`                |
| Skeleton                  | `XYSkeleton.tsx`            | `TestSkeleton.tsx`            |
| Hook                      | `useXY.ts`                  | `useTest.ts`                  |
| Unit test                 | `<source file>.test.ts(x)`  | `test.service.test.ts`        |
| Integration test (server) | `<source file>.int.test.ts` | `app.int.test.ts`             |

---

## 8. Organization

8.1 There is **no `features/` system**. Both apps are organized **by kind of file** at the root of `app/` (client) and `src/` (server), with domain sub-folders inside folders that hold multiple domain files.

---

## 9. Deviations from next-express

9.1 **Frontend Framework**: The client is built with **React Router v7 Framework Mode** (`apps/client/app`), replacing Next.js App Router.
9.2 **Routing**: Configured via `apps/client/app/routes.ts` using `@react-router/dev/routes` (`index`, `route`), with route modules in `app/routes/`.
9.3 **Data Fetching**: Route data loading uses route `loader` functions and typed request functions (`app/requests/<domain>/`) calling the Express REST API.
9.4 **Form Mutations**: Route mutations use route `action` functions and React Router `Form` components, with input validated against Zod schemas from `@workspace/validation`.
9.5 **State Management**: Client global state uses **Zustand + Immer** (`app/stores/`).
