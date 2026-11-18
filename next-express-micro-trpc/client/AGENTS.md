# AGENTS.md (tRPC Microservice Client)

This is a **Next.js 16 + tRPC v11** microservice frontend template built with React 19, TanStack Query v5, Tailwind CSS v4, Base UI, Zustand + Immer, and end-to-end type safety.

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
│   └── layout.tsx        # Wraps with TRPCProvider
├── components/           # UI components
│   ├── ui/               # Base UI styled components
│   ├── providers/        # TRPCProvider (TanStack Query + tRPC client)
│   └── test/             # Test domain components
├── contracts/            # Explicit contract types and router contracts
│   ├── test.types.ts
│   ├── test.validation.ts
│   └── trpc.types.ts     # Router contract providing end-to-end types
├── lib/
│   ├── trpc/             # tRPC client and server callers
│   │   ├── client.ts     # trpc React Query hook client
│   │   └── server.ts     # trpcCaller for Server Components
│   └── utils.ts
├── stores/               # Zustand + Immer stores
├── test/                 # Vitest tests
├── Dockerfile            # Multi-stage production container
├── package.json
└── tsconfig.json
```

---

## 3. tRPC Architectural Rules & Deviations from next-express

3.1 **Direct Typed Procedure Calls over Hand-written Requests**:

- Replaces hand-written `requests/` fetch functions with direct typed tRPC calls.
- In React Client Components: use `trpc.<domain>.<procedure>.useQuery(...)` or `.useMutation(...)`.
- In React Server Components: use `trpcCaller.<domain>.<procedure>.query(...)`.
  3.2 **End-to-End Type Inference**:
- Types are inferred directly from `contracts/trpc.types.ts`.
  3.3 **Zero Runtime Cross-Service Dependency**:
- Contracts are copied or verified via `pnpm test:contract`. The client builds and bundles completely independently.
