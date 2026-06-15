import { View } from "react-native";
import { Activity, Sparkles } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { type AiReportData } from "@/db/services/ai";
import { useTheme } from "@/hooks/useTheme";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

type Props = {
    report: AiReportData | null;
    coachLine: string;
};

export function CoachInsightCard({ report, coachLine }: Props) {
    const { colors } = useTheme();
    const score = report?.intensityScore ?? 0;

    return (
        <Animated.View entering={FadeInDown.duration(300).springify()}>
            <Card className="gap-4 p-card-padding">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <Sparkles size={18} color={colors.accent} />
                        <Text variant="subheading">教练结论</Text>
                    </View>
                    <Activity size={18} color={colors.textTertiary} />
                </View>

                <View className="min-h-[148px] justify-between rounded-lg bg-surface-elevated p-card-padding">
                    <View className="flex-row items-start justify-between gap-4">
                        <View className="min-w-0 flex-1 gap-2">
                            <Text variant="micro" className="text-muted-foreground">今日训练强度</Text>
                            <Text variant="subheading">{report ? coachLine : "等待状态分析"}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-large-stat text-accent font-variant-numeric-tabular-nums">{score}</Text>
                            <Text variant="micro" className="text-muted-foreground font-variant-numeric-tabular-nums">/ 100</Text>
                        </View>
                    </View>
                    <Text variant="body" className="mt-4 text-muted-foreground">
                        {report?.overallEvaluation ?? "暂无建议"}
                    </Text>
                </View>
            </Card>
        </Animated.View>
    );
}
