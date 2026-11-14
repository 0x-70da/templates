# 🐺 Anubis

نظام **RAG** للكلية. دلوقتي في مرحلة الـ **Demo**.

المشروع **Turborepo monorepo** فيه `client` و `server` وكام package مشتركة.

---

## 🧰 التقنيات

| الجزء   | التقنيات                                                                                  |
| ------- | ----------------------------------------------------------------------------------------- |
| Client  | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, TanStack Query, Zustand, React Hook Form |
| Server  | Express 5, TypeScript, Drizzle ORM, PostgreSQL, Better Auth                               |
| Shared  | Zod schemas, Shared types, ESLint/TS configs, UI components                               |
| Tooling | pnpm, Turborepo, Docker, Prettier                                                         |

---

## 📁 بنية المشروع

```
Anubis/
├── apps/
│   ├── client/        # Next.js (الواجهة)
│   └── server/        # Express API
└── packages/
    ├── types/             # الـ types المشتركة
    ├── validation/        # الـ Zod schemas المشتركة
    ├── ui/                # عناصر shadcn المشتركة
    ├── eslint-config/     # إعدادات ESLint
    └── typescript-config/ # إعدادات TypeScript
```

- كل **types** المشتركة بين الـ client والـ server بتتحط في `packages/types`.
- كل **Zod schemas** بتتحط في `packages/validation` عشان نستخدمها في الاتنين.
- عناصر الـ UI المشتركة (shadcn) في `packages/ui`.
- قواعد الكود وتنظيم الـ folders موجودة في ملفات **`AGENTS.md`** (في الـ root وفي كل app).

---

## ✅ المتطلبات

- **Node.js** `>= 24`
- **pnpm** `12.4.2`
- **Docker** (لقاعدة البيانات)

---

## 🚀 تشغيل المشروع

```bash
# 1. نزّل الـ dependencies
pnpm install

# 2. جهّز الـ env files (شوف القسم اللي تحت)

# 3. شغّل قاعدة البيانات
pnpm db:up

# 4. اعمل الجداول في الداتابيز
pnpm --filter server db:push

# 5. شغّل المشروع
pnpm dev
```

> أمر `pnpm dev` بيشغّل الداتابيز (Docker) أوتوماتيك عبر `predev` في حالة لو كانت مقفولة، لكن لتطبيق الـ schema لأول مرة بـ `db:push` لازم تبدأ الداتابيز أولاً بـ `pnpm db:up`.

---

## 🔐 Environment Variables

اعمل ملفين وانسخ فيهم القيم دي:

### `apps/server/.env`

```env
# Server
PORT=8000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database (used by Docker container & Drizzle)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=anubis
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/anubis

# Better Auth
BETTER_AUTH_SECRET=change-me-to-a-long-random-string
BETTER_AUTH_URL=http://localhost:8000

# Cloudinary (لرفع الصور)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### `apps/client/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> ⚠️ ممنوع نرفع أي `.env` على GitHub. ولو عايز تولّد `BETTER_AUTH_SECRET`:
> `openssl rand -base64 32`

---

## 🛠️ الأوامر

### من الـ root

| الأمر            | الوظيفة                                 |
| ---------------- | --------------------------------------- |
| `pnpm dev`       | تشغيل كل المشروع (client + server + DB) |
| `pnpm build`     | عمل build للمشروع كله                   |
| `pnpm lint`      | فحص الكود بـ ESLint                     |
| `pnpm typecheck` | فحص الـ TypeScript                      |
| `pnpm format`    | تنسيق الكود بـ Prettier                 |
| `pnpm db:up`     | تشغيل الداتابيز (Docker)                |
| `pnpm db:down`   | إيقاف الداتابيز                         |

### Server (`pnpm --filter server <command>`)

| الأمر           | الوظيفة                          |
| --------------- | -------------------------------- |
| `db:generate`   | توليد migration من الـ schema    |
| `db:migrate`    | تطبيق الـ migrations             |
| `db:push`       | رفع الـ schema مباشرة (للتطوير)  |
| `db:studio`     | فتح Drizzle Studio               |
| `auth:generate` | توليد auth schema من Better Auth |

### Client

| الأمر                                            | الوظيفة                                                 |
| ------------------------------------------------ | ------------------------------------------------------- |
| `pnpm --filter ./apps/client shadcn <component>` | إضافة component جديد من shadcn (يُضاف في `packages/ui`) |

---

## 🐳 Docker

- `docker-compose.dev.yml` → للتطوير (الداتابيز بس).
- `docker-compose.yml` → للـ production.

---

## 🤝 قبل ما تعمل Commit

```bash
pnpm lint && pnpm typecheck && pnpm format
```
