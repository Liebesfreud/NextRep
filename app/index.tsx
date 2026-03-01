import { useState, useEffect, useRef } from "react";
import {
    View, Text, ScrollView, Pressable, Modal,
    TextInput, ActivityIndicator, Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
    Plus, Dumbbell, X, Flame, Layers, Activity,
    CheckCircle, Trash2, ChevronLeft, Timer, Sparkles,
} from "lucide-react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { useTheme } from "@/hooks/useTheme";
import { MonthlyHeatmap } from "@/components/ui/MonthlyHeatmap";
import {
    addWorkout, updateWorkout, deleteWorkout,
    addStrengthPreset, removeStrengthPreset, checkinToday,
    getTodayWorkouts, getStrengthPresets, isTodayCheckedIn,
    type WorkoutItem, type StrengthPresetItem,
} from "@/db/services/workout";
import { estimateDailyCaloriesWithAI } from "@/db/services/ai";
import { getUserProfile } from "@/db/services/profile";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CARDIO_EXERCISES = ["跑步机", "椭圆机", "爬楼机"];

function parseSetsCount(sets: string | null): number {
    if (!sets) return 0;
    const match = sets.match(/(\d+)\s*[×x]/i);
    return match ? parseInt(match[1], 10) : 0;
}

function parseKcal(stats: string | null): number {
    if (!stats) return 0;
    const match = stats.match(/(\d+)\s*千卡/);
    return match ? parseInt(match[1], 10) : 0;
}

