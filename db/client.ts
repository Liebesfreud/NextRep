import * as SQLite from "expo-sqlite";
import { drizzle as drizzleExpo } from "drizzle-orm/expo-sqlite";
import { drizzle as drizzleProxy } from "drizzle-orm/sqlite-proxy";
import { Platform } from "react-native";
import * as schema from "./schema";

const sqliteOptions = {
  enableChangeListener: true,
};

const webExpoDb =
  Platform.OS === "web"
    ? SQLite.openDatabaseAsync("nextrep.db", sqliteOptions)
    : undefined;

const nativeExpoDb =
  Platform.OS === "web"
    ? undefined
    : SQLite.openDatabaseSync("nextrep.db", sqliteOptions);

async function getExpoDb(): Promise<SQLite.SQLiteDatabase> {
  return nativeExpoDb ?? (await webExpoDb!);
}

function rowToValues(row: Record<string, unknown>): unknown[] {
  return Object.keys(row).map((key) => row[key]);
}

type AppDatabase = ReturnType<typeof drizzleExpo<typeof schema>>;

async function addColumnIfMissing(
  database: SQLite.SQLiteDatabase,
  tableName: string,
  columnName: string,
  definition: string,
): Promise<void> {
  const columns = await database.getAllAsync<{ name: string }>(
    `PRAGMA table_info("${tableName}")`,
  );

  if (columns.some((column) => column.name === columnName)) return;
  await database.execAsync(`ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${definition};`);
}

export const db: AppDatabase = (
  Platform.OS === "web"
    ? drizzleProxy(
        async (sql, params, method) => {
          const database = await getExpoDb();

          if (method === "run") {
            await database.runAsync(sql, params);
            return { rows: [] };
          }

          if (method === "get") {
            const row = await database.getFirstAsync<Record<string, unknown>>(
              sql,
              params,
            );
            return {
              rows: row
                ? (rowToValues(row) as never)
                : (undefined as unknown as never[]),
            };
          }

          const rows = await database.getAllAsync<Record<string, unknown>>(
            sql,
            params,
          );
          return { rows: rows.map(rowToValues) };
        },
        { schema },
      )
    : drizzleExpo(nativeExpoDb!, { schema })
) as unknown as AppDatabase;

// ─── Database Initialisation ─────────────────────────────────────────────────
// Creates tables if they don't already exist.
// Call this once at app startup (e.g., in _layout.tsx).
export async function initDatabase(): Promise<void> {
  const database = await getExpoDb();

  await database.execAsync(`
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

    CREATE INDEX IF NOT EXISTS idx_workout_created_at
      ON "Workout" ("createdAt");

    CREATE INDEX IF NOT EXISTS idx_workout_name
      ON "Workout" ("name");

    CREATE INDEX IF NOT EXISTS idx_daily_checkin_date_str
      ON "DailyCheckin" ("dateStr");

    CREATE TABLE IF NOT EXISTS "UserProfile" (
      "id"        TEXT PRIMARY KEY NOT NULL DEFAULT 'me',
      "name"      TEXT NOT NULL DEFAULT '健身达人',
      "height"    REAL,
      "age"       INTEGER,
      "gender"    TEXT,
      "goal"      TEXT,
      "targetWeight" REAL,
      "targetBodyFat" REAL,
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

  // Safe migrations for early adopters. Run one column at a time so an
  // already-existing column does not prevent later columns from being added.
  for (const [tableName, columnName, definition] of [
    ["UserProfile", "aiConfigs", "TEXT"],
    ["UserProfile", "activeAiConfigId", "TEXT"],
    ["UserProfile", "aiTokensTotal", "INTEGER DEFAULT 0"],
    ["UserProfile", "aiTokensToday", "INTEGER DEFAULT 0"],
    ["UserProfile", "aiTokensDate", "TEXT"],
    ["UserProfile", "targetWeight", "REAL"],
    ["UserProfile", "targetBodyFat", "REAL"],
    ["DailyCheckin", "aiEstimatedCal", "INTEGER"],
  ] as const) {
    await addColumnIfMissing(database, tableName, columnName, definition);
  }
}
