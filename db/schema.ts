import { text, real, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import * as Crypto from "expo-crypto";

// ─── Workout ────────────────────────────────────────────────────────────────
export const workouts = sqliteTable("Workout", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => Crypto.randomUUID()),
    type: text("type").notNull(), // "strength" | "cardio"
    name: text("name").notNull(),
    weight: text("weight"),
    sets: text("sets"),
    stats: text("stats"),
    createdAt: integer("createdAt", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
});

// ─── StrengthPreset ──────────────────────────────────────────────────────────
export const strengthPresets = sqliteTable("StrengthPreset", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => Crypto.randomUUID()),
    name: text("name").notNull().unique(),
    tag: text("tag"),
    createdAt: integer("createdAt", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
});

// ─── DailyCheckin ────────────────────────────────────────────────────────────
export const dailyCheckins = sqliteTable("DailyCheckin", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => Crypto.randomUUID()),
    dateStr: text("dateStr").notNull().unique(), // YYYY-MM-DD
    aiEstimatedCal: integer("aiEstimatedCal"), // 预测的总耗能
    createdAt: integer("createdAt", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
});

// ─── BodyMetric ──────────────────────────────────────────────────────────────
export const bodyMetrics = sqliteTable("body_metrics", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => Crypto.randomUUID()),
    metricType: text("metricType").notNull(), // "weight" | "bodyFat"
    value: real("value").notNull(),
    dateStr: text("dateStr").notNull(), // YYYY-MM-DD
    createdAt: integer("createdAt", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
});

// ─── UserProfile ─────────────────────────────────────────────────────────────
export const userProfile = sqliteTable("UserProfile", {
    id: text("id").primaryKey().default("me"),
    name: text("name").notNull().default("健身达人"),
    height: real("height"),
    age: integer("age"),
    gender: text("gender"),
    goal: text("goal"),
    targetWeight: real("targetWeight"),
    targetBodyFat: real("targetBodyFat"),
    aiBaseUrl: text("aiBaseUrl"), // Legacy
    aiApiKey: text("aiApiKey"),     // Legacy
    aiModel: text("aiModel"),       // Legacy

    // Multi-AI Config fields
    aiConfigs: text("aiConfigs"), // Stored as JSON string
    activeAiConfigId: text("activeAiConfigId"),

    aiTokensTotal: integer("aiTokensTotal").default(0),
    aiTokensToday: integer("aiTokensToday").default(0),
    aiTokensDate: text("aiTokensDate"), // YYYY-MM-DD to reset today's tokens
    updatedAt: integer("updatedAt", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
});

// ─── Type Exports ─────────────────────────────────────────────────────────────
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type StrengthPreset = typeof strengthPresets.$inferSelect;
export type DailyCheckin = typeof dailyCheckins.$inferSelect;
export type BodyMetric = typeof bodyMetrics.$inferSelect;
export type UserProfile = typeof userProfile.$inferSelect;
