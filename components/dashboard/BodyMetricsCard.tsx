import { View, Text, Pressable } from "react-native";
import { Scale, TrendingUp, TrendingDown } from "lucide-react-native";
import Svg, { Polyline, Defs, LinearGradient, Stop } from "react-native-svg";
import { useTheme } from "@/hooks/useTheme";

function formatDaysAgo(days: number | null | undefined) {
    if (days === null || days === undefined) return "暂无记录";
    if (days === 0) return "今天";
    if (days === 1) return "1天前";
    return `${days}天前`;
}

function buildSparklinePoints(values: number[]) {
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
}

type Props = {
    data: any;
    loading: boolean;
    expandedMetric: "weight" | "bodyFat" | null;
    setExpandedMetric: (metric: "weight" | "bodyFat" | null) => void;
};

export function BodyMetricsCard({ data, loading, expandedMetric, setExpandedMetric }: Props) {
    const { colors } = useTheme();

    return (
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
                            onPress={() => setExpandedMetric(expandedMetric === metricType ? null : metricType)}
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
    );
}
