import { getUserProfile, recordAITokens } from "./profile";
import type { WorkoutItem } from "./workout";

const DEFAULT_AI_TIMEOUT_MS = 30000;
const AI_TEST_TIMEOUT_MS = 15000;

function resolveChatEndpoint(baseUrl: string): string {
    if (baseUrl.endsWith("/chat/completions")) return baseUrl;
    return baseUrl.endsWith("/") ? `${baseUrl}chat/completions` : `${baseUrl}/chat/completions`;
}

function getFetchErrorMessage(error: any): string {
    if (error?.name === "AbortError") return "请求超时，请检查网络或稍后再试。";
    return error?.message || "网络请求失败，请稍后再试。";
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = DEFAULT_AI_TIMEOUT_MS): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } catch (error: any) {
        throw new Error(getFetchErrorMessage(error));
    } finally {
        clearTimeout(timeoutId);
    }
}

// ─── AI Connection Testing ────────────────────────────────────────────────────

export async function testAIConnection(baseUrl: string, apiKey: string, model: string): Promise<boolean> {
    if (!apiKey) throw new Error("API Key 不能为空");

    const testBaseUrl = (baseUrl || "https://api.openai.com/v1").trim();
    const testModel = (model || "gpt-4o").trim();
    const cleanApiKey = apiKey.trim();

    const endpoint = resolveChatEndpoint(testBaseUrl);

    try {
        const response = await fetchWithTimeout(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${cleanApiKey}`,
            },
            body: JSON.stringify({
                model: testModel,
                messages: [{ role: "user", content: "hi" }],
                max_tokens: 5,
            }),
        }, AI_TEST_TIMEOUT_MS);

        if (!response.ok) {
            const err = await response.text().catch(() => "");
            throw new Error(`请求失败: ${response.status} ${response.statusText}${err ? ` - ${err.slice(0, 120)}` : ""}`);
        }

        return true;
    } catch (e: any) {
        throw new Error(`连接测试失败: ${getFetchErrorMessage(e)}`);
    }
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────

export async function chatWithAI(
    history: { role: string; content: string }[],
    userMessage: string,
    recentWorkouts: { name: string; weight: string | null; sets: string | null; stats: string | null; createdAt: string }[],
    recentMetrics: { metricType: string; dateStr: string; value: number }[]
): Promise<string> {
    const profile = await getUserProfile();

    const activeConfig = profile.aiConfigs?.find(c => c.id === profile.activeAiConfigId);
    const resolvedConfig = activeConfig || profile.aiConfigs?.[0];

    if (!resolvedConfig || !resolvedConfig.apiKey) {
        throw new Error("未配置 API Key，请先到设置页面添加 AI 配置。");
    }

    const rawBaseUrl = resolvedConfig.baseUrl || "https://api.openai.com/v1";
    const baseUrl = rawBaseUrl.trim();
    const model = (resolvedConfig.model || "gpt-4o").trim();
    const cleanApiKey = resolvedConfig.apiKey.trim();
    
    const endpoint = resolveChatEndpoint(baseUrl);

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

    const response = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanApiKey}`,
        },
        body: JSON.stringify({ model, messages, temperature: 0.7 }),
    });

    if (!response.ok) {
        const err = await response.text().catch(() => "");
        throw new Error(`AI 请求失败: ${response.status} ${response.statusText}${err ? ` - ${err.slice(0, 120)}` : ""}`);
    }

    const data = await response.json();

    // Record token usage
    if (data.usage?.total_tokens) {
        await recordAITokens(data.usage.total_tokens).catch(console.error);
    }

    return data.choices[0].message.content;
}

// ─── Calorie Estimation ───────────────────────────────────────────────────────

