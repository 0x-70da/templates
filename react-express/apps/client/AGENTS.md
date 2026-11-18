# AGENTS.md (Client)

This file holds the rules for the **React Vite SPA client** (`apps/client`).
Read root `AGENTS.md` first.

---

## 1. Architecture & Routing

1.1 Routing is handled by **React Router v7** in SPA mode via `src/router.tsx` using `createBrowserRouter` and `RouterProvider`.
1.2 Pages live in `src/pages/<Name>Page.tsx` and represent full screen views.
1.3 Reusable domain components live in `src/components/<domain>/<ComponentName>.tsx`.
1.4 Generic error boundary lives in `src/components/error/RouteErrorBoundary.tsx`.

---

## 2. Data Fetching & State

2.1 Server data fetching must use **TanStack Query v5** (`useQuery`, `useMutation`).
2.2 Every network request is encapsulated inside `src/requests/<domain>/<action>.ts` using the typed `api` helper from `src/lib/api.ts`.
2.3 Contracts and response types are imported from `@workspace/types`.
2.4 Client-only global state is managed with **Zustand + Immer** in `src/stores/<domain>/<domain>.store.ts`.

---

## 3. UI & Styling

3.1 Styling is powered by **Tailwind CSS v4** and `tw-animate-css`.
3.2 UI components are imported from `@workspace/ui` (Base UI based shadcn components).
3.3 Skeletons live in `src/components/<domain>/<Name>Skeleton.tsx` for loading states.

---

## 4. Testing

4.1 Tests are written using **Vitest** + `@testing-library/react` + `@testing-library/jest-dom`.
4.2 Test files live under `test/<domain>/<Component>.test.tsx` or `test/stores/<store>.test.ts`.
4.3 Run tests with `pnpm test`.
