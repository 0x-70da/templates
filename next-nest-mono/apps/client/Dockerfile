FROM node:24-alpine AS base
RUN corepack enable && npm i -g turbo
WORKDIR /app

FROM base AS pruner
COPY . .
RUN turbo prune client --docker

FROM base AS builder
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .

# NEXT_PUBLIC_* بتتثبت وقت الـ build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN turbo run build --filter=client

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app

COPY --from=builder --chown=app:app /app/apps/client/.next/standalone ./
COPY --from=builder --chown=app:app /app/apps/client/.next/static ./apps/client/.next/static
COPY --from=builder --chown=app:app /app/apps/client/public ./apps/client/public

USER app
EXPOSE 3000
CMD ["node", "apps/client/server.js"]