import { useState, useEffect, useMemo } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { X, ChevronLeft, ChevronRight, Save } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { type BodyMetricPoint } from "@/db/services/dashboard";
import Svg, { Circle, Path } from "react-native-svg";

type Props = {
    visible: boolean;
    metricType: "weight" | "bodyFat" | null;
    onClose: () => void;
    data: any;
    onSave: (metricType: "weight" | "bodyFat", valueStr: string, dateStr: string) => Promise<void>;
};

export function BodyMetricModal({ visible, metricType, onClose, data, onSave }: Props) {
    const { colors } = useTheme();

    const [formValue, setFormValue] = useState("");
    const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
    const [metricCalendarDate, setMetricCalendarDate] = useState(new Date());
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [trendRange, setTrendRange] = useState<7 | 30 | 90>(30);

    const metricSummary = metricType ? data?.bodyMetrics?.[metricType] : null;
    const chartUnit = metricType === "weight" ? "kg" : "%";
    const chartColor = metricType === "weight" ? colors.green : colors.orange;
    const targetValue = metricType === "weight" ? data?.profileTargets?.weight : data?.profileTargets?.bodyFat;
    const latestValue = metricSummary?.latestValue ?? null;
    const targetGap = latestValue != null && targetValue != null ? latestValue - targetValue : null;

    const chartRecords = useMemo(() => {
        const records = metricSummary?.recentRecords ?? [];
        const rangeStart = new Date();
        rangeStart.setDate(rangeStart.getDate() - trendRange + 1);
        return [...records]
            .filter((item) => new Date(`${item.dateStr}T00:00:00`) >= rangeStart)
            .slice(0, 12)
            .reverse();
    }, [metricSummary, trendRange]);

    const chartData = useMemo(() => {
        if (!chartRecords.length) return [] as Array<{ x: number; y: number; value: number; label: string }>;

        const width = 280;
        const height = 92;
        const paddingX = 10;
        const paddingY = 10;
        const values = chartRecords.map((item) => item.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = Math.max(max - min, 1);

        return chartRecords.map((item, index) => {
            const x = chartRecords.length === 1
                ? width / 2
                : paddingX + (index * (width - paddingX * 2)) / (chartRecords.length - 1);
            const y = height - paddingY - ((item.value - min) / range) * (height - paddingY * 2);
            return {
                x,
                y,
                value: item.value,
                label: item.dateStr.slice(5).replace("-", "/"),
            };
        });
    }, [chartRecords]);

    const chartPath = useMemo(() => {
        if (!chartData.length) return "";
        return chartData.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
    }, [chartData]);

    const chartDelta = chartRecords.length >= 2
        ? chartRecords[chartRecords.length - 1].value - chartRecords[0].value
        : null;

    const trendDeltaText = trendRange === 7
        ? metricSummary?.deltaFromPrevious
        : trendRange === 30
            ? metricSummary?.deltaFrom30Days
            : metricSummary?.deltaFrom90Days;

    // Reset state when opened
    useEffect(() => {
        if (visible) {
            setFormValue("");
            setTrendRange(30);
            // Keep today's date or the last selected date logic if you prefer
            // but normally we reset to today when newly opened:
            setFormDate(new Date().toISOString().slice(0, 10));
            setError(null);
            setMetricCalendarDate(new Date());
        }
    }, [visible, metricType]);

    const handleSave = async () => {
        if (!metricType) return;
        setError(null);
        const val = Number(formValue.trim());
        if (!Number.isFinite(val) || val <= 0) {
            setError("请输入有效的数值");
            return;
        }
        setIsSaving(true);
        try {
            await onSave(metricType, formValue, formDate);
            onClose();
        } catch (e) {
            setError("保存失败，请重试");
        } finally {
            setIsSaving(false);
        }
    };

    if (!metricType) return null;

    return (
        <BottomSheetModal
            visible={visible}
            onClose={onClose}
            sheetHeight="85%"
            backgroundColor={colors.bento}
            avoidKeyboard
        >
            <View className="flex-row justify-between items-center mb-6">
                <Text style={{ color: colors.white }} className="text-2xl font-extrabold tracking-tight">
                    {metricType === "weight" ? "记录体重" : "记录体脂率"}
                </Text>
                <Pressable onPress={onClose}
                    style={{ backgroundColor: colors.gray3 }}
                    className="w-8 h-8 rounded-lg items-center justify-center">
                    <X size={20} color={colors.gray4} />
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Current Value */}
                <View style={{ backgroundColor: colors.gray2, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: `${colors.gray3}4D` }}>
                    <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider mb-1 uppercase">
                        当前{metricType === "weight" ? "体重" : "体脂率"}
                    </Text>
                    <View className="flex-row items-baseline gap-1">
                        <Text style={{ color: colors.white }} className="text-3xl font-black tracking-tighter">
                            {data?.bodyMetrics?.[metricType]?.latestValue ?? "-"}
                        </Text>
                        <Text style={{ color: colors.gray4 }} className="font-bold">
                            {metricType === "weight" ? "kg" : "%"}
                        </Text>
                    </View>
                    <Text style={{ color: colors.gray4, fontSize: 12, marginTop: 8, fontWeight: "600" }}>
                        {targetValue != null && targetGap != null
                            ? `目标 ${targetValue}${chartUnit} · ${targetGap === 0 ? "已达成" : `${targetGap > 0 ? "高于" : "低于"}目标 ${Math.abs(targetGap).toFixed(1)}${chartUnit}`}`
                            : `设置目标${metricType === "weight" ? "体重" : "体脂率"}后显示差距`}
                    </Text>
                </View>

                <View style={{ backgroundColor: colors.gray2, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: `${colors.gray3}4D` }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <View>
                            <Text style={{ color: colors.white, fontSize: 13, fontWeight: "700" }}>趋势图</Text>
                            <Text style={{ color: colors.gray4, fontSize: 11, marginTop: 2 }}>
                                {`${chartRecords.length || 0} 次记录${trendDeltaText != null ? ` · ${trendDeltaText > 0 ? "+" : ""}${trendDeltaText.toFixed(1)} ${chartUnit}` : chartDelta !== null ? ` · ${chartDelta > 0 ? "+" : ""}${chartDelta.toFixed(1)} ${chartUnit}` : ""}`}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", backgroundColor: colors.border, borderRadius: 10, padding: 3, gap: 4 }}>
                            {([7, 30, 90] as const).map((range) => {
                                const active = trendRange === range;
                                return (
                                    <Pressable
                                        key={range}
                                        onPress={() => setTrendRange(range)}
                                        style={{
                                            paddingHorizontal: 10,
                                            paddingVertical: 6,
                                            borderRadius: 8,
                                            backgroundColor: active ? colors.gray3 : "transparent",
                                        }}
                                    >
                                        <Text style={{ color: active ? colors.white : colors.gray4, fontSize: 11, fontWeight: active ? "700" : "600" }}>
                                            {range}天
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    {chartData.length >= 2 ? (
                        <>
                            <View style={{ height: 92, marginBottom: 8 }}>
                                <Svg width="100%" height="92" viewBox="0 0 280 92">
                                    <Path d={chartPath} stroke={chartColor} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                    {chartData.map((point, index) => (
                                        <Circle key={index} cx={point.x} cy={point.y} r={index === chartData.length - 1 ? 4 : 3} fill={chartColor} />
                                    ))}
                                </Svg>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                {chartData.map((point, index) => (
                                    <View key={index} style={{ alignItems: index === 0 ? "flex-start" : index === chartData.length - 1 ? "flex-end" : "center", flex: 1 }}>
                                        <Text style={{ color: colors.white, fontSize: 11, fontWeight: "700" }}>{point.value}</Text>
                                        <Text style={{ color: colors.gray4, fontSize: 10, marginTop: 2 }}>{point.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    ) : (
                        <View style={{ backgroundColor: colors.border, borderRadius: 10, paddingVertical: 18, alignItems: "center" }}>
                            <Text style={{ color: colors.gray4, fontSize: 12 }}>至少两条记录后显示趋势图</Text>
                        </View>
                    )}
                </View>

                {/* Input Form */}
                <View className="flex-row gap-3 items-end mb-3">
                    <View className="flex-1">
                        <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider mb-1.5 pl-1">
                            {metricType === "weight" ? "体重 (kg)" : "体脂率 (%)"}
                        </Text>
                        <TextInput
                            keyboardType="decimal-pad"
                            value={formValue}
                            onChangeText={setFormValue}
                            placeholder={metricType === "weight" ? "例如：75.5" : "例如：15.0"}
                            placeholderTextColor={`${colors.gray4}66`}
                            style={{ color: colors.white, backgroundColor: colors.gray2, height: 44, paddingHorizontal: 16, borderRadius: 10, fontWeight: "bold", fontSize: 15, borderWidth: 1, borderColor: `${colors.gray3}4D` }}
                            autoFocus
                        />
                    </View>
                    <View className="flex-1">
                        <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider mb-1.5 pl-1">记录日期</Text>
                        <TextInput
                            value={formDate}
                            onChangeText={setFormDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={`${colors.gray4}66`}
                            style={{ color: colors.white, backgroundColor: colors.gray2, height: 44, paddingHorizontal: 16, borderRadius: 10, fontWeight: "bold", fontSize: 15, borderWidth: 1, borderColor: `${colors.gray3}4D` }}
                        />
                    </View>
                </View>

                {error && (
                    <Text style={{ color: colors.red }} className="text-xs font-bold px-1 mb-2">{error}</Text>
                )}

                <Pressable
                    onPress={handleSave}
                    disabled={isSaving}
                    style={{ backgroundColor: colors.green, borderRadius: 12, paddingVertical: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, opacity: isSaving ? 0.5 : 1, marginBottom: 8 }}
                >
                    <Save size={16} color={colors.white} />
                    <Text style={{ color: colors.white }} className="font-bold text-base">
                        {isSaving ? "保存中..." : "保存记录"}
                    </Text>
                </Pressable>

                {/* Metric Calendar */}
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
                            (data?.bodyMetrics?.[metricType]?.recentRecords || []).forEach((r: BodyMetricPoint) => {
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
                                                        setFormDate(ds);
                                                        if (val) setFormValue(String(val));
                                                    }
                                                }}
                                            >
                                                {!isPad && (
                                                    <View style={{
                                                        flex: 1,
                                                        borderRadius: 8,
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        backgroundColor: val ? `${colors.green}33` : colors.border,
                                                        borderWidth: 1,
                                                        borderColor: val ? `${colors.green}40` : `${colors.gray3}33`,
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
            </ScrollView>
        </BottomSheetModal>
    );
}
