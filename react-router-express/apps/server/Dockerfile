FROM node:24-alpine AS base
RUN corepack enable && npm i -g turbo
WORKDIR /app

# 1) نقص الـ monorepo على اللي الـ server محتاجه بس
FROM base AS pruner
COPY . .
RUN turbo prune server --docker

# 2) install كامل + build
FROM base AS builder
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=server

# 3) production dependencies بس
FROM base AS prod-deps
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod

# 4) الـ image النهائية
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app

COPY --from=prod-deps --chown=app:app /app/node_modules ./node_modules
COPY --from=prod-deps --chown=app:app /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=builder --chown=app:app /app/apps/server/dist ./apps/server/dist
COPY --from=builder --chown=app:app /app/apps/server/package.json ./apps/server/package.json

USER app
WORKDIR /app/apps/server
EXPOSE 4000
CMD ["node", "dist/server.js"]