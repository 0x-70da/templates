# AGENTS.md (apps/client)

Next.js frontend. Read the root `AGENTS.md` first; this file adds client-specific rules.

These rules apply to **every Next.js app** in this repo (currently `apps/client`). When another Next.js app is added, it gets a copy of this file and follows it exactly (see root section 11).

> How to extend this file: add a new numbered section at the bottom, or a new numbered rule inside the matching section.

---

## 1. Stack

1.1 Next.js (App Router), React, TypeScript, Tailwind CSS.
1.2 Components: **shadcn with Base UI** (not Radix UI). See section 9.
1.3 Forms: `react-hook-form` with the zod resolver (section 6).
1.4 Auth: `better-auth` client in `lib/auth-client.ts` (section 12). The auth routes and base URL live on the backend (`apps/server`). Check the better-auth docs for details.
1.5 Client-side state: **zustand with immer** (section 13).

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
│   │   ├── requests/      # one file per request function (API and better-auth calls)
│   │   ├── stores/        # zustand stores used only by this feature
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
│   └── auth-client.ts     # better-auth client
├── requests/              # shared requests
├── stores/                # shared zustand stores (used by more than 2 features)
├── types/                 # shared app-only types
└── public/
```

2.1 Everything specific to a feature goes inside that feature's folder.
2.2 If something is used by **more than 2 features**, move it to the matching root-level folder outside `app/`.
2.3 Put the right file in the right place. Example: `ProductCard.tsx` -> `app/products/components/ProductCard.tsx`, or `components/products/ProductCard.tsx` if shared.
2.4 shadcn components are **not** placed in the client. They live in `@workspace/ui` (see section 9).
2.5 **One unit per file.** One request function per file in `requests/`, one store per file in `stores/`, one component per file, one hook per file. Never group several of them in one file.

---

## 3. Prebuilt Functions

3.1 `lib/api.ts` contains `get`, `post`, `put`, `patch`, `delete`. **Always use them. Never use the raw `fetch` keyword.**
3.2 They are generic. Always pass the proper response type.
3.3 **Only functions inside `requests/` folders may call `lib/api.ts` or `authClient` (`lib/auth-client.ts`).** Pages, sections, components, hooks, and stores never call them directly.

---

## 4. Pages, Sections and Data Flow

4.1 A **page** (`page.tsx`) does **not** fetch data and does not call request functions. It only composes sections and components, and wraps data-fetching sections in `Suspense`.
4.2 A **section** (`sections/XYSection.tsx`) is the unit responsible for fetching. It is an async server component that calls a function from the feature's `requests/` folder, then passes the data down to components as props.
4.3 Components receive data through props and only render it. They do not fetch GET data themselves.
4.4 Each section that fetches data is wrapped in `Suspense` in the page, with a loading skeleton as the `fallback`.
4.5 The skeleton is `XYSkeleton.tsx`, placed in the feature's `components/` folder (or the proper root-level `components/` folder if shared), and matches the layout of the section it replaces.
4.6 Components may call functions from the `requests/` folder directly for non-GET operations (create, update, delete, auth actions). They must still never call `lib/api.ts` or `authClient` directly.
4.7 Sections that do not fetch anything do not need `Suspense`.
4.8 Do not build manual loading/error handling for data fetching with `useState`/`useEffect`. Loading is handled by `Suspense` + skeletons, errors by `error.tsx` (section 5).
4.9 Never write a whole page as one big file. Split every page into focused sections and components (one responsibility each).

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

6.1 Zod schemas come from `@workspace/validation`. Never define them locally. If the schema you need does not exist, create it in `@workspace/validation` (the server shares it).
6.2 The `requests/` file that sends the data imports the schema (or its inferred type) from `@workspace/validation` to type and validate the payload.
6.3 **Every form, without exception, uses `react-hook-form` with `zodResolver`**, and the resolver receives the schema imported from `@workspace/validation`.
6.4 **Forbidden in forms:**

- `useState` for field values (no controlled-by-hand inputs).
- `useState` for validation errors, loading, or submit state.
- Manual validation with `if/else` chains or custom regex checks.

6.5 Use what react-hook-form already gives you: `register`/`Controller`/form field components for inputs, `handleSubmit` for submitting, `formState.errors` for field errors, `formState.isSubmitting` for pending state, and `setError("root", ...)` for errors coming back from the server or better-auth.
6.6 The form submit handler only calls a function from `requests/` (see 3.3). It does not contain business logic.
6.7 Each form is its own component (e.g. `LoginForm.tsx`) so the page stays a composition of small parts.

```tsx
// app/login/components/LoginForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@workspace/validation";
import type { LoginInput } from "@workspace/types";
import { loginWithEmail } from "../requests/loginWithEmail";

