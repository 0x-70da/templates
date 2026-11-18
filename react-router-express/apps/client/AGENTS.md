# AGENTS.md (Client)

This file holds the rules for the **React Router v7 Framework Mode client** (`apps/client`).
Read root `AGENTS.md` first.

---

## 1. Architecture & Routing

1.1 Routing is defined in `app/routes.ts` using `index` and `route` from `@react-router/dev/routes`.
1.2 Route modules live in `app/routes/<route>.tsx`.
1.3 Root document layout and error boundaries are configured in `app/root.tsx`.
1.4 Reusable domain components live in `app/components/<domain>/<ComponentName>.tsx`.

---

## 2. Data Fetching & Mutations

2.1 Route data loading must use route `loader` functions calling typed functions in `app/requests/<domain>/`.
2.2 Data mutations must use route `action` functions and React Router `Form` components.
2.3 All action input data must be parsed and validated with Zod schemas imported from `@workspace/validation`.
2.4 Contracts and response types are imported from `@workspace/types`.
2.5 Client-only UI state is managed with **Zustand + Immer** in `app/stores/<domain>/<domain>.store.ts`.

---

## 3. UI & Styling

3.1 Styling is powered by **Tailwind CSS v4** and `tw-animate-css`.
3.2 UI components are imported from `@workspace/ui` (Base UI based shadcn components).
3.3 Skeletons live in `app/components/<domain>/<Name>Skeleton.tsx` for loading states.

---

## 4. Testing

4.1 Tests are written using **Vitest** + `@testing-library/react` + `@testing-library/jest-dom`.
4.2 Test files live under `test/` following the `<source>.test.tsx` naming convention.
4.3 Run tests with `pnpm test`.
