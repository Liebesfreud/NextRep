import { View } from "react-native";
import { ChevronRight, Gauge, Scale } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

type MetricSummary = {
    latestValue: number | null;
    deltaFromPrevious: number | null;
};

type Props = {
    data: {
        bodyMetrics?: {
            weight?: MetricSummary;
            bodyFat?: MetricSummary;
        };
        profileHeight?: number | null;
        profileTargets?: {
            weight?: number | null;
            bodyFat?: number | null;
        };
    } | null;
    loading: boolean;
    expandedMetric: "weight" | "bodyFat" | null;
    setExpandedMetric: (metric: "weight" | "bodyFat" | null) => void;
};

function formatTarget(value: number | null | undefined, target: number | null | undefined, unit: string) {
    if (target == null) return "未设置目标";
    if (value == null) return `目标 ${target}${unit}`;
    const gap = value - target;
    if (gap === 0) return `目标 ${target}${unit} · 已达成`;
    return `目标 ${target}${unit} · ${gap > 0 ? "高" : "低"} ${Math.abs(gap).toFixed(1)}${unit}`;
}

export function BodyMetricsCard({ data, loading, setExpandedMetric }: Props) {
    const { colors } = useTheme();
    const weightMetric = data?.bodyMetrics?.weight;
    const bodyFatMetric = data?.bodyMetrics?.bodyFat;
    const weight = weightMetric?.latestValue;
    const bodyFat = bodyFatMetric?.latestValue;
    const heightCm = data?.profileHeight;
    const bmi = weight && heightCm ? (weight / Math.pow(heightCm / 100, 2)).toFixed(1) : "-";
    const weightDelta = weightMetric?.deltaFromPrevious;
    const trendText = weightDelta == null
        ? "暂无趋势"
        : `${weightDelta <= 0 ? "↓" : "↑"} ${Math.abs(weightDelta).toFixed(1)} kg 较上次`;

    return (
        <Card className="gap-4 p-card-padding">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <Scale size={18} color={colors.accent} />
                    <Text variant="subheading" className="text-foreground">身体指标</Text>
                </View>
                <Gauge size={18} color={colors.textTertiary} />
            </View>

            <AnimatedPressable
                onPress={() => setExpandedMetric("weight")}
                className="min-h-[132px] justify-between rounded-lg bg-surface-elevated p-card-padding"
                accessibilityLabel="记录体重"
                accessibilityRole="button"
            >
                <View className="flex-row items-center justify-between">
                    <Text variant="micro">当前体重</Text>
                    <ChevronRight size={18} color={colors.textTertiary} />
                </View>

                <View className="flex-row items-baseline gap-1.5">
                    <Text className="text-large-stat text-foreground font-variant-numeric-tabular-nums">
                        {loading ? "-" : weight ?? "-"}
                    </Text>
                    <Text variant="caption" className="text-tertiary">kg</Text>
                </View>

                <View className="flex-row items-end justify-between gap-3">
                    <Text
                        variant="caption"
                        className={weightDelta != null && weightDelta <= 0 ? "shrink-0 text-success" : "shrink-0 text-accent"}
                    >
                        {trendText}
                    </Text>
                    <Text variant="micro" className="min-w-0 flex-1 text-right" numberOfLines={1}>
                        {formatTarget(weight, data?.profileTargets?.weight, "kg")}
                    </Text>
                </View>
            </AnimatedPressable>

            <View className="flex-row gap-4">
                <AnimatedPressable
                    onPress={() => setExpandedMetric("bodyFat")}
                    className="min-h-[128px] flex-1 justify-between rounded-lg bg-surface-elevated p-card-padding"
                    accessibilityLabel="记录体脂率"
                    accessibilityRole="button"
                >
                    <View className="flex-row items-center justify-between">
                        <Text variant="micro">体脂率</Text>
                        <ChevronRight size={15} color={colors.textTertiary} />
                    </View>
                    <View className="flex-row items-baseline gap-1">
                        <Text className="text-stat-value text-foreground font-variant-numeric-tabular-nums">
                            {loading ? "-" : bodyFat ?? "-"}
                        </Text>
                        <Text variant="micro">%</Text>
                    </View>
                    <Text variant="micro" numberOfLines={2}>
                        {formatTarget(bodyFat, data?.profileTargets?.bodyFat, "%")}
                    </Text>
                </AnimatedPressable>

                <View className="min-h-[128px] flex-1 gap-4 rounded-lg bg-surface-elevated p-card-padding">
                    <View className="flex-row items-center justify-between">
                        <Text variant="micro">BMI</Text>
                        <Gauge size={15} color={colors.textTertiary} />
                    </View>
                    <View className="flex-row items-baseline gap-1">
                        <Text className="text-stat-value text-foreground font-variant-numeric-tabular-nums">
                            {loading ? "-" : bmi}
                        </Text>
                    </View>
                </View>
            </View>
        </Card>
    );
}
