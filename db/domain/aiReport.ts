export type AiReportData = {
    overallEvaluation: string;
    intensityScore: number;
    movementSuggestions: string[];
    recoveryPlan: string;
    todaysPlan: { type: "strength" | "cardio"; name: string; sets?: string; stats?: string }[];
};

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function stripJsonFence(content: string): string {
    const trimmed = content.trim();
    const fenceMatch = trimmed.match(/^```(?:json|JSON)?\s*([\s\S]*?)\s*```$/);
    return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

export function extractJsonObject(content: string): string {
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

export function normalizeReportData(raw: unknown, presets: { name: string; tag: string | null }[]): AiReportData {
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

