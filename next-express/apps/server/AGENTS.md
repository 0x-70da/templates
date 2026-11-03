# AGENTS.md (apps/server)

Express backend. Read the root `AGENTS.md` first; this file adds server-specific rules.

> How to extend this file: add a new numbered section at the bottom, or a new numbered rule inside the matching section.

---

## 1. Stack

1.1 Express, TypeScript, ESM.
1.2 Database: PostgreSQL via `node-postgres` with **Drizzle ORM v1**.
1.3 Auth: `better-auth`. Auth routes and base URL live on this server.
1.4 Validation: zod.
1.5 Because the project is ESM, relative imports **must end with `.js`** (e.g. `import router from "./routes.js"`), even though the source files are `.ts`.

---

## 2. Structure (Feature-Based)

```
apps/server/src/
├── db/
│   ├── migrations/
│   ├── auth-schema.ts
│   ├── index.ts               # db instance
│   ├── relations.ts           # relations (separate file, Drizzle v1 style)
│   └── schema.ts
├── features/
│   └── <feature>/
│       ├── controllers/       # xY.controller.ts
│       ├── services/          # xY.service.ts
│       ├── queries/           # xY.query.ts
│       ├── utils/             # xY.ts
│       ├── <feature>.routes.ts   # the feature router (at the feature root)
│       └── <feature>.types.ts    # the feature types (at the feature root)
├── lib/
│   ├── auth.ts
│   ├── errors.ts              # AppError
│   ├── nullToUndefined.ts
│   └── response.ts            # success / error response helpers
├── middlewares/               # xY.middleware.ts
├── queries/                   # shared queries (used by more than 2 features)
├── services/                  # shared services (used by more than 2 features)
├── types/                     # shared app-only types
├── app.ts
├── routes.ts
└── server.ts
```

2.1 Everything of a feature lives in `features/<feature>/`.
2.2 The feature's **routes file** is `features/<feature>/<feature>.routes.ts` and the feature's **types file** is `features/<feature>/<feature>.types.ts`. They sit at the feature root, not in sub-folders.
2.3 Queries, services, and utils used by **more than 2 features** move to the matching root-level folder outside `features/`.

---

## 3. Request Flow

```
routes.ts -> <feature>.routes.ts -> controller -> service -> query -> db
```

3.1 **Controller**: receives the request, validates any external data (body, params, query) with zod, calls the proper service, and sends the result using `lib/response.ts`.
3.2 **Service**: business logic. May contain extra logic and helper functions (put helpers at the bottom of the file). Calls queries.
3.3 **Query**: the only layer that talks to the db instance. Returns the data.
3.4 Controllers never touch the db directly. Queries never contain business logic.
3.5 Errors thrown anywhere are caught automatically by the error middleware. Do not wrap everything in try/catch just to format errors.

---

## 4. Routing

4.1 Each feature has one router file: `features/<feature>/<feature>.routes.ts`. It creates a typed `Router`, attaches the controllers, and exports the router as **default**.
4.2 Controllers are **named exports** (`xController`) imported from `./controllers/x.controller.js`.

```typescript
// features/test/test.routes.ts
import { Router } from "express";
import { testController } from "./controllers/test.controller.js";

const router: Router = Router();

router.get("/", testController);

export default router;
```

4.3 Every feature router is mounted in `src/routes.ts` with `router.use(path, ...middlewares, handler)`. The feature router is loaded with a dynamic `await import(...)` and its `.default`. Put the middlewares that protect the whole feature (auth, admin) in the mount call.

```typescript
// routes.ts
import { Router } from "express";
import { xMiddleware } from "./middlewares/x.middleware.js";

const router: Router = Router();

router.use(
  "/test",
  xMiddleware,
  (await import("./features/test/test.routes.js")).default,
);

export default router;
```

4.4 To add a new feature: create `features/<feature>/<feature>.routes.ts`, then add one `router.use(...)` block in `routes.ts` following the same pattern.
4.5 Use middlewares per route inside a feature router when only some routes need them (e.g. only `DELETE` needs `adminMiddleware`).

---

## 5. App Setup (app.ts and server.ts)

5.1 `app.ts` creates the express app, configures it, and **exports it as default**. `server.ts` only starts listening. Keep this separation.
5.2 The order in `app.ts` matters. Keep it exactly like this unless the owner approves a change:

1. `cors` (origin from `process.env.CLIENT_URL`, `credentials: true`)
2. better-auth handler: `app.all("/api/auth/*splat", toNodeHandler(auth))`
3. `express.json()` (**after** the better-auth handler, never before it)
4. `app.use("/api", router)`
5. `errorHandler`
6. `notFoundHandler`

```typescript
// app.ts
import express from "express";
import cors from "cors";
import router from "./routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";

const app: express.Application = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api", router);

app.use(errorHandler);

app.use(notFoundHandler);

export default app;
```

5.3 `server.ts` imports `dotenv/config` **first**, then the app, then listens on `process.env.PORT || 5000`.

```typescript
// server.ts
import "dotenv/config";

import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
```

5.4 Do not register `errorHandler` or `notFoundHandler` anywhere else. Do not add global middlewares in `app.ts` without notifying the owner.
5.5 All API routes are under the `/api` prefix. Auth routes are under `/api/auth`.

---

## 6. Prebuilt Functions (Always Use Them)

6.1 `lib/response.ts`: success and error response functions. **Never use raw `res.json`.** They are generic; pass the proper type.
6.2 `lib/errors.ts`: the `AppError` class (extends `Error`). **Always throw `AppError`, never the default `Error`.**
6.3 `lib/nullToUndefined.ts`: converts `null` to `undefined`. **Use it in query files** on database results so `null` never leaks out of the query layer.

---

## 7. Middlewares

7.1 Located in `src/middlewares/`: `admin`, `auth`, `error`, `notFound`.
7.2 Use `auth.middleware` on routes that require an authenticated user.
7.3 Use `admin.middleware` on routes that require admin permission.
7.4 `error` and `notFound` middlewares are already registered in `app.ts`. They catch errors thrown from controllers and unknown paths, so do not add them again.

---

## 8. Validation

8.1 Zod schemas come from `@workspace/validation`. Never define them locally.
8.2 Import the schema in the **controller**.
8.3 Validate every piece of external data (body, params, query) in the controller before passing it to the service.

---

## 9. Database (Drizzle ORM v1)

9.1 The project uses the latest Drizzle ORM (**v1**). The API changed from older versions, so check the official v1 docs before writing queries; do not rely on old patterns.
9.2 Relations are defined in a **separate file** (`db/relations.ts`).
9.3 Schema in `db/schema.ts`, auth schema in `db/auth-schema.ts`, db instance in `db/index.ts`, migrations in `db/migrations/`.
9.4 Only query files import the db instance.

---

## 10. Authentication

10.1 `better-auth` is configured in `lib/auth.ts` and mounted in `app.ts` (see 5.2).
10.2 Check the better-auth docs for anything not covered here.

---

## 11. Types

11.1 Types shared with the client (request/response contracts) go in `@workspace/types`.
11.2 Feature-only types go in `features/<feature>/<feature>.types.ts`.
11.3 App-wide server-only types go in `src/types/xY.types.ts`.
11.4 Never use `any`.

---

## 12. Code Rules

12.1 No logic directly in controllers or route files. Extract it into a function (service or util).
12.2 Follow the naming conventions in the root `AGENTS.md`.
12.3 Keep code simple, readable, and clean.
