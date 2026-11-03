# AGENTS.md (Root)

This is a Turborepo monorepo (pnpm workspaces). This file holds the rules that apply to the **whole repo**.
App-specific rules live in:

- `apps/client/AGENTS.md` — Next.js frontend
- `apps/server/AGENTS.md` — Express backend

Read this file first, then the file of the app you are working in. If rules conflict, the more specific file wins, but you must still notify the owner (see 1.3).

> How to extend this file: add a new numbered section at the bottom, or a new numbered rule inside the matching section. Keep each rule short and actionable.

---

## 1. Working Agreement

1.1 Follow the instructions in these files strictly.
1.2 Never guess when something is unclear. Ask first.
1.3 If there is any conflict, question, or anything related that affects the task, **notify the owner before starting work**.
1.4 Put the right file in the right location with the right name. Example: `ProductCard.tsx` goes in `app/products/components/ProductCard.tsx`; if it is used by more than 2 features, it goes in the root-level `components/products/ProductCard.tsx`.

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

---

## 6. Code Quality (Global)

6.1 Keep logic separate. Every piece of logic gets its own function. Do not write logic directly inside a page, component, section, or controller.
6.2 Use clear, descriptive names for functions, components, queries, services, controllers, and everything else.
6.3 Keep code simple, human-readable, scalable, maintainable, and clean.
6.4 Prefer small, single-purpose functions over long ones.

---

## 7. Naming Conventions

| Kind       | Pattern            | Example                   |
| ---------- | ------------------ | ------------------------- |
| Controller | `xY.controller.ts` | `product.controller.ts`   |
| Service    | `xY.service.ts`    | `product.service.ts`      |
| Query      | `xY.query.ts`      | `product.query.ts`        |
| Routes     | `xY.routes.ts`     | `product.routes.ts`       |
| Middleware | `xY.middleware.ts` | `auth.middleware.ts`      |
| Utils      | `xY.ts`            | `formatPrice.ts`          |
| Request    | `xY.ts`            | `getProducts.ts`          |
| Types      | `xY.types.ts`      | `product.types.ts`        |
| Component  | `XY.tsx`           | `ProductCard.tsx`         |
| Section    | `XYSection.tsx`    | `ProductListSection.tsx`  |
| Skeleton   | `XYSkeleton.tsx`   | `ProductListSkeleton.tsx` |
| Hook       | `useXY.ts`         | `useProducts.ts`          |

(`xY` = camelCase, `XY` = PascalCase.)

---

## 8. Feature-Based Organization (Both Apps)

8.1 Both apps are organized **by feature**. Everything that belongs to a feature lives inside that feature's folder.
8.2 Anything (query, service, util, component, hook, request, type) used by **more than 2 features** moves to the proper root-level folder outside the feature folders.
8.3 Details per app are in the client and server files.

---

## 9. Tooling

9.1 Package manager: **pnpm**. Task runner: **Turborepo**.
9.2 Do not add dependencies without a reason. Install in the specific workspace that needs it.
9.3 Respect the shared ESLint and TypeScript configs from `packages/eslint-config` and `packages/typescript-config`.
