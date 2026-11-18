# AGENTS.md (Microservice Client)

This is a **Next.js 16** App Router microservice frontend template built with React 19, Tailwind CSS v4, Base UI, Zustand + Immer, React Hook Form + Zod, and explicit contract sharing.

---

## 1. Working Agreement

1.1 Follow the instructions in this file strictly.
1.2 Never guess when something is unclear. Ask first.
1.3 Put the right file in the right location with the right name.
1.4 Always run `pnpm typecheck`, `pnpm lint:ci`, and `pnpm test` before declaring work done.

---

## 2. Project Structure

```
client/
├── app/                  # Next.js App Router pages, layouts, and route handlers
│   ├── api/health/       # Client health endpoint
│   ├── test/             # Test domain page and sections
│   ├── globals.css       # Tailwind CSS v4 styles
│   └── layout.tsx
├── components/           # UI components
│   ├── ui/               # Base UI styled components
│   └── test/             # Test domain components
├── contracts/            # Explicit contract types and Zod schemas shared with server
│   ├── test.types.ts
│   └── test.validation.ts
├── requests/             # Strongly typed API client fetch calls
│   └── test/test.ts
├── stores/               # Zustand + Immer stores
├── lib/                  # Utilities (api client, utils, auth-client)
├── test/                 # Vitest unit and component tests
├── Dockerfile            # Multi-stage production container
├── package.json
└── tsconfig.json
```

---

## 3. Microservice Architectural Rules

3.1 **Contracts**: Consume types and validation schemas from `contracts/`. Keep them synchronized with `server/src/contracts/`.
3.2 **API Requests**: All network calls must be isolated inside `requests/<domain>/<name>.ts` using `lib/api.ts`. Never perform ad-hoc `fetch()` calls inside React components.
3.3 **Healthcheck**: Route handler `/api/health` returns `{ status: "ok", service: "client" }`.
3.4 **State & Forms**: Global UI state lives in `stores/<domain>/<name>.store.ts`. Forms use React Hook Form validated with Zod schemas from `contracts/`.
3.5 **No `any`**: TypeScript strict mode is enabled. Never use `any`.

---

## 4. Deviations from next-express

4.1 **Independence**: This client is completely independent with its own `package.json`, build pipeline, and Dockerfile (no Turborepo or `@workspace/*` dependencies).
4.2 **Contract Sharing**: Uses local `contracts/` verified with a drift-check script (`pnpm test:contract`) instead of shared monorepo packages.
