FROM node:24-alpine AS base
RUN corepack enable && npm i -g turbo
WORKDIR /app
FROM base AS pruner
COPY . .
RUN turbo prune auth-service --docker
FROM base AS builder
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=auth-service
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app/apps/auth-service/dist ./apps/auth-service/dist
COPY --from=builder --chown=app:app /app/apps/auth-service/package.json ./apps/auth-service/package.json
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
USER app
WORKDIR /app/apps/auth-service
EXPOSE 4001
CMD ["node", "dist/server.js"]
