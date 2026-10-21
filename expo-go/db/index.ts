// src/db/index.ts
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { relations } from "./relations";

export const expoDb = openDatabaseSync("app.db", {
  enableChangeListener: true,
});

expoDb.execSync("PRAGMA journal_mode = WAL;");
expoDb.execSync("PRAGMA foreign_keys = ON;");

export const db = drizzle(expoDb, { relations });
