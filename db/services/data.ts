import { db } from "../client";
import { workouts, strengthPresets, dailyCheckins, bodyMetrics, userProfile } from "../schema";
import { getUserProfile, type AIConfigItem, type UserProfileData } from "./profile";

const CURRENT_BACKUP_VERSION = 2;
const SUPPORTED_BACKUP_VERSIONS = new Set([1, CURRENT_BACKUP_VERSION]);

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

type ImportedWorkout = {
    id: string;
    type: string;
    name: string;
    weight: string | null;
    sets: string | null;
    stats: string | null;
    createdAt: Date;
};

type ImportedStrengthPreset = {
    id: string;
    name: string;
    tag: string | null;
    createdAt: Date;
};

type ImportedDailyCheckin = {
    id: string;
    dateStr: string;
    aiEstimatedCal: number | null;
    createdAt: Date;
};

type ImportedBodyMetric = {
    id: string;
    metricType: string;
    value: number;
    dateStr: string;
    createdAt: Date;
};

type ImportPayload = {
    workouts: ImportedWorkout[];
    strengthPresets: ImportedStrengthPreset[];
    dailyCheckins: ImportedDailyCheckin[];
    bodyMetrics: ImportedBodyMetric[];
    apiConfig?: ExportedApiConfig;
    userProfile?: ExportedUserProfile | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown, field: string): string | null {
    if (value === undefined || value === null) return null;
    if (typeof value === "string") return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    throw new Error(`Invalid import payload: ${field} must be a string`);
}

function requiredString(value: unknown, field: string): string {
    if (typeof value !== "string" || value.length === 0) {
        throw new Error(`Invalid import payload: ${field} must be a non-empty string`);
    }
    return value;
}

function optionalNumber(value: unknown, field: string): number | null {
    if (value === undefined || value === null) return null;
    const normalized = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
    if (typeof normalized !== "number" || !Number.isFinite(normalized)) {
        throw new Error(`Invalid import payload: ${field} must be a number`);
    }
    return normalized;
}

function requiredNumber(value: unknown, field: string): number {
    const normalized = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
    if (typeof normalized !== "number" || !Number.isFinite(normalized)) {
        throw new Error(`Invalid import payload: ${field} must be a number`);
    }
    return normalized;
}

