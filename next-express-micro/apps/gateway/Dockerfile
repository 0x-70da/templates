FROM node:24-alpine AS base
RUN corepack enable && npm i -g turbo
WORKDIR /app
FROM base AS pruner
COPY . .
RUN turbo prune gateway --docker
FROM base AS builder
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=gateway
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app/apps/gateway/dist ./apps/gateway/dist
COPY --from=builder --chown=app:app /app/apps/gateway/package.json ./apps/gateway/package.json
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
USER app
WORKDIR /app/apps/gateway
EXPOSE 4000
CMD ["node", "dist/server.js"]
