import { useState, useEffect, useMemo } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { X, ChevronLeft, ChevronRight, Save } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { type BodyMetricPoint } from "@/db/services/dashboard";
import Svg, { Circle, Path } from "react-native-svg";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

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
                <Text variant="heading" className="tracking-tight">
                    {metricType === "weight" ? "记录体重" : "记录体脂率"}
                </Text>
                <Button onPress={onClose}
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-lg">
                    <X size={20} color={colors.gray4} />
                </Button>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Current Value */}
                <Card className="mb-3 rounded-xl bg-secondary p-3">
                    <Text variant="caption" className="mb-1 font-bold uppercase tracking-wider">
                        当前{metricType === "weight" ? "体重" : "体脂率"}
                    </Text>
                    <View className="flex-row items-baseline gap-1">
                        <Text className="text-3xl font-black tracking-tighter">
                            {data?.bodyMetrics?.[metricType]?.latestValue ?? "-"}
                        </Text>
                        <Text variant="caption" className="font-bold">
                            {metricType === "weight" ? "kg" : "%"}
                        </Text>
                    </View>
                    <Text variant="caption" className="mt-2 font-semibold">
                        {targetValue != null && targetGap != null
                            ? `目标 ${targetValue}${chartUnit} · ${targetGap === 0 ? "已达成" : `${targetGap > 0 ? "高于" : "低于"}目标 ${Math.abs(targetGap).toFixed(1)}${chartUnit}`}`
                            : `设置目标${metricType === "weight" ? "体重" : "体脂率"}后显示差距`}
                    </Text>
                </Card>

                <Card className="mb-3 rounded-xl bg-secondary p-3">
                    <View className="mb-2.5 flex-row items-center justify-between">
                        <View>
                            <Text variant="label" className="text-[13px]">趋势图</Text>
                            <Text variant="caption" className="mt-0.5 text-[11px]">
                                {`${chartRecords.length || 0} 次记录${trendDeltaText != null ? ` · ${trendDeltaText > 0 ? "+" : ""}${trendDeltaText.toFixed(1)} ${chartUnit}` : chartDelta !== null ? ` · ${chartDelta > 0 ? "+" : ""}${chartDelta.toFixed(1)} ${chartUnit}` : ""}`}
                            </Text>
                        </View>
                        <View className="flex-row gap-1 rounded-[10px] bg-border p-[3px]">
                            {([7, 30, 90] as const).map((range) => {
                                const active = trendRange === range;
                                return (
                                    <Button
                                        key={range}
                                        onPress={() => setTrendRange(range)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto rounded-lg px-2.5 py-1.5"
                                        style={{
                                            backgroundColor: active ? colors.gray3 : "transparent",
                                        }}
                                    >
                                        <Text style={{ color: active ? colors.white : colors.gray4, fontSize: 11, fontWeight: active ? "700" : "600" }}>
                                            {range}天
                                        </Text>
                                    </Button>
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
                        <View className="items-center rounded-[10px] bg-border py-[18px]">
                            <Text variant="muted">至少两条记录后显示趋势图</Text>
                        </View>
                    )}
                </Card>

                {/* Input Form */}
                <View className="flex-row gap-3 items-end mb-3">
                    <View className="flex-1">
                        <Text variant="caption" className="mb-1.5 pl-1 font-bold tracking-wider">
                            {metricType === "weight" ? "体重 (kg)" : "体脂率 (%)"}
                        </Text>
                        <Input
                            keyboardType="decimal-pad"
                            value={formValue}
                            onChangeText={setFormValue}
                            placeholder={metricType === "weight" ? "例如：75.5" : "例如：15.0"}
                            className="h-11 px-4 text-[15px] font-bold"
                            autoFocus
                        />
                    </View>
                    <View className="flex-1">
                        <Text variant="caption" className="mb-1.5 pl-1 font-bold tracking-wider">记录日期</Text>
                        <Input
                            value={formDate}
                            onChangeText={setFormDate}
                            placeholder="YYYY-MM-DD"
                            className="h-11 px-4 text-[15px] font-bold"
                        />
                    </View>
                </View>

                {error && (
                    <Text style={{ color: colors.red }} className="text-xs font-bold px-1 mb-2">{error}</Text>
                )}

                <Button
                    onPress={handleSave}
                    disabled={isSaving}
                    className="mb-2 bg-accent py-3"
                >
                    <Save size={16} color={colors.white} />
                    <ButtonText className="text-base text-foreground">
                        {isSaving ? "保存中..." : "保存记录"}
                    </ButtonText>
                </Button>

                {/* Metric Calendar */}
                <View className="mt-1">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text variant="caption" className="font-bold tracking-wider">
                            {metricCalendarDate.getFullYear()}年{metricCalendarDate.getMonth() + 1}月记录日历
                        </Text>
                        <View className="flex-row gap-1">
                            <Button onPress={() => setMetricCalendarDate(new Date(metricCalendarDate.getFullYear(), metricCalendarDate.getMonth() - 1, 1))}
                                variant="secondary"
                                size="icon"
                                className="h-6 w-6 rounded-md bg-border">
                                <ChevronLeft size={12} color={colors.gray4} />
                            </Button>
                            <Button onPress={() => setMetricCalendarDate(new Date(metricCalendarDate.getFullYear(), metricCalendarDate.getMonth() + 1, 1))}
                                variant="secondary"
                                size="icon"
                                className="h-6 w-6 rounded-md bg-border">
                                <ChevronRight size={12} color={colors.gray4} />
                            </Button>
                        </View>
                    </View>

                    <Card className="rounded-xl bg-secondary p-2.5">
                        <View className="mb-1.5 flex-row">
                            {["日", "一", "二", "三", "四", "五", "六"].map(d => (
                                <View key={d} className="flex-1 items-center">
                                    <Text variant="caption" className="text-[10px] font-bold opacity-60">{d}</Text>
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
                                <View className="flex-row flex-wrap">
                                    {Array.from({ length: mTotal }).map((_, i) => {
                                        const isPad = i < mStart || i >= mStart + mDays;
                                        const dayN = i - mStart + 1;
                                        const val = isPad ? null : recordsMap.get(dayN);
                                        const hasValue = val != null;
                                        return (
                                            <Pressable
                                                key={i}
                                                style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}
                                                onPress={() => {
                                                    if (!isPad) {
                                                        const ds = `${mYear}-${String(mMonth + 1).padStart(2, "0")}-${String(dayN).padStart(2, "0")}`;
                                                        setFormDate(ds);
                                                        if (hasValue) setFormValue(String(val));
                                                    }
                                                }}
                                            >
                                                {!isPad && (
                                                    <View style={{
                                                        flex: 1,
                                                        borderRadius: 8,
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        backgroundColor: hasValue ? `${colors.green}33` : colors.border,
                                                        borderWidth: 1,
                                                        borderColor: hasValue ? `${colors.green}40` : `${colors.gray3}33`,
                                                    }}>
                                                        <Text style={{ color: hasValue ? colors.green : colors.white, fontSize: 11, fontWeight: hasValue ? "700" : "400", opacity: hasValue ? 1 : 0.8 }}>
                                                            {dayN}
                                                        </Text>
                                                        {hasValue && (
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
                    </Card>
                </View>
            </ScrollView>
        </BottomSheetModal>
    );
}
