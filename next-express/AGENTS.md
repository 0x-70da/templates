# AGENTS.md (Root)

This is a Turborepo monorepo (pnpm workspaces). This file holds the rules that apply to the **whole repo**.
App-specific rules live in:

- `apps/client/AGENTS.md` — Next.js frontend (its rules apply to **every Next.js app** in this repo, see section 11)
- `apps/server/AGENTS.md` — Express backend

Read this file first, then the file of the app you are working in. If rules conflict, the more specific file wins, but you must still notify the owner (see 1.3).

> How to extend this file: add a new numbered section at the bottom, or a new numbered rule inside the matching section. Keep each rule short and actionable.

---

## 1. Working Agreement

1.1 Follow the instructions in these files strictly.
1.2 Never guess when something is unclear. Ask first.
1.3 If there is any conflict, question, or anything related that affects the task, **notify the owner before starting work**.
1.4 Put the right file in the right location with the right name. Example: `ProductCard.tsx` goes in `app/products/components/ProductCard.tsx`; if it is used by more than 2 features, it goes in the root-level `components/products/ProductCard.tsx`.
1.5 Do not take shortcuts that skip a rule (e.g. "simpler" state, validation, or file layout). If a rule seems wrong for the task, notify the owner instead of ignoring it.

---

## 2. Repository Structure