export function LoginForm() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    try {
      await loginWithEmail(values);
    } catch (error) {
      form.setError("root", { message: getErrorMessage(error) });
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* fields */}</form>;
}
```

(Names above are illustrative. Follow the real schema and type names in the packages.)

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
9.3 Add components with the client script: from `apps/client` run `pnpm shadcn <component>` (it runs `pnpm dlx shadcn@latest add`). After it finishes, verify the files landed in `packages/ui/src/components` and nothing was created inside the client. If files are misplaced, move them and notify the owner. If unsure about where a command will place files, ask first.
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

11.1 Do not write logic directly in a page, section, or component. Extract it into a function (a util, a hook, or a request function).
11.2 Follow the naming conventions in the root `AGENTS.md` (components `XY.tsx`, sections `XYSection.tsx`, skeletons `XYSkeleton.tsx`, hooks `useXY.ts`, requests `xY.ts`, stores `xY.store.ts`, types `xY.types.ts`).
11.3 Keep code simple, readable, and clean.
11.4 Do not take shortcuts that skip these rules (see root 1.5).

---

## 12. Authentication (better-auth on the client)

12.1 `lib/auth-client.ts` exports `authClient`. **Only functions inside `requests/` folders may use it** (see 3.3).
12.2 Every better-auth operation gets its **own function in its own file** inside the proper `requests/` folder, named after what it does: `loginWithEmail.ts`, `signUpWithEmail.ts`, `loginWithGoogle.ts`, `logout.ts`, `updateProfile.ts`, `changePassword.ts`, `getSession.ts`, etc.
12.3 That function holds the whole logic of the operation: it calls `authClient`, handles the `{ data, error }` result, and returns a typed value or throws an error with a clear message. The component or form that calls it only handles the UI (see 6.5).
12.4 **Never** write `authClient.signIn.email(...)`, `authClient.signUp.email(...)`, `authClient.signOut()`, `authClient.useSession()`, or any other `authClient` call inside a page, section, or component. Create a request function instead.
12.5 Auth pages (login, register, account, etc.) are split into small focused components. The page only composes them. Example for login: `LoginForm.tsx`, `SocialLoginButtons.tsx`, `LoginHeader.tsx`. Example for account: `AccountInfoCard.tsx`, `ChangePasswordForm.tsx`, `LogoutButton.tsx`.
12.6 Auth forms follow section 6 (react-hook-form + zod from `@workspace/validation`).
12.7 If an auth request function is used by more than 2 features, move it to the root `requests/` folder.

```ts
// app/login/requests/loginWithEmail.ts
import { authClient } from "@/lib/auth-client";
import type { LoginInput } from "@workspace/types";

export async function loginWithEmail(input: LoginInput): Promise<void> {
  const { error } = await authClient.signIn.email(input);

  if (error) {
    throw new Error(error.message ?? "Unable to sign in");
  }
}
```

---

## 13. Client-Side State (zustand + immer)

13.1 Client-side state (cart, UI state shared between components, multi-step flow state, etc.) uses **zustand with the immer middleware** (`zustand/middleware/immer`).
13.2 Do **not** use `createContext`, `useReducer`, or prop drilling to manage shared app state (for example, a cart). Context is only for providers like theme.
13.3 Zustand holds **client-owned state only**. Data that comes from the API is fetched in sections (section 4) and is not copied into a store.
13.4 One store per file, named `xY.store.ts`, exporting a hook named `useXYStore` (e.g. `cart.store.ts` -> `useCartStore`). Feature-only stores go in `app/<feature>/stores/`. A store used by more than 2 features goes in the root `stores/` folder.
13.5 Type the state and the actions explicitly. Never use `any`.
13.6 Read from the store with selectors (`useCartStore((state) => state.items)`), not by subscribing to the whole store.
13.7 Keep store actions thin. Put reusable logic in small functions (at the bottom of the store file or in `utils/`).
13.8 Stores are used in Client Components only. If you use `persist` (e.g. for a cart), handle hydration correctly and check the zustand docs for Next.js usage.

```ts
// stores/cart.store.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type CartItem = { productId: string; quantity: number };

type CartState = { items: CartItem[] };

type CartActions = {
  addItem: (productId: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState & CartActions>()(
  immer((set) => ({
    items: [],
    addItem: (productId) =>
      set((state) => {
        increaseOrAddItem(state.items, productId);
      }),
    clearCart: () => set({ items: [] }),
  })),
);

function increaseOrAddItem(items: CartItem[], productId: string): void {
  const existing = items.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    items.push({ productId, quantity: 1 });
  }
}
```

---

## 14. Commands

Run from `apps/client`, or from the repo root with `pnpm --filter ./apps/client <script>`.

| Command              | What it does                                  |
| -------------------- | --------------------------------------------- |
| `pnpm dev`           | `next dev` (long-running)                     |
| `pnpm build`         | `next build`                                  |
| `pnpm start`         | `next start` (needs a build first)            |
| `pnpm lint`          | ESLint                                        |
| `pnpm typecheck`     | `tsc --noEmit`                                |
| `pnpm shadcn <name>` | `pnpm dlx shadcn@latest add <name>` (see 9.3) |

14.1 After any client change run `pnpm lint` and `pnpm typecheck`, and fix every error.
14.2 Run `pnpm build` when the change touches caching (`use cache`), metadata, route structure (`error.tsx`, `not-found.tsx`, `Suspense` boundaries), or `next.config.ts`, or when asked. Many Next.js errors only appear at build time.
14.3 Never run `dev` or `start` unless asked (they never exit).
14.4 Add a package with `pnpm add <pkg> --filter ./apps/client`. Zustand and immer are the approved state libraries (13.1).
