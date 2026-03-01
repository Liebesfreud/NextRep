import { db } from "../client";
import { workouts, strengthPresets, dailyCheckins } from "../schema";
import { eq, gte, lt, and } from "drizzle-orm";
import * as Crypto from "expo-crypto";

// ─── Types ────────────────────────────────────────────────────────────────────

export type WorkoutItem = {
    id: string;
    type: string;
    name: string;
    weight: string | null;
    sets: string | null;
    stats: string | null;
    createdAt: string; // ISO string
};

export type StrengthPresetItem = {
    name: string;
    tag: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayDateStr(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function toWorkoutItem(row: {
    id: string;
    type: string;
    name: string;
    weight: string | null;
    sets: string | null;
    stats: string | null;
    createdAt: Date;
}): WorkoutItem {
    return { ...row, createdAt: row.createdAt.toISOString() };
}

// ─── Check-in ─────────────────────────────────────────────────────────────────

export async function isTodayCheckedIn(): Promise<boolean> {
    const dateStr = getTodayDateStr();
    const rows = await db
        .select()
        .from(dailyCheckins)
        .where(eq(dailyCheckins.dateStr, dateStr));
    return rows.length > 0;
}

export async function checkinToday(): Promise<void> {
    const dateStr = getTodayDateStr();
    await db
        .insert(dailyCheckins)
        .values({ id: Crypto.randomUUID(), dateStr })
        .onConflictDoNothing();
}

export async function removeTodayCheckin(): Promise<void> {
    const dateStr = getTodayDateStr();
    await db.delete(dailyCheckins).where(eq(dailyCheckins.dateStr, dateStr));
}

export async function getCheckinsByMonth(
    year: number,
    month: number
): Promise<Record<number, boolean>> {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
    const rows = await db
        .select()
        .from(dailyCheckins)
        .where(
            and(
                gte(dailyCheckins.dateStr, prefix + "01"),
                lt(dailyCheckins.dateStr, prefix + "32")
            )
        );
    const result: Record<number, boolean> = {};
    for (const c of rows) {
        const day = parseInt(c.dateStr.split("-")[2], 10);
        result[day] = true;
    }
    return result;
}

// ─── Workouts ─────────────────────────────────────────────────────────────────

export async function getTodayWorkouts(): Promise<WorkoutItem[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const rows = await db
        .select()
        .from(workouts)
        .where(
            and(gte(workouts.createdAt, startOfDay), lt(workouts.createdAt, endOfDay))
        )
        .orderBy(workouts.createdAt);

    return rows.map(toWorkoutItem);
}

export async function addWorkout(data: {
    type: "strength" | "cardio";
    name: string;
    weight?: string;
    sets?: string;
    stats?: string;
}): Promise<void> {
    await db.insert(workouts).values({
        id: Crypto.randomUUID(),
        type: data.type,
        name: data.name,
        weight: data.weight ?? null,
        sets: data.sets ?? null,
        stats: data.stats ?? null,
    });
    await removeTodayCheckin();
}

export async function updateWorkout(
    id: string,
    data: {
        type?: "strength" | "cardio";
        name?: string;
        weight?: string;
        sets?: string;
        stats?: string;
    }
): Promise<void> {
    await db
        .update(workouts)
        .set({
            ...(data.name && { name: data.name }),
            weight: data.weight ?? null,
            sets: data.sets ?? null,
            stats: data.stats ?? null,
        })
        .where(eq(workouts.id, id));
    await removeTodayCheckin();
}

export async function deleteWorkout(id: string): Promise<void> {
    await db.delete(workouts).where(eq(workouts.id, id));
    await removeTodayCheckin();
}

export async function getWorkoutsByMonth(
    year: number,
    month: number
): Promise<Record<number, number>> {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);

    const rows = await db
        .select({ createdAt: workouts.createdAt })
        .from(workouts)
        .where(and(gte(workouts.createdAt, start), lt(workouts.createdAt, end)));

    const dayMap: Record<number, number> = {};
    for (const w of rows) {
        const day = new Date(w.createdAt).getDate();
        dayMap[day] = (dayMap[day] || 0) + 1;
    }
    return dayMap;
}

// ─── Strength Presets ─────────────────────────────────────────────────────────

export async function getStrengthPresets(): Promise<StrengthPresetItem[]> {
    const rows = await db
        .select()
        .from(strengthPresets)
        .orderBy(strengthPresets.createdAt);
    return rows.map((p) => ({ name: p.name, tag: p.tag }));
}

export async function addStrengthPreset(
    name: string,
    tag?: string
): Promise<void> {
    name = name.trim();
    if (!name) return;
    await db
        .insert(strengthPresets)
        .values({ id: Crypto.randomUUID(), name, tag: tag ?? null })
        .onConflictDoNothing();
}

export async function removeStrengthPreset(name: string): Promise<void> {
    await db.delete(strengthPresets).where(eq(strengthPresets.name, name));
}
