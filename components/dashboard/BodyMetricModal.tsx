import { useState, useEffect, useMemo, useRef } from "react";
import { View, ScrollView } from "react-native";
import { X, ChevronLeft, ChevronRight, Save } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { type BodyMetricPoint } from "@/db/services/dashboard";
import Svg, { Circle, Path } from "react-native-svg";
import { Button, ButtonText } from "@/components/ui/button";
import { CalendarDayCell } from "@/components/ui/calendar-day-cell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type Props = {
    visible: boolean;
    metricType: "weight" | "bodyFat" | null;
    onClose: () => void;
    data: any;
    onSave: (metricType: "weight" | "bodyFat", valueStr: string, dateStr: string) => Promise<void>;
};

type MetricCalendarCell = {
    key: string;
    day: number | null;
    value: number | null;
};

export function BodyMetricModal({ visible, metricType, onClose, data, onSave }: Props) {
    const { colors } = useTheme();

    const [formValue, setFormValue] = useState("");
    const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
    const [metricCalendarDate, setMetricCalendarDate] = useState(new Date());
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [trendRange, setTrendRange] = useState<7 | 30 | 90>(30);
    const saveSeqRef = useRef(0);
    const mountedRef = useRef(true);

    useEffect(() => () => {
        mountedRef.current = false;
        saveSeqRef.current += 1;
    }, []);

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

    const metricCalendarCells = useMemo<MetricCalendarCell[]>(() => {
        const year = metricCalendarDate.getFullYear();
        const month = metricCalendarDate.getMonth();
        const start = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();
        const total = Math.ceil((start + days) / 7) * 7;
        const recordsMap = new Map<number, number>();

        (metricSummary?.recentRecords || []).forEach((record: BodyMetricPoint) => {
            const parts = record.dateStr.split("-");
            if (parseInt(parts[0], 10) === year && parseInt(parts[1], 10) - 1 === month) {
                recordsMap.set(parseInt(parts[2], 10), record.value);
            }
        });

        return Array.from({ length: total }, (_, index) => {
            const isPad = index < start || index >= start + days;
            const day = isPad ? null : index - start + 1;
            return {
                key: isPad ? `pad-${year}-${month}-${index}` : `day-${year}-${month}-${day}`,
                day,
                value: day ? recordsMap.get(day) ?? null : null,
            };
        });
    }, [metricCalendarDate, metricSummary]);

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
        if (!metricType || isSaving) return;
        const requestId = ++saveSeqRef.current;
        setError(null);
        const val = Number(formValue.trim());
        if (!Number.isFinite(val) || val <= 0) {
            setError("请输入有效的数值");
            return;
        }
        setIsSaving(true);
        try {
            await onSave(metricType, formValue, formDate);
            if (!mountedRef.current || requestId !== saveSeqRef.current) return;
            onClose();
        } catch (e) {
            if (mountedRef.current && requestId === saveSeqRef.current) setError("保存失败，请重试");
        } finally {
            if (mountedRef.current && requestId === saveSeqRef.current) setIsSaving(false);
        }
    };

    if (!metricType) return null;

    return (
        <Sheet
            visible={visible}
            onClose={onClose}
            sheetHeight="85%"
            avoidKeyboard
        >
            <View className="flex-row justify-between items-center mb-6">
                <Text variant="heading" className="tracking-tight">
                    {metricType === "weight" ? "记录体重" : "记录体脂率"}
                </Text>
                <Button onPress={onClose}
                    accessibilityLabel="关闭身体指标弹窗"
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-lg">
                    <X size={20} color={colors.gray4} />
                </Button>
            </View>

            <View className="flex-1">
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                                        className={cn("h-auto rounded-lg px-2.5 py-1.5", active ? "bg-muted" : "bg-transparent")}
                                    >
                                        <Text className={cn("text-[11px]", active ? "font-bold text-foreground" : "font-semibold text-muted-foreground")}>
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
                                        <Text className="text-[11px] font-bold text-foreground">{point.value}</Text>
                                        <Text className="mt-0.5 text-[10px] text-muted-foreground">{point.label}</Text>
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
                    <Text className="mb-2 px-1 text-xs font-bold text-destructive">{error}</Text>
                )}

                {/* Metric Calendar */}
                <View className="mt-1">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text variant="caption" className="font-bold tracking-wider">
                            {metricCalendarDate.getFullYear()}年{metricCalendarDate.getMonth() + 1}月记录日历
                        </Text>
                        <View className="flex-row gap-1">
                            <Button onPress={() => setMetricCalendarDate(new Date(metricCalendarDate.getFullYear(), metricCalendarDate.getMonth() - 1, 1))}
                                accessibilityLabel="上一个月"
                                variant="secondary"
                                size="icon"
                                className="h-6 w-6 rounded-md bg-border">
                                <ChevronLeft size={12} color={colors.gray4} />
                            </Button>
                            <Button onPress={() => setMetricCalendarDate(new Date(metricCalendarDate.getFullYear(), metricCalendarDate.getMonth() + 1, 1))}
                                accessibilityLabel="下一个月"
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
                        <View className="flex-row flex-wrap">
                            {metricCalendarCells.map((cell) => {
                                if (!cell.day) return <View key={cell.key} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;

                                const hasValue = cell.value != null;
                                return (
                                    <View key={cell.key} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}>
                                        <CalendarDayCell
                                            day={cell.day}
                                            size={40}
                                            marked={hasValue}
                                            valueLabel={cell.value}
                                            onPress={() => {
                                                const year = metricCalendarDate.getFullYear();
                                                const month = metricCalendarDate.getMonth();
                                                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
                                                setFormDate(dateStr);
                                                if (hasValue) setFormValue(String(cell.value));
                                            }}
                                        />
                                    </View>
                                );
                            })}
                        </View>
                    </Card>
                </View>
            </ScrollView>

            <View className="mt-4 flex-row gap-2 border-t pt-3" style={{ borderTopColor: `${colors.gray3}4D` }}>
                <Button
                    onPress={handleSave}
                    disabled={isSaving}
                    className="flex-1 py-3.5"
                >
                    <Save size={16} color={colors.white} />
                    <ButtonText className="text-base">
                        {isSaving ? "保存中..." : "保存记录"}
                    </ButtonText>
                </Button>
            </View>
            </View>
        </Sheet>
    );
}
