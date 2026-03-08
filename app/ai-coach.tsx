import { useState, useRef, useCallback } from "react";
import {
    View, Text, ScrollView, Pressable, ActivityIndicator, Alert,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { Sparkles, AlertCircle, FileText, Activity, Zap, ShieldCheck, Plus } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { generateTrainingReportWithAI, type AiReportData } from "@/db/services/ai";
import { addWorkout, getStrengthPresets } from "@/db/services/workout";
import { db } from "@/db/client";
import { workouts, bodyMetrics } from "@/db/schema";
import { desc } from "drizzle-orm";
import * as SplashScreen from "expo-splash-screen";

export default function AiCoachScreen() {
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reportData, setReportData] = useState<AiReportData | null>(null);

    // Preload context data for AI
    const [contextData, setContextData] = useState<{
        recentWorkouts: any[];
        recentMetrics: any[];
        presets: any[];
    }>({ recentWorkouts: [], recentMetrics: [], presets: [] });

    useFocusEffect(useCallback(() => {
        // Load recent workouts and metrics for AI context
        Promise.all([
            // Extend to 20 for a better week overview
            db.select().from(workouts).orderBy(desc(workouts.createdAt)).limit(20),
            db.select().from(bodyMetrics).orderBy(desc(bodyMetrics.dateStr)).limit(5),
            getStrengthPresets()
        ]).then(([ws, ms, ps]) => {
            setContextData({
                recentWorkouts: ws.map(w => ({
                    name: w.name,
                    weight: w.weight,
                    sets: w.sets,
                    stats: w.stats,
                    createdAt: new Date(w.createdAt).toISOString(),
                })),
                recentMetrics: ms.map(m => ({
                    metricType: m.metricType,
                    dateStr: m.dateStr,
                    value: m.value,
                })),
                presets: ps
            });
            SplashScreen.hideAsync().catch(() => { });
        });
    }, []));

    const handleGenerateReport = async () => {
        if (isLoading) return;
        setError(null);
        setIsLoading(true);
        try {
            const data = await generateTrainingReportWithAI(
                contextData.recentWorkouts,
                contextData.recentMetrics,
                contextData.presets
            );
            setReportData(data);
        } catch (e: any) {
            setError(e.message || "请求 AI 时发生错误");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyTodaysPlan = async () => {
        if (!reportData?.todaysPlan || reportData.todaysPlan.length === 0) return;
        setIsApplying(true);
        try {
            const todayStr = new Date().toISOString().split("T")[0]; // Use current local date conceptually
            
            for (const item of reportData.todaysPlan) {
                await addWorkout({
                    type: item.type,
                    name: item.name,
                    sets: item.sets,
                    stats: item.stats,
                });
            }
            Alert.alert("✅ 成功", "计划已成功加入今日运动列表！", [
                { text: "去看看", onPress: () => router.push("/") }
            ]);
        } catch (e: any) {
            Alert.alert("❌ 失败", e.message || "添加计划失败");
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
            {/* ── Header ── */}
            <View style={{ paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: `${colors.bg}CC`, borderBottomWidth: 0.5, borderBottomColor: colors.border }}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <View style={{ backgroundColor: `${colors.green}22` }} className="w-10 h-10 rounded-full items-center justify-center">
                            <Sparkles size={20} color={colors.green} />
                        </View>
                        <View>
                            <Text style={{ color: colors.white }} className="text-2xl font-black leading-none">AI 教练</Text>
                            <Text style={{ color: colors.gray4, opacity: 0.8 }} className="text-[10px] font-bold tracking-widest mt-1 uppercase">
                                AI Report
                            </Text>
                        </View>
                    </View>
                    <Pressable
                        onPress={handleGenerateReport}
                        disabled={isLoading}
                        style={{ 
                            backgroundColor: colors.green, 
                            opacity: isLoading ? 0.5 : 1,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 12,
                        }}
                        className="flex-row items-center gap-1.5"
                    >
                        {isLoading ? <ActivityIndicator size="small" color={colors.bg} /> : <FileText size={15} color={colors.bg} strokeWidth={2.5} />}
                        <Text style={{ color: colors.bg, fontSize: 13, fontWeight: "700" }}>生成报告</Text>
                    </Pressable>
                </View>
            </View>

            {/* ── Content Area ── */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {isLoading && !reportData ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color={colors.green} />
                        <Text style={{ color: colors.gray4 }} className="text-sm font-bold mt-4">AI 正在深度分析你的数据...</Text>
                    </View>
                ) : !reportData ? (
                    <View className="flex-1 items-center justify-center py-20" style={{ opacity: 0.8 }}>
                        <View style={{
                            backgroundColor: colors.bento,
                            borderColor: colors.border,
                            borderWidth: 1,
                            borderRadius: 16,
                            alignItems: "center",
                            paddingVertical: 32,
                            paddingHorizontal: 20,
                            width: "100%",
                        }}>
                            <Sparkles size={48} color={colors.gray4} />
                            <View className="items-center mt-4">
                                <Text style={{ color: colors.gray3 }} className="font-bold text-sm">还没有今日的 AI 训练报告</Text>
                                <Text style={{ color: colors.gray4, textAlign: "center" }} className="text-xs mt-2 leading-relaxed">
                                    我会基于你最近一周的运动记录和身体指标数据，为你深度进行一次综合评估，并生成今日训练计划。
                                </Text>
                            </View>
                            <Pressable
                                onPress={handleGenerateReport}
                                style={{ backgroundColor: `${colors.green}1A`, borderColor: `${colors.green}33`, borderWidth: 1 }}
                                className="flex-row items-center gap-2 mt-6 px-4 py-2 rounded-xl"
                            >
                                <FileText size={16} color={colors.green} />
                                <Text style={{ color: colors.green }} className="text-sm font-bold">点击生成今日报告</Text>
                            </Pressable>
                        </View>
                        {error && (
                            <View className="mt-4 w-full">
                                <View style={{ backgroundColor: `${colors.red}1A`, borderColor: `${colors.red}33`, borderWidth: 1 }}
                                    className="flex-row items-center gap-2 px-4 py-3 rounded-lg">
                                    <AlertCircle size={16} color={colors.red} />
                                    <Text style={{ color: colors.red, flex: 1 }} className="text-xs font-bold">{error}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                ) : (
                    <View className="gap-4">
                        {/* Overall Evaluation */}
                        <View style={{
                            backgroundColor: colors.bento, borderColor: colors.border, borderWidth: 1, borderRadius: 16, overflow: "hidden"
                        }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                <Activity size={14} color={colors.orange} />
                                <Text style={{ color: colors.orange, fontSize: 11, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase", flex: 1 }}>综合评估</Text>
                                <View style={{ backgroundColor: `${colors.orange}1A`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                    <Text style={{ color: colors.orange, fontSize: 10, fontWeight: "800" }}>{reportData.intensityScore} / 100 分</Text>
                                </View>
                            </View>
                            <View style={{ padding: 16 }}>
                                <Text style={{ color: colors.white, fontSize: 14, lineHeight: 22, fontWeight: "500" }}>
                                    {reportData.overallEvaluation}
                                </Text>
                            </View>
                        </View>

                        {/* Movement Suggestions */}
                        {(reportData.movementSuggestions && reportData.movementSuggestions.length > 0) && (
                            <View style={{
                                backgroundColor: colors.bento, borderColor: colors.border, borderWidth: 1, borderRadius: 16, overflow: "hidden"
                            }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                    <ShieldCheck size={14} color={colors.gray4} />
                                    <Text style={{ color: colors.gray4, fontSize: 11, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase" }}>动作与细节建议</Text>
                                </View>
                                <View style={{ paddingVertical: 8 }}>
                                    {reportData.movementSuggestions.map((suggestion, idx) => (
                                        <View key={idx} style={{ flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 8 }}>
                                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gray4, marginTop: 8 }} />
                                            <Text style={{ color: colors.white, fontSize: 14, lineHeight: 22, fontWeight: "500", flex: 1 }}>
                                                {suggestion}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Recovery Plan */}
                        <View style={{
                            backgroundColor: colors.bento, borderColor: colors.border, borderWidth: 1, borderRadius: 16, overflow: "hidden"
                        }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                <Zap size={14} color={colors.gray4} />
                                <Text style={{ color: colors.gray4, fontSize: 11, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase" }}>恢复与饮食</Text>
                            </View>
                            <View style={{ padding: 16 }}>
                                <Text style={{ color: colors.white, fontSize: 14, lineHeight: 22, fontWeight: "500" }}>
                                    {reportData.recoveryPlan}
                                </Text>
                            </View>
                        </View>

                        {/* Today's Plan */}
                        {(reportData.todaysPlan && reportData.todaysPlan.length > 0) && (
                            <View style={{
                                backgroundColor: colors.bento, borderColor: colors.border, borderWidth: 1, borderRadius: 16, overflow: "hidden"
                            }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                    <Sparkles size={14} color={colors.green} />
                                    <Text style={{ color: colors.green, fontSize: 11, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase", flex: 1 }}>今日定制计划</Text>
                                </View>
                                
                                <View style={{ paddingVertical: 4 }}>
                                    {reportData.todaysPlan.map((plan, idx) => (
                                        <View key={idx} style={{ 
                                            flexDirection: "row", alignItems: "center", justifyContent: "space-between", 
                                            paddingHorizontal: 16, paddingVertical: 12,
                                            borderBottomWidth: idx === reportData.todaysPlan.length - 1 ? 0 : 1,
                                            borderBottomColor: colors.border
                                        }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ color: colors.white, fontSize: 15, fontWeight: "700" }}>{plan.name}</Text>
                                                <Text style={{ color: colors.gray4, fontSize: 12, fontWeight: "600", marginTop: 2 }}>
                                                    {plan.type === "strength" ? "抗阻训练" : "有氧训练"}
                                                </Text>
                                            </View>
                                            <View style={{ backgroundColor: `${colors.gray3}33`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                                                <Text style={{ color: colors.green, fontSize: 12, fontWeight: "800" }}>
                                                    {plan.sets || plan.stats || "自定"}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Apply Button */}
                                <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: `${colors.bg}66` }}>
                                    <Pressable
                                        onPress={handleApplyTodaysPlan}
                                        disabled={isApplying}
                                        style={{ 
                                            backgroundColor: colors.green, 
                                            paddingVertical: 12, borderRadius: 12, 
                                            flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
                                            opacity: isApplying ? 0.5 : 1
                                        }}
                                    >
                                        {isApplying ? (
                                            <ActivityIndicator size="small" color={colors.bg} />
                                        ) : (
                                            <Plus size={16} color={colors.bg} strokeWidth={2.5} />
                                        )}
                                        <Text style={{ color: colors.bg, fontSize: 14, fontWeight: "800" }}>
                                            一键应用到今日运动
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                        
                        {error && (
                            <View style={{ backgroundColor: `${colors.red}1A`, borderColor: `${colors.red}33`, borderWidth: 1, padding: 12, borderRadius: 12 }}>
                                <Text style={{ color: colors.red, fontSize: 12, fontWeight: "bold" }}>{error}</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
