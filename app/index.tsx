import { useState, useEffect, useRef, useCallback } from "react";
import { View, ScrollView } from "react-native";
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
import { AnimatedEnter } from "@/components/ui/AnimatedEnter";

import {
    addWorkout, updateWorkout, deleteWorkout,
    checkinToday, getTodayWorkouts, getStrengthPresets, isTodayCheckedIn,
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
    const confettiRef = useRef<any>(null);

    const [greeting, setGreeting] = useState("你好");
    const [userName, setUserName] = useState("健身达人");
    const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [strengthPresets, setStrengthPresets] = useState<StrengthPresetItem[]>([]);
    const [isPending, setIsPending] = useState(false);

    // Modal State
    const [activeModal, setActiveModal] = useState<"strength" | "cardio" | null>(null);
    const [editingWorkout, setEditingWorkout] = useState<WorkoutItem | null>(null);

    // AI State
    const [aiEstimatedCal, setAiEstimatedCal] = useState<number | null>(null);
    const [isAiPredicting, setIsAiPredicting] = useState(false);

    // ─── Load Data ─────────────────────────────────────────────────────────────

    const loadData = useCallback(async () => {
        const [ws, presets, checkedIn, profile] = await Promise.all([
            getTodayWorkouts(),
            getStrengthPresets(),
            isTodayCheckedIn(),
            getUserProfile(),
        ]);
        setWorkouts(ws);
        setStrengthPresets(presets);
        setIsCheckedIn(checkedIn);
        setUserName(profile.name);
        SplashScreen.hideAsync().catch(() => { });
    }, []);

    useFocusEffect(useCallback(() => {
        loadData();
    }, [loadData]));

    useEffect(() => {
        const h = new Date().getHours();
        if (h < 5) setGreeting("夜已深了");
        else if (h < 12) setGreeting("早上好");
        else if (h < 18) setGreeting("下午好");
        else setGreeting("晚上好");
    }, []);

    useEffect(() => {
        if (workouts.length === 0) { setAiEstimatedCal(0); return; }
        let cancelled = false;
        (async () => {
            setIsAiPredicting(true);
            try {
                const res = await estimateDailyCaloriesWithAI(workouts);
                if (!cancelled) setAiEstimatedCal(res);
            } catch {
                if (!cancelled) setAiEstimatedCal(null);
            } finally {
                if (!cancelled) setIsAiPredicting(false);
            }
        })();
        return () => { cancelled = true; };
    }, [workouts]);

    // ─── Computed ──────────────────────────────────────────────────────────────

    const strengthWorkouts = workouts.filter((w) => w.type === "strength");
    const cardioWorkouts = workouts.filter((w) => w.type === "cardio");
    const totalSets = strengthWorkouts.reduce((s, w) => s + parseSetsCount(w.sets), 0);
    const cardioCalories = cardioWorkouts.reduce((s, w) => s + parseKcal(w.stats), 0);
    const fallbackCal = totalSets * 8 + cardioCalories;
    const displayCal = aiEstimatedCal !== null ? aiEstimatedCal : fallbackCal;

    // ─── Handlers ───────────────────────────────────────────────────────────────

    const closeModal = () => {
        setActiveModal(null);
        setEditingWorkout(null);
    };

    const handleSave = async (payload: any) => {
        setIsPending(true);
        try {
            if (editingWorkout) await updateWorkout(editingWorkout.id, payload);
            else await addWorkout(payload);
            closeModal();
            await loadData();
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsPending(true);
        try {
            await deleteWorkout(id);
            closeModal();
            await loadData();
        } finally {
            setIsPending(false);
        }
    };

    const handleCheckin = async () => {
        setIsPending(true);
        try {
            await checkinToday();
            confettiRef.current?.start();
            await loadData();
        } finally {
            setIsPending(false);
        }
    };

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 100, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <AnimatedEnter delay={0} distance={10}>
                    <HomeHeader greeting={greeting} userName={userName} isCheckedIn={isCheckedIn} />
                </AnimatedEnter>

                <AnimatedEnter delay={50} distance={15}>
                    <View className="flex-row gap-bento">
                        <HomeStatsCard displayCal={displayCal} totalSets={totalSets} isAiPredicting={isAiPredicting} />
                        <View style={{ backgroundColor: colors.bento, borderColor: colors.border, flex: 2 }} className="rounded-bento-lg border p-3.5">
                            <MonthlyHeatmap refreshKey={`${workouts.length}-${isCheckedIn}`} />
                        </View>
                    </View>
                </AnimatedEnter>

                <AnimatedEnter delay={100} distance={15}>
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
                    />
                </AnimatedEnter>
            </ScrollView>

            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}>
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
