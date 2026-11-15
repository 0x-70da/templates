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

2.1 There is **no** shared ESLint config. Linting is done with Oxlint from the root.

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
6.5 **No spaghetti code.** A function that does several things one after another is split: every distinct piece of logic becomes its own named function, and the main function only reads like a list of steps. Inside services, the helper functions live in the same file, below the main service function (see server section 14).
6.6 This applies to everything, and agents often forget it for auth-related code. Auth logic (reading the session, checking roles, ownership checks, error mapping) is isolated in its own functions too.

---

## 7. Naming Conventions

| Kind                      | Pattern                     | Example                       |
| ------------------------- | --------------------------- | ----------------------------- |
| Controller                | `xY.controller.ts`          | `getProducts.controller.ts`   |
| Service                   | `xY.service.ts`             | `getProducts.service.ts`      |
| Query                     | `xY.query.ts`               | `getProducts.query.ts`        |
| Routes                    | `xY.routes.ts`              | `product.routes.ts`           |
| Middleware                | `xY.middleware.ts`          | `auth.middleware.ts`          |
| Utils                     | `xY.ts`                     | `formatPrice.ts`              |
| Request                   | `xY.ts`                     | `loginWithEmail.ts`           |
| Types                     | `xY.types.ts`               | `product.types.ts`            |
| Store                     | `xY.store.ts`               | `cart.store.ts`               |
| Component                 | `XY.tsx`                    | `ProductCard.tsx`             |
| Section                   | `XYSection.tsx`             | `ProductListSection.tsx`      |
| Skeleton                  | `XYSkeleton.tsx`            | `ProductListSkeleton.tsx`     |
| Hook                      | `useXY.ts`                  | `useProducts.ts`              |
| Unit test                 | `<source file>.test.ts(x)`  | `createOrder.service.test.ts` |
| Integration test (server) | `<source file>.int.test.ts` | `app.int.test.ts`             |

(`xY` = camelCase, `XY` = PascalCase.) A test file is named after the file it tests, with `.test.ts` (or `.test.tsx` for components) added.

---

## 8. Feature-Based Organization (Both Apps)

8.1 Both apps are organized **by feature**. Everything that belongs to a feature lives inside that feature's folder.
8.2 Anything (query, service, util, component, hook, request, store, type) used by **more than 2 features** moves to the proper root-level folder outside the feature folders.
8.3 Details per app are in the client and server files.
8.4 **One unit per file.** Never put several controllers, services, queries, requests, or utils in a single file. Each file holds one main exported function (private helpers used only by it stay at the bottom of the same file). The folder holds many small files, not one big file.
8.5 Each feature has **exactly one** `controllers/`, one `services/`, one `queries/`, and one `utils/` folder (server), and each of these folders contains one file per unit. Do not create duplicate, nested, or per-entity folders for them.

---

## 9. Tooling

9.1 Package manager: **pnpm** (version from `packageManager` in `package.json`). Never use `npm` or `yarn`. Node `>=24`. TypeScript is installed at the root.
9.2 Task runner: **Turborepo**. It runs `build`, `dev`, `typecheck`, and `test`. **Lint and format do not go through Turborepo**; they run directly from the repo root.
9.3 **Linting: Oxlint** (type-aware, with `oxlint-tsgolint`), configured in `oxlint.config.ts` at the root. ESLint was removed: do not add ESLint, ESLint configs, or `eslint-disable` comments. Fix the cause of a lint error. Do not silence rules (including with `oxlint-disable` comments) and do not edit `oxlint.config.ts` without asking.
9.4 **Formatting: Prettier** with `prettier-plugin-tailwindcss`, which sorts Tailwind classes automatically. Do not reorder classes by hand and do not fight the formatter.
9.5 **Git hooks: Husky + lint-staged.** On commit, staged files get `oxlint --fix` and `prettier --write`. Never bypass hooks (no `--no-verify`). If a hook fails, fix the cause.
9.6 Shared TypeScript configs come from `packages/typescript-config`.
9.7 Do not add dependencies without a reason. Install in the specific workspace that needs it, and use `workspace:*` for workspace packages.

---

## 10. Commands

Run commands from the repo root unless stated otherwise. To target one app use a path filter, e.g. `pnpm --filter ./apps/client typecheck` or `pnpm --filter ./apps/server test`. **Lint and format are never per-app: always run them from the root.**

| Command             | What it does                                                                 |
| ------------------- | ---------------------------------------------------------------------------- |
| `pnpm install`      | Install all workspace dependencies (`prepare` sets up Husky)                 |
| `pnpm dev`          | Starts the dev DB (`predev` runs `db:up`), then `turbo run dev` for all apps |
| `pnpm build`        | `turbo run build` for all workspaces                                         |
| `pnpm lint`         | `oxlint --type-aware` on the whole repo (not through turbo)                  |
| `pnpm lint:fix`     | Same, with `--fix`                                                           |
| `pnpm lint:ci`      | Same, with `--deny-warnings` (warnings fail)                                 |
| `pnpm format`       | `prettier --write .` on the **whole repo**                                   |
| `pnpm format:check` | `prettier --check .` (read-only)                                             |
| `pnpm typecheck`    | `turbo run typecheck`                                                        |
| `pnpm test`         | `turbo run test` (client and server tests)                                   |
| `pnpm test:watch`   | `turbo run test:watch` (long-running)                                        |
| `pnpm db:up`        | Start the dev Postgres container and wait until it is healthy                |
| `pnpm db:down`      | Stop and remove the dev containers                                           |

