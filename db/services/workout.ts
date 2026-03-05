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

/** 按任意日期字符串（YYYY-MM-DD）查询运动记录 */
export async function getWorkoutsByDate(dateStr: string): Promise<WorkoutItem[]> {
    const [y, m, d] = dateStr.split("-").map(Number);
    const startOfDay = new Date(y, m - 1, d);
    const endOfDay = new Date(y, m - 1, d + 1);

    const rows = await db
        .select()
        .from(workouts)
        .where(
            and(gte(workouts.createdAt, startOfDay), lt(workouts.createdAt, endOfDay))
        )
        .orderBy(workouts.createdAt);

    return rows.map(toWorkoutItem);
}

/** 查询任意日期是否已打卡 */
export async function isDateCheckedIn(dateStr: string): Promise<boolean> {
    const rows = await db
        .select()
        .from(dailyCheckins)
        .where(eq(dailyCheckins.dateStr, dateStr));
    return rows.length > 0;
}

export async function addWorkout(data: {
    type: "strength" | "cardio";
    name: string;
    weight?: string;
    sets?: string;
    stats?: string;
    /** 指定记录日期（YYYY-MM-DD），不传则使用当前时间 */
    forDate?: string;
}): Promise<void> {
    let createdAt: Date | undefined;
    if (data.forDate) {
        const [y, m, d] = data.forDate.split("-").map(Number);
        // 存为当天正午 12:00，确保落在日期区间内
        createdAt = new Date(y, m - 1, d, 12, 0, 0);
    }
    await db.insert(workouts).values({
        id: Crypto.randomUUID(),
        type: data.type,
        name: data.name,
        weight: data.weight ?? null,
        sets: data.sets ?? null,
        stats: data.stats ?? null,
        ...(createdAt ? { createdAt } : {}),
    });
    // 仅当修改今天的记录时才重置打卡
    const todayStr = getTodayDateStr();
    if (!data.forDate || data.forDate === todayStr) {
        await removeTodayCheckin();
    }
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