```
next-express/
├── apps/
│   ├── client/              # Next.js app (see apps/client/AGENTS.md)
│   └── server/              # Express app (see apps/server/AGENTS.md)
├── packages/
│   ├── eslint-config/       # Shared ESLint configs
│   ├── types/               # @workspace/types      -> shared types & contracts
│   ├── typescript-config/   # Shared tsconfig bases
│   ├── ui/                  # @workspace/ui         -> ALL shadcn components live here
│   └── validation/          # @workspace/validation -> shared zod schemas
├── AGENTS.md
├── docker-compose.yml
├── docker-compose.dev.yml
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 3. Shared Packages and Contracts

3.1 Client and server must stay compatible. Use the shared packages as the single source of truth:

- Shared types and contract types -> `@workspace/types` (`packages/types`)
- Zod schemas -> `@workspace/validation` (`packages/validation`)
- Shared UI (shadcn) -> `@workspace/ui` (`packages/ui`)

3.2 Never duplicate a type or schema in both apps. If both sides need it, it belongs in a package.
3.3 When you change a shared contract, update **both** client and server usages in the same task.
3.4 shadcn is used with **Base UI** (not Radix UI). Every shadcn component is installed into `@workspace/ui`, never directly into an app. See the client file for details.
3.5 If a needed zod schema does not exist yet, create it in `@workspace/validation`. Never write an inline or local schema.

---

## 4. TypeScript Rules

4.1 **Never use `any`.** Use proper types, generics, or `unknown` with narrowing.
4.2 Generic helper functions (`apps/client/lib/api.ts`, `apps/server/src/lib/response.ts`) require you to pass the proper type. Never leave them untyped.
4.3 Props types of a component live in the same file as the component, not in a separate file.
4.4 Shared types go to `@workspace/types`; app-only types go in the feature's types location (see each app's file).

---

## 5. Validation

5.1 Zod is used for validation on both client and server.
5.2 Schemas are always imported from `@workspace/validation`. Never define a schema locally.
5.3 Where to import it is app-specific (see the client and server files).
5.4 Never write manual validation with `if/else` chains when a zod schema can do the job.

---

## 6. Code Quality (Global)

6.1 Keep logic separate. Every piece of logic gets its own function. Do not write logic directly inside a page, component, section, or controller.
6.2 Use clear, descriptive names for functions, components, queries, services, controllers, and everything else.
6.3 Keep code simple, human-readable, scalable, maintainable, and clean.
6.4 Prefer small, single-purpose functions over long ones.

---

## 7. Naming Conventions

| Kind       | Pattern            | Example                     |
| ---------- | ------------------ | --------------------------- |
| Controller | `xY.controller.ts` | `getProducts.controller.ts` |
| Service    | `xY.service.ts`    | `getProducts.service.ts`    |
| Query      | `xY.query.ts`      | `getProducts.query.ts`      |
| Routes     | `xY.routes.ts`     | `product.routes.ts`         |
| Middleware | `xY.middleware.ts` | `auth.middleware.ts`        |
| Utils      | `xY.ts`            | `formatPrice.ts`            |
| Request    | `xY.ts`            | `loginWithEmail.ts`         |
| Types      | `xY.types.ts`      | `product.types.ts`          |
| Store      | `xY.store.ts`      | `cart.store.ts`             |
| Component  | `XY.tsx`           | `ProductCard.tsx`           |
| Section    | `XYSection.tsx`    | `ProductListSection.tsx`    |
| Skeleton   | `XYSkeleton.tsx`   | `ProductListSkeleton.tsx`   |
| Hook       | `useXY.ts`         | `useProducts.ts`            |

(`xY` = camelCase, `XY` = PascalCase.)

---

## 8. Feature-Based Organization (Both Apps)

8.1 Both apps are organized **by feature**. Everything that belongs to a feature lives inside that feature's folder.
8.2 Anything (query, service, util, component, hook, request, store, type) used by **more than 2 features** moves to the proper root-level folder outside the feature folders.
8.3 Details per app are in the client and server files.
8.4 **One unit per file.** Never put several controllers, services, queries, requests, or utils in a single file. Each file holds one main exported function (private helpers used only by it may stay at the bottom of the same file). The folder holds many small files, not one big file.

---

## 9. Tooling

9.1 Package manager: **pnpm** (version from `packageManager` in `package.json`). Never use `npm` or `yarn`. Node `>=24`. Task runner: **Turborepo**.
9.2 Do not add dependencies without a reason. Install in the specific workspace that needs it, and use `workspace:*` for workspace packages.
9.3 Respect the shared ESLint and TypeScript configs from `packages/eslint-config` and `packages/typescript-config`.

---

## 10. Commands

Run commands from the repo root unless stated otherwise. To target one app use a path filter, e.g. `pnpm --filter ./apps/client typecheck` or `pnpm --filter ./apps/server typecheck`.

| Command          | What it does                                                                 |
| ---------------- | ---------------------------------------------------------------------------- |
| `pnpm install`   | Install all workspace dependencies                                           |
| `pnpm dev`       | Starts the dev DB (`predev` runs `db:up`), then `turbo run dev` for all apps |
| `pnpm build`     | `turbo run build` for all workspaces                                         |
| `pnpm lint`      | `turbo run lint`                                                             |
| `pnpm typecheck` | `turbo run typecheck`                                                        |
| `pnpm format`    | Prettier write on all `ts`, `tsx`, `md` files                                |
| `pnpm db:up`     | Start the dev Postgres container and wait until it is healthy                |
| `pnpm db:down`   | Stop and remove the dev containers                                           |

10.1 **After finishing any task that changes code, run `pnpm lint` and `pnpm typecheck`** (scoped to the changed app when only one app changed) and fix every error before reporting the task as done.
10.2 Format only the files you changed: `pnpm exec prettier --write <changed files>`. Run the full `pnpm format` only when asked.
10.3 Run `pnpm build` only when the change can affect the build (configs, dependencies, shared packages, routing/caching in Next.js), or when asked.
10.4 **Never run long-running or interactive commands** (`pnpm dev`, `start`, `db:studio`) unless the owner asks. They never exit.
10.5 `pnpm dev` needs Docker running, because `predev` starts the database. `db:up` runs automatically through `predev`; run `pnpm db:down` only when asked.
10.6 Ask before any destructive or state-changing command (`db:push`, `db:migrate`, `db:down`, deleting files or folders, force git operations).
10.7 Add dependencies with `pnpm add <pkg> --filter <workspace>` (for dev dependencies add `-D`). Never edit `pnpm-lock.yaml` by hand.

---

## 11. Adding a New App

11.1 If the owner asks to add another **Next.js** app next to `client` and `server`, build it with **exactly the same architecture, rules, and flow as `apps/client`**: same folder structure, features inside `app/`, pages composing sections, `Suspense` + skeletons, `error.tsx`/`not-found.tsx` per route and at the root, requests layer, `lib/api.ts`, zod + react-hook-form, zustand + immer for client state, caching rules, accessibility rules, and shadcn from `@workspace/ui`.
11.2 Create it at `apps/<app-name>/`. Copy `apps/client/AGENTS.md` into `apps/<app-name>/AGENTS.md` (change only the app name) so the rules stay identical. Future rule changes to the client file must be mirrored in the copies.
11.3 Use the same scripts as the client (`dev`, `build`, `start`, `lint`, `typecheck`, `shadcn`), the same shared configs (`@workspace/typescript-config`, `@workspace/eslint-config`), and the same workspace dependencies (`@workspace/ui`, `@workspace/validation`, `@workspace/types`). Give it its own unique dev port.
11.4 Reuse the shared packages. Do not copy shared code (types, schemas, UI) into the new app.
11.5 If the new app talks to `apps/server`, **notify the owner before starting**: the server's CORS (`CLIENT_URL`) and the better-auth trusted origins currently serve a single client and must be updated.
11.6 Also update what is needed for it to run with the repo: `turbo.json` if required, `Dockerfile`, and the `docker-compose` files. Ask the owner if unsure.
11.7 For any other kind of app (not Next.js), notify the owner before starting.
