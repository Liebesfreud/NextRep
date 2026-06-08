import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
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

export default function AiCoachScreen() {
    const { colors } = useTheme();
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
        if (adjustedPlan.length === 0) return;

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
            <View className="border-b border-border bg-background/95 px-4 pb-3 pt-[60px]">
                <View className="flex-row items-center gap-3">
                    <View className="h-[42px] w-[42px] items-center justify-center rounded-full bg-accent/10">
                        <Sparkles size={20} color={colors.green} />
                    </View>
                    <View className="flex-1">
                        <Text variant="heading">AI 教练</Text>
                        <Text variant="caption" className="mt-0.5 font-bold">今天练什么</Text>
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
                <Card>
                    <Text variant="caption" className="text-[11px] font-extrabold tracking-[1.2px] text-accent">今日状态</Text>
                    <Text variant="subheading" className="mt-2">先选一下今天的状态</Text>

                    <View className="mt-4 gap-3">
                        <FilterRow
                            title="精力"
                            icon={<Flame size={14} color={colors.orange} />}
                            value={checkIn.energy}
                            options={[{ key: "high", label: "很好" }, { key: "medium", label: "一般" }, { key: "low", label: "疲劳" }]}
                            onChange={(value) => setCheckIn((prev) => ({ ...prev, energy: value as EnergyOption }))}
                        />
                        <FilterRow
                            title="时长"
                            icon={<Clock3 size={14} color={colors.green} />}
                            value={checkIn.duration}
                            options={[{ key: "20", label: "20m" }, { key: "40", label: "40m" }, { key: "60", label: "60m+" }]}
                            onChange={(value) => setCheckIn((prev) => ({ ...prev, duration: value as DurationOption }))}
                        />
                        <FilterRow
                            title="地点"
                            icon={<MapPin size={14} color={colors.red} />}
                            value={checkIn.location}
                            options={[{ key: "gym", label: "健身房" }, { key: "home", label: "家里" }]}
                            onChange={(value) => setCheckIn((prev) => ({ ...prev, location: value as LocationOption }))}
                        />
                    </View>

                    <Button onPress={handleGenerateReport} disabled={isLoading} className="mt-4 bg-accent py-3.5">
                        {isLoading ? <ActivityIndicator size="small" color={colors.bg} /> : <Sparkles size={16} color={colors.bg} strokeWidth={2.6} />}
                        <ButtonText className="text-[15px] text-accent-foreground">{isLoading ? "正在生成建议..." : "生成今日建议"}</ButtonText>
                    </Button>
                </Card>

                <Card>
                    <Text variant="caption" className="text-[11px] font-extrabold tracking-[1.2px] text-accent">AI 建议</Text>
                    <View className="mt-2 flex-row items-center justify-between gap-3">
                        <Text variant="subheading" className="flex-1">今天的建议</Text>
                        <View className="rounded-full bg-accent/10 px-2.5 py-1.5">
                            <Text className="text-xs font-black text-primary">{reportData?.intensityScore ?? 0} / 100</Text>
                        </View>
                    </View>

                    <View className="mt-3.5 rounded-[14px] bg-muted/50 p-3.5">
                        <Text className="text-base font-extrabold">{coachLine}</Text>
                        <Text variant="muted" className="mt-2 leading-[22px]">
                            {reportData?.overallEvaluation || "生成建议后，这里会显示 AI 对你今天训练的判断。"}
                        </Text>
                    </View>
                </Card>

                <Card>
                    <Text variant="caption" className="text-[11px] font-extrabold tracking-[1.2px] text-accent">今日计划</Text>
                    <Text variant="subheading" className="mt-2">今天的训练计划</Text>

                    {adjustedPlan.length === 0 ? (
                        <View className="mt-3.5 rounded-[14px] bg-muted/40 p-4">
                            <Text variant="muted" className="leading-[22px]">先生成建议，这里会给你 2 到 3 个今天该做的训练项。</Text>
                        </View>
                    ) : (
                        <View className="mt-3.5 gap-2.5">
                            {adjustedPlan.map((plan, index) => (
                                <Card key={`${plan.name}-${index}`} className="rounded-[14px] bg-card/60 p-3.5">
                                    <View className="flex-row items-center justify-between gap-2.5">
                                        <View className="flex-1">
                                            <Text className="text-base font-extrabold">{plan.name}</Text>
                                            <Text variant="caption" className="mt-1 font-bold">{getPlanTypeLabel(plan.type)}</Text>
                                        </View>
                                        <Text className="text-xs font-black text-accent">{plan.sets || plan.stats || "自定义"}</Text>
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
                            className={`flex-1 py-3 ${useLiteMode ? "border-accent bg-accent/10" : "border-border bg-muted/40"}`}
                        >
                            <ButtonText variant="outline" className={`text-[13px] ${useLiteMode ? "text-accent" : "text-foreground"}`}>{useLiteMode ? "已切到轻松版" : "换个更轻松的"}</ButtonText>
                        </Button>

                        <Button onPress={handleApplyTodaysPlan} disabled={isApplying || adjustedPlan.length === 0} className="flex-1 bg-accent py-3">
                            {isApplying ? <ActivityIndicator size="small" color={colors.bg} /> : <Plus size={16} color={colors.bg} strokeWidth={2.6} />}
                            <ButtonText className="text-[13px] text-accent-foreground">应用到今日训练</ButtonText>
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
                <Text className="text-[13px] font-extrabold">{title}</Text>
            </View>
            <ToggleGroup value={value} onValueChange={onChange}>
                {options.map((option) => {
                    const active = option.key === value;
                    return (
                        <ToggleGroupItem
                            key={option.key}
                            value={option.key}
                            activeClassName="border-success bg-success/10"
                            inactiveClassName="border-border bg-muted/40"
                        >
                            <Text className={active ? "text-xs font-black text-success" : "text-xs font-black text-foreground"}>{option.label}</Text>
                        </ToggleGroupItem>
                    );
                })}
            </ToggleGroup>
        </View>
    );
}
