# AGENTS.md (apps/client)

Next.js frontend. Read the root `AGENTS.md` first; this file adds client-specific rules.

> How to extend this file: add a new numbered section at the bottom, or a new numbered rule inside the matching section.

---

## 1. Stack

1.1 Next.js (App Router), React, TypeScript, Tailwind CSS.
1.2 Components: **shadcn with Base UI** (not Radix UI). See section 9.
1.3 Forms: `react-hook-form` with the zod resolver.
1.4 Auth: `better-auth` client in `lib/auth-client.ts`. The auth routes and base URL live on the backend (`apps/server`). Check the better-auth docs for details.

---

## 2. Structure (Feature-Based)

The client is organized by feature, and features live inside the `app/` folder (not a `features/` folder).

```
apps/client/
├── app/
│   ├── <feature>/
│   │   ├── components/    # feature components (including XYSkeleton.tsx loading skeletons)
│   │   ├── sections/      # XYSection.tsx: page sections (they fetch data)
│   │   ├── hooks/         # hooks used only by this feature
│   │   ├── requests/      # API request functions of this feature
│   │   ├── types/         # types used only by this feature
│   │   ├── utils/         # utils used only by this feature
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── error.tsx          # root error boundary
│   ├── global-error.tsx   # root layout error boundary
│   ├── not-found.tsx      # root 404
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/            # shared components (used by more than 2 features)
│   └── <group>/           # e.g. components/products/ProductCard.tsx
├── constants/
├── hooks/                 # shared hooks
├── lib/
│   ├── api.ts             # prebuilt fetch functions
│   └── auth-client.ts
├── requests/              # shared requests
├── types/                 # shared app-only types
└── public/
```

2.1 Everything specific to a feature goes inside that feature's folder.
2.2 If something is used by **more than 2 features**, move it to the matching root-level folder outside `app/`.
2.3 Put the right file in the right place. Example: `ProductCard.tsx` -> `app/products/components/ProductCard.tsx`, or `components/products/ProductCard.tsx` if shared.
2.4 shadcn components are **not** placed in the client. They live in `@workspace/ui` (see section 9).

---

## 3. Prebuilt Functions

3.1 `lib/api.ts` contains `get`, `post`, `put`, `patch`, `delete`. **Always use them. Never use the raw `fetch` keyword.**
3.2 They are generic. Always pass the proper response type.
3.3 **Only functions inside `requests/` folders may call `lib/api.ts`.** Pages, sections, and components never call it directly.

---

## 4. Pages, Sections and Data Flow

4.1 A **page** (`page.tsx`) does **not** fetch data and does not call request functions. It only composes sections and wraps data-fetching sections in `Suspense`.
4.2 A **section** (`sections/XYSection.tsx`) is the unit responsible for fetching. It is an async server component that calls a function from the feature's `requests/` folder, then passes the data down to components as props.
4.3 Components receive data through props and only render it. They do not fetch GET data themselves.
4.4 Each section that fetches data is wrapped in `Suspense` in the page, with a loading skeleton as the `fallback`.
4.5 The skeleton is `XYSkeleton.tsx`, placed in the feature's `components/` folder (or the proper root-level `components/` folder if shared), and matches the layout of the section it replaces.
4.6 Components may call functions from the `requests/` folder directly for non-GET operations (create, update, delete). They must still never call `lib/api.ts` directly.
4.7 Sections that do not fetch anything do not need `Suspense`.
4.8 Do not build manual loading/error handling for data fetching with `useState`/`useEffect`. Loading is handled by `Suspense` + skeletons, errors by `error.tsx` (section 5).

```tsx
// app/products/page.tsx
import { Suspense } from "react";
import { ProductListSection } from "./sections/ProductListSection";
import { ProductListSkeleton } from "./components/ProductListSkeleton";

export default function ProductsPage() {
  return (
    <main>
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductListSection />
      </Suspense>
    </main>
  );
}
```

```
page.tsx
  └─ <Suspense fallback={<XYSkeleton />}>
       └─ sections/XYSection.tsx -> requests/xY.ts -> lib/api.ts -> server
            └─ components/XY.tsx (receives data as props)
```

---

## 5. Error and Not-Found Handling

5.1 Every route (feature) has its own `error.tsx` and `not-found.tsx`.
5.2 The root has `app/error.tsx`, `app/not-found.tsx`, and `app/global-error.tsx` (global-error catches errors in the root layout).
5.3 `error.tsx` must be a Client Component (`"use client"`), show a clear message, and include a **Retry** button that calls the `reset` function.
5.4 `not-found.tsx` shows a suitable 404 message for that route and includes a **Back** button. The back button needs `router.back()`, so make it a small shared client component and reuse it everywhere.
5.5 Trigger the not-found UI from sections/pages with `notFound()` when the requested resource does not exist.
5.6 Messages must be user-friendly. Never show raw error messages, stack traces, or internal details to the user.

