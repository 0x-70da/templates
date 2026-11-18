# AGENTS.md (Microservice Server)

This is an **Express 5** microservice backend template built with TypeScript, Drizzle ORM v1, PostgreSQL, Better Auth, and explicit contract sharing.

---

## 1. Working Agreement

1.1 Follow the instructions in this file strictly.
1.2 Never guess when something is unclear. Ask first.
1.3 Put the right file in the right location with the right name.
1.4 Always run `pnpm typecheck`, `pnpm lint:ci`, and `pnpm test` before declaring work done.

---

## 2. Project Structure

```
server/
├── src/
│   ├── contracts/            # Explicit contract types and Zod schemas shared with client
│   │   ├── test.types.ts
│   │   └── test.validation.ts
│   ├── controllers/          # HTTP request handlers (parse, call service, respond)
│   ├── services/             # Business logic layer
│   ├── queries/              # Database access layer (Drizzle queries)
│   ├── routes/               # Express route definitions
│   ├── middlewares/          # Auth, error, and notFound middlewares
│   ├── db/                   # Drizzle schema, relations, and connection
│   ├── lib/                  # Helpers (response, errors, auth)
│   ├── tests/                # Unit and integration tests
│   ├── app.ts                # Express app configuration & /health endpoint
│   └── server.ts             # Server entry point with graceful shutdown
├── Dockerfile                # Multi-stage production container
├── package.json
└── tsconfig.json
```

---

## 3. Microservice Architectural Rules

3.1 **Layering**: `Controller -> Service -> Query -> Database`. Controllers never access queries or database directly.
3.2 **Contracts**: Define API payloads and Zod schemas in `src/contracts/`. Keep them synchronized with `client/contracts/`.
3.3 **Healthcheck**: The `/health` endpoint checks database connectivity via `SELECT 1` and returns `{ status: "ok", uptime, timestamp, database: "connected" }`.
3.4 **Graceful Shutdown**: Handled in `src/server.ts` listening to `SIGTERM` and `SIGINT` signals to close the HTTP server and database pool cleanly.
3.5 **Responses**: All responses must use `success(res, message, data, code)` or `error(res, message, err, code)` from `src/lib/response.ts`. Never use raw `res.json()`.
3.6 **No `any`**: TypeScript strict mode is enabled. Never use `any`.

---

## 4. Deviations from next-express

4.1 **Independence**: This service is completely independent with its own `package.json`, build pipeline, and Dockerfile (no Turborepo or `@workspace/*` dependencies).
4.2 **Contract Sharing**: Uses local `src/contracts/` verified with a drift-check script (`pnpm test:contract`) instead of shared monorepo packages.
4.3 **Resilience**: Features built-in container health check endpoint `/health` and graceful process termination.
