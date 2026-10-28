FROM node:24-alpine

WORKDIR /app

RUN npm install --global pnpm@11.25.0

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY turbo.json .

COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN pnpm install --frozen-lockfile

COPY . .

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["pnpm", "dev"]
