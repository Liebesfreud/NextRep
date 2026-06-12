import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock3, Flame, MapPin, Plus, Sparkles } from "lucide-react-native";
import { desc } from "drizzle-orm";
import * as SplashScreen from "expo-splash-screen";

import { db } from "@/db/client";
import { bodyMetrics, workouts } from "@/db/schema";
import { generateTrainingReportWithAI, type AiReportData } from "@/db/services/ai";
import * as workoutService from "@/db/services/workout";
import { useTheme } from "@/hooks/useTheme";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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

type PlanWorkoutInput = {
    type: "strength" | "cardio";
    name: string;
    sets?: string;
    stats?: string;
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
    if (energy === "low") return "今天以轻量训练为主。";
    if (score >= 75 && energy === "high") return "今天可以完成完整训练。";
    return "按计划推进即可。";
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

export default function AiCoachScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const mountedRef = useRef(true);
    const contextSeqRef = useRef(0);
    const reportSeqRef = useRef(0);
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

    useEffect(() => {
        return () => {
            mountedRef.current = false;
            contextSeqRef.current += 1;
            reportSeqRef.current += 1;
        };
    }, []);

    useFocusEffect(useCallback(() => {
        const requestId = ++contextSeqRef.current;
        Promise.all([
            db.select().from(workouts).orderBy(desc(workouts.createdAt)).limit(20),
            db.select().from(bodyMetrics).orderBy(desc(bodyMetrics.dateStr)).limit(5),
            workoutService.getStrengthPresets(),
        ]).then(([workoutRows, metricRows, presetRows]) => {
            if (!mountedRef.current || requestId !== contextSeqRef.current) return;
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
        }).catch(console.error).finally(() => {
            if (mountedRef.current && requestId === contextSeqRef.current) {
                SplashScreen.hideAsync().catch(() => {});
            }
        });
        return () => {
            contextSeqRef.current += 1;
        };
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
        const requestId = ++reportSeqRef.current;

        try {
            const data = await generateTrainingReportWithAI(
                contextData.recentWorkouts,
                contextData.recentMetrics,
                contextData.presets
            );
            if (!mountedRef.current || requestId !== reportSeqRef.current) return;
            setReportData(data);
        } catch (e: any) {
            if (mountedRef.current && requestId === reportSeqRef.current) {
                setError(e.message || "生成 AI 建议失败，请稍后再试。");
            }
        } finally {
            if (mountedRef.current && requestId === reportSeqRef.current) {
                setIsLoading(false);
            }
        }
    };

    const handleApplyTodaysPlan = async () => {
        if (isApplying || adjustedPlan.length === 0) return;

        setIsApplying(true);
        try {
            const todayStr = getTodayDateStr();
            await workoutService.addWorkouts(adjustedPlan.map((item): PlanWorkoutInput => ({
                type: item.type,
                name: item.name,
                sets: item.sets,
                stats: item.stats,
            })), todayStr);

            if (!mountedRef.current) return;
            Alert.alert("已添加", "今天的计划已经加入训练列表。", [
                { text: "去首页", onPress: () => router.push("/") },
                { text: "留在这里", style: "cancel" },
            ]);
        } catch (e: any) {
            if (mountedRef.current) Alert.alert("应用失败", e.message || "添加计划失败，请稍后再试。");
        } finally {
            if (mountedRef.current) setIsApplying(false);
        }
    };

    return (
        <View className="flex-1 bg-background">
            <View className="border-b border-border bg-background px-4 pb-3" style={{ paddingTop: insets.top + 16 }}>
                <Text variant="title">AI 教练</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 + Math.max(insets.bottom, 0) + 52, gap: 14 }}>
                <Card>
                    <Text variant="subheading">今日状态</Text>

                    <View className="mt-4 gap-3">
                        <FilterRow
                            title="精力"
                            icon={<Flame size={14} color={colors.white} />}
                            value={checkIn.energy}
                            options={[{ key: "high", label: "很好" }, { key: "medium", label: "一般" }, { key: "low", label: "疲劳" }]}
                            onChange={(value) => setCheckIn((prev) => ({ ...prev, energy: value as EnergyOption }))}
                        />
                        <FilterRow
                            title="时长"
                            icon={<Clock3 size={14} color={colors.white} />}
                            value={checkIn.duration}
                            options={[{ key: "20", label: "20m" }, { key: "40", label: "40m" }, { key: "60", label: "60m+" }]}
                            onChange={(value) => setCheckIn((prev) => ({ ...prev, duration: value as DurationOption }))}
                        />
                        <FilterRow
                            title="地点"
                            icon={<MapPin size={14} color={colors.white} />}
                            value={checkIn.location}
                            options={[{ key: "gym", label: "健身房" }, { key: "home", label: "家里" }]}
                            onChange={(value) => setCheckIn((prev) => ({ ...prev, location: value as LocationOption }))}
                        />
                    </View>

                    <Button onPress={handleGenerateReport} disabled={isLoading} className="mt-4 py-3.5">
                        {isLoading ? <ActivityIndicator size="small" color={colors.primaryForeground} /> : <Sparkles size={16} color={colors.primaryForeground} strokeWidth={2.2} />}
                        <ButtonText>{isLoading ? "生成中" : "生成建议"}</ButtonText>
                    </Button>
                </Card>

                <Card>
                    <View className="mt-2 flex-row items-center justify-between gap-3">
                        <Text variant="subheading" className="flex-1">建议</Text>
                        <View className="rounded-full border border-border px-2.5 py-1.5">
                            <Text className="text-xs font-medium text-foreground">{reportData?.intensityScore ?? 0} / 100</Text>
                        </View>
                    </View>

                    <View className="mt-3.5 rounded-[14px] border border-border bg-background p-3.5">
                        <Text className="text-base font-semibold">{coachLine}</Text>
                        <Text variant="muted" className="mt-2">
                            {reportData?.overallEvaluation || "暂无建议"}
                        </Text>
                    </View>
                </Card>

                <Card>
                    <Text variant="subheading">今日计划</Text>

                    {adjustedPlan.length === 0 ? (
                        <View className="mt-3.5 rounded-[14px] border border-dashed border-border bg-background p-4">
                            <Text variant="muted">暂无计划</Text>
                        </View>
                    ) : (
                        <View className="mt-3.5 gap-2.5">
                            {adjustedPlan.map((plan, index) => (
                                <Card key={`${plan.name}-${index}`} className="rounded-[14px] border border-border bg-background p-3.5">
                                    <View className="flex-row items-center justify-between gap-2.5">
                                        <View className="flex-1">
                                            <Text className="text-base font-semibold">{plan.name}</Text>
                                            <Text variant="caption" className="mt-1">{getPlanTypeLabel(plan.type)}</Text>
                                        </View>
                                        <Text className="text-xs text-muted-foreground">{plan.sets || plan.stats || "-"}</Text>
                                    </View>
                                </Card>
                            ))}
                        </View>
                    )}

                    <View className="mt-3.5 flex-row gap-2.5">
                        <Button
                            onPress={() => setUseLiteMode((prev) => !prev)}
                            disabled={!reportData}
                            variant="outline"
                            className="flex-1 py-3"
                        >
                            <ButtonText variant="outline">{useLiteMode ? "轻松版" : "切换轻松版"}</ButtonText>
                        </Button>

                        <Button onPress={handleApplyTodaysPlan} disabled={isApplying || adjustedPlan.length === 0} className="flex-1 py-3">
                            {isApplying ? <ActivityIndicator size="small" color={colors.primaryForeground} /> : <Plus size={16} color={colors.primaryForeground} strokeWidth={2.2} />}
                            <ButtonText>加入今日训练</ButtonText>
                        </Button>
                    </View>
                </Card>

                {error && (
                    <Card className="border-destructive/20 bg-destructive/10 p-3.5">
                        <Text className="text-[13px] font-bold leading-5 text-destructive">{error}</Text>
                    </Card>
                )}
            </ScrollView>
        </View>
    );
}

function FilterRow({ title, icon, options, value, onChange }: { title: string; icon: ReactNode; options: { key: string; label: string }[]; value: string; onChange: (value: string) => void; }) {
    return (
        <View>
            <View className="mb-2 flex-row items-center gap-1.5">
                {icon}
                <Text className="text-[13px] font-medium">{title}</Text>
            </View>
            <ToggleGroup value={value} onValueChange={onChange}>
                {options.map((option) => {
                    const active = option.key === value;
                    return (
                        <ToggleGroupItem
                            key={option.key}
                            value={option.key}
                            activeClassName="border-primary bg-background"
                            inactiveClassName="border-border bg-background"
                        >
                            <Text className={active ? "text-xs font-medium text-foreground" : "text-xs text-muted-foreground"}>{option.label}</Text>
                        </ToggleGroupItem>
                    );
                })}
            </ToggleGroup>
        </View>
    );
}
