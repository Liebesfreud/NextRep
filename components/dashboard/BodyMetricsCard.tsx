import { View, Text, Pressable } from "react-native";
import { Scale, Sparkles } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

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

    return (
        <View style={{ backgroundColor: colors.bento, borderColor: colors.border, borderWidth: 1, padding: 14, borderRadius: 16, flexDirection: "column", gap: 14 }}>
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 2 }}>
                <Scale size={16} color={colors.red} />
                <Text style={{ color: colors.white, opacity: 0.9, fontWeight: "bold", fontSize: 13, letterSpacing: 0.5, marginLeft: 6 }}>
                    身体指标
                </Text>
            </View>

            {/* 第一部分：顶部数据区 */}
            <View style={{ flexDirection: "row", gap: 12 }}>

                {/* 左侧核心卡片（体重） */}
                <Pressable
                    onPress={() => setExpandedMetric(expandedMetric === "weight" ? null : "weight")}
                    style={{
                        flex: 1.3,
                        backgroundColor: colors.gray3,
                        borderColor: expandedMetric === "weight" ? `${colors.red}80` : colors.border,
                        borderWidth: 1,
                        padding: 14,
                        borderRadius: 12,
                        justifyContent: "space-between",
                        minHeight: 120,
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={{ color: colors.white, opacity: 0.8, fontWeight: "600", fontSize: 13 }}>
                            体重
                        </Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 8, marginBottom: 12 }}>
                        <Text style={{ color: colors.white, fontSize: 32, fontWeight: "800", letterSpacing: -1 }}>
                            {loading ? "-" : (weightVal ?? "-")}
                        </Text>
                        <Text style={{ color: colors.white, opacity: 0.5, fontSize: 14, marginLeft: 4, fontWeight: "600" }}>
                            kg
                        </Text>
                    </View>

                    {/* 趋势标签 */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        alignSelf: "flex-start",
                        backgroundColor: trendBgColor,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        gap: 2
                    }}>
                        <Text style={{ color: trendColor, fontSize: 11, fontWeight: "700" }}>
                            {trendText}
                        </Text>
                    </View>
                </Pressable>

                {/* 右侧辅助卡片区 */}
                <View style={{ flex: 1, flexDirection: "column", gap: 12 }}>

                    {/* 右上卡片（体脂率） */}
                    <Pressable
                        onPress={() => setExpandedMetric(expandedMetric === "bodyFat" ? null : "bodyFat")}
                        style={{
                            flex: 1,
                            backgroundColor: colors.gray3,
                            borderColor: expandedMetric === "bodyFat" ? `${colors.red}80` : colors.border,
                            borderWidth: 1,
                            padding: 10,
                            borderRadius: 12,
                            justifyContent: "space-between",
                        }}
                    >
                        <Text style={{ color: colors.white, opacity: 0.8, fontSize: 12, fontWeight: "600" }}>
                            体脂率
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 4 }}>
                            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                                <Text style={{ color: colors.white, fontSize: 18, fontWeight: "800" }}>
                                    {loading ? "-" : (bodyFatVal ?? "-")}
                                </Text>
                                <Text style={{ color: colors.white, opacity: 0.5, fontSize: 10, marginLeft: 2, fontWeight: "600" }}>%</Text>
                            </View>
                            {bodyFatVal && (
                                <View style={{ backgroundColor: bodyFatStatusBg, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 }}>
                                    <Text style={{ fontSize: 9, color: bodyFatStatusColor, fontWeight: "700" }}>
                                        {bodyFatStatusText}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </Pressable>

                    {/* 右下卡片（BMI） */}
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: colors.gray3,
                            borderColor: colors.border,
                            borderWidth: 1,
                            padding: 10,
                            borderRadius: 12,
                            justifyContent: "space-between"
                        }}
                    >
                        <Text style={{ color: colors.white, opacity: 0.8, fontSize: 12, fontWeight: "600" }}>
                            BMI
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 4 }}>
                            <Text style={{ color: colors.white, fontSize: 18, fontWeight: "800" }}>
                                {loading ? "-" : bmiVal}
                            </Text>
                            <View style={{ backgroundColor: bmiStatus.bg, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 }}>
                                <Text style={{ fontSize: 9, color: bmiStatus.color, fontWeight: "700" }}>
                                    {bmiStatus.text}
                                </Text>
                            </View>
                        </View>
                    </View>

                </View>
            </View>

            {/* 第二部分：底部 AI 评估区 */}
            <View
                style={{
                    backgroundColor: `${colors.green}14`, // 品牌绿 8% 透明度
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: `${colors.green}20`,
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                    <Sparkles size={14} color={colors.green} />
                    <Text style={{ color: colors.green, fontWeight: "800", marginLeft: 6, fontSize: 13 }}>
                        AI 评估
                    </Text>
                </View>
                <Text style={{ color: colors.white, opacity: 0.9, fontSize: 12, lineHeight: 18 }}>
                    体重稳中有降，体脂率保持优良，继续保持当前的力量训练频率！
                </Text>
            </View>

        </View>
    );
}
