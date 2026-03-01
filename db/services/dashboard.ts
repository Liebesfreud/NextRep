import { db } from "../client";
import { workouts, dailyCheckins, bodyMetrics } from "../schema";
import { gte, lt, and, asc, desc } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import { getUserProfile } from "./profile";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DailySummary = {
    day: number;
    isWorkout: boolean;
    workouts: { id: string; name: string; weight: string | null; sets: string | null; type: string }[];
    volume: number;
    duration: number;
};

export type BodyMetricType = "weight" | "bodyFat";

export type BodyMetricPoint = {
    id: string;
    metricType: BodyMetricType;
    value: number;
    dateStr: string;
    createdAt: string;
};

type BodyMetricSummary = {
    latestValue: number | null;
    latestDateStr: string | null;
    deltaFromPrevious: number | null;
    deltaFrom30Days: number | null;
    deltaFrom365Days: number | null;
    recentPoints: number[];
    recentRecords: BodyMetricPoint[];
};

type DashboardBodyMetrics = {
    weight: BodyMetricSummary;
    bodyFat: BodyMetricSummary;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function daysSince(dateStr: string | null): number | null {
    if (!dateStr) return null;
    const target = new Date(`${dateStr}T00:00:00`);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = today.getTime() - target.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function buildMetricSummary(rows: BodyMetricPoint[]): BodyMetricSummary {
    const sorted = [...rows].sort((a, b) => {
        if (a.dateStr === b.dateStr)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return a.dateStr > b.dateStr ? -1 : 1;
    });

    const latest = sorted[0] ?? null;
    const previous = sorted[1] ?? null;

    let deltaFrom30Days: number | null = null;
    let deltaFrom365Days: number | null = null;

    if (latest) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let target30: BodyMetricPoint | null = null;
        for (const r of sorted) {
            if (new Date(r.dateStr + "T00:00:00") <= thirtyDaysAgo) {
                target30 = r;
                break;
            }
        }
        if (!target30 && sorted.length > 1) target30 = sorted[sorted.length - 1];
        if (target30 && target30 !== latest)
            deltaFrom30Days = latest.value - target30.value;

        const oneYearAgo = new Date();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);
        let target365: BodyMetricPoint | null = null;
        for (const r of sorted) {
            if (new Date(r.dateStr + "T00:00:00") <= oneYearAgo) {
                target365 = r;
                break;
            }
        }
        if (!target365 && sorted.length > 1) target365 = sorted[sorted.length - 1];
        if (target365 && target365 !== latest)
            deltaFrom365Days = latest.value - target365.value;
    }

    return {
        latestValue: latest ? latest.value : null,
        latestDateStr: latest ? latest.dateStr : null,
        deltaFromPrevious:
            latest && previous ? latest.value - previous.value : null,
        deltaFrom30Days,
        deltaFrom365Days,
        recentPoints: sorted
            .slice(0, 30)
            .reverse()
            .map((r) => r.value),
        recentRecords: sorted.slice(0, 365),
    };
}

// ─── Body Metrics ─────────────────────────────────────────────────────────────

async function getBodyMetricsSummary(): Promise<DashboardBodyMetrics> {
    const rows = await db
        .select()
        .from(bodyMetrics)
        .orderBy(desc(bodyMetrics.dateStr), desc(bodyMetrics.createdAt))
        .limit(400);

    const points: BodyMetricPoint[] = rows.map((r) => ({
        id: r.id,
        metricType: r.metricType === "bodyFat" ? "bodyFat" : "weight",
        value: Number(r.value),
        dateStr: r.dateStr,
        createdAt: new Date(r.createdAt).toISOString(),
    }));

    const weightRows = points.filter((p) => p.metricType === "weight");
    const bodyFatRows = points.filter((p) => p.metricType === "bodyFat");

    return {
        weight: buildMetricSummary(weightRows),
        bodyFat: buildMetricSummary(bodyFatRows),
    };
}

