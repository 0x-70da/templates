# Expo EAS Mobile Application Template

An enterprise-ready mobile application template built with **Expo SDK 57**, **Expo Router**, **NativeWind**, local **SQLite** (via Drizzle ORM), and full integration with **Expo Application Services (EAS)** for native builds, distribution, and over-the-air updates.

## Features

- **Expo SDK 57 & React Native 0.86**: Latest native runtime with React 19 support.
- **Expo Router 57**: File-based routing with typed routes, tab/stack navigation, and web support.
- **NativeWind v5 (Tailwind CSS v4)**: Utility-first styling adapted for React Native primitives.
- **EAS Build & Updates**: Pre-configured `eas.json` for development, preview, and production builds, plus `expo-updates` OTA deployment.
- **Local SQLite with Drizzle ORM**: Type-safe local database queries and migrations using `expo-sqlite`.
- **State & Forms**: Zustand with Immer for state management, React Hook Form with Zod validation.
- **Quality Tooling**: Oxlint, Prettier, TypeScript, Husky, and Jest with `jest-expo` and `@testing-library/react-native`.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start local development
pnpm dev

# Run on physical dev client
pnpm dev:client

# Typecheck, lint, and test
pnpm typecheck
pnpm lint:ci
pnpm test
```

## EAS Workflow

### 1. Initialize EAS

```bash
eas login
eas init
```

Update `extra.eas.projectId` and `updates.url` in `app.json` with your generated project ID.

### 2. Build Profiles (`eas.json`)

- **Development Build** (with `expo-dev-client`):
  ```bash
  pnpm build:dev
  ```
- **Preview Build** (internal distribution / testing):
  ```bash
  pnpm build:preview
  ```
- **Production Build** (App Store & Play Store ready):
  ```bash
  pnpm build:prod
  ```

### 3. Over-the-Air Updates

```bash
# Push update to preview channel
pnpm update:preview --message "Update description"

# Push update to production channel
pnpm update:prod --message "Critical fix"
```
