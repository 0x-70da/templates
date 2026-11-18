# AGENTS.md (Expo Mobile App)

This is an **Expo Go / React Native** mobile application template built with Expo SDK 57, Expo Router, NativeWind, and local SQLite with Drizzle ORM.

---

## 1. Working Agreement

1.1 Follow the instructions in this file strictly.
1.2 Never guess when something is unclear. Ask first.
1.3 Put the right file in the right location with the right name.
1.4 Always run `pnpm typecheck`, `pnpm lint:ci`, and `pnpm test` before declaring work done.

---

## 2. Project Structure

```
expo-go/
├── assets/                 # App icons, splash screens, assets
├── db/                     # Drizzle ORM + expo-sqlite schemas and migrations
│   ├── schema.ts           # SQLite table definitions
│   ├── relations.ts        # Table relations
│   └── index.ts            # expo-sqlite database instance
├── src/
│   ├── app/                # Expo Router screens and layout navigators
│   ├── components/         # Reusable mobile UI components
│   ├── constants/          # Theme constants and tokens
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand + Immer global stores
│   ├── types/              # Domain TypeScript types
│   ├── validation/         # Zod schemas for input validation
│   └── global.css          # NativeWind CSS entry point
├── test/                   # Jest + testing-library tests
├── app.json                # Expo application config
├── babel.config.js         # Babel presets and plugins
├── drizzle.config.ts       # Drizzle Kit SQLite configuration
├── metro.config.js         # Metro bundler config
├── package.json
└── tsconfig.json
```

---

## 3. Expo Router & Mobile Rules

3.1 Use **Expo Router** for all screen navigation. Every file in `src/app/` represents a route.
3.2 Navigators are defined in `_layout.tsx` files. Keep non-screen logic outside `src/app/`.
3.3 Use `Link` from `expo-router` for declarative navigation and `router` for imperative navigation.
3.4 If `ios/` and `android/` folders are not present, do not create them manually. Expo uses Continuous Native Generation (CNG).

---

## 4. State, Forms & Validation

4.1 Global client state uses **Zustand + Immer** located in `src/stores/<domain>/<name>.store.ts`.
4.2 Form management uses **React Hook Form** paired with `@hookform/resolvers/zod`.
4.3 Input validation schemas are defined with **Zod** in `src/validation/<domain>.validation.ts`. Never use manual `if/else` checks where Zod can validate.

---

## 5. Local Database (Drizzle + SQLite)

5.1 Local persistence uses `expo-sqlite` powered by **Drizzle ORM**.
5.2 Tables are defined in `db/schema.ts` using `sqliteTable`.
5.3 Run `pnpm db:generate` to generate migration files.

---

## 6. Code Quality & Standards

6.1 **Never use `any`.** Use precise types, generics, or `unknown` with narrowing.
6.2 Single-responsibility functions only. Keep screen components clean by extracting sub-components and hooks.
6.3 Code quality is verified using **Oxlint** (`pnpm lint:ci`) and **Prettier** (`pnpm format:check`).

---

## 7. Testing

7.1 Mobile tests use **Jest** with `jest-expo` preset and `@testing-library/react-native`.
7.2 Test files live under `test/` following the `<source>.test.tsx` naming convention.
7.3 Run unit tests with `pnpm test`.

---

## 8. Deviations from next-express

8.1 **Platform**: Built for mobile (iOS & Android via Expo SDK 57 / React Native 0.86) rather than web/Node.js.
8.2 **Routing**: Uses **Expo Router** file-system routing designed for mobile tab/stack navigators.
8.3 **UI**: Uses React Native primitives (`View`, `Text`, `Pressable`, `StyleSheet`) and NativeWind instead of DOM/Base UI elements.
8.4 **Database**: Uses local embedded SQLite (`expo-sqlite`) instead of a PostgreSQL server container.
8.5 **Test Runner**: Uses **Jest** + `jest-expo` instead of Vitest due to React Native native runtime bridge requirements.