function parseImportDate(value: unknown, field: string): Date {
    let raw = typeof value === "string" || typeof value === "number" ? value : null;
    if (raw === null) throw new Error(`Invalid import payload: ${field} must be a date`);

    // Older SQLite exports may contain Unix seconds rather than ISO strings or milliseconds.
    if (typeof raw === "string" && /^-?\d+(?:\.\d+)?$/.test(raw.trim())) {
        raw = Number(raw);
    }
    if (typeof raw === "number" && Math.abs(raw) < 100_000_000_000) {
        raw *= 1000;
    }

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid import payload: ${field} must be a valid date`);
    }
    return date;
}

function readOptionalArray(payload: Record<string, unknown>, key: string): Record<string, unknown>[] {
    const value = payload[key];
    if (value === undefined || value === null) return [];
    if (!Array.isArray(value)) throw new Error(`Invalid import payload: ${key} must be an array`);
    return value.map((item, index) => {
        if (!isRecord(item)) throw new Error(`Invalid import payload: ${key}[${index}] must be an object`);
        return item;
    });
}

function readOptionalRecord(payload: Record<string, unknown>, key: string): Record<string, unknown> | null {
    const value = payload[key];
    if (value === undefined || value === null) return null;
    if (!isRecord(value)) throw new Error(`Invalid import payload: ${key} must be an object`);
    return value;
}

function normalizeBackupVersion(value: unknown): number | null {
    if (value === undefined || value === null || value === "") return null;

    const version = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(version)) {
        throw new Error("Invalid import payload: version must be a number");
    }

    if (!Number.isInteger(version)) {
        throw new Error("Invalid import payload: version must be an integer");
    }

    return version;
}

function unwrapImportPayload(input: Record<string, unknown>): Record<string, unknown> {
    const hasRootData = ["workouts", "strengthPresets", "dailyCheckins", "bodyMetrics", "userProfile", "apiConfig"]
        .some((key) => key in input);
    if (hasRootData) return input;

    // Accept backups wrapped by file/export tooling as { version, data: { ... } }.
    if (isRecord(input.data)) {
        return {
            ...input.data,
            version: input.data.version ?? input.version,
        };
    }

    return input;
}

function validateImportPayload(input: unknown): ImportPayload {
    if (!isRecord(input)) throw new Error("Invalid import payload: root must be an object");

    const payload = unwrapImportPayload(input);
    const version = normalizeBackupVersion(payload.version);
    if (version !== null && !SUPPORTED_BACKUP_VERSIONS.has(version)) {
        throw new Error(`Unsupported backup version: ${String(payload.version)}`);
    }

    const recognizedKeys = ["workouts", "strengthPresets", "dailyCheckins", "bodyMetrics", "userProfile", "apiConfig"];
    if (!recognizedKeys.some((key) => key in payload)) {
        throw new Error("Invalid import payload: no NextRep data found");
    }

    const workoutsRows = readOptionalArray(payload, "workouts").map((row, index): ImportedWorkout => ({
        id: requiredString(row.id, `workouts[${index}].id`),
        type: requiredString(row.type, `workouts[${index}].type`),
        name: requiredString(row.name, `workouts[${index}].name`),
        weight: optionalString(row.weight, `workouts[${index}].weight`),
        sets: optionalString(row.sets, `workouts[${index}].sets`),
        stats: optionalString(row.stats, `workouts[${index}].stats`),
        createdAt: parseImportDate(row.createdAt, `workouts[${index}].createdAt`),
    }));

    const strengthPresetRows = readOptionalArray(payload, "strengthPresets").map((row, index): ImportedStrengthPreset => ({
        id: requiredString(row.id, `strengthPresets[${index}].id`),
        name: requiredString(row.name, `strengthPresets[${index}].name`),
        tag: optionalString(row.tag, `strengthPresets[${index}].tag`),
        createdAt: parseImportDate(row.createdAt, `strengthPresets[${index}].createdAt`),
    }));

    const dailyCheckinRows = readOptionalArray(payload, "dailyCheckins").map((row, index): ImportedDailyCheckin => ({
        id: requiredString(row.id, `dailyCheckins[${index}].id`),
        dateStr: requiredString(row.dateStr, `dailyCheckins[${index}].dateStr`),
        aiEstimatedCal: optionalNumber(row.aiEstimatedCal, `dailyCheckins[${index}].aiEstimatedCal`),
        createdAt: parseImportDate(row.createdAt, `dailyCheckins[${index}].createdAt`),
    }));

    const bodyMetricRows = readOptionalArray(payload, "bodyMetrics").map((row, index): ImportedBodyMetric => ({
        id: requiredString(row.id, `bodyMetrics[${index}].id`),
        metricType: requiredString(row.metricType, `bodyMetrics[${index}].metricType`),
        value: requiredNumber(row.value, `bodyMetrics[${index}].value`),
        dateStr: requiredString(row.dateStr, `bodyMetrics[${index}].dateStr`),
        createdAt: parseImportDate(row.createdAt, `bodyMetrics[${index}].createdAt`),
    }));

    const rawUserProfile = readOptionalRecord(payload, "userProfile");
    const rawApiConfig = readOptionalRecord(payload, "apiConfig");

    return {
        workouts: workoutsRows,
        strengthPresets: strengthPresetRows,
        dailyCheckins: dailyCheckinRows,
        bodyMetrics: bodyMetricRows,
        userProfile: rawUserProfile as ExportedUserProfile | null,
        apiConfig: rawApiConfig ? rawApiConfig as ExportedApiConfig : undefined,
    };
}

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
