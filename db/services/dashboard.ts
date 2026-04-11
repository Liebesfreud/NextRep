import { db } from "../client";
import { workouts, dailyCheckins, bodyMetrics } from "../schema";
import { gte, lt, and, asc, desc, sql } from "drizzle-orm";
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
    deltaFrom90Days: number | null;
    deltaFrom365Days: number | null;
    recentPoints: number[];
    recentRecords: BodyMetricPoint[];
};

type DashboardBodyMetrics = {
    weight: BodyMetricSummary;
    bodyFat: BodyMetricSummary;
};

type ReviewPeriodSummary = {
    workouts: number;
    activeDays: number;
    totalVolumeKg: number;
    strengthWorkouts: number;
    cardioWorkouts: number;
    topExercise: string | null;
    averageVolumePerWorkoutKg: number;
    consistencyRate: number;
    summary: string;
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

function normalizeMetricType(metricType: string | null | undefined): BodyMetricType | null {
    if (!metricType) return null;
    const normalized = metricType.trim().toLowerCase();
    if (["weight", "体重"].includes(normalized)) return "weight";
    if (["bodyfat", "body_fat", "body-fat", "fat", "体脂", "体脂率"].includes(normalized)) return "bodyFat";
    return null;
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
    let deltaFrom90Days: number | null = null;
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

        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        let target90: BodyMetricPoint | null = null;
        for (const r of sorted) {
            if (new Date(r.dateStr + "T00:00:00") <= ninetyDaysAgo) {
                target90 = r;
                break;
            }
        }
        if (!target90 && sorted.length > 1) target90 = sorted[sorted.length - 1];
        if (target90 && target90 !== latest)
            deltaFrom90Days = latest.value - target90.value;

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
        deltaFrom90Days,
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

    const points: BodyMetricPoint[] = rows.flatMap((r) => {
        const metricType = normalizeMetricType(r.metricType);
        if (!metricType) return [];

        return [{
            id: r.id,
            metricType,
            value: Number(r.value),
            dateStr: r.dateStr,
            createdAt: new Date(r.createdAt).toISOString(),
        }];
    });

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
    if (Number.isNaN(w)) return 0;

    try {
        if (sets.trim().startsWith("[")) {
            const parsed = JSON.parse(sets) as Array<{ reps?: number | string; isCompleted?: boolean }>;
            if (Array.isArray(parsed)) {
                const effectiveSets = parsed.some((set) => set?.isCompleted)
                    ? parsed.filter((set) => set?.isCompleted)
                    : parsed;
                const totalReps = effectiveSets.reduce((sum, set) => {
                    const reps = typeof set?.reps === "number"
                        ? set.reps
                        : parseInt(String(set?.reps ?? "0"), 10);
                    return sum + (Number.isFinite(reps) ? reps : 0);
                }, 0);
                return totalReps > 0 ? w * totalReps : 0;
            }
        }
    } catch {
        // Fallback to legacy text parsing below.
    }

    const normalizedSets = sets.replace(/×/g, "x");
    const parts = normalizedSets.split("x").map((s: string) => s.trim());
    let totalReps = 0;
    if (parts.length === 2)
        totalReps = parseInt(parts[0], 10) * parseInt(parts[1], 10);
    else if (parts.length === 1)
        totalReps = parseInt(parts[0], 10);
    if (Number.isNaN(totalReps)) return 0;
    return w * totalReps;
}

function buildReviewSummary(
    periodWorkouts: Array<{ name: string; type: string; weight: string | null; sets: string | null; createdAt: Date }>,
    expectedDays: number
): ReviewPeriodSummary {
    const activeDaySet = new Set<string>();
    const exerciseCountMap: Record<string, number> = {};

    let totalVolumeKg = 0;
    let strengthWorkouts = 0;
    let cardioWorkouts = 0;

    for (const workout of periodWorkouts) {
        const dateKey = normalizeDate(new Date(workout.createdAt));
        activeDaySet.add(dateKey);
        exerciseCountMap[workout.name] = (exerciseCountMap[workout.name] || 0) + 1;

        if (workout.type === "strength") strengthWorkouts += 1;
        if (workout.type === "cardio") cardioWorkouts += 1;

        totalVolumeKg += calculateVolume(workout.weight, workout.sets);
    }

    const topExercise = Object.entries(exerciseCountMap)
        .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const workouts = periodWorkouts.length;
    const activeDays = activeDaySet.size;
    const averageVolumePerWorkoutKg = workouts > 0 ? totalVolumeKg / workouts : 0;
    const consistencyRate = expectedDays > 0 ? activeDays / expectedDays : 0;

    let summary = "本周期还没有训练记录，先完成一次训练吧。";
    if (workouts > 0) {
        const consistencyText = consistencyRate >= 0.6 ? "节奏不错" : consistencyRate >= 0.3 ? "还在建立节奏" : "频率偏低";
        const focusText =
            strengthWorkouts > cardioWorkouts ? "以力量训练为主" :
                cardioWorkouts > strengthWorkouts ? "以有氧训练为主" : "力量和有氧比较均衡";
        const topExerciseText = topExercise ? `高频动作是 ${topExercise}` : "还没有明显高频动作";

        summary = `${consistencyText}，这段时间共训练 ${workouts} 次、活跃 ${activeDays} 天，${focusText}，${topExerciseText}。`;
    }

    return {
        workouts,
        activeDays,
        totalVolumeKg,
        strengthWorkouts,
        cardioWorkouts,
        topExercise,
        averageVolumePerWorkoutKg,
        consistencyRate,
        summary,
    };
}

function getTrackedDays(periodWorkouts: Array<{ createdAt: Date }>): number {
    if (periodWorkouts.length === 0) return 1;

    const timestamps = periodWorkouts
        .map((workout) => new Date(workout.createdAt).getTime())
        .sort((a, b) => a - b);

    const first = new Date(timestamps[0]);
    const last = new Date(timestamps[timestamps.length - 1]);
    const start = new Date(first.getFullYear(), first.getMonth(), first.getDate()).getTime();
    const end = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime();

    return Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1);
}

