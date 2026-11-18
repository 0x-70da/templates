# AGENTS.md (server)

NestJS microservice application. Read root `AGENTS.md` first; this file adds server-specific rules.

---

## 1. Stack

1.1 NestJS 11, TypeScript.
1.2 Database: PostgreSQL via `node-postgres` with **Drizzle ORM v1**.
1.3 Auth: `better-auth`. Mounted via `AuthController` at `/api/auth/*`.
1.4 Validation: Zod schemas from `src/contracts/test.validation.ts` applied via `ZodValidationPipe`.
1.5 Contracts: shared types in `src/contracts/test.types.ts`. Drift checked via `pnpm test:contract`.
1.6 Tests: **Vitest** + `@nestjs/testing` with `unplugin-swc`.
1.7 Build: `tsc -p tsconfig.build.json` (`pnpm build` outputs `dist/main.js`). Dev: `tsx watch src/main.ts`.
1.8 Resilience: `GET /health` pings PostgreSQL via `SELECT 1`. Graceful shutdown enabled on `SIGTERM`/`SIGINT`.

---

## 2. Structure

```
server/
├── src/
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── pipes/
│   │       └── zod-validation.pipe.ts
│   ├── contracts/
│   │   ├── test.types.ts
│   │   └── test.validation.ts
│   ├── database/
│   │   └── database.module.ts
│   ├── db/
│   │   ├── auth-schema.ts
│   │   ├── index.ts
│   │   ├── relations.ts
│   │   └── schema.ts
│   ├── health/
│   │   ├── health.controller.ts
│   │   └── health.module.ts
│   ├── lib/
│   │   ├── auth.ts
│   │   └── nullToUndefined.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.module.ts
│   │   └── test/
│   │       ├── test.controller.ts
│   │       ├── test.controller.spec.ts
│   │       ├── test.module.ts
│   │       ├── test.query.ts
│   │       ├── test.service.ts
│   │       └── test.service.spec.ts
│   ├── app.module.ts
│   └── main.ts
├── Dockerfile
├── nest-cli.json
├── oxlint.config.ts
├── package.json
├── tsconfig.build.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 3. Deviations from next-express

1. **NestJS Architecture**:
   - _Rule Changed_: Express procedural routes and controller functions.
   - _Reason_: NestJS enforces structured modules, dependency injection, and decorator-based controllers (`@Controller`, `@Get`, `@Param`).
   - _Replacement_: `TestController` in `src/modules/test/test.controller.ts`.

2. **Validation & Exception Handling**:
   - _Rule Changed_: Express error middleware and manual `AppError`.
   - _Reason_: NestJS provides native HTTP exception handling and validation pipes.
   - _Replacement_: `ZodValidationPipe` and `HttpExceptionFilter`.

3. **Microservice Contract Synchronization**:
   - _Rule Changed_: Monorepo workspace packages (`@workspace/types`, `@workspace/validation`).
   - _Reason_: Microservices maintain independent repositories/containers without cross-monorepo imports.
   - _Replacement_: Explicit shared contracts under `src/contracts/`, validated for drift with `scripts/check-contracts.ts`.
