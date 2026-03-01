import { db } from "../client";
import { userProfile } from "../schema";
import { eq } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserProfileData = {
    name: string;
    height: number | null;
    age: number | null;
    gender: string | null;
    goal: string | null;
    aiBaseUrl: string | null;
    aiApiKey: string | null;
    aiModel: string | null;
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
};

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getUserProfile(): Promise<UserProfileData> {
    const rows = await db
        .select()
        .from(userProfile)
        .where(eq(userProfile.id, "me"));

    if (rows.length === 0) return { ...DEFAULT_PROFILE };

    const p = rows[0];
    return {
        name: p.name,
        height: p.height,
        age: p.age,
        gender: p.gender,
        goal: p.goal,
        aiBaseUrl: p.aiBaseUrl,
        aiApiKey: p.aiApiKey,
        aiModel: p.aiModel,
    };
}

export async function updateUserProfile(data: UserProfileData): Promise<void> {
    const now = new Date();
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
                updatedAt: now,
            },
        });
}
