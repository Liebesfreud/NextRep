import { describe, expect, it } from "vitest";
import { parseImportDate, validateImportPayload } from "./backupValidation";

describe("backup validation domain helpers", () => {
    it("accepts wrapped v2 backup payloads", () => {
        const result = validateImportPayload({
            version: 2,
            data: {
                workouts: [{
                    id: "w1",
                    type: "strength",
                    name: "深蹲",
                    weight: 100,
                    sets: "3x5",
                    stats: null,
                    createdAt: "2026-06-20T10:00:00.000Z",
                }],
            },
        });

        expect(result.workouts).toHaveLength(1);
        expect(result.workouts[0].weight).toBe("100");
        expect(result.workouts[0].createdAt).toEqual(new Date("2026-06-20T10:00:00.000Z"));
    });

    it("rejects unsupported backup versions", () => {
        expect(() => validateImportPayload({ version: 99, workouts: [] })).toThrow("Unsupported backup version");
    });

    it("normalizes unix seconds", () => {
        expect(parseImportDate(1_782_000_000, "createdAt")).toEqual(new Date(1_782_000_000_000));
    });
});

