# AGENTS.md (Client - GraphQL Monorepo)

This is a **Next.js 16** App Router client consuming an Express GraphQL backend using `graphql-request` and `@graphql-codegen/cli`.

---

## 1. Working Agreement

1.1 Follow the instructions in this file strictly.
1.2 Never guess when something is unclear. Ask first.
1.3 Put the right file in the right location with the right name.
1.4 Always run `pnpm typecheck`, `pnpm lint:ci`, and `pnpm test` before declaring work done.

---

## 2. Project Structure

```
apps/client/
├── app/                  # Next.js App Router pages and layouts
├── components/           # UI components
├── lib/
│   └── graphql.ts        # Typed GraphQLClient instance
├── requests/             # Strongly typed GraphQL query/mutation requests
│   └── test/test.ts
├── stores/               # Zustand + Immer stores
├── codegen.ts            # GraphQL Code Generator configuration
├── package.json
└── tsconfig.json
```

---

## 3. GraphQL Client Rules & Deviations from next-express

3.1 **GraphQL Query Execution**:

- Network calls use `graphqlClient.request<T>(QUERY, variables)` in `requests/<domain>/<name>.ts`.
- Never use ad-hoc REST `fetch()` or fake REST routes.
  3.2 **Code Generation**:
- Run `pnpm codegen` to generate typed documents and hooks based on the server's GraphQL schema SDL.
