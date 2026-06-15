import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlertCircle } from "lucide-react-native";
import { desc } from "drizzle-orm";
import * as SplashScreen from "expo-splash-screen";

import { db } from "@/db/client";
import { bodyMetrics, workouts } from "@/db/schema";
import { generateTrainingReportWithAI, type AiReportData } from "@/db/services/ai";
import { getUserProfile } from "@/db/services/profile";
import * as workoutService from "@/db/services/workout";
import { useTheme } from "@/hooks/useTheme";
import { AiCoachHeader } from "@/components/ai-coach/AiCoachHeader";
import { CoachCheckInCard, type CheckInState, type EnergyOption } from "@/components/ai-coach/CoachCheckInCard";
import { CoachInsightCard } from "@/components/ai-coach/CoachInsightCard";
import { CoachPlanSection } from "@/components/ai-coach/CoachPlanSection";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

type CoachContextData = {
    recentWorkouts: { name: string; weight: string | null; sets: string | null; stats: string | null; createdAt: string }[];
    recentMetrics: { metricType: string; dateStr: string; value: number }[];
    presets: { name: string; tag: string | null }[];
};

const INITIAL_CHECK_IN: CheckInState = { energy: "medium", duration: "40", location: "gym" };

function getTodayDateStr() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getCoachLine(score: number, energy: EnergyOption) {
    if (energy === "low") return "今天以轻量训练为主";
    if (score >= 75 && energy === "high") return "状态不错，可以完整推进";
    return "保持节奏，按计划完成";
}

function getAdjustedPlan(report: AiReportData | null, checkIn: CheckInState, useLiteMode: boolean) {
    if (!report) return [];
    let plan = [...report.todaysPlan];

    if (checkIn.duration === "20" || useLiteMode) {
        plan = plan.slice(0, Math.min(2, plan.length)).map((item) => ({
            ...item,
            sets: item.sets ? `${item.sets} · 轻松版` : item.sets,
            stats: item.stats ? `${item.stats} · 轻松版` : item.stats,
        }));
    }
    if (checkIn.location === "home") {
        plan = plan.map((item) => ({ ...item, stats: item.type === "cardio" ? item.stats || "15-20 分钟" : item.stats }));
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
    const [aiConfig, setAiConfig] = useState<{ configured: boolean; label: string | null }>({ configured: false, label: null });
    const [contextData, setContextData] = useState<CoachContextData>({ recentWorkouts: [], recentMetrics: [], presets: [] });

    useEffect(() => () => {
        mountedRef.current = false;
        contextSeqRef.current += 1;
        reportSeqRef.current += 1;
    }, []);

    useFocusEffect(useCallback(() => {
        const requestId = ++contextSeqRef.current;
        Promise.all([
            db.select().from(workouts).orderBy(desc(workouts.createdAt)).limit(20),
            db.select().from(bodyMetrics).orderBy(desc(bodyMetrics.dateStr)).limit(5),
            workoutService.getStrengthPresets(),
            getUserProfile(),
        ]).then(([workoutRows, metricRows, presetRows, profile]) => {
            if (!mountedRef.current || requestId !== contextSeqRef.current) return;
            const activeConfig = profile.aiConfigs.find((config) => config.id === profile.activeAiConfigId) ?? profile.aiConfigs[0];
            setAiConfig({
                configured: Boolean(activeConfig?.apiKey?.trim()),
                label: activeConfig ? activeConfig.model || activeConfig.name : null,
            });
            setContextData({
                recentWorkouts: workoutRows.map((item) => ({
                    name: item.name, weight: item.weight, sets: item.sets, stats: item.stats,
                    createdAt: new Date(item.createdAt).toISOString(),
                })),
                recentMetrics: metricRows.map((item) => ({ metricType: item.metricType, dateStr: item.dateStr, value: item.value })),
                presets: presetRows,
            });
        }).catch(console.error).finally(() => {
            if (mountedRef.current && requestId === contextSeqRef.current) SplashScreen.hideAsync().catch(() => {});
        });
        return () => { contextSeqRef.current += 1; };
    }, []));

    const adjustedPlan = useMemo(() => getAdjustedPlan(reportData, checkIn, useLiteMode), [checkIn, reportData, useLiteMode]);
    const coachLine = useMemo(() => getCoachLine(reportData?.intensityScore ?? 50, checkIn.energy), [checkIn.energy, reportData?.intensityScore]);

    const handleGenerateReport = async () => {
        if (isLoading || !aiConfig.configured) return;
        setError(null);
        setUseLiteMode(false);
        setIsLoading(true);
        const requestId = ++reportSeqRef.current;
        try {
            const data = await generateTrainingReportWithAI(contextData.recentWorkouts, contextData.recentMetrics, contextData.presets);
            if (mountedRef.current && requestId === reportSeqRef.current) setReportData(data);
        } catch (cause: any) {
            if (mountedRef.current && requestId === reportSeqRef.current) setError(cause.message || "生成 AI 建议失败，请稍后再试。");
        } finally {
            if (mountedRef.current && requestId === reportSeqRef.current) setIsLoading(false);
        }
    };

    const handleApplyTodaysPlan = async () => {
        if (isApplying || adjustedPlan.length === 0) return;
        setIsApplying(true);
        try {
            await workoutService.addWorkouts(adjustedPlan.map((item) => ({ type: item.type, name: item.name, sets: item.sets, stats: item.stats })), getTodayDateStr());
            if (!mountedRef.current) return;
            Alert.alert("已加入今日训练", "计划已经准备好，可以回首页开始记录。", [
                { text: "去首页", onPress: () => router.push("/") },
                { text: "留在这里", style: "cancel" },
            ]);
        } catch (cause: any) {
            if (mountedRef.current) Alert.alert("应用失败", cause.message || "添加计划失败，请稍后再试。");
        } finally {
            if (mountedRef.current) setIsApplying(false);
        }
    };

    return (
        <View className="flex-1 bg-transparent">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 100 + Math.max(insets.bottom - 20, 0), gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <AiCoachHeader />
                <CoachCheckInCard
                    value={checkIn}
                    isLoading={isLoading}
                    isConfigured={aiConfig.configured}
                    configLabel={aiConfig.label}
                    onChange={setCheckIn}
                    onGenerate={handleGenerateReport}
                    onOpenSettings={() => router.push("/settings")}
                />
                {error && (
                    <Card className="flex-row items-start gap-3 border-destructive/20 bg-destructive/10 p-card-padding">
                        <AlertCircle size={18} color={colors.red} className="mt-0.5" />
                        <View className="min-w-0 flex-1 gap-1">
                            <Text variant="body-semibold" className="text-destructive">生成失败</Text>
                            <Text variant="caption" className="text-destructive">{error}</Text>
                        </View>
                    </Card>
                )}
                <CoachInsightCard report={reportData} coachLine={coachLine} />
                <CoachPlanSection
                    report={reportData}
                    plan={adjustedPlan}
                    useLiteMode={useLiteMode}
                    isApplying={isApplying}
                    onToggleLite={() => setUseLiteMode((current) => !current)}
                    onApply={handleApplyTodaysPlan}
                />
            </ScrollView>
        </View>
    );
}
