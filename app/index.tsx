import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import ConfettiCannon from "react-native-confetti-cannon";
import { useTheme } from "@/hooks/useTheme";
import * as SplashScreen from "expo-splash-screen";

import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeStatsCard } from "@/components/home/HomeStatsCard";
import { MonthlyHeatmap } from "@/components/home/MonthlyHeatmap";
import { TodayWorkouts } from "@/components/home/TodayWorkouts";
import { StrengthModal } from "@/components/home/StrengthModal";
import { CardioModal } from "@/components/home/CardioModal";
import { Card } from "@/components/ui/card";

import {
    addWorkout, updateWorkout, deleteWorkout,
    checkinDate, getWorkoutsByDate, getStrengthPresets, isDateCheckedIn, getCheckinByDate,
    type WorkoutItem, type StrengthPresetItem,
} from "@/db/services/workout";
import { estimateDailyCaloriesWithAI } from "@/db/services/ai";
import { getUserProfile } from "@/db/services/profile";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseSetsCount(sets: string | null): number {
    if (!sets) return 0;
    try {
        if (sets.startsWith("[")) {
            const parsed = JSON.parse(sets);
            if (Array.isArray(parsed)) {
                const completedSets = parsed.filter((s: any) => s.isCompleted);
                return completedSets.length > 0 ? completedSets.length : parsed.length;
            }
        }
    } catch (e) { }

    const match = sets.match(/(\d+)\s*[×x]/i);
    return match ? parseInt(match[1], 10) : 0;
}

