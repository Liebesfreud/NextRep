import { db } from "../client";
import { workouts, strengthPresets, dailyCheckins } from "../schema";
import { eq, gte, lt, and } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import { calculateWorkoutPerformance } from "../domain/training";
import { buildTimestampForDate, getDateBounds, getTodayDateStr, toDateStr } from "@/db/domain/dates";

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

function buildWorkoutCreatedAt(forDate?: string): Date | undefined {
    return forDate ? buildTimestampForDate(forDate) : undefined;
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

export async function checkinDate(dateStr: string, aiEstimatedCal?: number | null): Promise<void> {
    await db
        .insert(dailyCheckins)
        .values({ id: Crypto.randomUUID(), dateStr, aiEstimatedCal: aiEstimatedCal ?? null })
        .onConflictDoUpdate({
            target: dailyCheckins.dateStr,
            set: { aiEstimatedCal: aiEstimatedCal ?? null },
        });
}

export async function checkinToday(aiEstimatedCal?: number | null): Promise<void> {
    const dateStr = getTodayDateStr();
    return checkinDate(dateStr, aiEstimatedCal);
}

export async function removeCheckinByDate(dateStr: string): Promise<void> {
    await db.delete(dailyCheckins).where(eq(dailyCheckins.dateStr, dateStr));
}

export async function removeTodayCheckin(): Promise<void> {
    const dateStr = getTodayDateStr();
    await removeCheckinByDate(dateStr);
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
    const { startOfDay, endOfDay } = getDateBounds(dateStr);

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

/** 查询任意日期的打卡记录信息 */
export async function getCheckinByDate(dateStr: string) {
    const rows = await db
        .select()
        .from(dailyCheckins)
        .where(eq(dailyCheckins.dateStr, dateStr));
    return rows.length > 0 ? rows[0] : null;
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
    const { forDate, ...item } = data;
    await addWorkouts([item], forDate);
}

export type AddWorkoutItem = {
    type: "strength" | "cardio";
    name: string;
    weight?: string;
    sets?: string;
    stats?: string;
};

export async function addWorkouts(items: AddWorkoutItem[], forDate?: string): Promise<void> {
    if (items.length === 0) return;

    const targetDateStr = forDate ?? getTodayDateStr();
    const createdAt = buildWorkoutCreatedAt(forDate);

    await db.transaction(async (tx) => {
        for (const item of items) {
            const performance = calculateWorkoutPerformance(item);
            await tx.insert(workouts).values({
                id: Crypto.randomUUID(),
                type: item.type,
                name: item.name,
                weight: item.weight ?? null,
                sets: item.sets ?? null,
                stats: item.stats ?? null,
                volumeKg: performance.volumeKg,
                totalReps: performance.totalReps,
                setCount: performance.setCount,
                maxWeightKg: performance.maxWeightKg,
                ...(createdAt ? { createdAt } : {}),
            });
        }

        await tx.delete(dailyCheckins).where(eq(dailyCheckins.dateStr, targetDateStr));
    });
}

export async function addWorkoutsForDate(items: AddWorkoutItem[], dateStr: string): Promise<void> {
    await addWorkouts(items, dateStr);
}

async function getWorkoutDateStrById(id: string): Promise<string | null> {
    const rows = await db
        .select({ createdAt: workouts.createdAt })
        .from(workouts)
        .where(eq(workouts.id, id));

    if (rows.length === 0) return null;
    return toDateStr(new Date(rows[0].createdAt));
}

async function getWorkoutRowById(id: string) {
    const rows = await db
        .select()
        .from(workouts)
        .where(eq(workouts.id, id));

    return rows[0] ?? null;
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
    const existing = await getWorkoutRowById(id);
    const workoutDateStr = existing ? toDateStr(new Date(existing.createdAt)) : null;
    const nextType = data.type ?? (existing?.type as "strength" | "cardio" | undefined);
    const nextWeight = data.weight !== undefined ? data.weight : existing?.weight ?? null;
    const nextSets = data.sets !== undefined ? data.sets : existing?.sets ?? null;
    const performance = calculateWorkoutPerformance({
        type: nextType,
        weight: nextWeight,
        sets: nextSets,
    });

    await db
        .update(workouts)
        .set({
            ...(data.type && { type: data.type }),
            ...(data.name && { name: data.name }),
            weight: nextWeight,
            sets: nextSets,
            stats: data.stats ?? null,
            volumeKg: performance.volumeKg,
            totalReps: performance.totalReps,
            setCount: performance.setCount,
            maxWeightKg: performance.maxWeightKg,
        })
        .where(eq(workouts.id, id));

    if (workoutDateStr) {
        await removeCheckinByDate(workoutDateStr);
    }
}

export async function deleteWorkout(id: string): Promise<void> {
    const workoutDateStr = await getWorkoutDateStrById(id);
    await db.delete(workouts).where(eq(workouts.id, id));

    if (workoutDateStr) {
        await removeCheckinByDate(workoutDateStr);
    }
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
