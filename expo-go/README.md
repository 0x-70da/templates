# Expo Go Mobile Template

A mobile application template built with Expo SDK 57, Expo Router, NativeWind, local SQLite via Drizzle ORM, Zustand, and React Hook Form.

## Tech Stack

- **Framework**: Expo SDK 57, React Native 0.86, React 19
- **Routing**: Expo Router (file-based stack and tab navigation)
- **Styling**: NativeWind v5 (Tailwind CSS v4 for React Native)
- **Local Database**: `expo-sqlite` with Drizzle ORM
- **State Management**: Zustand + Immer
- **Forms & Validation**: React Hook Form, Zod
- **Testing**: Jest, `jest-expo`, `@testing-library/react-native`
- **Tooling**: Oxlint, Prettier, Husky, lint-staged

## Getting Started

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Start Development Server**:

   ```bash
   pnpm dev
   ```

3. **Run on Platform**:
   - Press `a` in the terminal for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for Web preview
   - Scan the QR code with the Expo Go app on your phone

## Scripts

- `pnpm dev`: Start Expo dev server
- `pnpm lint:ci`: Run Oxlint type-aware lint checks
- `pnpm format:check`: Check code formatting with Prettier
- `pnpm typecheck`: Run TypeScript compiler typechecks
- `pnpm test`: Run unit tests with Jest
- `pnpm db:generate`: Generate SQLite migrations with Drizzle Kit
