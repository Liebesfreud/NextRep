import type { AIConfigItem, UserProfileData } from "@/db/services/profile";

export const CURRENT_BACKUP_VERSION = 2;
export const SUPPORTED_BACKUP_VERSIONS = new Set([1, CURRENT_BACKUP_VERSION]);

export type ExportedApiConfig = {
    legacy?: {
        baseUrl?: string | null;
        apiKey?: string | null;
        model?: string | null;
    } | null;
    configs?: AIConfigItem[] | null;
    activeConfigId?: string | null;
};

export type ExportedUserProfile = Partial<UserProfileData> & {
    aiConfigs?: AIConfigItem[] | string | null;
};

export type ImportedWorkout = {
    id: string;
    type: string;
    name: string;
    weight: string | null;
    sets: string | null;
    stats: string | null;
    createdAt: Date;
};

export type ImportedStrengthPreset = {
    id: string;
    name: string;
    tag: string | null;
    createdAt: Date;
};

export type ImportedDailyCheckin = {
    id: string;
    dateStr: string;
    aiEstimatedCal: number | null;
    createdAt: Date;
};

export type ImportedBodyMetric = {
    id: string;
    metricType: string;
    value: number;
    dateStr: string;
    createdAt: Date;
};

export type ImportPayload = {
    workouts: ImportedWorkout[];
    strengthPresets: ImportedStrengthPreset[];
    dailyCheckins: ImportedDailyCheckin[];
    bodyMetrics: ImportedBodyMetric[];
    apiConfig?: ExportedApiConfig;
    userProfile?: ExportedUserProfile | null;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
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

export function parseImportDate(value: unknown, field: string): Date {
    let raw = typeof value === "string" || typeof value === "number" ? value : null;
    if (raw === null) throw new Error(`Invalid import payload: ${field} must be a date`);

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

    if (isRecord(input.data)) {
        return {
            ...input.data,
            version: input.data.version ?? input.version,
        };
    }

    return input;
}

export function validateImportPayload(input: unknown): ImportPayload {
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

    return {
        workouts: readOptionalArray(payload, "workouts").map((row, index) => ({
            id: requiredString(row.id, `workouts[${index}].id`),
            type: requiredString(row.type, `workouts[${index}].type`),
            name: requiredString(row.name, `workouts[${index}].name`),
            weight: optionalString(row.weight, `workouts[${index}].weight`),
            sets: optionalString(row.sets, `workouts[${index}].sets`),
            stats: optionalString(row.stats, `workouts[${index}].stats`),
            createdAt: parseImportDate(row.createdAt, `workouts[${index}].createdAt`),
        })),
        strengthPresets: readOptionalArray(payload, "strengthPresets").map((row, index) => ({
            id: requiredString(row.id, `strengthPresets[${index}].id`),
            name: requiredString(row.name, `strengthPresets[${index}].name`),
            tag: optionalString(row.tag, `strengthPresets[${index}].tag`),
            createdAt: parseImportDate(row.createdAt, `strengthPresets[${index}].createdAt`),
        })),
        dailyCheckins: readOptionalArray(payload, "dailyCheckins").map((row, index) => ({
            id: requiredString(row.id, `dailyCheckins[${index}].id`),
            dateStr: requiredString(row.dateStr, `dailyCheckins[${index}].dateStr`),
            aiEstimatedCal: optionalNumber(row.aiEstimatedCal, `dailyCheckins[${index}].aiEstimatedCal`),
            createdAt: parseImportDate(row.createdAt, `dailyCheckins[${index}].createdAt`),
        })),
        bodyMetrics: readOptionalArray(payload, "bodyMetrics").map((row, index) => ({
            id: requiredString(row.id, `bodyMetrics[${index}].id`),
            metricType: requiredString(row.metricType, `bodyMetrics[${index}].metricType`),
            value: requiredNumber(row.value, `bodyMetrics[${index}].value`),
            dateStr: requiredString(row.dateStr, `bodyMetrics[${index}].dateStr`),
            createdAt: parseImportDate(row.createdAt, `bodyMetrics[${index}].createdAt`),
        })),
        userProfile: readOptionalRecord(payload, "userProfile") as ExportedUserProfile | null,
        apiConfig: readOptionalRecord(payload, "apiConfig") as ExportedApiConfig | undefined,
    };
}