function formatTime(iso: string) {
    return new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date(iso));
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
    const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
    const [isCreatingPreset, setIsCreatingPreset] = useState(false);
    const [newPresetName, setNewPresetName] = useState("");
    const [newPresetTag, setNewPresetTag] = useState<string | null>(null);

    // Modal
    const [activeModal, setActiveModal] = useState<"strength" | "cardio" | null>(null);
    const [modalStep, setModalStep] = useState<"select" | "form">("select");
    const [selectedExercise, setSelectedExercise] = useState("");

    // Form — strength
    const [formWeight, setFormWeight] = useState("");
    const [formSets, setFormSets] = useState("");
    const [formReps, setFormReps] = useState("");
    // Form — cardio
    const [formDuration, setFormDuration] = useState("");
    const [formCalories, setFormCalories] = useState("");

    // AI
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
    }, []);

    // Refresh on every tab focus
    useFocusEffect(useCallback(() => {
        loadData();
    }, [loadData]));

    // Greeting
    useEffect(() => {
        const h = new Date().getHours();
        if (h < 5) setGreeting("夜已深了");
        else if (h < 12) setGreeting("早上好");
        else if (h < 18) setGreeting("下午好");
        else setGreeting("晚上好");
    }, []);

    // AI calorie estimation
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

    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat("zh-CN", {
        month: "long", day: "numeric", weekday: "long",
    }).format(now);

    const strengthWorkouts = workouts.filter((w) => w.type === "strength");
    const cardioWorkouts = workouts.filter((w) => w.type === "cardio");
    const totalSets = strengthWorkouts.reduce((s, w) => s + parseSetsCount(w.sets), 0);
    const cardioCalories = cardioWorkouts.reduce((s, w) => s + parseKcal(w.stats), 0);
    const fallbackCal = totalSets * 8 + cardioCalories;
    const displayCal = aiEstimatedCal !== null ? aiEstimatedCal : fallbackCal;

    // ─── Helpers ───────────────────────────────────────────────────────────────

    const closeModal = () => {
        setActiveModal(null);
        setModalStep("select");
        setSelectedExercise("");
        setFormWeight(""); setFormSets(""); setFormReps("");
        setFormDuration(""); setFormCalories("");
        setEditingWorkoutId(null);
        setIsCreatingPreset(false);
        setNewPresetName("");
        setNewPresetTag(null);
    };

    const handleOpenStrength = () => {
        setEditingWorkoutId(null);
        setSelectedExercise("");
        setFormWeight(""); setFormSets(""); setFormReps("");
        setActiveModal("strength");
        setModalStep("select");
    };

    const handleOpenCardio = () => {
        setEditingWorkoutId(null);
        setSelectedExercise("");
        setFormDuration(""); setFormCalories("");
        setActiveModal("cardio");
        setModalStep("select");
    };

    const openEditModal = (w: WorkoutItem) => {
        setEditingWorkoutId(w.id);
        setActiveModal(w.type as "strength" | "cardio");
        setModalStep("form");
        setSelectedExercise(w.name);
        if (w.type === "strength") {
            const wMatch = w.weight?.match(/([\d.]+)/);
            setFormWeight(wMatch ? wMatch[1] : "");
            const sMatch = w.sets?.match(/(\d+)\s*[×x]\s*(\d+)/i);
            setFormSets(sMatch ? sMatch[1] : "");
            setFormReps(sMatch ? sMatch[2] : "");
        } else {
            const mMin = w.stats?.match(/(\d+)\s*分钟/);
            const mCal = w.stats?.match(/(\d+)\s*千卡/);
            setFormDuration(mMin ? mMin[1] : "");
            setFormCalories(mCal ? mCal[1] : "");
        }
    };

    const selectExercise = (name: string) => {
        setSelectedExercise(name);
        setModalStep("form");
    };

    const handleSaveStrength = async () => {
        if (!selectedExercise) return;
        setIsPending(true);
        const payload = {
            type: "strength" as const,
            name: selectedExercise,
            weight: formWeight ? `${formWeight} kg` : undefined,
            sets: formSets && formReps ? `${formSets} × ${formReps}` : undefined,
        };
        try {
            if (editingWorkoutId) await updateWorkout(editingWorkoutId, payload);
            else await addWorkout(payload);
            closeModal();
            await loadData();
        } finally {
            setIsPending(false);
        }
    };

    const handleSaveCardio = async () => {
        if (!selectedExercise) return;
        setIsPending(true);
        const parts: string[] = [];
        if (formDuration) parts.push(`${formDuration} 分钟`);
        if (formCalories) parts.push(`${formCalories} 千卡`);
        const payload = {
            type: "cardio" as const,
            name: selectedExercise,
            stats: parts.length ? parts.join(" • ") : undefined,
        };
        try {
            if (editingWorkoutId) await updateWorkout(editingWorkoutId, payload);
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
                {/* ── Header ── */}
                <View className="flex-row justify-between items-end">
                    <View>
                        <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-widest mb-0.5">
                            {formattedDate}
                        </Text>
                        <Text className="text-3xl font-extrabold tracking-tight mt-1">
                            <Text style={{ color: colors.green }}>{greeting}, </Text>
                            <Text style={{ color: colors.white, opacity: 0.9 }}>{userName}</Text>
                        </Text>
                    </View>
                    {isCheckedIn && (
                        <CheckCircle size={32} color={colors.green} strokeWidth={2.5} />
                    )}
                </View>

                {/* ── Stats + Heatmap Row ── */}
                <View className="flex-row gap-bento">
                    {/* Stats card */}
                    <View
                        style={{ backgroundColor: colors.bento, borderColor: colors.border, flex: 1 }}
                        className="rounded-bento-lg border p-3 justify-around"
                    >
                        {/* Calories */}
                        <View className="mb-3">
                            <View className="flex-row items-center gap-1 mb-1">
                                <Flame size={14} color={colors.orange} />
                                <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-widest">燃脂</Text>
                            </View>
                            <View className="flex-row items-baseline gap-1">
                                {isAiPredicting ? (
                                    <Text style={{ color: colors.white, opacity: 0.5 }} className="text-lg">预测中...</Text>
                                ) : (
                                    <Text style={{ color: colors.white }} className="text-2xl font-extrabold">{displayCal}</Text>
                                )}
                                {!isAiPredicting && <Text style={{ color: colors.gray4 }} className="text-xs font-bold">千卡</Text>}
                            </View>
                        </View>

                        {/* Divider */}
                        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 2 }} />

                        {/* Sets */}
                        <View className="mt-3">
                            <View className="flex-row items-center gap-1 mb-1">
                                <Layers size={14} color={colors.green} />
                                <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-widest">组数</Text>
                            </View>
                            <View className="flex-row items-baseline gap-1">
                                <Text style={{ color: colors.white }} className="text-2xl font-extrabold">{totalSets}</Text>
                                <Text style={{ color: colors.gray4 }} className="text-xs font-bold">组</Text>
                            </View>
                        </View>
                    </View>

                    {/* Heatmap card */}
                    <View
                        style={{ backgroundColor: colors.bento, borderColor: colors.border, flex: 2 }}
                        className="rounded-bento-lg border p-3.5"
                    >
                        <MonthlyHeatmap refreshKey={`${workouts.length}-${isCheckedIn}`} />
                    </View>
                </View>

                {/* ── Today's Workouts ── */}
                <View
                    style={{ backgroundColor: colors.bento, borderColor: colors.border }}
                    className="rounded-bento-lg border p-4 gap-bento"
                >
                    <View className="flex-row justify-between items-center px-1">
                        <View className="flex-row items-center gap-2">
                            <Text style={{ color: colors.white }} className="text-lg font-bold tracking-tight">今日运动</Text>
                            {workouts.length > 0 && (
                                <View style={{ backgroundColor: colors.border }} className="px-2 py-0.5 rounded-md">
                                    <Text style={{ color: colors.white }} className="text-xs font-bold uppercase tracking-wider">
                                        {workouts.length} 次
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {workouts.length > 0 ? (
                        <View className="gap-bento">
                            {/* Cardio */}
                            {cardioWorkouts.length > 0 && (
                                <View style={{ backgroundColor: `${colors.orange}1A`, borderColor: `${colors.orange}33` }}
                                    className="rounded-bento-sm border p-3 gap-2">
                                    <View className="flex-row justify-between items-center ml-1">
                                        <Text style={{ color: colors.orange }} className="text-xs font-extrabold tracking-widest uppercase opacity-90">
                                            有氧训练
                                        </Text>
                                        <Pressable onPress={handleOpenCardio}
                                            style={{ backgroundColor: `${colors.orange}33` }}
                                            className="w-6 h-6 rounded-md items-center justify-center">
                                            <Plus size={14} color={colors.orange} strokeWidth={3} />
                                        </Pressable>
                                    </View>
                                    {cardioWorkouts.map((w) => (
                                        <Pressable key={w.id} onPress={() => openEditModal(w)}
                                            className="flex-row items-center gap-2.5 p-1.5 -mx-1.5 rounded-lg">
                                            <View style={{ backgroundColor: `${colors.orange}33` }} className="w-9 h-9 rounded-lg items-center justify-center">
                                                <Activity size={16} color={colors.orange} />
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row justify-between items-center">
                                                    <Text style={{ color: colors.white }} className="font-bold text-sm">{w.name}</Text>
                                                    <View style={{ backgroundColor: `${colors.orange}1A` }} className="px-2 py-0.5 rounded-md">
                                                        <Text style={{ color: colors.orange }} className="text-xs font-semibold">{formatTime(w.createdAt)}</Text>
                                                    </View>
                                                </View>
                                                {w.stats && <Text style={{ color: colors.white, opacity: 0.9 }} className="text-xs font-semibold mt-0.5">{w.stats}</Text>}
                                            </View>
                                        </Pressable>
                                    ))}
                                </View>
                            )}

                            {/* Strength */}
                            {strengthWorkouts.length > 0 && (
                                <View style={{ backgroundColor: colors.gray3 }} className="rounded-bento-sm p-3 gap-2">
                                    <View className="flex-row justify-between items-center ml-1 mb-0.5">
                                        <Text style={{ color: colors.gray4, opacity: 0.7 }} className="text-xs font-extrabold tracking-widest uppercase">
                                            力量训练
                                        </Text>
                                        <Pressable onPress={handleOpenStrength}
                                            style={{ backgroundColor: colors.gray2, borderColor: colors.border, borderWidth: 1 }}
                                            className="w-6 h-6 rounded-md items-center justify-center">
                                            <Plus size={14} color={colors.white} strokeWidth={3} />
                                        </Pressable>
                                    </View>
                                    {strengthWorkouts.map((w) => (
                                        <Pressable key={w.id} onPress={() => openEditModal(w)}
                                            className="flex-row items-center gap-2.5 p-1.5 -mx-1.5 rounded-lg">
                                            <View style={{ backgroundColor: colors.gray3 }} className="w-9 h-9 rounded-lg items-center justify-center">
                                                <Dumbbell size={16} color={colors.gray4} />
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row justify-between items-center">
                                                    <Text style={{ color: colors.white }} className="font-bold text-sm">{w.name}</Text>
                                                    <View style={{ backgroundColor: colors.border }} className="px-2 py-0.5 rounded-md">
                                                        <Text style={{ color: colors.gray4 }} className="text-xs font-semibold">{formatTime(w.createdAt)}</Text>
                                                    </View>
                                                </View>
                                                <Text className="text-xs font-semibold mt-0.5">
                                                    {w.weight && <Text style={{ color: colors.white, opacity: 0.9 }}>{w.weight}</Text>}
                                                    {w.weight && w.sets && <Text style={{ color: colors.gray4 }}> • </Text>}
                                                    {w.sets && <Text style={{ color: colors.gray4 }}>{w.sets}</Text>}
                                                </Text>
                                            </View>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>
                    ) : (
                        <View className="items-center justify-center py-8" style={{ opacity: 0.6 }}>
                            <Dumbbell size={40} color={colors.gray4} />
                            <Text style={{ color: colors.gray4 }} className="text-sm font-bold mt-3">今天还没有记录运动</Text>
                        </View>
                    )}

                    {/* Quick-add buttons */}
                    <View className="flex-row gap-bento">
                        {cardioWorkouts.length === 0 && (
                            <Pressable onPress={handleOpenCardio}
                                style={{ backgroundColor: `${colors.orange}26`, borderColor: `${colors.orange}33`, borderWidth: 1 }}
                                className="flex-1 py-3 rounded-bento-sm flex-row items-center justify-center gap-2">
                                <Activity size={16} color={colors.orange} />
                                <Text style={{ color: colors.orange }} className="font-bold text-sm">有氧运动</Text>
                            </Pressable>
                        )}
                        {strengthWorkouts.length === 0 && (
                            <Pressable onPress={handleOpenStrength}
                                style={{ backgroundColor: colors.gray3, borderColor: colors.border, borderWidth: 1 }}
                                className="flex-1 py-3 rounded-bento-sm flex-row items-center justify-center gap-2">
                                <Dumbbell size={16} color={colors.white} />
                                <Text style={{ color: colors.white }} className="font-bold text-sm">力量训练</Text>
                            </Pressable>
                        )}
                    </View>

                    {/* Check-in Button */}
                    {workouts.length > 0 && !isCheckedIn && (
                        <Pressable
                            onPress={handleCheckin}
                            disabled={isPending}
                            style={{ backgroundColor: colors.green, opacity: isPending ? 0.5 : 1 }}
                            className="w-full py-4 rounded-bento-sm flex-row items-center justify-center gap-2"
                        >
                            <CheckCircle size={18} color="#000" strokeWidth={2.5} />
                            <Text className="font-extrabold text-base tracking-widest text-black">
                                {isPending ? "打卡中..." : "完成今日打卡"}
                            </Text>
                        </Pressable>
                    )}
                    {isCheckedIn && (
                        <View
                            style={{ backgroundColor: `${colors.green}1A`, borderColor: `${colors.green}33`, borderWidth: 1 }}
                            className="w-full py-4 rounded-bento-sm flex-row items-center justify-center gap-2"
                        >
                            <CheckCircle size={18} color={colors.green} strokeWidth={2.5} />
                            <Text style={{ color: colors.green }} className="font-extrabold text-base tracking-widest">今日打卡已完成</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Confetti */}
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}>
                <ConfettiCannon
                    ref={confettiRef}
                    count={120}
                    origin={{ x: 200, y: -50 }}
                    autoStart={false}
                    fadeOut
                />
            </View>

            {/* ─── Strength Modal ─── */}
            <Modal visible={activeModal === "strength"} animationType="slide" transparent onRequestClose={closeModal}>
                <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
                    onPress={closeModal}>
                    <Pressable onPress={() => { }} style={{ backgroundColor: colors.bento, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, height: "75%" }}>
                        <View className="flex-row justify-between items-center mb-6">
                            {modalStep === "form" && !editingWorkoutId ? (
                                <Pressable onPress={() => { setModalStep("select"); setSelectedExercise(""); }}
                                    className="flex-row items-center gap-1">
                                    <ChevronLeft size={20} color={colors.green} />
                                    <Text style={{ color: colors.green }} className="font-bold text-sm">返回</Text>
                                </Pressable>
                            ) : (
                                <Text style={{ color: colors.white }} className="text-2xl font-extrabold tracking-tight">
                                    {editingWorkoutId ? "修改力量训练" : "添加力量训练"}
                                </Text>
                            )}
                            <Pressable onPress={closeModal}
                                style={{ backgroundColor: colors.gray3 }}
                                className="w-8 h-8 rounded-lg items-center justify-center">
                                <X size={20} color={colors.gray4} />
                            </Pressable>
                        </View>

                        {modalStep === "select" ? (
                            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                {strengthPresets.map((ex, i) => (
                                    <View key={i} className="relative mb-3">
                                        <Pressable onPress={() => selectExercise(ex.name)}
                                            style={{ backgroundColor: colors.gray2 }}
                                            className="w-full p-4 rounded-2xl flex-row justify-between items-center">
                                            <View className="gap-1">
                                                <View className="flex-row items-center gap-2">
                                                    <Dumbbell size={16} color={colors.green} />
                                                    <Text style={{ color: colors.white }} className="font-bold text-lg">{ex.name}</Text>
                                                </View>
                                                {ex.tag && (
                                                    <View style={{ backgroundColor: `${colors.green}1A` }} className="self-start px-1.5 py-0.5 rounded">
                                                        <Text style={{ color: colors.green }} className="text-xs font-bold tracking-wide">{ex.tag}</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View className="flex-row items-center gap-3">
                                                <Pressable onPress={() => {
                                                    Alert.alert("删除预设", `确定删除 "${ex.name}"？`, [
                                                        { text: "取消", style: "cancel" },
                                                        {
                                                            text: "删除", style: "destructive", onPress: async () => {
                                                                setStrengthPresets(p => p.filter(x => x.name !== ex.name));
                                                                await removeStrengthPreset(ex.name);
                                                            }
                                                        },
                                                    ]);
                                                }}>
                                                    <Trash2 size={16} color={`${colors.red}99`} />
                                                </Pressable>
                                                <Plus size={20} color={colors.gray4} />
                                            </View>
                                        </Pressable>
                                    </View>
                                ))}

                                {isCreatingPreset ? (
                                    <View style={{ backgroundColor: colors.gray2, borderColor: `${colors.green}80`, borderWidth: 1 }}
                                        className="p-4 rounded-2xl gap-3 mt-2">
                                        <TextInput
                                            value={newPresetName}
                                            onChangeText={setNewPresetName}
                                            placeholder="输入动作名称，例如：杠铃区卧推"
                                            placeholderTextColor={`${colors.gray4}66`}
                                            style={{ color: colors.white, backgroundColor: "rgba(0,0,0,0.2)", padding: 12, borderRadius: 12, fontWeight: "bold" }}
                                            autoFocus
                                        />
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View className="flex-row gap-1.5">
                                                {["胸部训练", "肩部训练", "背部训练", "腿部训练", "手臂训练", "核心训练", "全身训练"].map(tag => (
                                                    <Pressable key={tag} onPress={() => setNewPresetTag(tag === newPresetTag ? null : tag)}
                                                        style={{
                                                            backgroundColor: tag === newPresetTag ? `${colors.green}33` : "rgba(255,255,255,0.05)",
                                                            borderColor: tag === newPresetTag ? `${colors.green}80` : "transparent",
                                                            borderWidth: 1,
                                                        }}
                                                        className="px-2 py-1.5 rounded-md">
                                                        <Text style={{ color: tag === newPresetTag ? colors.green : colors.gray4 }}
                                                            className="text-xs font-bold">{tag}</Text>
                                                    </Pressable>
                                                ))}
                                            </View>
                                        </ScrollView>
                                        <View className="flex-row gap-2">
                                            <Pressable
                                                onPress={async () => {
                                                    const name = newPresetName.trim();
                                                    if (name && !strengthPresets.find(p => p.name === name)) {
                                                        const tag = newPresetTag;
                                                        setStrengthPresets(prev => [...prev, { name, tag }]);
                                                        await addStrengthPreset(name, tag || undefined);
                                                    }
                                                    setNewPresetName(""); setNewPresetTag(null); setIsCreatingPreset(false);
                                                }}
                                                disabled={!newPresetName.trim()}
                                                style={{ flex: 1, backgroundColor: colors.green, opacity: newPresetName.trim() ? 1 : 0.5 }}
                                                className="py-2.5 rounded-xl items-center">
                                                <Text style={{ color: colors.white }} className="font-bold">保存</Text>
                                            </Pressable>
                                            <Pressable onPress={() => { setNewPresetName(""); setNewPresetTag(null); setIsCreatingPreset(false); }}
                                                style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.1)" }}
                                                className="py-2.5 rounded-xl items-center">
                                                <Text style={{ color: colors.white }} className="font-bold">取消</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                ) : (
                                    <Pressable onPress={() => setIsCreatingPreset(true)}
                                        style={{ borderColor: colors.border, borderWidth: 1, borderStyle: "dashed" }}
                                        className="w-full mt-2 py-5 rounded-2xl items-center justify-center flex-row gap-2">
                                        <Plus size={20} color={colors.gray4} />
                                        <Text style={{ color: colors.gray4 }} className="font-bold">创建新项目预设</Text>
                                    </Pressable>
                                )}
                            </ScrollView>
                        ) : (
                            <View className="flex-1">
                                <View className="flex-row items-center gap-3 mb-6">
                                    <View style={{ backgroundColor: `${colors.green}33` }} className="w-12 h-12 rounded-xl items-center justify-center">
                                        <Dumbbell size={24} color={colors.green} />
                                    </View>
                                    <Text style={{ color: colors.white }} className="text-xl font-bold">{selectedExercise}</Text>
                                </View>
                                <View className="gap-4 flex-1">
                                    <View>
                                        <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider mb-2">重量 (KG)</Text>
                                        <TextInput
                                            keyboardType="decimal-pad"
                                            value={formWeight}
                                            onChangeText={setFormWeight}
                                            placeholder="例如 100"
                                            placeholderTextColor={`${colors.gray4}66`}
                                            style={{ color: colors.white, backgroundColor: colors.gray2, padding: 16, borderRadius: 12, fontWeight: "bold", fontSize: 18, borderWidth: 1, borderColor: `${colors.gray3}4D` }}
                                        />
                                    </View>
                                    <View className="flex-row gap-3">
                                        <View className="flex-1">
                                            <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider mb-2">组数</Text>
                                            <TextInput
                                                keyboardType="number-pad"
                                                value={formSets}
                                                onChangeText={setFormSets}
                                                placeholder="5"
                                                placeholderTextColor={`${colors.gray4}66`}
                                                style={{ color: colors.white, backgroundColor: colors.gray2, padding: 16, borderRadius: 12, fontWeight: "bold", fontSize: 18, borderWidth: 1, borderColor: `${colors.gray3}4D` }}
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider mb-2">每组次数</Text>
                                            <TextInput
                                                keyboardType="number-pad"
                                                value={formReps}
                                                onChangeText={setFormReps}
                                                placeholder="8"
                                                placeholderTextColor={`${colors.gray4}66`}
                                                style={{ color: colors.white, backgroundColor: colors.gray2, padding: 16, borderRadius: 12, fontWeight: "bold", fontSize: 18, borderWidth: 1, borderColor: `${colors.gray3}4D` }}
                                            />
                                        </View>
                                    </View>
                                </View>
                                <View className="flex-row gap-2 mt-6">
                                    {editingWorkoutId && (
                                        <Pressable onPress={() => handleDelete(editingWorkoutId)} disabled={isPending}
                                            style={{ backgroundColor: `${colors.red}1A`, width: 64, opacity: isPending ? 0.5 : 1 }}
                                            className="py-4 rounded-xl items-center justify-center">
                                            <Trash2 size={20} color={colors.red} />
                                        </Pressable>
                                    )}
                                    <Pressable onPress={handleSaveStrength} disabled={isPending || !selectedExercise}
                                        style={{ backgroundColor: colors.green, flex: 1, opacity: (isPending || !selectedExercise) ? 0.5 : 1 }}
                                        className="py-4 rounded-xl items-center">
                                        <Text style={{ color: colors.white }} className="font-bold text-lg">
                                            {isPending ? "保存中..." : "保存记录"}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>

            {/* ─── Cardio Modal ─── */}
            <Modal visible={activeModal === "cardio"} animationType="slide" transparent onRequestClose={closeModal}>
                <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
                    onPress={closeModal}>
                    <Pressable onPress={() => { }} style={{ backgroundColor: colors.bento, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, height: "75%" }}>
                        <View className="flex-row justify-between items-center mb-6">
                            {modalStep === "form" ? (
                                <Pressable onPress={() => { setModalStep("select"); setSelectedExercise(""); }}
                                    className="flex-row items-center gap-1">
                                    <ChevronLeft size={20} color={colors.orange} />
                                    <Text style={{ color: colors.orange }} className="font-bold text-sm">返回</Text>
                                </Pressable>
                            ) : (
                                <Text style={{ color: colors.white }} className="text-2xl font-extrabold tracking-tight">
                                    {editingWorkoutId ? "修改有氧运动" : "添加有氧运动"}
                                </Text>
                            )}
                            <Pressable onPress={closeModal}
                                style={{ backgroundColor: colors.gray3 }}
                                className="w-8 h-8 rounded-lg items-center justify-center">
                                <X size={20} color={colors.gray4} />
                            </Pressable>
                        </View>

                        {modalStep === "select" ? (
                            <View className="gap-3">
                                {CARDIO_EXERCISES.map((ex, i) => (
                                    <Pressable key={i} onPress={() => selectExercise(ex)}
                                        style={{ backgroundColor: colors.gray2 }}
                                        className="w-full p-5 rounded-2xl flex-row justify-between items-center">
                                        <View className="flex-row items-center gap-3">
                                            <Activity size={20} color={colors.orange} />
                                            <Text style={{ color: colors.white }} className="font-bold text-lg">{ex}</Text>
                                        </View>
                                        <Plus size={20} color={colors.gray4} />
                                    </Pressable>
                                ))}
                            </View>
                        ) : (
                            <View className="flex-1">
                                <View className="flex-row items-center gap-3 mb-6">
                                    <View style={{ backgroundColor: `${colors.orange}33` }} className="w-12 h-12 rounded-xl items-center justify-center">
                                        <Activity size={24} color={colors.orange} />
                                    </View>
                                    <Text style={{ color: colors.white }} className="text-xl font-bold">{selectedExercise}</Text>
                                </View>
                                <View className="gap-4 flex-1">
                                    <View>
                                        <View className="flex-row items-center gap-1.5 mb-2">
                                            <Timer size={14} color={colors.gray4} />
                                            <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider">时长 (分钟)</Text>
                                        </View>
                                        <TextInput
                                            keyboardType="number-pad"
                                            value={formDuration}
                                            onChangeText={setFormDuration}
                                            placeholder="例如 30"
                                            placeholderTextColor={`${colors.gray4}66`}
                                            style={{ color: colors.white, backgroundColor: colors.gray2, padding: 16, borderRadius: 12, fontWeight: "bold", fontSize: 18, borderWidth: 1, borderColor: `${colors.gray3}4D` }}
                                        />
                                    </View>
                                    <View>
                                        <View className="flex-row items-center gap-1.5 mb-2">
                                            <Flame size={14} color={colors.gray4} />
                                            <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider">消耗 (千卡)</Text>
                                        </View>
                                        <TextInput
                                            keyboardType="number-pad"
                                            value={formCalories}
                                            onChangeText={setFormCalories}
                                            placeholder="例如 300"
                                            placeholderTextColor={`${colors.gray4}66`}
                                            style={{ color: colors.white, backgroundColor: colors.gray2, padding: 16, borderRadius: 12, fontWeight: "bold", fontSize: 18, borderWidth: 1, borderColor: `${colors.gray3}4D` }}
                                        />
                                    </View>
                                </View>
                                <View className="flex-row gap-2 mt-6">
                                    {editingWorkoutId && (
                                        <Pressable onPress={() => handleDelete(editingWorkoutId)} disabled={isPending}
                                            style={{ backgroundColor: `${colors.red}1A`, width: 64, opacity: isPending ? 0.5 : 1 }}
                                            className="py-4 rounded-xl items-center justify-center">
                                            <Trash2 size={20} color={colors.red} />
                                        </Pressable>
                                    )}
                                    <Pressable onPress={handleSaveCardio} disabled={isPending}
                                        style={{ backgroundColor: colors.orange, flex: 1, opacity: isPending ? 0.5 : 1 }}
                                        className="py-4 rounded-xl items-center">
                                        <Text className="font-bold text-lg text-black">
                                            {isPending ? "保存中..." : "保存记录"}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
