import { useState, useCallback } from "react";
import {
    View, Text, ScrollView, Pressable, Modal,
    TextInput, Alert, Platform,
} from "react-native";
import { useFocusEffect } from "expo-router";
import Svg, { Polyline, Path, Defs, LinearGradient, Stop } from "react-native-svg";
import {
    Flame, Activity, Dumbbell, Calendar, TrendingUp, TrendingDown,
    Scale, BarChart2, Target, History, Save, X, ChevronLeft, ChevronRight,
} from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import {
    getDashboardData, addBodyMetric,
    type BodyMetricPoint, type BodyMetricType,
} from "@/db/services/dashboard";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export default function DashboardScreen() {
    const { colors } = useTheme();
    const todayNum = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const [selectedDay, setSelectedDay] = useState(todayNum);
    const [calendarExpanded, setCalendarExpanded] = useState(false);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedMetric, setExpandedMetric] = useState<"weight" | "bodyFat" | null>(null);
    const [metricFormValue, setMetricFormValue] = useState({ weight: "", bodyFat: "" });
    const [metricFormDate, setMetricFormDate] = useState({
        weight: new Date().toISOString().slice(0, 10),
        bodyFat: new Date().toISOString().slice(0, 10),
    });
    const [savingMetric, setSavingMetric] = useState<"weight" | "bodyFat" | null>(null);
    const [metricError, setMetricError] = useState<string | null>(null);
    const [metricCalendarDate, setMetricCalendarDate] = useState(new Date());

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getDashboardData(currentYear, currentMonth);
            setData(res);
        } finally {
            setLoading(false);
        }
    }, [currentYear, currentMonth]);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    const formatDaysAgo = (days: number | null | undefined) => {
        if (days === null || days === undefined) return "暂无记录";
        if (days === 0) return "今天";
        if (days === 1) return "1天前";
        return `${days}天前`;
    };

    const buildSparklinePoints = (values: number[]) => {
        if (!values || values.length === 0) return "0,15 100,15";
        if (values.length === 1) return "0,15 100,15";
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        return values.map((v, i) => {
            const x = (i / (values.length - 1)) * 100;
            const y = 24 - ((v - min) / range) * 16;
            return `${x},${y}`;
        }).join(" ");
    };

    const handleSaveMetric = async (metricType: "weight" | "bodyFat") => {
        setMetricError(null);
        const raw = metricFormValue[metricType].trim();
        const value = Number(raw);
        if (!Number.isFinite(value) || value <= 0) {
            setMetricError("请输入有效的数值");
            return;
        }
        try {
            setSavingMetric(metricType);
            await addBodyMetric({ metricType, value, dateStr: metricFormDate[metricType] });
            setMetricFormValue(prev => ({ ...prev, [metricType]: "" }));
            await loadData();
        } catch {
            setMetricError("保存失败，请重试");
        } finally {
            setSavingMetric(null);
        }
    };

    // ─── Calendar helpers ──────────────────────────────────────────────────────
    const startDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
    const selectedDayIndex = startDay + selectedDay - 1;
    const selectedWeekRow = Math.floor(selectedDayIndex / 7);

    return (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 100, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ── */}
                <View className="flex-row items-end justify-between pt-2 px-1">
                    <View>
                        <Text style={{ color: colors.white }} className="text-2xl font-black leading-none">数据看板</Text>
                        <Text style={{ color: colors.gray4, opacity: 0.6 }} className="text-xs font-bold tracking-widest mt-1.5 uppercase">
                            Performance Insights
                        </Text>
                    </View>
                    <View style={{ backgroundColor: colors.border, borderColor: colors.border, borderWidth: 1 }}
                        className="px-2 py-1 rounded-lg flex-row items-center gap-1.5">
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green }} />
                        <Text style={{ color: colors.gray4 }} className="text-xs font-bold">LIVE DATA</Text>
                    </View>
                </View>

                {/* ── Training Overview ── */}
                <View style={{ backgroundColor: colors.bento, borderColor: colors.border, borderWidth: 1, padding: 14 }} className="rounded-bento-lg gap-3">
                    <View className="flex-row items-center justify-between px-0.5">
                        <View className="flex-row items-center gap-1.5">
                            <BarChart2 size={16} color={colors.green} />
                            <Text style={{ color: colors.white, opacity: 0.9 }} className="font-bold text-xs tracking-wide">训练表现</Text>
                        </View>
                        <Text style={{ color: colors.gray4 }} className="text-xs italic">Weekly Focus</Text>
                    </View>

                    {/* Stats Bar */}
                    <View style={{ flexDirection: "row", backgroundColor: colors.gray2, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }} className="rounded-bento-sm">
                        {[
                            { label: "连续打卡", value: loading ? "-" : String(data?.streak || 0), unit: "天", icon: <Flame size={14} color={colors.orange} />, color: colors.orange },
                            { label: "本周训练", value: loading ? "-" : String(data?.workoutsThisWeek || 0), unit: "次", icon: <Activity size={14} color={colors.green} />, color: colors.green },
                            { label: "月容量", value: loading ? "-" : String(data?.monthlyVolumeTon || "0"), unit: "t", icon: <Dumbbell size={14} color={colors.green} />, color: colors.green },
                        ].map((item, i) => (
                            <View key={i} style={{ flex: 1, paddingVertical: 16, alignItems: "center", borderLeftWidth: i > 0 ? 1 : 0, borderColor: colors.border }}>
                                <View className="flex-row items-center gap-1 mb-1.5">
                                    {item.icon}
                                    <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-tight opacity-80">{item.label}</Text>
                                </View>
                                <View className="flex-row items-baseline gap-0.5">
                                    <Text style={{ color: colors.white }} className="text-2xl font-black leading-none">{item.value}</Text>
                                    <Text style={{ color: colors.gray4 }} className="text-sm font-bold">{item.unit}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 14 }} />

                    {/* Calendar */}
                    <View className="gap-3 px-0.5">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-1.5">
                                <Calendar size={16} color={colors.green} />
                                <Text style={{ color: colors.white, opacity: 0.9 }} className="font-semibold text-xs tracking-wide">
                                    {currentMonth + 1}月 {currentYear}
                                </Text>
                            </View>
                            <Pressable onPress={() => setCalendarExpanded(!calendarExpanded)}>
                                <Text style={{ color: colors.green }} className="text-xs font-bold">
                                    {calendarExpanded ? "收起" : "展开"}
                                </Text>
                            </Pressable>
                        </View>

                        {/* Day headers */}
                        <View style={{ flexDirection: "row" }}>
                            {["日", "一", "二", "三", "四", "五", "六"].map(d => (
                                <View key={d} style={{ flex: 1, alignItems: "center" }}>
                                    <Text style={{ color: colors.gray4, fontSize: 10 }}>{d}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Days */}
                        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                            {Array.from({ length: totalCells }).map((_, i) => {
                                const currentRow = Math.floor(i / 7);
                                if (!calendarExpanded && currentRow !== selectedWeekRow) return null;
                                const isPadding = i < startDay || i >= startDay + daysInMonth;
                                const dayNum = i - startDay + 1;
                                const isWorkout = data?.dailyData?.[dayNum]?.isWorkout;
                                const isSelected = dayNum === selectedDay;

                                return (
                                    <View key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}>
                                        {!isPadding && (
                                            <Pressable
                                                onPress={() => setSelectedDay(dayNum)}
                                                style={{
                                                    flex: 1,
                                                    borderRadius: 999,
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    backgroundColor: isSelected ? colors.green
                                                        : isWorkout ? `${colors.green}1A` : "transparent",
                                                    transform: [{ scale: isSelected ? 1.1 : 1 }],
                                                }}
                                            >
                                                <Text style={{
                                                    fontSize: 12,
                                                    fontWeight: "600",
                                                    color: isSelected ? colors.white
                                                        : isWorkout ? colors.green : colors.white,
                                                    opacity: isSelected ? 1 : 0.9,
                                                }}>
                                                    {dayNum}
                                                </Text>
                                            </Pressable>
                                        )}
                                    </View>
                                );
                            })}
                        </View>

                        {/* Daily Detail */}
                        <View className="pt-2 gap-2">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-1.5">
                                    <History size={14} color={colors.green} style={{ opacity: 0.8 }} />
                                    <Text style={{ color: colors.white, opacity: 0.9 }} className="text-xs font-bold">
                                        {currentMonth + 1}月{selectedDay}日
                                    </Text>
                                    <View style={{ backgroundColor: colors.border }} className="px-1.5 py-0.5 rounded">
                                        <Text style={{ color: colors.gray4 }} className="text-xs font-medium tracking-wide">
                                            {selectedDay === todayNum ? "今天" : (data?.dailyData?.[selectedDay]?.isWorkout ? "训练日" : "休息")}
                                        </Text>
                                    </View>
                                </View>
                                {data?.dailyData?.[selectedDay]?.isWorkout && (
                                    <View className="flex-row items-baseline gap-0.5">
                                        <Text style={{ color: colors.green }} className="font-black text-sm tracking-tight">
                                            {(data.dailyData[selectedDay].volume / 1000).toFixed(1)}
                                        </Text>
                                        <Text style={{ color: colors.green }} className="text-xs font-bold">t</Text>
                                    </View>
                                )}
                            </View>
                            {data?.dailyData?.[selectedDay]?.isWorkout ? (
                                <View style={{ backgroundColor: colors.gray3, borderColor: colors.border, borderWidth: 1 }}
                                    className="rounded-xl px-3 py-2.5 flex-row items-center justify-between gap-3">
                                    <Text style={{ color: colors.white }} className="flex-1 text-sm font-medium" numberOfLines={1}>
                                        {data.dailyData[selectedDay].workouts.map(w => w.name).join(" • ")}
                                    </Text>
                                    <Text style={{ color: colors.gray4 }} className="text-xs font-medium whitespace-nowrap">
                                        {data.dailyData[selectedDay].workouts.length} 项 • ~{data.dailyData[selectedDay].duration} min
                                    </Text>
                                </View>
                            ) : (
                                <Text style={{ color: colors.gray4 }} className="text-xs font-medium italic pt-1">休息，是为了更好的开始 💤</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* ── Body Metrics ── */}
                <View style={{ backgroundColor: colors.bento, borderColor: colors.border, borderWidth: 1, padding: 14 }} className="rounded-bento-lg gap-3">
                    <View className="flex-row items-center px-0.5">
                        <Scale size={16} color={colors.red} />
                        <Text style={{ color: colors.white, opacity: 0.9 }} className="font-bold text-xs tracking-wide ml-1.5">身体指标</Text>
                    </View>

                    <View className="flex-row gap-bento">
                        {(["weight", "bodyFat"] as const).map((metricType) => {
                            const metric = data?.bodyMetrics?.[metricType];
                            const isExpanded = expandedMetric === metricType;
                            const delta = metric?.deltaFromPrevious;
                            const isDecrease = (delta ?? 0) <= 0;
                            const sparkPoints = buildSparklinePoints(metric?.recentPoints || []);

                            return (
                                <Pressable
                                    key={metricType}
                                    onPress={() => setExpandedMetric(prev => prev === metricType ? null : metricType)}
                                    style={{
                                        flex: 1,
                                        backgroundColor: colors.gray3,
                                        padding: 12,
                                        borderWidth: 1,
                                        borderColor: isExpanded ? `${colors.red}80` : colors.border,
                                        minHeight: 80,
                                    }}
                                    className="rounded-bento-sm"
                                >
                                    <View className="flex-row justify-between items-center mb-1">
                                        <Text style={{ color: colors.white, opacity: 0.9 }} className="font-semibold text-xs">
                                            {metricType === "weight" ? "体重" : "体脂率"}
                                        </Text>
                                        <View style={{ backgroundColor: colors.border }} className="px-2 py-0.5 rounded-md">
                                            <Text style={{ color: colors.gray4 }} className="text-xs">
                                                {formatDaysAgo(data?.bodyMetricDaysAgo?.[metricType])}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row justify-between items-end mb-2">
                                        <View className="flex-row items-baseline gap-0.5 mt-0.5">
                                            <Text style={{ color: colors.white }} className="text-2xl font-bold tracking-tight">
                                                {loading ? "-" : (metric?.latestValue ?? "-")}
                                            </Text>
                                            <Text style={{ color: colors.gray4 }} className="text-xs mb-0.5">
                                                {metricType === "weight" ? "kg" : "%"}
                                            </Text>
                                        </View>
                                        <View style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 2,
                                            padding: 4,
                                            paddingHorizontal: 6,
                                            borderRadius: 4,
                                            backgroundColor: delta === null || delta === undefined
                                                ? colors.border
                                                : isDecrease ? `${colors.green}1A` : `${colors.orange}1A`,
                                        }}>
                                            {isDecrease
                                                ? <TrendingDown size={12} color={delta === null ? colors.gray4 : colors.green} />
                                                : <TrendingUp size={12} color={colors.orange} />
                                            }
                                            <Text style={{
                                                fontSize: 11, fontWeight: "700",
                                                color: delta === null || delta === undefined ? colors.gray4
                                                    : isDecrease ? colors.green : colors.orange,
                                            }}>
                                                {delta === null || delta === undefined
                                                    ? "--"
                                                    : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Sparkline */}
                                    <View style={{ height: 32, opacity: 0.6 }}>
                                        <Svg viewBox="0 0 100 30" style={{ width: "100%", height: "100%" }} preserveAspectRatio="none">
                                            <Defs>
                                                <LinearGradient id={`grad${metricType}`} x1="0" y1="0" x2="0" y2="1">
                                                    <Stop offset="0%" stopColor={colors.green} stopOpacity="0.4" />
                                                    <Stop offset="100%" stopColor={colors.green} stopOpacity="0" />
                                                </LinearGradient>
                                            </Defs>
                                            <Polyline
                                                points={sparkPoints}
                                                fill="none"
                                                stroke={colors.green}
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </Svg>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* ── Exercise Analytics ── */}
                <View style={{ backgroundColor: colors.bento, borderColor: colors.border, borderWidth: 1, padding: 14 }} className="rounded-bento-lg gap-3">
                    <View className="flex-row items-center justify-between px-0.5">
                        <View className="flex-row items-center gap-1.5">
                            <Target size={16} color={colors.orange} />
                            <Text style={{ color: colors.white, opacity: 0.9 }} className="font-bold text-xs tracking-wide">动作分析</Text>
                        </View>
                    </View>

                    <View style={{ backgroundColor: colors.gray3, borderWidth: 1, borderColor: colors.border, padding: 8, minHeight: 100 }} className="rounded-bento-sm">
                        {!data?.analytics || data.analytics.length === 0 ? (
                            <View className="items-center justify-center p-4">
                                <Text style={{ color: colors.gray4 }} className="text-sm italic">暂无运动数据</Text>
                            </View>
                        ) : data.analytics.map((exercise, idx) => (
                            <View key={idx} className="flex-row items-center justify-between p-2.5 rounded-lg">
                                <View className="flex-row items-center gap-2.5">
                                    <View style={{ width: 4, height: 24, backgroundColor: `${colors.orange}CC`, borderRadius: 2 }} />
                                    <View>
                                        <Text style={{ color: colors.white }} className="font-medium text-sm">{exercise.name}</Text>
                                        <Text style={{ color: colors.gray4 }} className="text-xs font-medium tracking-wide mt-0.5">
                                            累计 {exercise.sessions} 次训练
                                        </Text>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <View className="flex-row items-baseline gap-0.5">
                                        <Text style={{ color: colors.white }} className="font-bold text-base tracking-tight">{exercise.volume}</Text>
                                        <Text style={{ color: colors.gray4 }} className="text-xs font-medium">{exercise.unit}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* ─── Body Metric Modal ─── */}
            <Modal visible={!!expandedMetric} animationType="slide" transparent onRequestClose={() => setExpandedMetric(null)}>
                <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
                    onPress={() => setExpandedMetric(null)}>
                    <Pressable onPress={() => { }}
                        style={{ backgroundColor: colors.bento, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, maxHeight: "85%" }}>
                        <View className="flex-row justify-between items-center mb-6">
                            <Text style={{ color: colors.white }} className="text-2xl font-extrabold tracking-tight">
                                {expandedMetric === "weight" ? "记录体重" : "记录体脂率"}
                            </Text>
                            <Pressable onPress={() => setExpandedMetric(null)}
                                style={{ backgroundColor: colors.gray3 }}
                                className="w-8 h-8 rounded-lg items-center justify-center">
                                <X size={20} color={colors.gray4} />
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Current Value */}
                            {expandedMetric && (
                                <View style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
                                    <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider mb-1 uppercase">
                                        当前{expandedMetric === "weight" ? "体重" : "体脂率"}
                                    </Text>
                                    <View className="flex-row items-baseline gap-1">
                                        <Text style={{ color: colors.white }} className="text-3xl font-black tracking-tighter">
                                            {data?.bodyMetrics?.[expandedMetric]?.latestValue ?? "-"}
                                        </Text>
                                        <Text style={{ color: colors.gray4 }} className="font-bold">
                                            {expandedMetric === "weight" ? "kg" : "%"}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Input Form */}
                            {expandedMetric && (
                                <View className="flex-row gap-3 items-end mb-3">
                                    <View className="flex-1">
                                        <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider mb-1.5 pl-1">
                                            {expandedMetric === "weight" ? "体重 (kg)" : "体脂率 (%)"}
                                        </Text>
                                        <TextInput
                                            keyboardType="decimal-pad"
                                            value={metricFormValue[expandedMetric]}
                                            onChangeText={(v) => setMetricFormValue(prev => ({ ...prev, [expandedMetric!]: v }))}
                                            placeholder={expandedMetric === "weight" ? "例如：75.5" : "例如：15.0"}
                                            placeholderTextColor={`${colors.gray4}66`}
                                            style={{ color: colors.white, backgroundColor: colors.gray2, height: 44, paddingHorizontal: 16, borderRadius: 10, fontWeight: "bold", fontSize: 15, borderWidth: 1, borderColor: `${colors.gray3}4D` }}
                                            autoFocus
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider mb-1.5 pl-1">记录日期</Text>
                                        <TextInput
                                            value={metricFormDate[expandedMetric]}
                                            onChangeText={(v) => setMetricFormDate(prev => ({ ...prev, [expandedMetric!]: v }))}
                                            placeholder="YYYY-MM-DD"
                                            placeholderTextColor={`${colors.gray4}66`}
                                            style={{ color: colors.white, backgroundColor: colors.gray2, height: 44, paddingHorizontal: 16, borderRadius: 10, fontWeight: "bold", fontSize: 15, borderWidth: 1, borderColor: `${colors.gray3}4D` }}
                                        />
                                    </View>
                                </View>
                            )}

                            {metricError && (
                                <Text style={{ color: colors.red }} className="text-xs font-bold px-1 mb-2">{metricError}</Text>
                            )}

                            {expandedMetric && (
                                <Pressable
                                    onPress={() => handleSaveMetric(expandedMetric)}
                                    disabled={savingMetric === expandedMetric}
                                    style={{ backgroundColor: colors.green, borderRadius: 12, paddingVertical: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, opacity: savingMetric === expandedMetric ? 0.5 : 1, marginBottom: 8 }}
                                >
                                    <Save size={16} color={colors.white} />
                                    <Text style={{ color: colors.white }} className="font-bold text-base">
                                        {savingMetric === expandedMetric ? "保存中..." : "保存记录"}
                                    </Text>
                                </Pressable>
                            )}

                            {/* Metric Calendar */}
                            {expandedMetric && (
                                <View className="mt-1">
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider">
                                            {metricCalendarDate.getFullYear()}年{metricCalendarDate.getMonth() + 1}月记录日历
                                        </Text>
                                        <View className="flex-row gap-1">
                                            <Pressable onPress={() => setMetricCalendarDate(new Date(metricCalendarDate.getFullYear(), metricCalendarDate.getMonth() - 1, 1))}
                                                style={{ backgroundColor: colors.border }}
                                                className="w-6 h-6 rounded-md items-center justify-center">
                                                <ChevronLeft size={12} color={colors.gray4} />
                                            </Pressable>
                                            <Pressable onPress={() => setMetricCalendarDate(new Date(metricCalendarDate.getFullYear(), metricCalendarDate.getMonth() + 1, 1))}
                                                style={{ backgroundColor: colors.border }}
                                                className="w-6 h-6 rounded-md items-center justify-center">
                                                <ChevronRight size={12} color={colors.gray4} />
                                            </Pressable>
                                        </View>
                                    </View>

                                    <View style={{ backgroundColor: colors.gray2, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: colors.border }}>
                                        <View style={{ flexDirection: "row", marginBottom: 6 }}>
                                            {["日", "一", "二", "三", "四", "五", "六"].map(d => (
                                                <View key={d} style={{ flex: 1, alignItems: "center" }}>
                                                    <Text style={{ color: colors.gray4, fontSize: 10, fontWeight: "700", opacity: 0.6 }}>{d}</Text>
                                                </View>
                                            ))}
                                        </View>
                                        {(() => {
                                            const mYear = metricCalendarDate.getFullYear();
                                            const mMonth = metricCalendarDate.getMonth();
                                            const mStart = new Date(mYear, mMonth, 1).getDay();
                                            const mDays = new Date(mYear, mMonth + 1, 0).getDate();
                                            const mTotal = Math.ceil((mStart + mDays) / 7) * 7;

                                            const recordsMap = new Map<number, number>();
                                            (data?.bodyMetrics?.[expandedMetric]?.recentRecords || []).forEach((r: BodyMetricPoint) => {
                                                const parts = r.dateStr.split("-");
                                                if (parseInt(parts[0]) === mYear && parseInt(parts[1]) - 1 === mMonth) {
                                                    recordsMap.set(parseInt(parts[2]), r.value);
                                                }
                                            });

                                            return (
                                                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                                                    {Array.from({ length: mTotal }).map((_, i) => {
                                                        const isPad = i < mStart || i >= mStart + mDays;
                                                        const dayN = i - mStart + 1;
                                                        const val = isPad ? null : recordsMap.get(dayN);
                                                        return (
                                                            <Pressable
                                                                key={i}
                                                                style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}
                                                                onPress={() => {
                                                                    if (!isPad) {
                                                                        const ds = `${mYear}-${String(mMonth + 1).padStart(2, "0")}-${String(dayN).padStart(2, "0")}`;
                                                                        setMetricFormDate(prev => ({ ...prev, [expandedMetric!]: ds }));
                                                                        if (val) setMetricFormValue(prev => ({ ...prev, [expandedMetric!]: String(val) }));
                                                                    }
                                                                }}
                                                            >
                                                                {!isPad && (
                                                                    <View style={{
                                                                        flex: 1, borderRadius: 8, alignItems: "center", justifyContent: "center",
                                                                        backgroundColor: val ? `${colors.green}33` : "transparent",
                                                                    }}>
                                                                        <Text style={{ color: val ? colors.green : colors.white, fontSize: 11, fontWeight: val ? "700" : "400", opacity: val ? 1 : 0.8 }}>
                                                                            {dayN}
                                                                        </Text>
                                                                        {val && (
                                                                            <Text style={{ color: colors.green, fontSize: 8, fontWeight: "800" }}>{val}</Text>
                                                                        )}
                                                                    </View>
                                                                )}
                                                            </Pressable>
                                                        );
                                                    })}
                                                </View>
                                            );
                                        })()}
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
