import { db } from "../client";
import { userProfile } from "../schema";
import { eq } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIConfigItem {
    id: string;
    name: string;
    baseUrl: string;
    apiKey: string;
    model: string;
}

export type UserProfileData = {
    name: string;
    height: number | null;
    age: number | null;
    gender: string | null;
    goal: string | null;
    aiBaseUrl: string | null; // Legacy
    aiApiKey: string | null;  // Legacy
    aiModel: string | null;   // Legacy
    aiConfigs: AIConfigItem[]; // New JSON array
    activeAiConfigId: string | null; // New Active ID
    aiTokensTotal: number;
    aiTokensToday: number;
    aiTokensDate: string | null;
};

// ─── Default Values ───────────────────────────────────────────────────────────

const DEFAULT_PROFILE: UserProfileData = {
    name: "健身达人",
    height: null,
    age: null,
    gender: null,
    goal: null,
    aiBaseUrl: null,
    aiApiKey: null,
    aiModel: null,
    aiConfigs: [],
    activeAiConfigId: null,
    aiTokensTotal: 0,
    aiTokensToday: 0,
    aiTokensDate: null,
};

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getUserProfile(): Promise<UserProfileData> {
    const rows = await db
        .select()
        .from(userProfile)
        .where(eq(userProfile.id, "me"));

    if (rows.length === 0) return { ...DEFAULT_PROFILE };

    const p = rows[0];

    // Automatically reset today's tokens if the date has changed
    const todayStr = new Date().toISOString().slice(0, 10);
    let todayCount = p.aiTokensToday || 0;
    if (p.aiTokensDate !== todayStr) {
        todayCount = 0;
    }

    // Parse aiConfigs
    let parsedConfigs: AIConfigItem[] = [];
    if (p.aiConfigs) {
        try {
            parsedConfigs = JSON.parse(p.aiConfigs);
        } catch { }
    }

    // Auto-migrate legacy config if new list is empty but legacy has key
    if (parsedConfigs.length === 0 && p.aiApiKey) {
        parsedConfigs.push({
            id: `legacy-${Date.now()}`,
            name: "默认配置",
            baseUrl: p.aiBaseUrl || "",
            apiKey: p.aiApiKey,
            model: p.aiModel || "gpt-4o",
        });
    }

    return {
        name: p.name,
        height: p.height,
        age: p.age,
        gender: p.gender,
        goal: p.goal,
        aiBaseUrl: p.aiBaseUrl,
        aiApiKey: p.aiApiKey,
        aiModel: p.aiModel,
        aiConfigs: parsedConfigs,
        activeAiConfigId: p.activeAiConfigId || (parsedConfigs.length > 0 ? parsedConfigs[0].id : null),
        aiTokensTotal: p.aiTokensTotal || 0,
        aiTokensToday: todayCount,
        aiTokensDate: p.aiTokensDate !== todayStr ? todayStr : p.aiTokensDate,
    };
}

export async function updateUserProfile(data: UserProfileData): Promise<void> {
    const now = new Date();
    const aiConfigsStr = JSON.stringify(data.aiConfigs);

    await db
        .insert(userProfile)
        .values({
            id: "me",
            name: data.name,
            height: data.height,
            age: data.age,
            gender: data.gender,
            goal: data.goal,
            aiBaseUrl: data.aiBaseUrl,
            aiApiKey: data.aiApiKey,
            aiModel: data.aiModel,
            aiConfigs: aiConfigsStr,
            activeAiConfigId: data.activeAiConfigId,
            aiTokensTotal: data.aiTokensTotal,
            aiTokensToday: data.aiTokensToday,
            aiTokensDate: data.aiTokensDate,
            updatedAt: now,
        })
        .onConflictDoUpdate({
            target: userProfile.id,
            set: {
                name: data.name,
                height: data.height,
                age: data.age,
                gender: data.gender,
                goal: data.goal,
                aiBaseUrl: data.aiBaseUrl,
                aiApiKey: data.aiApiKey,
                aiModel: data.aiModel,
                aiConfigs: aiConfigsStr,
                activeAiConfigId: data.activeAiConfigId,
                aiTokensTotal: data.aiTokensTotal,
                aiTokensToday: data.aiTokensToday,
                aiTokensDate: data.aiTokensDate,
                updatedAt: now,
            },
        });
}

export async function recordAITokens(usageTokens: number): Promise<void> {
    if (!usageTokens || usageTokens <= 0) return;

    const profile = await getUserProfile();
    const todayStr = new Date().toISOString().slice(0, 10);

    // getUserProfile already handles the date reset logic for reading, 
    // so we just add to it and commit.
    profile.aiTokensTotal += usageTokens;
    profile.aiTokensToday += usageTokens;
    profile.aiTokensDate = todayStr;

    await updateUserProfile(profile);
}

