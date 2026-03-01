import { getUserProfile } from "./profile";
import type { WorkoutItem } from "./workout";

// ─── AI Chat ──────────────────────────────────────────────────────────────────

export async function chatWithAI(
    history: { role: string; content: string }[],
    userMessage: string,
    recentWorkouts: { name: string; weight: string | null; sets: string | null; stats: string | null; createdAt: string }[],
    recentMetrics: { metricType: string; dateStr: string; value: number }[]
): Promise<string> {
    const profile = await getUserProfile();

    if (!profile.aiApiKey) {
        throw new Error("未配置 API Key，请先到设置页面配置。");
    }

    const baseUrl = profile.aiBaseUrl || "https://api.openai.com/v1";
    const model = profile.aiModel || "gpt-4o";
    const endpoint = baseUrl.endsWith("/")
        ? `${baseUrl}chat/completions`
        : `${baseUrl}/chat/completions`;

    const workoutsSummary = recentWorkouts
        .map(
            (w) =>
                `[${w.createdAt.slice(0, 10)}] ${w.name}: ${w.weight ? w.weight + "kg" : ""} ${w.sets || ""} ${w.stats || ""}`
        )
        .join("\n");

    const metricsSummary = recentMetrics
        .map(
            (m) =>
                `[${m.dateStr}] ${m.metricType === "weight" ? "体重" : "体脂率"}: ${m.value}${m.metricType === "weight" ? "kg" : "%"}`
        )
        .join("\n");

    const systemPrompt = `你是一个名为 NextRep AI Coach 的专业健身教练。你的任务是引导用户健身，并根据用户的数据给出个性化建议。
    
用户概况：
- 昵称: ${profile.name || "未设置"}
- 身高: ${profile.height ? profile.height + "cm" : "未设置"}
- 年龄: ${profile.age || "未设置"}
- 性别: ${profile.gender === "male" ? "男" : profile.gender === "female" ? "女" : "未设置"}
- 目标: ${profile.goal === "build-muscle" ? "增肌" : profile.goal === "lose-weight" ? "减脂" : profile.goal === "maintain" ? "保持" : "未设置"}

最近运动记录 (最新10条):
${workoutsSummary || "暂无运动记录"}

最近身体指标 (最新5条):
${metricsSummary || "暂无最新指标"}

要求：
1. 请根据当前的上下文回答用户的问题或提供建议。
2. 保持回答专业、简洁、有激励性。
3. 请使用 Markdown 格式。
`;

    const messages = [
        { role: "system", content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage },
    ];

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${profile.aiApiKey}`,
        },
        body: JSON.stringify({ model, messages, temperature: 0.7 }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`AI 请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// ─── Calorie Estimation ───────────────────────────────────────────────────────

export async function estimateDailyCaloriesWithAI(
    workouts: WorkoutItem[]
): Promise<number | null> {
    if (workouts.length === 0) return 0;

    const profile = await getUserProfile();
    if (!profile.aiApiKey) return null;

    const baseUrl = profile.aiBaseUrl || "https://api.openai.com/v1";
    const model = profile.aiModel || "gpt-4o";
    const endpoint = baseUrl.endsWith("/")
        ? `${baseUrl}chat/completions`
        : `${baseUrl}/chat/completions`;

    const workoutsSummary = workouts
        .map(
            (w) =>
                `- ${w.name}: ${w.weight ? w.weight + "kg" : ""} ${w.sets || ""} ${w.stats || ""}`
        )
        .join("\n");

    const systemPrompt = `你是一个精准的运动生理学能耗计算器。
你的唯一任务：基于用户的个人数据和今日具体的运动明细，计算总运动热量消耗（kcal）。

计算逻辑准则：
1. 力量训练：必须考虑动作、总重量（重量×组数×次数）和强度。
2. 有氧运动：如果有明确记载的"千卡"，优先累加；如果是"分钟"，按对应强度的 METs 值计算。
3. 动态敏感：每次检测到动作数量、重量或组数的增加或减少，返回的数字必须有逻辑上的变化。

要求：
- 严禁模糊估算为固定整数（如 100）。
- 直接返回一个纯数字（如 "267"），不要包含任何单位、文字、解释或标点符号。

用户概况：
身高: ${profile.height || 175}cm, 年龄: ${profile.age || 25}, 性别: ${profile.gender === "female" ? "女" : "男"}, 目标: ${profile.goal || "维持"}
`;

    const userPrompt = `今日运动明细:\n${workoutsSummary}`;

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${profile.aiApiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.3,
            }),
        });

        if (!response.ok) return null;

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        const parsed = parseInt(content.replace(/[^\d]/g, ""), 10);
        return isNaN(parsed) ? null : parsed;
    } catch {
        return null;
    }
}