export async function getDashboardData(year: number, month: number) {
    const today = new Date();

    // Limits checkins to recent ones (e.g., past 100 days to find streak)
    const checkDateLimit = new Date();
    checkDateLimit.setDate(checkDateLimit.getDate() - 100);

    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay() || 7;
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 1);

    // Parallel fetch independent metrics
    const [
        allCheckins,
        weekWorkouts,
        monthWorkouts,
        analyticsRows,
        bm,
        profile,
    ] = await Promise.all([
        // 1. Checkins for streak (limited to 100)
        db.select({ dateStr: dailyCheckins.dateStr })
            .from(dailyCheckins)
            .where(gte(dailyCheckins.dateStr, normalizeDate(checkDateLimit)))
            .orderBy(desc(dailyCheckins.dateStr)),

        // 2. Workouts this week
        db.select()
            .from(workouts)
            .where(gte(workouts.createdAt, startOfWeek)),

        // 3. Monthly data
        db.select()
            .from(workouts)
            .where(and(gte(workouts.createdAt, startOfMonth), lt(workouts.createdAt, endOfMonth))),

        // 4. Content Analytics - Uses SQLite group by instead of JS memory aggregation
        db.select({
            name: workouts.name,
            sessions: sql<number>`cast(count(${workouts.id}) as integer)`,
            // We'll calculate volume post-query since it relies on JS logic (calculateVolume), 
            // but doing it grouped by name limits the result set massively.
        })
            .from(workouts)
            .groupBy(workouts.name),

        // 5. Body Metrics
        getBodyMetricsSummary(),

        // 6. User Profile
        getUserProfile(),
    ]);

    // Calculate Streak
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

    const workoutsThisWeek = weekWorkouts.length;

    // Monthly Volume & Daily Splitting
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
                duration: Math.floor(Math.random() * 30) + 30, // Mock duration
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

    // We still have to run through all workouts to compute accurate volume 
    // due to the custom logic of calculateVolume, but we pull ONLY what's needed for the 5 biggest grouped sessions.
    // To do this fully in SQL requires a complex string sum on weight and sets, which is unreliable across databases,
    // so we will query only the rows matching the top groups if necessary, or just query all like before but ONLY map the volume
    // But since `analyticsRows` has all unique names + session counts, let's just query to calculate volumes for them 
    // Wait, the previous logic parsed everything. Let's do a more robust approach to volume calculation.

    const allRelevantWorkouts = await db.select().from(workouts);
    const analyticsMap: Record<string, { sessions: number; volume: number }> = {};

    analyticsRows.forEach(row => {
        analyticsMap[row.name] = { sessions: row.sessions, volume: 0 };
    });

    allRelevantWorkouts.forEach(w => {
        if (analyticsMap[w.name]) {
            analyticsMap[w.name].volume += calculateVolume(w.weight, w.sets);
        }
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

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthlyReview = buildReviewSummary(monthWorkouts, daysInMonth);
    const weeklyReview = buildReviewSummary(weekWorkouts, 7);
    const allTimeReview = buildReviewSummary(allRelevantWorkouts, getTrackedDays(allRelevantWorkouts));

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
        profileTargets: {
            weight: profile.targetWeight,
            bodyFat: profile.targetBodyFat,
        },
        weeklyReview,
        monthlyReview,
        allTimeReview,
    };
}
