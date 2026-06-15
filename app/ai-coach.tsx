import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { desc } from "drizzle-orm";
import * as SplashScreen from "expo-splash-screen";

import { db } from "@/db/client";
import { bodyMetrics, workouts } from "@/db/schema";
import { generateTrainingReportWithAI, type AiReportData } from "@/db/services/ai";
import { getUserProfile } from "@/db/services/profile";
import * as workoutService from "@/db/services/workout";
import { AiCoachHeader } from "@/components/ai-coach/AiCoachHeader";
import { CoachInsightCard } from "@/components/ai-coach/CoachInsightCard";
import { CoachPlanSection } from "@/components/ai-coach/CoachPlanSection";

type CoachContextData = {
    recentWorkouts: { name: string; weight: string | null; sets: string | null; stats: string | null; createdAt: string }[];
    recentMetrics: { metricType: string; dateStr: string; value: number }[];
    presets: { name: string; tag: string | null }[];
};

function getTodayDateStr() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getCoachLine(score: number) {
    if (score >= 80) return "状态在线，今天可以稳步推进";
    if (score >= 60) return "状态稳定，按计划完成即可";
    return "控制强度，优先保证动作质量";
}

export default function AiCoachScreen() {
    const insets = useSafeAreaInsets();
    const mountedRef = useRef(true);
    const contextSeqRef = useRef(0);
    const reportSeqRef = useRef(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reportData, setReportData] = useState<AiReportData | null>(null);
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

    const todaysPlan = reportData?.todaysPlan ?? [];
    const coachLine = getCoachLine(reportData?.intensityScore ?? 50);

    const handleGenerateReport = async () => {
        if (isLoading || !aiConfig.configured) return;
        setError(null);
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
        if (isApplying || todaysPlan.length === 0) return;
        setIsApplying(true);
        try {
            await workoutService.addWorkouts(todaysPlan.map((item) => ({ type: item.type, name: item.name, sets: item.sets, stats: item.stats })), getTodayDateStr());
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
                <CoachInsightCard
                    report={reportData}
                    coachLine={coachLine}
                    isLoading={isLoading}
                    isConfigured={aiConfig.configured}
                    configLabel={aiConfig.label}
                    error={error}
                    onGenerate={handleGenerateReport}
                    onOpenSettings={() => router.push("/settings")}
                />
                <CoachPlanSection
                    plan={todaysPlan}
                    isApplying={isApplying}
                    onApply={handleApplyTodaysPlan}
                />
            </ScrollView>
        </View>
    );
}
