import { describe, expect, it } from "vitest";
import { buildTimestampForDate, getDateBounds, getTodayDateStr, toDateStr } from "./dates";

describe("date domain helpers", () => {
    it("formats local dates as YYYY-MM-DD", () => {
        expect(toDateStr(new Date(2026, 0, 5))).toBe("2026-01-05");
        expect(getTodayDateStr(new Date(2026, 5, 20))).toBe("2026-06-20");
    });

    it("builds local day bounds", () => {
        const bounds = getDateBounds("2026-06-20");

        expect(bounds.startOfDay).toEqual(new Date(2026, 5, 20, 0, 0, 0, 0));
        expect(bounds.endOfDay).toEqual(new Date(2026, 5, 21, 0, 0, 0, 0));
    });

    it("keeps current time when creating a workout timestamp for a selected date", () => {
        const timestamp = buildTimestampForDate("2026-06-20", new Date(2024, 1, 2, 13, 14, 15, 16));

        expect(timestamp).toEqual(new Date(2026, 5, 20, 13, 14, 15, 16));
    });
});

