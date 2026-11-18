# AGENTS.md (Root)

Next.js 16 + NestJS 11 independent microservices template.

---

## 1. Structure

```
next-nest-micro/
├── client/                  # Next.js 16 App Router microservice
│   ├── contracts/           # Client contract mirror (test.types.ts, test.validation.ts)
│   ├── Dockerfile
│   └── package.json
├── server/                  # NestJS 11 microservice
│   ├── src/contracts/       # Server contract mirror (test.types.ts, test.validation.ts)
│   ├── Dockerfile
│   └── package.json
├── scripts/
│   └── check-contracts.ts   # Contract drift verification script
├── docker-compose.yaml      # Multi-container production composition
├── docker-compose.dev.yaml  # Development databases and services
├── package.json             # Root orchestration scripts
└── README.md
```

---

## 2. Microservice Rules & Contracts

2.1 The client and server services are fully independent applications with their own dependencies and Docker builds.
2.2 Neither service imports from monorepo packages. Instead, API contracts are synchronized between `client/contracts` and `server/src/contracts`.
2.3 Run `pnpm test:contract` (invoking `scripts/check-contracts.ts`) to ensure contract consistency.
2.4 Server exposes a health check at `GET /health` with DB connectivity verification.
2.5 Client exposes a health check at `GET /api/health`.

---

## 3. Deviations from next-express

1. **Independent Microservices vs Turborepo Monorepo**:
   - _Rule Changed_: Turborepo shared workspace packages (`@workspace/ui`, `@workspace/types`, `@workspace/validation`).
   - _Reason_: Microservices require isolated deployability, decoupled lifecycles, and independent CI/CD pipelines.
   - _Replacement_: Dual standalone projects (`client/`, `server/`) coordinated via root package scripts and contract synchronization.

2. **NestJS 11 Framework on Server**:
   - _Rule Changed_: Express 5 procedural routing and controllers.
   - _Reason_: NestJS offers modular structure, dependency injection, and decorator-based routing for backend enterprise architecture.
   - _Replacement_: NestJS controllers, services, modules, validation pipes, and exception filters.