---

## 6. Validation and Forms

6.1 Zod schemas come from `@workspace/validation`. Never define them locally.
6.2 Import the schema in the **`requests/` file** that calls `lib/api.ts`.
6.3 Every form uses `react-hook-form` with `zodResolver`, using the schema from `@workspace/validation`.

---

## 7. Caching (`use cache`)

7.1 Caching is applied to the **functions in the `requests/` folders**, because they are the ones that talk to the API.
7.2 **Not every function needs `use cache` and not every page needs to be cached.** Cache only when there is a real benefit, and choose the refresh policy based on how the data behaves (how often it changes, how stale it may be).
7.3 Public (non-user-specific) data: evaluate caching the request function with `use cache`, with a cache tag and a lifetime that suits the data.
7.4 Public pages: use **page-level** caching when the page content is suitable for reuse.
7.5 Independent sections: use **component-level** caching only when there is a clear reason to isolate that section.
7.6 **User-specific data must never be cached in a way that is shared between users.**
7.7 After CRUD operations, refresh the cache with `updateTag` (when the user must see the change immediately) or `revalidateTag` (when a slight delay is acceptable). Choose based on how fast the update must appear.
7.8 Time-sensitive data (stock, balances, availability, prices at checkout, etc.): even if a cached copy is shown in the UI, verify against the trusted source when performing the important operation.
7.9 Cache invalidation (`updateTag` / `revalidateTag`) runs on the server (Server Action or Route Handler), not in a client component. No actions folder is defined yet, so **notify the owner before adding one**.
7.10 Check the current Next.js docs for `use cache`, `cacheTag`, `cacheLife`, `updateTag`, and `revalidateTag` before using them. Their APIs and required config (`cacheComponents`) change between versions.

---

## 8. Accessibility, Semantics and Performance

8.1 Use **semantic HTML**: `main`, `header`, `nav`, `section`, `article`, `aside`, `footer`, proper heading order (one `h1` per page, no skipped levels), `button` for actions, `a` for navigation, `ul/ol` for lists.
8.2 Accessibility: meaningful `alt` text (empty `alt=""` for decorative images), labels for every form input, visible focus states, full keyboard support, correct `aria-*` only when semantics are not enough, enough color contrast, respect `prefers-reduced-motion`.
8.3 Images: **always use `next/image`, never the plain `img` tag.** Provide `width`/`height` (or `fill` with sizes), a proper `sizes` prop for responsive images, and `priority` only for above-the-fold (LCP) images.
8.4 Fonts: use `next/font`. Do not load fonts through manual `<link>` tags.
8.5 Keep Client Components to a minimum. Default to Server Components and add `"use client"` only to the smallest component that needs interactivity.
8.6 Lazy-load heavy components that are not needed on first render (`next/dynamic`). Avoid heavy dependencies when a small solution works.
8.7 Use `Suspense` + skeletons to stream slow sections (section 4), and avoid layout shift (reserve space for images and skeletons).
8.8 Set page `metadata` (title, description) for every route, and use `next/link` for internal navigation.
8.9 All of the above must follow the structure and code rules in this file. Performance work never justifies breaking the folder structure, data flow, or naming rules.

---

## 9. UI and Styling

9.1 shadcn is used with **Base UI**, not Radix UI. Do not install or import Radix primitives.
9.2 **All shadcn components are installed into `@workspace/ui`** (`packages/ui`) and imported from there (e.g. `@workspace/ui/components/button`). Do not add shadcn components inside `apps/client`.
9.3 Follow the shadcn monorepo setup when adding components (see `components.json` in `apps/client` and `packages/ui`). If unsure about where a command will place files, ask first.
9.4 Prefer shadcn components (or other shadcn registries if provided) over building from scratch.
9.5 Mobile-first and responsive.
9.6 Use Tailwind utilities. Do not write custom CSS.
9.7 Use the variables and utilities defined in `app/globals.css` so styling stays consistent.
9.8 Non-shadcn shared components go in `components/` (e.g. `components/helper-components/`).

---

## 10. Types

10.1 Shared and contract types (anything that crosses client/server) come from `@workspace/types`.
10.2 Component props types live in the same file as the component.
10.3 Feature-only types go in the feature's `types/` folder (`xY.types.ts`).
10.4 Never use `any`.

---

## 11. Code Rules

11.1 Do not write logic directly in a page, section, or component. Extract it into a function (a util or a hook).
11.2 Follow the naming conventions in the root `AGENTS.md` (components `XY.tsx`, sections `XYSection.tsx`, skeletons `XYSkeleton.tsx`, hooks `useXY.ts`, requests `xY.ts`, types `xY.types.ts`).
11.3 Keep code simple, readable, and clean.
