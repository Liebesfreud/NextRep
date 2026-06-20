import { db } from "../client";
import { workouts, strengthPresets, dailyCheckins, bodyMetrics, userProfile } from "../schema";
import { getUserProfile, type AIConfigItem, type UserProfileData } from "./profile";
import {
    CURRENT_BACKUP_VERSION,
    isRecord,
    validateImportPayload,
    type ExportedUserProfile,
    type ImportPayload,
} from "@/db/domain/backupValidation";

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
        version: CURRENT_BACKUP_VERSION,
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

function isAIConfigItem(value: unknown): value is AIConfigItem {
    if (!isRecord(value)) return false;
    return typeof value.id === "string"
        && typeof value.name === "string"
        && typeof value.baseUrl === "string"
        && typeof value.apiKey === "string"
        && typeof value.model === "string";
}

function normalizeImportedAiConfigs(value: ExportedUserProfile["aiConfigs"]): AIConfigItem[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(isAIConfigItem);

    try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter(isAIConfigItem) : [];
    } catch {
        return [];
    }
}

function buildImportedProfile(data: ImportPayload): UserProfileData | null {
    if (!data.userProfile && !data.apiConfig) return null;

    const rawProfile: ExportedUserProfile = data.userProfile ?? {};
    const apiConfig = data.apiConfig;
    const profileAiConfigs = normalizeImportedAiConfigs(rawProfile.aiConfigs);
    const apiConfigs = Array.isArray(apiConfig?.configs) ? apiConfig.configs.filter(isAIConfigItem) : [];
    const normalizedAiConfigs = profileAiConfigs.length > 0 ? profileAiConfigs : apiConfigs;

    return {
        name: rawProfile.name ?? "健身达人",
        height: rawProfile.height ?? null,
        age: rawProfile.age ?? null,
        gender: rawProfile.gender ?? null,
        goal: rawProfile.goal ?? null,
        targetWeight: rawProfile.targetWeight ?? null,
        targetBodyFat: rawProfile.targetBodyFat ?? null,
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

export async function importAllData(rawData: unknown): Promise<void> {
    const data = validateImportPayload(rawData);
    const importedProfile = buildImportedProfile(data);

    await db.transaction(async (tx) => {
        await tx.delete(workouts);
        await tx.delete(strengthPresets);
        await tx.delete(dailyCheckins);
        await tx.delete(bodyMetrics);
        await tx.delete(userProfile);

        for (const w of data.workouts) {
            await tx.insert(workouts).values(w);
        }

        for (const p of data.strengthPresets) {
            await tx.insert(strengthPresets).values(p);
        }

        for (const c of data.dailyCheckins) {
            await tx.insert(dailyCheckins).values(c);
        }

        for (const m of data.bodyMetrics) {
            await tx.insert(bodyMetrics).values(m);
        }

        if (importedProfile) {
            const aiConfigsStr = JSON.stringify(importedProfile.aiConfigs);
            await tx.insert(userProfile).values({
                id: "me",
                name: importedProfile.name,
                height: importedProfile.height,
                age: importedProfile.age,
                gender: importedProfile.gender,
                goal: importedProfile.goal,
                targetWeight: importedProfile.targetWeight,
                targetBodyFat: importedProfile.targetBodyFat,
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
                    targetWeight: importedProfile.targetWeight,
                    targetBodyFat: importedProfile.targetBodyFat,
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
    });
}

// ─── Clear All Data ───────────────────────────────────────────────────────────

export async function clearDatabase(): Promise<void> {
    await db.transaction(async (tx) => {
        await tx.delete(workouts);
        await tx.delete(strengthPresets);
        await tx.delete(dailyCheckins);
        await tx.delete(bodyMetrics);
        await tx.delete(userProfile);
    });
}
