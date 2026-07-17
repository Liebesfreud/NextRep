import * as SQLite from "expo-sqlite";
import { drizzle as drizzleExpo } from "drizzle-orm/expo-sqlite";
import { drizzle as drizzleProxy } from "drizzle-orm/sqlite-proxy";
import { Platform } from "react-native";
import * as schema from "./schema";
import { calculateWorkoutPerformance } from "./domain/training";

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

async function backfillWorkoutPerformance(database: SQLite.SQLiteDatabase): Promise<void> {
  const rows = await database.getAllAsync<{
    id: string;
    type: string;
    weight: string | null;
    sets: string | null;
    volumeKg: number | null;
    totalReps: number | null;
    setCount: number | null;
    maxWeightKg: number | null;
  }>(`
    SELECT "id", "type", "weight", "sets", "volumeKg", "totalReps", "setCount", "maxWeightKg"
    FROM "Workout"
    WHERE "type" = 'strength'
      AND (
        "volumeKg" IS NULL OR "totalReps" IS NULL OR "setCount" IS NULL OR "maxWeightKg" IS NULL
        OR ("volumeKg" = 0 AND "totalReps" = 0 AND "setCount" = 0 AND "maxWeightKg" = 0)
      );
  `);

  for (const row of rows) {
    const performance = calculateWorkoutPerformance(row);
    await database.runAsync(
      `
        UPDATE "Workout"
        SET "volumeKg" = ?, "totalReps" = ?, "setCount" = ?, "maxWeightKg" = ?
        WHERE "id" = ?;
      `,
      [
        performance.volumeKg,
        performance.totalReps,
        performance.setCount,
        performance.maxWeightKg,
        row.id,
      ],
    );
  }
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
      "volumeKg"  REAL NOT NULL DEFAULT 0,
      "totalReps" INTEGER NOT NULL DEFAULT 0,
      "setCount"  INTEGER NOT NULL DEFAULT 0,
      "maxWeightKg" REAL NOT NULL DEFAULT 0,
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

    CREATE INDEX IF NOT EXISTS idx_workout_type_created_at
      ON "Workout" ("type", "createdAt");

    CREATE INDEX IF NOT EXISTS idx_workout_name_created_at
      ON "Workout" ("name", "createdAt");

    CREATE INDEX IF NOT EXISTS idx_workout_type_name_created_at
      ON "Workout" ("type", "name", "createdAt");

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
    ["Workout", "volumeKg", "REAL NOT NULL DEFAULT 0"],
    ["Workout", "totalReps", "INTEGER NOT NULL DEFAULT 0"],
    ["Workout", "setCount", "INTEGER NOT NULL DEFAULT 0"],
    ["Workout", "maxWeightKg", "REAL NOT NULL DEFAULT 0"],
  ] as const) {
    await addColumnIfMissing(database, tableName, columnName, definition);
  }

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_workout_type_created_at
      ON "Workout" ("type", "createdAt");

    CREATE INDEX IF NOT EXISTS idx_workout_name_created_at
      ON "Workout" ("name", "createdAt");

    CREATE INDEX IF NOT EXISTS idx_workout_type_name_created_at
      ON "Workout" ("type", "name", "createdAt");
  `);

  await backfillWorkoutPerformance(database);
}
