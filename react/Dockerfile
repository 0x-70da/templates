FROM node:24-alpine

WORKDIR /app

RUN npm install --global pnpm@11.25.0

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY turbo.json .

COPY apps/client/package.json ./apps/client/
COPY packages/ui/package.json ./packages/ui/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN pnpm install --frozen-lockfile

COPY . .

WORKDIR /app/apps/client

EXPOSE 5173

CMD ["pnpm", "dev"]
