import { View, Pressable } from "react-native";
import { Scale } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

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

    const isWeightDecrease = (weightDelta ?? 0) <= 0;
    const trendColor = weightDelta === null ? colors.gray4 : (isWeightDecrease ? colors.green : colors.orange);
    const trendBgColor = weightDelta === null ? colors.border : (isWeightDecrease ? `${colors.green}1A` : `${colors.orange}1A`);
    const trendText = weightDelta === null ? "暂无数据" : `${isWeightDecrease ? "↓" : "↑"} ${Math.abs(weightDelta).toFixed(1)} kg 相比上次`;

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

    return (
        <Card className="gap-2.5 p-3">
            {/* Header */}
            <View className="flex-row items-center px-0.5">
                <Scale size={16} color={colors.red} />
                <Text variant="caption" className="ml-1.5 font-bold tracking-[0.4px] opacity-90">
                    身体指标
                </Text>
            </View>

            {/* 第一部分：顶部数据区 */}
            <View className="flex-row gap-2.5">

                {/* 左侧核心卡片（体重） */}
                <Pressable
                    onPress={() => setExpandedMetric(expandedMetric === "weight" ? null : "weight")}
                    style={{
                        flex: 1.3,
                        backgroundColor: colors.gray3,
                        borderColor: expandedMetric === "weight" ? `${colors.red}80` : colors.border,
                        borderWidth: 1,
                        padding: 12,
                        borderRadius: 16,
                        justifyContent: "space-between",
                        minHeight: 106,
                    }}
                >
                    <View className="flex-row items-center">
                        <Text variant="caption" className="font-semibold text-foreground opacity-80">
                            体重
                        </Text>
                    </View>

                    <View className="mb-2 mt-1.5 flex-row items-baseline">
                        <Text className="text-[28px] font-extrabold tracking-[-1px] text-foreground">
                            {loading ? "-" : (weightVal ?? "-")}
                        </Text>
                        <Text variant="caption" className="ml-1 font-semibold text-foreground opacity-50">
                            kg
                        </Text>
                    </View>

                    {/* 趋势标签 */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        alignSelf: "flex-start",
                        backgroundColor: trendBgColor,
                        paddingHorizontal: 7,
                        paddingVertical: 3,
                        borderRadius: 6,
                        gap: 2
                    }}>
                        <Text style={{ color: trendColor, fontSize: 10, fontWeight: "700" }}>
                            {trendText}
                        </Text>
                    </View>

                    <Text className="mt-2 text-[10px] font-semibold text-muted-foreground" numberOfLines={2}>
                        {targetWeight != null && weightGap != null
                            ? `目标 ${targetWeight}kg · ${weightGap === 0 ? "已达成" : `${weightGap > 0 ? "高于" : "低于"}目标 ${Math.abs(weightGap).toFixed(1)}kg`}`
                            : "设置目标体重后显示差距"}
                    </Text>
                </Pressable>

                {/* 右侧辅助卡片区 */}
                <View className="flex-1 gap-2.5">

                    {/* 右上卡片（体脂率） */}
                    <Pressable
                        onPress={() => setExpandedMetric(expandedMetric === "bodyFat" ? null : "bodyFat")}
                        style={{
                            flex: 1,
                            backgroundColor: colors.gray3,
                            borderColor: expandedMetric === "bodyFat" ? `${colors.red}80` : colors.border,
                            borderWidth: 1,
                            padding: 9,
                            borderRadius: 16,
                            justifyContent: "space-between",
                        }}
                    >
                        <Text className="text-[11px] font-semibold text-foreground opacity-80">
                            体脂率
                        </Text>
                        <View className="mt-0.5 flex-row items-end justify-between">
                            <View className="flex-row items-baseline">
                                <Text className="text-[17px] font-extrabold text-foreground">
                                    {loading ? "-" : (bodyFatVal ?? "-")}
                                </Text>
                                <Text className="ml-0.5 text-[9px] font-semibold text-foreground opacity-50">%</Text>
                            </View>
                            {bodyFatVal && (
                                <View style={{ backgroundColor: bodyFatStatusBg, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 }}>
                                    <Text style={{ fontSize: 9, color: bodyFatStatusColor, fontWeight: "700" }}>
                                        {bodyFatStatusText}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text className="mt-[3px] text-[9px] font-semibold text-muted-foreground" numberOfLines={2}>
                            {targetBodyFat != null && bodyFatGap != null
                                ? `目标 ${targetBodyFat}% · ${bodyFatGap === 0 ? "已达成" : `${bodyFatGap > 0 ? "高于" : "低于"}目标 ${Math.abs(bodyFatGap).toFixed(1)}%`}`
                                : "设置目标体脂后显示差距"}
                        </Text>
                    </Pressable>

                    {/* 右下卡片（BMI） */}
                    <Card
                        style={{
                            backgroundColor: colors.gray3,
                            borderColor: colors.border,
                        }}
                        className="flex-1 justify-between rounded-2xl border p-[9px]"
                    >
                        <Text className="text-[11px] font-semibold text-foreground opacity-80">
                            BMI
                        </Text>
                        <View className="mt-0.5 flex-row items-end justify-between">
                            <Text className="text-[17px] font-extrabold text-foreground">
                                {loading ? "-" : bmiVal}
                            </Text>
                            <View style={{ backgroundColor: bmiStatus.bg, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 }}>
                                <Text style={{ fontSize: 9, color: bmiStatus.color, fontWeight: "700" }}>
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
