import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

// Open (or create) the database file once — reused as a singleton
const expoDb = SQLite.openDatabaseSync("nextrep.db", {
  enableChangeListener: true,
});

export const db = drizzle(expoDb, { schema });

// ─── Database Initialisation ─────────────────────────────────────────────────
// Creates tables if they don't already exist.
// Call this once at app startup (e.g., in _layout.tsx).
export async function initDatabase(): Promise<void> {
  await expoDb.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS "Workout" (
      "id"        TEXT PRIMARY KEY NOT NULL,
      "type"      TEXT NOT NULL,
      "name"      TEXT NOT NULL,
      "weight"    TEXT,
      "sets"      TEXT,
      "stats"     TEXT,
      "createdAt" INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS "StrengthPreset" (
      "id"        TEXT PRIMARY KEY NOT NULL,
      "name"      TEXT NOT NULL UNIQUE,
      "tag"       TEXT,
      "createdAt" INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS "DailyCheckin" (
      "id"        TEXT PRIMARY KEY NOT NULL,
      "dateStr"   TEXT NOT NULL UNIQUE,
      "createdAt" INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS "body_metrics" (
      "id"         TEXT PRIMARY KEY NOT NULL,
      "metricType" TEXT NOT NULL,
      "value"      REAL NOT NULL,
      "dateStr"    TEXT NOT NULL,
      "createdAt"  INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_body_metrics_type_date
      ON body_metrics (metricType, dateStr DESC);

    CREATE TABLE IF NOT EXISTS "UserProfile" (
      "id"        TEXT PRIMARY KEY NOT NULL DEFAULT 'me',
      "name"      TEXT NOT NULL DEFAULT '健身达人',
      "height"    REAL,
      "age"       INTEGER,
      "gender"    TEXT,
      "goal"      TEXT,
      "aiBaseUrl" TEXT,
      "aiApiKey"  TEXT,
      "aiModel"   TEXT,
      "aiConfigs" TEXT,
      "activeAiConfigId" TEXT,
      "aiTokensTotal" INTEGER DEFAULT 0,
      "aiTokensToday" INTEGER DEFAULT 0,
      "aiTokensDate" TEXT,
      "updatedAt" INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  // Safe migrations for early adopters
  try {
    await expoDb.execAsync(`
          ALTER TABLE "UserProfile" ADD COLUMN "aiConfigs" TEXT;
          ALTER TABLE "UserProfile" ADD COLUMN "activeAiConfigId" TEXT;
          ALTER TABLE "UserProfile" ADD COLUMN "aiTokensTotal" INTEGER DEFAULT 0;
          ALTER TABLE "UserProfile" ADD COLUMN "aiTokensToday" INTEGER DEFAULT 0;
          ALTER TABLE "UserProfile" ADD COLUMN "aiTokensDate" TEXT;
      `);
  } catch (e) {
    // Columns likely already exist
  }
}
