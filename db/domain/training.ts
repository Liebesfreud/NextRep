export type ParsedStrengthSet = {
    weightKg: number;
    reps: number;
    isCompleted: boolean;
};

export type WorkoutPerformanceSummary = {
    setCount: number;
    totalReps: number;
    volumeKg: number;
    maxWeightKg: number | null;
};

export function parseNumber(value: string | number | null | undefined): number {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (!value) return 0;
    const match = value.match(/[\d.]+/);
    if (!match) return 0;
    const parsed = parseFloat(match[0]);
    return Number.isFinite(parsed) ? parsed : 0;
}

export function getEffectiveSets(sets: ParsedStrengthSet[]): ParsedStrengthSet[] {
    const meaningful = sets.filter((set) => set.weightKg > 0 || set.reps > 0);
    const completed = meaningful.filter((set) => set.isCompleted);
    return completed.length > 0 ? completed : meaningful;
}

export function parseStrengthSets(weight: string | null, sets: string | null): ParsedStrengthSet[] {
    const fallbackWeight = parseNumber(weight);
    if (!sets) {
        return fallbackWeight > 0 ? [{ weightKg: fallbackWeight, reps: 0, isCompleted: true }] : [];
    }

    try {
        if (sets.trim().startsWith("[")) {
            const parsed = JSON.parse(sets) as Array<{
                weight?: number | string;
                reps?: number | string;
                isCompleted?: boolean;
            }>;
            if (Array.isArray(parsed)) {
                return getEffectiveSets(parsed.map((set) => ({
                    weightKg: parseNumber(set?.weight) || fallbackWeight,
                    reps: parseNumber(set?.reps),
                    isCompleted: !!set?.isCompleted,
                })));
            }
        }
    } catch {
        // Fall back to legacy text parsing below.
    }

    const normalizedSets = sets.replace(/×/g, "x");
    const parts = normalizedSets.split("x").map((s) => s.trim());
    if (parts.length === 2) {
        const setCount = parseNumber(parts[0]);
        const reps = parseNumber(parts[1]);
        return Array.from({ length: Math.max(0, Math.floor(setCount)) }, () => ({
            weightKg: fallbackWeight,
            reps,
            isCompleted: true,
        }));
    }

    const reps = parseNumber(parts[0]);
    if (fallbackWeight > 0 || reps > 0) {
        return [{ weightKg: fallbackWeight, reps, isCompleted: true }];
    }
    return [];
}

export function summarizeWorkoutPerformance(weight: string | null, sets: string | null): WorkoutPerformanceSummary {
    const parsedSets = parseStrengthSets(weight, sets);
    const totalReps = parsedSets.reduce((sum, set) => sum + set.reps, 0);
    const volumeKg = parsedSets.reduce((sum, set) => sum + set.weightKg * set.reps, 0);
    const maxWeightKg = parsedSets.reduce((max, set) => Math.max(max, set.weightKg), 0);

    return {
        setCount: parsedSets.length,
        totalReps,
        volumeKg,
        maxWeightKg: maxWeightKg > 0 ? maxWeightKg : null,
    };
}

export function calculateStrengthVolumeKg(weight: string | null, sets: string | null): number {
    return summarizeWorkoutPerformance(weight, sets).volumeKg;
}

export function estimateDailyDurationMinutes(workoutCount: number, volumeKg: number): number {
    if (workoutCount <= 0) return 0;
    const volumeMinutes = Math.min(30, Math.floor(volumeKg / 500));
    return workoutCount * 12 + volumeMinutes;
}

