# AGENTS.md (Microservice Client - GraphQL)

This is a **Next.js 16** App Router microservice frontend template consuming an Express GraphQL backend with `graphql-request` and `@graphql-codegen/cli`.

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
├── app/                  # Next.js App Router pages and layouts
├── components/           # UI components
├── contracts/            # Explicit contract types and SDL schema
│   ├── schema.graphql
│   ├── test.types.ts
│   └── test.validation.ts
├── lib/
│   └── graphql.ts        # Typed GraphQLClient instance
├── requests/             # Strongly typed GraphQL query/mutation requests
│   └── test/test.ts
├── stores/               # Zustand + Immer stores
├── codegen.ts            # GraphQL Code Generator configuration
├── Dockerfile            # Multi-stage production container
├── package.json
└── tsconfig.json
```

---

## 3. GraphQL Client Rules & Deviations from next-express

3.1 **GraphQL Requests over REST Fetch**:

- All data operations use `graphqlClient.request<T>(QUERY, variables)` inside `requests/<domain>/<name>.ts`.
  3.2 **Code Generation**:
- Run `pnpm codegen` to generate typed documents and hooks based on `contracts/schema.graphql`.
  3.3 **Zero Runtime Cross-Service Dependency**:
- Fully decoupled independent client service with its own Dockerfile, build pipeline, and tests.
