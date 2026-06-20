import { describe, expect, it } from "vitest";
import {
    calculateStrengthVolumeKg,
    estimateDailyDurationMinutes,
    parseStrengthSets,
    summarizeWorkoutPerformance,
} from "./training";

describe("training domain helpers", () => {
    it("parses legacy sets syntax", () => {
        expect(parseStrengthSets("80kg", "3x5")).toEqual([
            { weightKg: 80, reps: 5, isCompleted: true },
            { weightKg: 80, reps: 5, isCompleted: true },
            { weightKg: 80, reps: 5, isCompleted: true },
        ]);
    });

    it("uses completed JSON sets when available", () => {
        const sets = JSON.stringify([
            { weight: 60, reps: 8, isCompleted: false },
            { weight: 70, reps: 6, isCompleted: true },
        ]);

        expect(summarizeWorkoutPerformance(null, sets)).toEqual({
            setCount: 1,
            totalReps: 6,
            volumeKg: 420,
            maxWeightKg: 70,
        });
    });

    it("calculates volume and estimated duration", () => {
        expect(calculateStrengthVolumeKg("100", "2x3")).toBe(600);
        expect(estimateDailyDurationMinutes(2, 1200)).toBe(26);
    });
});

