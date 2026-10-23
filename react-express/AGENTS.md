<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": true` in the root `turbo.json` or `turbo.jsonc` to opt in; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# AGENTS.md

Instructions for AI coding agents working in this monorepo. Read this fully before making changes. Follow the existing patterns in the codebase first; if this file and the code disagree, ask before deciding.

## 1. Monorepo overview

A **Turborepo + pnpm** monorepo with a React client, an Express 5 API server, and shared packages.

```
.
├── apps/
│   ├── client/                  # React + Vite SPA
│   └── server/                  # Express 5 REST API
├── packages/
│   ├── ui/                      # @workspace/ui: shadcn components shared by apps
│   ├── eslint-config/           # @workspace/eslint-config
│   └── typescript-config/       # @workspace/typescript-config
├── docker-compose.yml           # db (Postgres) + server + client
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Stack

- **Client (`apps/client`):** React 19, Vite, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), TanStack Query, `react-hook-form` + Zod 4, Better Auth client, `lucide-react`, UI from `@workspace/ui`
- **Server (`apps/server`):** Node >= 24, Express 5, TypeScript (ESM, `"type": "module"`), Drizzle ORM v1 (rc) + `pg`, Better Auth, Zod 4, `cors`, `dotenv`, `tsx` for dev
- **Database:** PostgreSQL 16 (Docker)
- **Tooling:** pnpm, Turborepo, ESLint (shared config), Prettier

Library versions are new. Do not rely on memory of older versions: check the relevant `package.json` and the official docs for **Express 5, Drizzle v1, Zod 4, Better Auth, TanStack Query, Vite, and Tailwind v4** before using an API you are not sure about.

### Monorepo rules

- **Apps never import from each other.** `client` and `server` share code only through `packages/*` (referenced as `workspace:*`). The API contract (types, Zod schemas) is therefore kept in sync by hand in both apps; ask before creating a new shared package.
- Add dependencies to the app that uses them: `pnpm add <pkg> --filter client` (or `--filter server`). Only repo-wide tooling goes in the root `package.json`.
- Do not duplicate tsconfig or ESLint settings: apps extend `@workspace/typescript-config` and `@workspace/eslint-config`. Change shared config in its package.
- If you add a script that should run across the repo, register it in `turbo.json`.
- **Package manager is `pnpm` only.** Never use `npm` or `yarn`, never create other lockfiles.

## 2. Commands

Run from the repo root:

```bash
pnpm dev                                   # turbo: run dev for all apps
pnpm build                                 # turbo: build everything
pnpm lint                                  # turbo: lint everything
pnpm typecheck                             # turbo: typecheck everything
pnpm format                                # prettier --write on the WHOLE repo (see note)

pnpm --filter client <script>              # run a script in the client
pnpm --filter server <script>              # run a script in the server
pnpm --filter server db:generate           # generate a migration from schema changes
pnpm --filter server db:migrate            # apply migrations
pnpm --filter server db:push               # push schema directly (prototyping only)
pnpm --filter server db:studio             # drizzle studio

pnpm dlx shadcn@latest add <component> -c apps/client   # add a shadcn component (generated into packages/ui)
```

- `pnpm format` rewrites every `.ts`, `.tsx`, and `.md` file. **Do not run it unless asked.** To format only what you changed: `pnpm prettier --write <files>`.
- Definition of done for any task: `pnpm typecheck`, `pnpm lint`, and `pnpm build` pass from the root. Do not leave unused imports, dead code, `console.log`, or commented-out code.
- For real schema changes use `db:generate` + `db:migrate`, not `db:push`.

## 3. Docker

`docker-compose.yml` defines three services:

- **`db`**: `postgres:16-alpine`, data in the `postgres-data` volume, with a healthcheck.
- **`server`**: built from `apps/server/Dockerfile` with the **repo root as build context** (it needs workspace files). Listens on port 5000 and waits for `db` to be healthy. `DATABASE_URL` points at host `db`.
- **`client`**: built from `apps/client/Dockerfile`, runs the Vite dev server on `0.0.0.0:5173`.

```bash
docker compose up --build        # start everything
docker compose up db -d          # only the database (run apps locally with pnpm dev)
docker compose down              # stop (add -v to also delete the database volume)
```

- Env vars are read from a root `.env` (`POSTGRES_*`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `SERVER_PORT`, `CLIENT_PORT`, ...) with safe development defaults in the compose file.
- Inside Docker the database host is `db`; outside Docker it is `localhost`. Do not hard-code either.
- When you add or rename an env var, update **all** of: the server's env validation, `docker-compose.yml`, and `.env.example`.
- Do not assume migrations run automatically on `docker compose up`; check the server Dockerfile/entrypoint first.

## 4. Conventions shared by both apps

### One thing per file

**Every file in the folders below contains exactly one thing.** Never put several controllers, services, queries, hooks, schemas, types, utils, API functions, or components in one file.

A file's single export is named after the file. Small private functions used only by that export may stay in the same file if they are not exported. A Zod schema file may also export the type inferred from it, and a const array may be exported together with the union type derived from it.

### File naming

- **Components:** `PascalCase` for the component and the file: `UserCard.tsx`.
- **Hooks (client):** the file is named exactly like the hook, starting with `use`: `useGetUsers.ts`.
- **Everything else:** `<kebab-case-name>.<kind>.ts`, where **kind is the singular of the folder name**. The name is the export's name in kebab-case; function names start with a verb.

| Where  | Folder         | File                         | Export                             |
| ------ | -------------- | ---------------------------- | ---------------------------------- |
| server | `controllers/` | `get-users.controller.ts`    | `getUsersController`               |
| server | `routes/`      | `user.route.ts`              | `userRouter` (one router per file) |
| server | `services/`    | `create-user.service.ts`     | `createUser`                       |
| server | `queries/`     | `get-user-by-id.query.ts`    | `getUserById`                      |
| server | `middlewares/` | `require-auth.middleware.ts` | `requireAuth`                      |
| both   | `schema/`      | `create-user.schema.ts`      | `createUserSchema`                 |
| both   | `types/`       | `user.type.ts`               | `User`                             |
| both   | `utils/`       | `format-price.util.ts`       | `formatPrice`                      |
| client | `api/`         | `get-users.api.ts`           | `getUsersApi`                      |

- Shared helpers/types/schemas outside those folders (server `lib/`) use the same suffixes. Infrastructure files keep plain names (`env.ts`, `errors.ts`, `auth.ts`, `api-client.ts`, `query-keys.ts`).
- **Exceptions:** files in `packages/ui` generated by the shadcn CLI keep their generated names. `page.tsx`, `main.tsx`, `App.tsx`, `server.ts` keep their names.

### TypeScript rules

- `strict` mode is on. **Never use `any`.** Use `unknown` and narrow it. Avoid `as` casts and the non-null assertion `!`; if unavoidable, add a short comment explaining why.
- Use `import type { ... }` for type-only imports.
- Exported functions must have an explicit return type. Local variables can rely on inference.
- Prefer `as const` objects + derived union types over `enum`.
- Use `satisfies` to check an object's shape without widening its type.
- Handle `null` and `undefined` explicitly. No `// @ts-ignore`; `@ts-expect-error` only with a reason.
- Follow the import style (extensions, aliases) already used in each app and its tsconfig.

**Creating a new type:**

1. **Derive, don't duplicate.** Server: infer DB types from Drizzle (`typeof users.$inferSelect`, exported from `db/schema.ts`) and input types from Zod (`z.infer<typeof createUserSchema>`). Client: infer form/input types from the Zod schema.
2. Write a manual type only when there is nothing to derive from (component props, API response models on the client, view models).
3. Placement: feature-specific -> the feature's `types/<name>.type.ts`; shared -> the app's shared `types/` (server) or next to its use (client). Component props live in the component file.
4. Naming: `PascalCase`, no `I` prefix. Props: `<Component>Props`. Inputs: `<Action><Entity>Input`. Use `type` by default; `interface` only when extension/merging is needed.

### Writing logic

The code must be **readable, scalable, and maintainable**.

- **Put logic in functions, then call them.** Never write logic inline inside a component, controller, route, or hook body. Write a named function in its own file and use it.
- One function = one responsibility. If you need "and" to describe it, split it.
- Name functions with a verb: `calculateOrderTotal`, `getUserById`, `formatPrice`, `isOrderCancellable`. Booleans start with `is/has/can/should`.
- Prefer pure functions. Isolate side effects (DB, network) in clearly named functions.
- More than 2 parameters -> take a single typed object parameter.
- Early returns instead of deep nesting. No nested ternaries. No magic numbers or strings.
- Don't repeat yourself, but don't abstract too early: extract on the second or third real repetition.
- Comments explain **why**, not what.
- Do not swallow errors with an empty `catch`.

### API contract

All endpoints return JSON in this shape. Keep this type identical in both apps (`apps/server/src/types/api-response.type.ts` and `apps/client/src/api/api-response.type.ts`):

```ts
export type ApiResponse<T> =
  | { success: true; data: T; message: string }
  | { success: false; message: string };
```

- Success: `{ success: true, data, message }`. Failure: `{ success: false, message }` (nothing else). `message` is always a human-readable string.
- Always set the correct HTTP status: `200` OK, `201` created, `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict, `500` unexpected.
- REST, plural nouns, under `/api`: `GET /api/users`, `GET /api/users/:id`, `POST /api/users`, `PATCH /api/users/:id`, `DELETE /api/users/:id`.
- Lists are paginated (`?page=1&limit=20`) and return `data: { items, page, limit, total }`.
- Better Auth owns `/api/auth/*`; do not reimplement it.

## 5. Server (`apps/server`)

### Structure

```
apps/server/src/
├── server.ts                 # entry point
├── db/
│   ├── index.ts              # Drizzle client
│   ├── schema.ts             # ALL table definitions
│   ├── relations.ts          # ALL relations
│   └── queries/              # shared queries (used by 2+ features)
├── features/
│   └── <feature>/            # e.g. users, orders
│       ├── controllers/      # one controller per file
│       ├── routes/           # the feature's router
│       ├── services/         # business logic, one function per file
│       ├── queries/          # DB queries, one function per file
│       ├── schema/           # Zod schemas
│       ├── types/            # manual types
│       └── utils/            # pure helpers
├── lib/                      # env.ts, errors.ts, auth.ts, shared helpers
├── middlewares/              # shared Express middlewares
├── schema/                   # shared Zod schemas
├── services/                 # shared services (used by 2+ features)
└── types/                    # shared types
```

- Create a feature folder per domain and only the subfolders it needs. Keep things inside the feature; move them to the shared folder only when a second feature needs them.
- Features do not import from other features' internals. Cross-feature logic goes in the shared `services/`.

### Layering (always respect this direction)

```
route -> middlewares -> controller -> service -> query -> DB
```

- **Route:** wires HTTP method + path + middlewares + controller. No logic.
- **Controller:** parse input with Zod, call a service, send the `ApiResponse`. No business rules, no DB access.
- **Service:** business rules, orchestration, transactions. Knows nothing about `req`/`res`. Throws `AppError` for expected failures.
- **Query:** database access only. No business rules.
- If an operation is plain CRUD with no business rule, the controller may call the query directly. Do not create pass-through services.

### Express 5 rules

- **Async handlers are first-class.** A thrown error or rejected promise in a handler or middleware is forwarded to the error handler automatically. Do **not** wrap handlers in `try/catch` just to call `next(error)`, and do not add `express-async-errors` or an `asyncHandler` wrapper.
- Handlers are `async (req, res): Promise<void>`. Send the response and return nothing (do not `return res.json(...)`).
- Use `res.status(200).json(...)`. Express 4 forms (`res.json(status, body)`, `res.send(status)`, `app.del`, `req.param()`) are removed.
- `req.query` is a read-only getter: never reassign it, parse it into a new variable. `req.body` is `undefined` when no body was parsed: always validate it with Zod.
- Route path syntax (path-to-regexp v8): wildcards must be named (`/api/auth/*splat`), optional segments use braces (`/users{/:id}`), no regex characters in paths.
- **One global error handler**: a 4-argument middleware registered **last**, after a 404 handler. It is the only place that turns errors into responses:
  - `ZodError` -> `400` with the first issue message
  - `AppError` -> its `status` and message
  - anything else -> log it, respond `500` with a generic message (never leak internals)
- App registration order: `cors` -> Better Auth handler -> `express.json()` -> feature routers under `/api` -> 404 handler -> error handler. The Better Auth handler **must come before** `express.json()`.

```ts
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
  }
}
```

```ts
// src/middlewares/error-handler.middleware.ts
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/errors";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: error.issues[0]?.message ?? "Invalid input",
    });
    return;
  }
  if (error instanceof AppError) {
    res.status(error.status).json({ success: false, message: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ success: false, message: "Internal server error" });
};
```

```ts
// src/features/users/routes/user.route.ts
import { Router } from "express";
import { requireAuth } from "../../../middlewares/require-auth.middleware";
import { getUserByIdController } from "../controllers/get-user-by-id.controller";
import { createUserController } from "../controllers/create-user.controller";

export const userRouter = Router();

userRouter.get("/:id", requireAuth, getUserByIdController);
userRouter.post("/", requireAuth, createUserController);
```

```ts
// src/features/users/controllers/get-user-by-id.controller.ts
import type { Request, Response } from "express";
import type { ApiResponse } from "../../../types/api-response.type";
import type { User } from "../../../db/schema";
import { getUserByIdParamsSchema } from "../schema/get-user-by-id-params.schema";
import { getUser } from "../services/get-user.service";

export async function getUserByIdController(
  req: Request,
  res: Response<ApiResponse<User>>,
): Promise<void> {
  const { id } = getUserByIdParamsSchema.parse(req.params); // ZodError -> 400 via the error handler
  const user = await getUser(id);
  res
    .status(200)
    .json({ success: true, data: user, message: "User fetched successfully" });
}
```

```ts
// src/features/users/services/get-user.service.ts
import { AppError } from "../../../lib/errors";
import type { User } from "../../../db/schema";
import { getUserById } from "../queries/get-user-by-id.query";

export async function getUser(id: string): Promise<User> {
  const user = await getUserById(id);
  if (!user) throw new AppError("NOT_FOUND", "User not found", 404);
  return user;
}
```

### Authentication (Better Auth)

- Config in `src/lib/auth.ts` (Drizzle adapter). Mount it with `toNodeHandler(auth)` at `/api/auth/*splat` **before** `express.json()`.
- Protected routes use a `requireAuth` middleware that reads the session with `auth.api.getSession({ headers: fromNodeHeaders(req.headers) })`, responds `401` via `AppError` when missing, and stores the session on `res.locals` (declare its type, no `any`).
- The client runs on a different origin: configure `cors` with the exact client origin and `credentials: true` (never `*` with credentials), and add the client origin to Better Auth's `trustedOrigins`. Read the origin from env.
- Auth tables live in `db/schema.ts`. Follow the Better Auth docs/CLI for their shape; do not invent columns.

### Database (Drizzle)

- Tables in `db/schema.ts`, relations in `db/relations.ts`. Drizzle v1 differs from 0.x: check the existing files and the v1 docs before writing relations or relational queries.
- After changing the schema: `pnpm --filter server db:generate`, review the SQL, then `db:migrate`. Never edit an applied migration; create a new one.
- Tables: plural `snake_case`; columns `snake_case` in the DB and `camelCase` in TypeScript. Every table has a primary key and `createdAt` / `updatedAt`. Add foreign keys and indexes for join/filter columns.
- **Every query is a function in its own file** in the feature's `queries/` (or `db/queries/` if shared). Never write Drizzle calls in controllers, services, or routes.
- Function names: `getXById`, `getXByY`, `listX`, `insertX`, `updateX`, `deleteX`, `countX`.
- Select only the columns you need for lists, paginate lists, return `null` (do not throw) when a single record is not found, and use a transaction for operations with more than one write (orchestrated in a service).

```ts
// src/features/users/queries/get-user-by-id.query.ts
import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { users, type User } from "../../../db/schema";

export async function getUserById(id: string): Promise<User | null> {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row ?? null;
}
```

### Server environment

- Validate all env vars with Zod in `src/lib/env.ts` (after `dotenv` loads) and import `env` from there. Do not read `process.env` elsewhere.
- Never commit `.env`; keep `.env.example` updated.

## 6. Client (`apps/client`)

### Structure

```
apps/client/src/
├── main.tsx, App.tsx, index.css
├── api/                      # shared API layer: api-client.ts, auth-client.ts, query-keys.ts, api-response.type.ts
├── components/               # shared components (used by 2+ features), e.g. QueryProvider.tsx
├── hooks/                    # shared hooks
├── utils/                    # shared pure helpers
└── features/
    └── <feature>/            # e.g. users, orders
        ├── page.tsx          # the feature's page (exports <Feature>Page)
        ├── api/              # API functions, one per file
        ├── components/       # components used only by this feature
        ├── hooks/            # TanStack Query hooks, one per file
        ├── schema/           # Zod schemas (forms)
        ├── types/
        └── utils/
```

- Keep things inside the feature; move them to the shared folders only when a second feature needs them. Features do not import from other features' internals.
- No router is installed yet. Do not add one without asking.
- Only `VITE_`-prefixed env vars reach the browser and they must never contain secrets. Read `import.meta.env` in one place (`api-client.ts` / `auth-client.ts`).

### Components

- Function components with **named exports**, props typed as `<Component>Props` above the component, destructured in the signature.
- Keep components small and single-purpose (under ~150 lines); split into more files when they grow.
- **No logic inside JSX.** Pure computations go to `utils/`, data fetching and stateful logic go to hooks. JSX reads like a description of the UI.
- Handle loading, empty, and error states explicitly. Accessibility: semantic HTML, labels for inputs, `alt` for images, keyboard-reachable controls.

### UI (`@workspace/ui`) and `cn()`

- Import shared primitives from the ui package (e.g. `@workspace/ui/components/button`). Use the primitive library already used in `packages/ui` and do not mix in another. Add components with the shadcn CLI (see commands) instead of hand-writing them, and avoid editing generated files unless needed. Check `packages/ui` for the import paths in use.
- Tailwind classes only; no inline `style` unless the value is truly dynamic. Use theme tokens (`bg-background`, `text-muted-foreground`, ...) so dark mode works.
- **Always use `cn()`** (from the ui package's `lib/utils`) to combine classes, add conditional classes, or let a parent override styles via `className`. Never concatenate class strings by hand.

```tsx
// src/features/users/components/UserCard.tsx
import { cn } from "@workspace/ui/lib/utils";
import type { User } from "../types/user.type";

type UserCardProps = {
  user: User;
  isHighlighted?: boolean;
  className?: string;
};

export function UserCard({
  user,
  isHighlighted = false,
  className,
}: UserCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border p-4",
        isHighlighted && "border-primary",
        className,
      )}
    >
      <h3 className="font-medium">{user.name}</h3>
      <p className="text-muted-foreground">{user.email}</p>
    </article>
  );
}
```

### Data flow: components -> hooks -> API functions

```
component -> hook (TanStack Query) -> API function -> apiClient (fetch) -> server
```

- **Components never call `fetch`, `useQuery`, or `useMutation` directly.** They use custom hooks.
- **API functions** (feature `api/`, one per file, `get-users.api.ts`) call `apiClient` and return the unwrapped `data`. `apiClient` sends `credentials: "include"`, parses the `ApiResponse`, and throws `Error(message)` when `success` is `false`.
- **One hook per operation, one file per hook:** `useGetUsers`, `useGetUserById`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`.
- **Return only what the component needs**, under **descriptive names** that include the entity or operation. Do not return the raw query result or spread it.
  - Queries: `data` -> `users`, `isLoading` -> `isFetchingUsers`, `isError` -> `isFetchUsersError`, `error` -> `fetchUsersError`
  - Mutations: `mutate` -> `createUser`, `isPending` -> `isCreatingUser`, `isError` -> `isCreateUserError`, `error` -> `createUserError`
- Query keys come from the factory in `src/api/query-keys.ts`; never inline key arrays. Mutations invalidate the affected keys in `onSuccess`.
- `QueryClientProvider` lives in `src/components/QueryProvider.tsx` (creates the `QueryClient` once with `useState`) and wraps the app in `main.tsx`.

```ts
// src/api/api-client.ts
import type { ApiResponse } from "./api-response.type";

const BASE_URL = import.meta.env.VITE_API_URL;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const result = (await response.json()) as ApiResponse<T>; // the server contract
  if (!result.success) throw new Error(result.message);
  return result.data;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
```

```ts
// src/features/users/api/get-users.api.ts
import { apiClient } from "@/api/api-client";
import type { User } from "../types/user.type";

export function getUsersApi(): Promise<User[]> {
  return apiClient.get<User[]>("/api/users");
}
```

```ts
// src/features/users/hooks/useGetUsers.ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { getUsersApi } from "../api/get-users.api";

export function useGetUsers() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: getUsersApi,
  });

  return {
    users: data ?? [],
    isFetchingUsers: isLoading,
    isFetchUsersError: isError,
    fetchUsersError: error,
  };
}
```

```ts
// src/features/users/hooks/useCreateUser.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { createUserApi } from "../api/create-user.api";

export function useCreateUser() {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createUserApi,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  });

  return {
    createUser: mutate,
    isCreatingUser: isPending,
    isCreateUserError: isError,
    createUserError: error,
  };
}
```

(The `@/` alias is shown for readability: use the alias or relative import style the client's tsconfig/Vite config actually defines.)

### Forms and validation

- Define the Zod schema in the feature's `schema/` (one per file) and use it with `react-hook-form` + `zodResolver`. Field errors come from `formState.errors`.
- Submit through a mutation hook (`useCreateUser`), show its error message (it is the server's `message`), and disable the submit button while the `is...ing` flag is true.
- Zod 4 API: use top-level validators (`z.email()`, `z.url()`, `z.uuid()`) and the `error` option for custom messages. If a schema uses `transform` or `default`, use `z.input<>` for form values and `z.output<>` for the parsed result.
- The server validates again with its own schema; keep the two schemas consistent.

### Authentication (client)

- `src/api/auth-client.ts` creates the Better Auth client (`createAuthClient` from `better-auth/react`) pointing at the server. Use `authClient.useSession()` for the current user; do not copy the session into TanStack Query or other stores.
- Client-side route guards are for UX only. The server's `requireAuth` is the real protection.
- Never store tokens in `localStorage`.

## 7. Security

- Never trust client input: validate on the server even if the client validated.
- Never log secrets, tokens, or personal data. Never commit `.env`.
- Never return internal error details to the client; the global error handler sends generic `500` messages.

## 8. Working agreement

- Before writing code, look at an existing feature in the same app and follow its structure and naming.
- Make the smallest change that solves the task. Do not refactor unrelated code or reformat files you did not need to touch.
- Do not add a dependency without a clear reason; prefer what the stack already provides.
- If requirements are ambiguous or a change affects the architecture, ask first instead of guessing.
- When done, briefly summarize what changed and anything the user must do (run a migration, add an env var, rebuild Docker).
