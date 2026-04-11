import { type ReactNode, useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Clock3, Flame, MapPin, Plus, Sparkles } from "lucide-react-native";
import { desc } from "drizzle-orm";
import * as SplashScreen from "expo-splash-screen";

import { db } from "@/db/client";
import { bodyMetrics, workouts } from "@/db/schema";
import { generateTrainingReportWithAI, type AiReportData } from "@/db/services/ai";
import { addWorkout, getStrengthPresets } from "@/db/services/workout";
import { useTheme } from "@/hooks/useTheme";

type EnergyOption = "high" | "medium" | "low";
type DurationOption = "20" | "40" | "60";
type LocationOption = "gym" | "home";

type CheckInState = {
    energy: EnergyOption;
    duration: DurationOption;
    location: LocationOption;
};

type CoachContextData = {
    recentWorkouts: {
        name: string;
        weight: string | null;
        sets: string | null;
        stats: string | null;
        createdAt: string;
    }[];
    recentMetrics: {
        metricType: string;
        dateStr: string;
        value: number;
    }[];
    presets: {
        name: string;
        tag: string | null;
    }[];
};

const INITIAL_CHECK_IN: CheckInState = {
    energy: "medium",
    duration: "40",
    location: "gym",
};

function getTodayDateStr() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function getCoachLine(score: number, energy: EnergyOption) {
    if (energy === "low") return "今天轻一点，先完成比冲强度更重要。";
    if (score >= 75 && energy === "high") return "今天状态不错，适合完成一版完整训练。";
    return "今天稳稳推进，就是最好的安排。";
}

function getPlanTypeLabel(type: "strength" | "cardio") {
    return type === "strength" ? "力量训练" : "有氧训练";
}

function getAdjustedPlan(reportData: AiReportData | null, checkIn: CheckInState, useLiteMode: boolean) {
    if (!reportData) return [];

    let plan = [...reportData.todaysPlan];

    if (checkIn.duration === "20" || useLiteMode) {
        plan = plan.slice(0, Math.min(2, plan.length)).map((item) => ({
            ...item,
            sets: item.sets ? `${item.sets} · 轻松版` : item.sets,
            stats: item.stats ? `${item.stats} · 轻松版` : item.stats,
        }));
    }

    if (checkIn.location === "home") {
        plan = plan.map((item) => ({
            ...item,
            stats: item.type === "cardio" ? item.stats || "15-20 分钟" : item.stats,
        }));
    }

    if (checkIn.energy === "low") {
        plan = plan.map((item) => ({
            ...item,
            sets: item.sets ? `${item.sets} · 降低强度` : item.sets,
            stats: item.stats ? `${item.stats} · 放轻松` : item.stats,
        }));
    }

    return plan;
}

function sectionCard(colors: ReturnType<typeof useTheme>["colors"]) {
    return {
        backgroundColor: colors.bento,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 18,
    } as const;
}

