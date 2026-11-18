# AGENTS.md (Expo EAS Mobile App)

This is an **Expo with EAS (Expo Application Services)** mobile application template built with Expo SDK 57, Expo Router, NativeWind, local SQLite with Drizzle ORM, and full EAS Build / EAS Update workflow support.

---

## 1. Working Agreement

1.1 Follow the instructions in this file strictly.
1.2 Never guess when something is unclear. Ask first.
1.3 Put the right file in the right location with the right name.
1.4 Always run `pnpm typecheck`, `pnpm lint:ci`, and `pnpm test` before declaring work done.

---

## 2. Project Structure

```
expo-eas/
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
├── app.json                # Expo application config (bundle IDs, EAS projectId, updates)
├── babel.config.js         # Babel presets and plugins
├── drizzle.config.ts       # Drizzle Kit SQLite configuration
├── eas.json                # EAS Build and Submit profiles
├── metro.config.js         # Metro bundler config
├── package.json
└── tsconfig.json
```

---

## 3. Expo Router & Mobile Rules

3.1 Use **Expo Router** for all screen navigation. Every file in `src/app/` represents a route.
3.2 Navigators are defined in `_layout.tsx` files. Keep non-screen logic outside `src/app/`.
3.3 Use `Link` from `expo-router` for declarative navigation and `router` for imperative navigation.
3.4 Uses **Continuous Native Generation (CNG)**. Do not manually edit or check in `ios/` or `android/` folders unless debugging native modules. EAS Build generates native projects dynamically.

---

## 4. EAS Build & EAS Update Workflow

4.1 **Build Profiles** in `eas.json`:

- `development`: Builds a custom development client (`developmentClient: true`) for debugging custom native code with `expo-dev-client`. Run via `pnpm build:dev`.
- `preview`: Internal distribution build (`distribution: "internal"`) linked to the `preview` update channel. Run via `pnpm build:preview`.
- `production`: Store-ready release build (`channel: "production"`, `autoIncrement: true`). Run via `pnpm build:prod`.

4.2 **Development Client (`expo-dev-client`)**:

- Run `pnpm dev:client` to start Metro connected to a development build installed on your physical device or simulator.

4.3 **Over-the-Air Updates (`expo-updates`)**:

- Configured with runtime version policy `"appVersion"`.
- Push JS/asset updates without app store re-submission:
  - Preview channel: `pnpm update:preview --message="Bugfix for auth"`
  - Production channel: `pnpm update:prod --message="Critical patch"`

4.4 **Project ID Configuration**:

- Set your real EAS Project ID in `app.json` under `extra.eas.projectId` and `updates.url` (`https://u.expo.dev/<YOUR-PROJECT-ID>`) after running `eas init`.

---

## 5. State, Forms & Validation

5.1 Global client state uses **Zustand + Immer** located in `src/stores/<domain>/<name>.store.ts`.
5.2 Form management uses **React Hook Form** paired with `@hookform/resolvers/zod`.
5.3 Input validation schemas are defined with **Zod** in `src/validation/<domain>.validation.ts`. Never use manual `if/else` checks where Zod can validate.

---

## 6. Local Database (Drizzle + SQLite)

6.1 Local persistence uses `expo-sqlite` powered by **Drizzle ORM**.
6.2 Tables are defined in `db/schema.ts` using `sqliteTable`.
6.3 Run `pnpm db:generate` to generate migration files.

---

## 7. Code Quality & Standards

7.1 **Never use `any`.** Use precise types, generics, or `unknown` with narrowing.
7.2 Single-responsibility functions only. Keep screen components clean by extracting sub-components and hooks.
7.3 Code quality is verified using **Oxlint** (`pnpm lint:ci`) and **Prettier** (`pnpm format:check`).

---

## 8. Testing

8.1 Mobile tests use **Jest** with `jest-expo` preset and `@testing-library/react-native`.
8.2 Test files live under `test/` following the `<source>.test.tsx` naming convention.
8.3 Run unit tests with `pnpm test`.

---

## 9. Deviations from next-express

9.1 **Platform**: Built for mobile (iOS & Android via Expo SDK 57 / React Native 0.86) rather than web/Node.js.
9.2 **Routing**: Uses **Expo Router** file-system routing designed for mobile tab/stack navigators.
9.3 **UI**: Uses React Native primitives (`View`, `Text`, `Pressable`, `StyleSheet`) and NativeWind instead of DOM/Base UI elements.
9.4 **Database**: Uses local embedded SQLite (`expo-sqlite`) instead of a PostgreSQL server container.
9.5 **Native Tooling & Distribution**: Integrated with **EAS Build** and **EAS Update** via `eas.json`, `expo-dev-client`, and `expo-updates` for cloud native compilation and OTA updates.
9.6 **Test Runner**: Uses **Jest** + `jest-expo` instead of Vitest due to React Native native runtime bridge requirements.
