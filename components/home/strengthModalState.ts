export interface WorkoutSet {
    id: string;
    setNumber: number;
    weight: string;
    reps: string;
    isCompleted: boolean;
}

let workoutSetIdSeq = 0;

export function createWorkoutSetId() {
    workoutSetIdSeq += 1;
    return `set-${Date.now()}-${workoutSetIdSeq}`;
}

export function createWorkoutSet(overrides: Partial<WorkoutSet> = {}): WorkoutSet {
    return {
        id: createWorkoutSetId(),
        setNumber: 1,
        weight: "",
        reps: "",
        isCompleted: false,
        ...overrides,
    };
}

export function normalizeWorkoutSet(set: WorkoutSet, index: number): WorkoutSet {
    return {
        ...set,
        id: set.id || createWorkoutSetId(),
        setNumber: index + 1,
    };
}

