import { db } from "../client";
import { workouts, strengthPresets, dailyCheckins, bodyMetrics, userProfile } from "../schema";
import { getUserProfile, type AIConfigItem, type UserProfileData } from "./profile";

// ─── Export All Data ──────────────────────────────────────────────────────────

export async function exportAllData() {
    const [
        workoutRows,
        presetRows,
        checkinRows,
        metricRows,
        normalizedProfile,
    ] = await Promise.all([
        db.select().from(workouts),
        db.select().from(strengthPresets),
        db.select().from(dailyCheckins),
        db.select().from(bodyMetrics),
        getUserProfile(),
    ]);

    return {
        version: 2,
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
        userProfile: normalizedProfile,
        apiConfig: {
            legacy: {
                baseUrl: normalizedProfile.aiBaseUrl,
                apiKey: normalizedProfile.aiApiKey,
                model: normalizedProfile.aiModel,
            },
            configs: normalizedProfile.aiConfigs,
            activeConfigId: normalizedProfile.activeAiConfigId,
        },
    };
}

// ─── Import All Data ──────────────────────────────────────────────────────────

type ExportedApiConfig = {
    legacy?: {
        baseUrl?: string | null;
        apiKey?: string | null;
        model?: string | null;
    } | null;
    configs?: AIConfigItem[] | null;
    activeConfigId?: string | null;
};

type ExportedUserProfile = Partial<UserProfileData> & {
    aiConfigs?: AIConfigItem[] | string | null;
};

type ImportPayload = Awaited<ReturnType<typeof exportAllData>> & {
    apiConfig?: ExportedApiConfig;
    userProfile?: ExportedUserProfile | null;
};

function normalizeImportedAiConfigs(value: ExportedUserProfile["aiConfigs"]): AIConfigItem[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function buildImportedProfile(data: ImportPayload): UserProfileData | null {
    if (!data.userProfile && !data.apiConfig) return null;

    const rawProfile = data.userProfile ?? {};
    const apiConfig = data.apiConfig;
    const normalizedAiConfigs = normalizeImportedAiConfigs(rawProfile.aiConfigs) || apiConfig?.configs || [];

    return {
        name: rawProfile.name ?? "健身达人",
        height: rawProfile.height ?? null,
        age: rawProfile.age ?? null,
        gender: rawProfile.gender ?? null,
        goal: rawProfile.goal ?? null,
        aiBaseUrl: rawProfile.aiBaseUrl ?? apiConfig?.legacy?.baseUrl ?? null,
        aiApiKey: rawProfile.aiApiKey ?? apiConfig?.legacy?.apiKey ?? null,
        aiModel: rawProfile.aiModel ?? apiConfig?.legacy?.model ?? null,
        aiConfigs: normalizedAiConfigs,
        activeAiConfigId: rawProfile.activeAiConfigId ?? apiConfig?.activeConfigId ?? normalizedAiConfigs[0]?.id ?? null,
        aiTokensTotal: rawProfile.aiTokensTotal ?? 0,
        aiTokensToday: rawProfile.aiTokensToday ?? 0,
        aiTokensDate: rawProfile.aiTokensDate ?? null,
    };
}

export async function importAllData(data: ImportPayload): Promise<void> {
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

    const importedProfile = buildImportedProfile(data);
    if (importedProfile) {
        const aiConfigsStr = JSON.stringify(importedProfile.aiConfigs);
        await db.insert(userProfile).values({
            id: "me",
            name: importedProfile.name,
            height: importedProfile.height,
            age: importedProfile.age,
            gender: importedProfile.gender,
            goal: importedProfile.goal,
            aiBaseUrl: importedProfile.aiBaseUrl,
            aiApiKey: importedProfile.aiApiKey,
            aiModel: importedProfile.aiModel,
            aiConfigs: aiConfigsStr,
            activeAiConfigId: importedProfile.activeAiConfigId,
            aiTokensTotal: importedProfile.aiTokensTotal,
            aiTokensToday: importedProfile.aiTokensToday,
            aiTokensDate: importedProfile.aiTokensDate,
        }).onConflictDoUpdate({
            target: userProfile.id,
            set: {
                name: importedProfile.name,
                height: importedProfile.height,
                age: importedProfile.age,
                gender: importedProfile.gender,
                goal: importedProfile.goal,
                aiBaseUrl: importedProfile.aiBaseUrl,
                aiApiKey: importedProfile.aiApiKey,
                aiModel: importedProfile.aiModel,
                aiConfigs: aiConfigsStr,
                activeAiConfigId: importedProfile.activeAiConfigId,
                aiTokensTotal: importedProfile.aiTokensTotal,
                aiTokensToday: importedProfile.aiTokensToday,
                aiTokensDate: importedProfile.aiTokensDate,
            },
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