export default function AiCoachScreen() {
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reportData, setReportData] = useState<AiReportData | null>(null);
    const [checkIn, setCheckIn] = useState<CheckInState>(INITIAL_CHECK_IN);
    const [useLiteMode, setUseLiteMode] = useState(false);
    const [contextData, setContextData] = useState<CoachContextData>({
        recentWorkouts: [],
        recentMetrics: [],
        presets: [],
    });

    useFocusEffect(useCallback(() => {
        Promise.all([
            db.select().from(workouts).orderBy(desc(workouts.createdAt)).limit(20),
            db.select().from(bodyMetrics).orderBy(desc(bodyMetrics.dateStr)).limit(5),
            getStrengthPresets(),
        ]).then(([workoutRows, metricRows, presetRows]) => {
            setContextData({
                recentWorkouts: workoutRows.map((item) => ({
                    name: item.name,
                    weight: item.weight,
                    sets: item.sets,
                    stats: item.stats,
                    createdAt: new Date(item.createdAt).toISOString(),
                })),
                recentMetrics: metricRows.map((item) => ({
                    metricType: item.metricType,
                    dateStr: item.dateStr,
                    value: item.value,
                })),
                presets: presetRows,
            });
            SplashScreen.hideAsync().catch(() => {});
        });
    }, []));

    const adjustedPlan = useMemo(
        () => getAdjustedPlan(reportData, checkIn, useLiteMode),
        [checkIn, reportData, useLiteMode]
    );

    const coachLine = useMemo(
        () => getCoachLine(reportData?.intensityScore ?? 50, checkIn.energy),
        [checkIn.energy, reportData?.intensityScore]
    );

    const handleGenerateReport = async () => {
        if (isLoading) return;
        setError(null);
        setUseLiteMode(false);
        setIsLoading(true);

        try {
            const data = await generateTrainingReportWithAI(
                contextData.recentWorkouts,
                contextData.recentMetrics,
                contextData.presets
            );
            setReportData(data);
        } catch (e: any) {
            setError(e.message || "生成 AI 建议失败，请稍后再试。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyTodaysPlan = async () => {
        if (adjustedPlan.length === 0) return;

        setIsApplying(true);
        try {
            const todayStr = getTodayDateStr();
            for (const item of adjustedPlan) {
                await addWorkout({
                    type: item.type,
                    name: item.name,
                    sets: item.sets,
                    stats: item.stats,
                    forDate: todayStr,
                });
            }

            Alert.alert("已添加", "今天的计划已经加入训练列表。", [
                { text: "去首页", onPress: () => router.push("/") },
                { text: "留在这里", style: "cancel" },
            ]);
        } catch (e: any) {
            Alert.alert("应用失败", e.message || "添加计划失败，请稍后再试。");
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <View style={{ paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: `${colors.bg}F2`, borderBottomWidth: 0.5, borderBottomColor: colors.border }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{ width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: `${colors.green}22` }}>
                        <Sparkles size={20} color={colors.green} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.white, fontSize: 24, fontWeight: "900" }}>AI 教练</Text>
                        <Text style={{ color: colors.gray4, fontSize: 12, fontWeight: "700", marginTop: 2 }}>今天练什么</Text>
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
                <View style={{ ...sectionCard(colors), padding: 16 }}>
                    <Text style={{ color: colors.green, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 }}>今日状态</Text>
                    <Text style={{ color: colors.white, fontSize: 20, fontWeight: "900", marginTop: 8 }}>先选一下今天的状态</Text>

                    <View style={{ gap: 12, marginTop: 16 }}>
                        <FilterRow
                            title="精力"
                            icon={<Flame size={14} color={colors.orange} />}
                            value={checkIn.energy}
                            colors={colors}
                            options={[{ key: "high", label: "很好" }, { key: "medium", label: "一般" }, { key: "low", label: "疲劳" }]}
                            onChange={(value) => setCheckIn((prev) => ({ ...prev, energy: value as EnergyOption }))}
                        />
                        <FilterRow
                            title="时长"
                            icon={<Clock3 size={14} color={colors.green} />}
                            value={checkIn.duration}
                            colors={colors}
                            options={[{ key: "20", label: "20m" }, { key: "40", label: "40m" }, { key: "60", label: "60m+" }]}
                            onChange={(value) => setCheckIn((prev) => ({ ...prev, duration: value as DurationOption }))}
                        />
                        <FilterRow
                            title="地点"
                            icon={<MapPin size={14} color={colors.red} />}
                            value={checkIn.location}
                            colors={colors}
                            options={[{ key: "gym", label: "健身房" }, { key: "home", label: "家里" }]}
                            onChange={(value) => setCheckIn((prev) => ({ ...prev, location: value as LocationOption }))}
                        />
                    </View>

                    <Pressable onPress={handleGenerateReport} disabled={isLoading} style={{ marginTop: 16, backgroundColor: colors.green, borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, opacity: isLoading ? 0.6 : 1 }}>
                        {isLoading ? <ActivityIndicator size="small" color={colors.bg} /> : <Sparkles size={16} color={colors.bg} strokeWidth={2.6} />}
                        <Text style={{ color: colors.bg, fontSize: 15, fontWeight: "900" }}>{isLoading ? "正在生成建议..." : "生成今日建议"}</Text>
                    </Pressable>
                </View>

                <View style={{ ...sectionCard(colors), padding: 16 }}>
                    <Text style={{ color: colors.green, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 }}>AI 建议</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
                        <Text style={{ color: colors.white, fontSize: 20, fontWeight: "900", flex: 1 }}>今天的建议</Text>
                        <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: `${colors.orange}18` }}>
                            <Text style={{ color: colors.orange, fontSize: 12, fontWeight: "900" }}>{reportData?.intensityScore ?? 0} / 100</Text>
                        </View>
                    </View>

                    <View style={{ marginTop: 14, padding: 14, borderRadius: 14, backgroundColor: `${colors.gray3}55` }}>
                        <Text style={{ color: colors.white, fontSize: 16, fontWeight: "800" }}>{coachLine}</Text>
                        <Text style={{ color: colors.gray4, fontSize: 14, lineHeight: 22, marginTop: 8 }}>
                            {reportData?.overallEvaluation || "生成建议后，这里会显示 AI 对你今天训练的判断。"}
                        </Text>
                    </View>
                </View>

                <View style={{ ...sectionCard(colors), padding: 16 }}>
                    <Text style={{ color: colors.green, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 }}>今日计划</Text>
                    <Text style={{ color: colors.white, fontSize: 20, fontWeight: "900", marginTop: 8 }}>今天的训练计划</Text>

                    {adjustedPlan.length === 0 ? (
                        <View style={{ marginTop: 14, padding: 16, borderRadius: 14, backgroundColor: `${colors.gray3}44` }}>
                            <Text style={{ color: colors.gray4, fontSize: 14, lineHeight: 22 }}>先生成建议，这里会给你 2 到 3 个今天该做的训练项。</Text>
                        </View>
                    ) : (
                        <View style={{ gap: 10, marginTop: 14 }}>
                            {adjustedPlan.map((plan, index) => (
                                <View key={`${plan.name}-${index}`} style={{ borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: `${colors.bg}66` }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: colors.white, fontSize: 16, fontWeight: "800" }}>{plan.name}</Text>
                                            <Text style={{ color: colors.gray4, fontSize: 12, fontWeight: "700", marginTop: 4 }}>{getPlanTypeLabel(plan.type)}</Text>
                                        </View>
                                        <Text style={{ color: colors.green, fontSize: 12, fontWeight: "900" }}>{plan.sets || plan.stats || "自定义"}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                        <Pressable onPress={() => setUseLiteMode((prev) => !prev)} disabled={!reportData} style={{ flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: useLiteMode ? colors.green : colors.border, backgroundColor: useLiteMode ? `${colors.green}18` : `${colors.gray3}44`, opacity: reportData ? 1 : 0.5 }}>
                            <Text style={{ color: useLiteMode ? colors.green : colors.white, fontSize: 13, fontWeight: "900" }}>{useLiteMode ? "已切到轻松版" : "换个更轻松的"}</Text>
                        </Pressable>

                        <Pressable onPress={handleApplyTodaysPlan} disabled={isApplying || adjustedPlan.length === 0} style={{ flex: 1, backgroundColor: colors.green, borderRadius: 14, paddingVertical: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, opacity: isApplying || adjustedPlan.length === 0 ? 0.55 : 1 }}>
                            {isApplying ? <ActivityIndicator size="small" color={colors.bg} /> : <Plus size={16} color={colors.bg} strokeWidth={2.6} />}
                            <Text style={{ color: colors.bg, fontSize: 13, fontWeight: "900" }}>应用到今日训练</Text>
                        </Pressable>
                    </View>
                </View>

                {error && (
                    <View style={{ ...sectionCard(colors), padding: 14, backgroundColor: `${colors.red}14`, borderColor: `${colors.red}33` }}>
                        <Text style={{ color: colors.red, fontSize: 13, lineHeight: 20, fontWeight: "700" }}>{error}</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

function FilterRow({ title, icon, options, value, onChange, colors }: { title: string; icon: ReactNode; options: { key: string; label: string }[]; value: string; onChange: (value: string) => void; colors: ReturnType<typeof useTheme>["colors"]; }) {
    return (
        <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                {icon}
                <Text style={{ color: colors.white, fontSize: 13, fontWeight: "800" }}>{title}</Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {options.map((option) => {
                    const active = option.key === value;
                    return (
                        <Pressable key={option.key} onPress={() => onChange(option.key)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: active ? colors.green : colors.border, backgroundColor: active ? `${colors.green}18` : `${colors.gray3}44` }}>
                            <Text style={{ color: active ? colors.green : colors.white, fontSize: 12, fontWeight: "800" }}>{option.label}</Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}
