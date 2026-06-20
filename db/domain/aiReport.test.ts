import { describe, expect, it } from "vitest";
import { extractJsonObject, normalizeReportData } from "./aiReport";

describe("AI report domain helpers", () => {
    it("extracts JSON from fenced content", () => {
        expect(extractJsonObject("```json\n{\"ok\":true}\n```")).toBe("{\"ok\":true}");
    });

    it("normalizes score, suggestions, and filters plans by library", () => {
        const report = normalizeReportData({
            overallEvaluation: "  稳定  ",
            intensityScore: 120,
            movementSuggestions: ["  收紧核心  ", "", "控制节奏"],
            recoveryPlan: "",
            todaysPlan: [
                { type: "strength", name: "深蹲", sets: "4x8" },
                { type: "strength", name: "不存在动作", sets: "3x10" },
                { type: "cardio", name: "慢跑", stats: "20m" },
            ],
        }, [
            { name: "深蹲", tag: "腿部" },
            { name: "慢跑", tag: "有氧" },
        ]);

        expect(report.intensityScore).toBe(100);
        expect(report.movementSuggestions).toEqual(["收紧核心", "控制节奏"]);
        expect(report.recoveryPlan).toBe("注意训练后的拉伸、补水和睡眠恢复。");
        expect(report.todaysPlan).toEqual([
            { type: "strength", name: "深蹲", sets: "4x8", stats: undefined },
            { type: "cardio", name: "慢跑", sets: undefined, stats: "20m" },
        ]);
    });
});

