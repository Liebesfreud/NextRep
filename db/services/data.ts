import { db } from "../client";
import { workouts, strengthPresets, dailyCheckins, bodyMetrics, userProfile } from "../schema";

// ─── Export All Data ──────────────────────────────────────────────────────────

export async function exportAllData() {
    const [
        workoutRows,
        presetRows,
        checkinRows,
        metricRows,
        profileRows,
    ] = await Promise.all([
        db.select().from(workouts),
        db.select().from(strengthPresets),
        db.select().from(dailyCheckins),
        db.select().from(bodyMetrics),
        db.select().from(userProfile),
    ]);

    return {
        version: 1,
        exportedAt: new Date().toISOString(),
        workouts: workoutRows.map((w) => ({
            ...w,
            createdAt: new Date(w.createdAt).toISOString(),
        })),
        strengthPresets: presetRows.map((p) => ({
            ...p,
            createdAt: new Date(p.createdAt).toISOString(),
        })),
        dailyCheckins: checkinRows.map((c) => ({
            ...c,
            createdAt: new Date(c.createdAt).toISOString(),
        })),
        bodyMetrics: metricRows.map((m) => ({
            ...m,
            createdAt: new Date(m.createdAt).toISOString(),
        })),
        userProfile: profileRows[0] ?? null,
    };
}

// ─── Import All Data ──────────────────────────────────────────────────────────

export async function importAllData(data: ReturnType<typeof exportAllData> extends Promise<infer T> ? T : never): Promise<void> {
    // Clear all existing data first
    await db.delete(workouts);
    await db.delete(strengthPresets);
    await db.delete(dailyCheckins);
    await db.delete(bodyMetrics);
    await db.delete(userProfile);

    // Re-insert
    if (data.workouts?.length) {
        for (const w of data.workouts) {
            await db.insert(workouts).values({
                ...w,
                createdAt: new Date(w.createdAt),
            }).onConflictDoNothing();
        }
    }
    if (data.strengthPresets?.length) {
        for (const p of data.strengthPresets) {
            await db.insert(strengthPresets).values({
                ...p,
                createdAt: new Date(p.createdAt),
            }).onConflictDoNothing();
        }
    }
    if (data.dailyCheckins?.length) {
        for (const c of data.dailyCheckins) {
            await db.insert(dailyCheckins).values({
                ...c,
                createdAt: new Date(c.createdAt),
            }).onConflictDoNothing();
        }
    }
    if (data.bodyMetrics?.length) {
        for (const m of data.bodyMetrics) {
            await db.insert(bodyMetrics).values({
                ...m,
                createdAt: new Date(m.createdAt),
            }).onConflictDoNothing();
        }
    }
    if (data.userProfile) {
        await db.insert(userProfile).values(data.userProfile).onConflictDoUpdate({
            target: userProfile.id,
            set: data.userProfile,
        });
    }
}

// ─── Clear All Data ───────────────────────────────────────────────────────────

export async function clearDatabase(): Promise<void> {
    await db.delete(workouts);
    await db.delete(strengthPresets);
    await db.delete(dailyCheckins);
    await db.delete(bodyMetrics);
    await db.delete(userProfile);
}