function parseKcal(stats: string | null): number {
    if (!stats) return 0;
    const match = stats.match(/(\d+)\s*千卡/);
    return match ? parseInt(match[1], 10) : 0;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HomeScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const confettiRef = useRef<any>(null);
    const mountedRef = useRef(true);
    const loadSeqRef = useRef(0);

    const [greeting, setGreeting] = useState("你好");
    const [userName, setUserName] = useState("健身达人");
    const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [strengthPresets, setStrengthPresets] = useState<StrengthPresetItem[]>([]);
    const [isPending, setIsPending] = useState(false);

    // Modal State
    const [activeModal, setActiveModal] = useState<"strength" | "cardio" | null>(null);
    const [editingWorkout, setEditingWorkout] = useState<WorkoutItem | null>(null);

    // 日期选择
    const todayStr = (() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    })();
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const isToday = selectedDate === todayStr;

    // AI State
    const [aiEstimatedCal, setAiEstimatedCal] = useState<number | null>(null);
    const [isAiPredicting, setIsAiPredicting] = useState(false);

    // ─── Load Data ─────────────────────────────────────────────────────────────

    useEffect(() => {
        return () => {
            mountedRef.current = false;
            loadSeqRef.current += 1;
        };
    }, []);

    const loadData = useCallback(async (dateStr = selectedDate) => {
        if (!mountedRef.current) return;

        const requestId = ++loadSeqRef.current;
        try {
            const [ws, presets, checkedIn, profile, checkinData] = await Promise.all([
                getWorkoutsByDate(dateStr),
                getStrengthPresets(),
                isDateCheckedIn(dateStr),
                getUserProfile(),
                getCheckinByDate(dateStr),
            ]);
            if (!mountedRef.current || requestId !== loadSeqRef.current) return;
            setWorkouts(ws);
            setStrengthPresets(presets);
            setIsCheckedIn(checkedIn);
            setUserName(profile.name);
            setAiEstimatedCal(checkinData?.aiEstimatedCal ?? null);
        } catch (error) {
            console.error(error);
        } finally {
            if (mountedRef.current && requestId === loadSeqRef.current) {
                SplashScreen.hideAsync().catch(() => { });
            }
        }
    }, [selectedDate]);

    useFocusEffect(useCallback(() => {
        loadData(selectedDate);
        return () => {
            loadSeqRef.current += 1;
        };
    }, [loadData, selectedDate]));

    // 切换日期时重新加载
    const handleDateChange = (dateStr: string) => {
        setSelectedDate(dateStr);
    };

    useEffect(() => {
        const h = new Date().getHours();
        if (h < 5) setGreeting("夜已深了");
        else if (h < 12) setGreeting("早上好");
        else if (h < 18) setGreeting("下午好");
        else setGreeting("晚上好");
    }, []);



    // ─── Computed ──────────────────────────────────────────────────────────────

    const workoutSummary = useMemo(() => {
        const strengthWorkouts: WorkoutItem[] = [];
        const cardioWorkouts: WorkoutItem[] = [];
        let totalSets = 0;
        let cardioCalories = 0;

        workouts.forEach((workout) => {
            if (workout.type === "strength") {
                strengthWorkouts.push(workout);
                totalSets += parseSetsCount(workout.sets);
            } else if (workout.type === "cardio") {
                cardioWorkouts.push(workout);
                cardioCalories += parseKcal(workout.stats);
            }
        });

        return {
            strengthWorkouts,
            cardioWorkouts,
            totalSets,
            fallbackCal: totalSets * 8 + cardioCalories,
        };
    }, [workouts]);

    const { strengthWorkouts, cardioWorkouts, totalSets, fallbackCal } = workoutSummary;
    const displayCal = aiEstimatedCal !== null ? aiEstimatedCal : fallbackCal;

    // ─── Handlers ───────────────────────────────────────────────────────────────

    const closeModal = () => {
        setActiveModal(null);
    };

    const handleSave = async (payload: any) => {
        setIsPending(true);
        try {
            if (editingWorkout) await updateWorkout(editingWorkout.id, payload);
            else await addWorkout({ ...payload, forDate: selectedDate });
            closeModal();
            await loadData(selectedDate);
        } finally {
            if (mountedRef.current) setIsPending(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsPending(true);
        try {
            await deleteWorkout(id);
            closeModal();
            await loadData(selectedDate);
        } finally {
            if (mountedRef.current) setIsPending(false);
        }
    };

    const handleCheckin = async () => {
        setIsPending(true);
        try {
            let aiCal = null;
            if (workouts.length > 0) {
                setIsAiPredicting(true);
                try {
                    aiCal = await estimateDailyCaloriesWithAI(workouts);
                } catch {
                    // fall through
                } finally {
                    if (mountedRef.current) setIsAiPredicting(false);
                }
            }
            await checkinDate(selectedDate, aiCal);
            confettiRef.current?.start();
            await loadData(selectedDate);
        } finally {
            if (mountedRef.current) setIsPending(false);
        }
    };

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <View className="flex-1 bg-transparent">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 100 + Math.max(insets.bottom - 20, 0), gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <HomeHeader greeting={greeting} userName={userName} isCheckedIn={isCheckedIn} />

                <View className="flex-row gap-4">
                    <HomeStatsCard displayCal={displayCal} totalSets={totalSets} isAiPredicting={isAiPredicting} />
                    <Card className="flex-[2] p-3">
                        <MonthlyHeatmap refreshKey={`${workouts.length}-${isCheckedIn}`} />
                    </Card>
                </View>

                <TodayWorkouts
                    workouts={workouts}
                    cardioWorkouts={cardioWorkouts}
                    strengthWorkouts={strengthWorkouts}
                    handleOpenCardio={() => { setEditingWorkout(null); setActiveModal("cardio"); }}
                    handleOpenStrength={() => { setEditingWorkout(null); setActiveModal("strength"); }}
                    openEditModal={(w) => { setEditingWorkout(w); setActiveModal(w.type as "strength" | "cardio"); }}
                    handleCheckin={handleCheckin}
                    isCheckedIn={isCheckedIn}
                    isPending={isPending}
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                    isToday={isToday}
                />
            </ScrollView>

            <View className="pointer-events-none absolute inset-0 z-[999]">
                <ConfettiCannon
                    ref={confettiRef}
                    count={120}
                    origin={{ x: 200, y: -50 }}
                    autoStart={false}
                    fadeOut
                />
            </View>

            <StrengthModal
                visible={activeModal === "strength"}
                onClose={closeModal}
                initialWorkout={editingWorkout}
                presets={strengthPresets}
                onPresetsChange={setStrengthPresets}
                onSave={handleSave}
                onDelete={handleDelete}
                isPending={isPending}
            />

            <CardioModal
                visible={activeModal === "cardio"}
                onClose={closeModal}
                initialWorkout={editingWorkout}
                onSave={handleSave}
                onDelete={handleDelete}
                isPending={isPending}
            />
        </View>
    );
}
