import { View } from "react-native";
import { Scale } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type Props = {
    data: any;
    loading: boolean;
    expandedMetric: "weight" | "bodyFat" | null;
    setExpandedMetric: (metric: "weight" | "bodyFat" | null) => void;
};

export function BodyMetricsCard({ data, loading, expandedMetric, setExpandedMetric }: Props) {
    const { colors } = useTheme();

    const weightMetric = data?.bodyMetrics?.weight;
    const bodyFatMetric = data?.bodyMetrics?.bodyFat;
    const heightCm = data?.profileHeight;
    const targetWeight = data?.profileTargets?.weight;
    const targetBodyFat = data?.profileTargets?.bodyFat;

    const weightVal = weightMetric?.latestValue;
    const bodyFatVal = bodyFatMetric?.latestValue;
    const weightDelta = weightMetric?.deltaFromPrevious;

    const hasWeightDelta = weightDelta != null;
    const isWeightDecrease = (weightDelta ?? 0) <= 0;
    const trendColor = hasWeightDelta ? (isWeightDecrease ? colors.green : colors.orange) : colors.gray4;
    const trendBgColor = hasWeightDelta ? (isWeightDecrease ? `${colors.green}1A` : `${colors.orange}1A`) : colors.border;
    const trendText = hasWeightDelta ? `${isWeightDecrease ? "↓" : "↑"} ${Math.abs(weightDelta).toFixed(1)} kg 相比上次` : "暂无数据";

    // BMI logic based on Chinese standard
    const bmiVal = (weightVal && heightCm) ? (weightVal / Math.pow(heightCm / 100, 2)).toFixed(1) : "-";

    const getBmiStatus = (bmiStr: string) => {
        if (bmiStr === "-") return { text: "未知", color: colors.gray4, bg: colors.border };
        const val = parseFloat(bmiStr);
        if (val < 18.5) return { text: "偏瘦", color: colors.orange, bg: `${colors.orange}1A` };
        if (val < 24) return { text: "正常", color: colors.green, bg: `${colors.green}1A` };
        if (val < 28) return { text: "超重", color: colors.orange, bg: `${colors.orange}1A` };
        return { text: "肥胖", color: colors.red, bg: `${colors.red}1A` };
    };

    const bmiStatus = getBmiStatus(bmiVal);

    // Body fat simple proxy logic to display badge
    const bodyFatStatusText = bodyFatVal ? (bodyFatVal >= 25 ? "偏高" : bodyFatVal >= 15 ? "标准" : "偏低") : "";
    const bodyFatStatusColor = bodyFatVal ? (bodyFatVal >= 25 ? colors.orange : bodyFatVal >= 15 ? colors.green : colors.orange) : colors.gray4;
    const bodyFatStatusBg = bodyFatVal ? (bodyFatVal >= 25 ? `${colors.orange}1A` : bodyFatVal >= 15 ? `${colors.green}1A` : `${colors.orange}1A`) : colors.border;
    const weightGap = weightVal != null && targetWeight != null ? weightVal - targetWeight : null;
    const bodyFatGap = bodyFatVal != null && targetBodyFat != null ? bodyFatVal - targetBodyFat : null;
    const toggleWeightExpanded = () => setExpandedMetric(expandedMetric === "weight" ? null : "weight");
    const toggleBodyFatExpanded = () => setExpandedMetric(expandedMetric === "bodyFat" ? null : "bodyFat");

    return (
        <Card className="gap-3 p-4">
            {/* Header */}
            <View className="flex-row items-center px-0.5">
                <Scale size={16} color={colors.red} />
                <Text variant="caption" className="ml-1.5 text-muted-foreground">
                    身体指标
                </Text>
            </View>

            {/* 第一部分：顶部数据区 */}
            <View className="flex-row gap-2.5">

                {/* 左侧核心卡片（体重） */}
                <Button
                    onPress={toggleWeightExpanded}
                    variant="ghost"
                    className={cn(
                        "min-h-[106px] h-auto flex-[1.3] justify-between rounded-lg border p-3",
                        expandedMetric === "weight" ? "border-destructive/50" : "border-border"
                    )}
                >
                    <View className="flex-row items-center">
                        <Text variant="caption" className="text-muted-foreground">
                            体重
                        </Text>
                    </View>

                    <View className="mb-2 mt-1.5 flex-row items-baseline">
                        <Text className="text-[28px] font-semibold text-foreground">
                            {loading ? "-" : (weightVal ?? "-")}
                        </Text>
                        <Text variant="caption" className="ml-1 text-muted-foreground">
                            kg
                        </Text>
                    </View>

                    {/* 趋势标签 */}
                    <View
                        className="self-start rounded-md px-[7px] py-[3px]"
                        style={{ backgroundColor: trendBgColor }}
                    >
                        <Text className="text-[10px] font-bold" style={{ color: trendColor }}>
                            {trendText}
                        </Text>
                    </View>

                    <Text className="mt-2 text-[10px] text-muted-foreground" numberOfLines={2}>
                        {targetWeight != null && weightGap != null
                            ? `目标 ${targetWeight}kg · ${weightGap === 0 ? "已达成" : `${weightGap > 0 ? "高于" : "低于"}目标 ${Math.abs(weightGap).toFixed(1)}kg`}`
                            : "未设置目标"}
                    </Text>
                </Button>

                {/* 右侧辅助卡片区 */}
                <View className="flex-1 gap-2.5">

                    {/* 右上卡片（体脂率） */}
                    <Button
                        onPress={toggleBodyFatExpanded}
                        variant="ghost"
                        className={cn(
                            "h-auto flex-1 justify-between rounded-lg border p-[9px]",
                            expandedMetric === "bodyFat" ? "border-destructive/50" : "border-border"
                        )}
                    >
                        <Text className="text-[11px] text-muted-foreground">
                            体脂率
                        </Text>
                        <View className="mt-0.5 flex-row items-end justify-between">
                            <View className="flex-row items-baseline">
                                <Text className="text-[17px] font-semibold text-foreground">
                                    {loading ? "-" : (bodyFatVal ?? "-")}
                                </Text>
                                <Text className="ml-0.5 text-[9px] text-muted-foreground">%</Text>
                            </View>
                            {bodyFatVal && (
                                <View
                                    className="rounded-md px-2 py-0.5"
                                    style={{ backgroundColor: bodyFatStatusBg }}
                                >
                                    <Text className="text-[10px] font-medium" style={{ color: bodyFatStatusColor }}>
                                        {bodyFatStatusText}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text className="mt-[3px] text-[9px] text-muted-foreground" numberOfLines={2}>
                            {targetBodyFat != null && bodyFatGap != null
                                ? `目标 ${targetBodyFat}% · ${bodyFatGap === 0 ? "已达成" : `${bodyFatGap > 0 ? "高于" : "低于"}目标 ${Math.abs(bodyFatGap).toFixed(1)}%`}`
                                : "未设置目标"}
                        </Text>
                    </Button>

                    {/* 右下卡片（BMI） */}
                    <Card
                        className="flex-1 justify-between rounded-lg border border-border p-[9px]"
                    >
                        <Text className="text-[11px] text-muted-foreground">
                            BMI
                        </Text>
                        <View className="mt-0.5 flex-row items-end justify-between">
                            <Text className="text-[17px] font-semibold text-foreground">
                                {loading ? "-" : bmiVal}
                            </Text>
                            <View
                                className="rounded-md px-2 py-0.5"
                                style={{ backgroundColor: bmiStatus.bg }}
                            >
                                <Text className="text-[10px] font-medium" style={{ color: bmiStatus.color }}>
                                    {bmiStatus.text}
                                </Text>
                            </View>
                        </View>
                    </Card>

                </View>
            </View>
        </Card>
    );
}