export async function addBodyMetric(input: {
    metricType: BodyMetricType;
    value: number;
    dateStr?: string;
}): Promise<void> {
    const metricType =
        input.metricType === "bodyFat" ? "bodyFat" : "weight";
    const value = Number(input.value);
    const dateStr =
        input.dateStr || normalizeDate(new Date());

    if (!Number.isFinite(value) || value <= 0) throw new Error("Invalid value");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) throw new Error("Invalid date");

    await db.insert(bodyMetrics).values({
        id: Crypto.randomUUID(),
        metricType,
        value,
        dateStr,
    });
}

// ─── Dashboard Data ───────────────────────────────────────────────────────────

function calculateVolume(weight: string | null, sets: string | null): number {
    if (!weight || !sets) return 0;
    const wMatch = weight.match(/[\d.]+/);
    if (!wMatch) return 0;
    const w = parseFloat(wMatch[0]);
    const parts = sets.split("x").map((s: string) => s.trim());
    let totalReps = 0;
    if (parts.length === 2)
        totalReps = parseInt(parts[0]) * parseInt(parts[1]);
    else if (parts.length === 1)
        totalReps = parseInt(parts[0]);
    if (isNaN(totalReps) || isNaN(w)) return 0;
    return w * totalReps;
}

export async function getDashboardData(year: number, month: number) {
    // 1. Streak
    const allCheckins = await db
        .select()
        .from(dailyCheckins)
        .orderBy(desc(dailyCheckins.dateStr));

    let streak = 0;
    const checkDate = new Date();
    const todayStr = normalizeDate(checkDate);
    const hasToday = allCheckins.some((c) => c.dateStr === todayStr);
    if (!hasToday) checkDate.setDate(checkDate.getDate() - 1);

    while (true) {
        const str = normalizeDate(checkDate);
        if (allCheckins.some((c) => c.dateStr === str)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else break;
    }

    // 2. Workouts this week
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay() || 7;
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekWorkouts = await db
        .select()
        .from(workouts)
        .where(gte(workouts.createdAt, startOfWeek));
    const workoutsThisWeek = weekWorkouts.length;

    // 3. Monthly data
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 1);

    const monthWorkouts = await db
        .select()
        .from(workouts)
        .where(
            and(
                gte(workouts.createdAt, startOfMonth),
                lt(workouts.createdAt, endOfMonth)
            )
        );

    let monthlyVolumeKg = 0;
    const dailyData: Record<number, DailySummary> = {};

    monthWorkouts.forEach((w) => {
        const day = new Date(w.createdAt).getDate();
        if (!dailyData[day]) {
            dailyData[day] = {
                day,
                isWorkout: true,
                workouts: [],
                volume: 0,
                duration: Math.floor(Math.random() * 30) + 30,
            };
        }
        const vol = calculateVolume(w.weight, w.sets);
        monthlyVolumeKg += vol;
        dailyData[day].volume += vol;
        dailyData[day].workouts.push({
            id: w.id,
            name: w.name,
            weight: w.weight,
            sets: w.sets,
            type: w.type,
        });
    });

    // 4. Analytics
    const allWorkouts = await db.select().from(workouts);
    const analyticsMap: Record<string, { sessions: number; volume: number }> = {};
    allWorkouts.forEach((w) => {
        if (!analyticsMap[w.name]) analyticsMap[w.name] = { sessions: 0, volume: 0 };
        analyticsMap[w.name].sessions += 1;
        analyticsMap[w.name].volume += calculateVolume(w.weight, w.sets);
    });

    const analytics = Object.entries(analyticsMap)
        .map(([name, data]) => ({
            name,
            sessions: data.sessions,
            volume: (data.volume / 1000).toFixed(1),
            unit: "t",
            trend: "+0%",
        }))
        .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
        .slice(0, 5);

    const bm = await getBodyMetricsSummary();
    const profile = await getUserProfile();

    return {
        streak,
        workoutsThisWeek,
        monthlyVolumeTon: (monthlyVolumeKg / 1000).toFixed(1),
        dailyData,
        analytics,
        bodyMetrics: bm,
        bodyMetricDaysAgo: {
            weight: daysSince(bm.weight.latestDateStr),
            bodyFat: daysSince(bm.bodyFat.latestDateStr),
        },
        profileHeight: profile.height,
    };
}