10.1 **After finishing any task that changes code, run:** `pnpm lint` (root), `pnpm typecheck` and `pnpm test` (scoped to the changed app when only one app changed). Fix every error and every failing test before reporting the task as done.
10.2 `pnpm lint:ci` and `pnpm format:check` are the strict, read-only checks meant for CI. Treat lint warnings as errors.
10.3 `pnpm lint:fix` is allowed. Check the diff afterwards so it did not touch unrelated files.
10.4 Format only the files you changed: `pnpm exec prettier --write <changed files>`. Run the full `pnpm format` (whole repo) only when asked.
10.5 Run `pnpm build` only when the change can affect the build (configs, dependencies, shared packages, routing/caching in Next.js), or when asked.
10.6 **Never run long-running or interactive commands** (`pnpm dev`, `start`, `db:studio`, `test:watch`) unless the owner asks. They never exit.
10.7 `pnpm dev` and the server integration tests need the database. If it is not running, start it with `pnpm db:up` (safe). Run `pnpm db:down` only when asked.
10.8 Ask before any destructive or state-changing command (`db:push`, `db:migrate`, `db:down`, deleting files or folders, force git operations).
10.9 Add dependencies with `pnpm add <pkg> --filter <workspace>` (for dev dependencies add `-D`). Never edit `pnpm-lock.yaml` by hand.
10.10 Do not commit unless asked, and never use `--no-verify`.
10.11 Do not edit CI/CD workflow files (`.github/`) unless asked. The strict checks above (`lint:ci`, `format:check`, `typecheck`, `test`, `build`) must pass locally before you report a task as done.

---

## 11. Adding a New App

11.1 If the owner asks to add another **Next.js** app next to `client` and `server`, build it with **exactly the same architecture, rules, and flow as `apps/client`**: same folder structure, features inside `app/`, pages composing sections, `Suspense` + skeletons, `error.tsx`/`not-found.tsx` per route and at the root, requests layer, `lib/api.ts`, zod + react-hook-form, zustand + immer for client state, caching rules, accessibility rules, shadcn components from `@workspace/ui` (Base UI), and the same testing setup (Vitest, `tests/` folders per feature, global `test/` folder).
11.2 Create it at `apps/<app-name>/`. Copy `apps/client/AGENTS.md` into `apps/<app-name>/AGENTS.md` (change only the app name) so the rules stay identical. Future rule changes to the client file must be mirrored in the copies.
11.3 Use the same scripts as the client (`dev`, `build`, `start`, `typecheck`, `test`, `test:watch`, `shadcn`) so `turbo run` picks the app up. Lint and format come from the root (no per-app lint script). Use the same shared config (`@workspace/typescript-config`) and the same workspace dependencies (`@workspace/ui`, `@workspace/validation`, `@workspace/types`). Give it its own unique dev port.
11.4 Reuse the shared packages (types, schemas, UI). Do not copy shared code into the new app. Never install shadcn components inside the new app: they go into `@workspace/ui`, like in the client. Give the new app a `components.json` configured like the client's so the shadcn CLI installs into `packages/ui`.
11.5 If the new app talks to `apps/server`, **notify the owner before starting**: the server's CORS (`CLIENT_URL`) and the better-auth trusted origins currently serve a single client and must be updated.
11.6 Also update what is needed for it to run with the repo: `turbo.json` if required, `Dockerfile`, and the `docker-compose` files. Ask the owner if unsure.
11.7 For any other kind of app (not Next.js), notify the owner before starting.

---

## 12. Self-Check Before Reporting a Task as Done

Before saying a task is finished, verify every item. These are the rules agents most often forget:

12.1 Forms: every form uses `react-hook-form` + `zodResolver` with a schema from `@workspace/validation`. No `useState` for fields, no manual `if/else` validation.
12.2 Client state: zustand + immer only. No `createContext` / `useContext` for state.
12.3 Auth and API calls on the client are inside `requests/` functions, one function per file.
12.4 Server: one controller, one service, one query, one util per file, inside the feature's single `controllers/`, `services/`, `queries/`, `utils/` folders.
12.5 Server services: no spaghetti code. Each piece of logic is its own helper function below the main service function, in the same file. Auth logic is isolated the same way.
12.6 No `any`, no raw `fetch`, no raw `res.json`, no default `Error` on the server, no `img` tags, no ESLint leftovers.
12.7 Tests: new or changed logic has new or updated tests in the feature's `tests/` folder (section 13), and no test was skipped or deleted to make things pass.
12.8 Files are in the right place with the right names (section 7), and `pnpm lint`, `pnpm typecheck`, and `pnpm test` pass (section 10).

---

## 13. Testing (Global Rules)

13.1 Both apps use **Vitest**. The server also uses **supertest**; the client uses **Testing Library** (jsdom).
13.2 **Every feature has one `tests/` folder** (`<feature>/tests/`) holding the unit tests of that feature. **Every app has one global test folder at its root** (`test/` in the client, `src/test/` in the server) for global setup, shared test helpers, and tests of shared root-level code.
13.3 **Tests are part of the task.** New or changed logic ships with new or updated tests in the same task. A feature without tests is not done.
13.4 One test file per unit under test, named after the file it tests (section 7). Do not group the tests of several units in one file.
13.5 **Never delete, skip (`it.skip`), or weaken a test to make it pass**, and never leave `.only` in the code. Fix the code, or notify the owner if the test contradicts a rule.
13.6 Unit tests never use the real network or the real database. Integration tests (server only) use only the test database from the global setup.
13.7 Tests follow the same code rules: no `any`, clear names, small and independent tests, Arrange-Act-Assert, `describe` per unit and `it` per behavior.
13.8 Per-app details are in the client and server files.