export async function estimateDailyCaloriesWithAI(
    workouts: WorkoutItem[]
): Promise<number | null> {
    if (workouts.length === 0) return 0;

    const profile = await getUserProfile();
    const activeConfig = profile.aiConfigs?.find(c => c.id === profile.activeAiConfigId);
    const resolvedConfig = activeConfig || profile.aiConfigs?.[0];

    if (!resolvedConfig || !resolvedConfig.apiKey) return null;

    const rawBaseUrl = resolvedConfig.baseUrl || "https://api.openai.com/v1";
    const baseUrl = rawBaseUrl.trim();
    const model = (resolvedConfig.model || "gpt-4o").trim();
    const cleanApiKey = resolvedConfig.apiKey.trim();

    const endpoint = resolveChatEndpoint(baseUrl);

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
        const response = await fetchWithTimeout(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${cleanApiKey}`,
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

        // Record token usage
        if (data.usage?.total_tokens) {
            await recordAITokens(data.usage.total_tokens).catch(console.error);
        }

        const content = data.choices[0].message.content.trim();
        const parsed = parseInt(content.replace(/[^\d]/g, ""), 10);
        return isNaN(parsed) ? null : parsed;
    } catch {
        return null;
    }
}

// ─── JSON Report Generation ───────────────────────────────────────────────────

export type AiReportData = {
    overallEvaluation: string;
    intensityScore: number;
    movementSuggestions: string[];
    recoveryPlan: string;
    todaysPlan: { type: "strength" | "cardio"; name: string; sets?: string; stats?: string }[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stripJsonFence(content: string): string {
    const trimmed = content.trim();
    const fenceMatch = trimmed.match(/^```(?:json|JSON)?\s*([\s\S]*?)\s*```$/);
    return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function extractJsonObject(content: string): string {
    const stripped = stripJsonFence(content);
    if (stripped.startsWith("{") && stripped.endsWith("}")) return stripped;

    const start = stripped.indexOf("{");
    if (start < 0) return stripped;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < stripped.length; i += 1) {
        const char = stripped[i];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (char === "\\") {
            escaped = true;
            continue;
        }

        if (char === "\"") {
            inString = !inString;
            continue;
        }

        if (inString) continue;

        if (char === "{") depth += 1;
        if (char === "}") {
            depth -= 1;
            if (depth === 0) return stripped.slice(start, i + 1);
        }
    }

    return stripped;
}

function toStringOrFallback(value: unknown, fallback: string): string {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .map((item) => item.trim())
        .slice(0, 6);
}

function normalizeReportData(raw: unknown, presets: { name: string; tag: string | null }[]): AiReportData {
    if (!isRecord(raw)) throw new Error("AI 返回内容不是 JSON 对象");

    const presetNames = new Set(presets.map((preset) => preset.name));
    const rawScore = typeof raw.intensityScore === "number"
        ? raw.intensityScore
        : Number(raw.intensityScore);
    const intensityScore = Number.isFinite(rawScore)
        ? Math.max(0, Math.min(100, Math.round(rawScore)))
        : 50;

    const rawPlan = Array.isArray(raw.todaysPlan) ? raw.todaysPlan : [];
    const todaysPlan = rawPlan.flatMap((item): AiReportData["todaysPlan"] => {
        if (!isRecord(item)) return [];

        const type = item.type === "cardio" ? "cardio" : item.type === "strength" ? "strength" : null;
        const name = typeof item.name === "string" ? item.name.trim() : "";
        if (!type || !name) return [];
        if (presetNames.size > 0 && !presetNames.has(name)) return [];

        const sets = typeof item.sets === "string" && item.sets.trim() ? item.sets.trim() : undefined;
        const stats = typeof item.stats === "string" && item.stats.trim() ? item.stats.trim() : undefined;

        return [{ type, name, sets, stats }];
    }).slice(0, 5);

    return {
        overallEvaluation: toStringOrFallback(raw.overallEvaluation, "AI 已生成建议，但没有返回详细评价。"),
        intensityScore,
        movementSuggestions: normalizeStringArray(raw.movementSuggestions),
        recoveryPlan: toStringOrFallback(raw.recoveryPlan, "注意训练后的拉伸、补水和睡眠恢复。"),
        todaysPlan,
    };
}

export async function generateTrainingReportWithAI(
    recentWorkouts: { name: string; weight: string | null; sets: string | null; stats: string | null; createdAt: string }[],
    recentMetrics: { metricType: string; dateStr: string; value: number }[],
    presets: { name: string; tag: string | null }[]
): Promise<AiReportData> {
    const profile = await getUserProfile();

    const activeConfig = profile.aiConfigs?.find(c => c.id === profile.activeAiConfigId);
    const resolvedConfig = activeConfig || profile.aiConfigs?.[0];

    if (!resolvedConfig || !resolvedConfig.apiKey) {
        throw new Error("未配置 API Key，请先到个人配置页面添加 AI 配置。");
    }

    const rawBaseUrl = resolvedConfig.baseUrl || "https://api.openai.com/v1";
    const baseUrl = rawBaseUrl.trim();
    const model = (resolvedConfig.model || "gpt-4o").trim();
    const cleanApiKey = resolvedConfig.apiKey.trim();

    const endpoint = resolveChatEndpoint(baseUrl);

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

    const presetsSummary = presets.length > 0 
        ? presets.map(p => `- ${p.name} ${p.tag ? `(${p.tag})` : ""}`).join("\n")
        : "暂无预设动作";

    const systemPrompt = `你是一个名为 NextRep AI Coach 的专业健身教练和数据分析师。你的任务是基于用户的近期运动数据和身体指标生成一份结构化的训练报告和今日详细计划。

必须严格返回 JSON 格式，包含以下字段，不能有任何多余的包裹或 markdown 代码块（如不要输出 \`\`\`json）：
{
  "overallEvaluation": "对近期训练频率、强度的总结评价",
  "intensityScore": 0到100的打分（数字）,
  "movementSuggestions": [
    "动作改进建议1",
    "动作改进建议2"
  ],
  "recoveryPlan": "对恢复、饮食或拉伸的具体建议",
  "todaysPlan": [
    { "type": "strength", "name": "深蹲", "sets": "4x10" },
    { "type": "cardio", "name": "慢跑", "stats": "20m" }
  ]
}

【重要限制】
todaysPlan 数组中的项目 name 必须且只能从以下用户当前的**动作库**列表中挑选。绝对不能自己凭空捏造库外不存在的动作名字！

当前可用动作库列表：
${presetsSummary}

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
`;

    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "请根据上述数据生成我的今日训练报告和今日训练计划（直接返回 JSON）。" },
    ];

    const response = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanApiKey}`,
        },
        body: JSON.stringify({ 
            model, 
            messages, 
            temperature: 0.5,
            ...(baseUrl.includes("api.openai.com") ? { response_format: { type: "json_object" } } : {}),
        }),
    });

    if (!response.ok) {
        const err = await response.text().catch(() => "");
        throw new Error(`AI 请求失败: ${response.status} ${response.statusText}${err ? ` - ${err.slice(0, 120)}` : ""}`);
    }

    const data = await response.json();

    if (data.usage?.total_tokens) {
        await recordAITokens(data.usage.total_tokens).catch(console.error);
    }

    const rawContent = typeof data.choices?.[0]?.message?.content === "string"
        ? data.choices[0].message.content
        : "";
    const jsonContent = extractJsonObject(rawContent);

    try {
        return normalizeReportData(JSON.parse(jsonContent), presets);
    } catch (e) {
        throw new Error("AI 返回了无法解析的 JSON 格式: " + rawContent.trim().substring(0, 100) + "...");
    }
}
