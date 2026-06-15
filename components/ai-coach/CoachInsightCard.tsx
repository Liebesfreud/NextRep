import { View } from "react-native";
import { AlertCircle, RefreshCw, Settings2, Sparkles } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { type AiReportData } from "@/db/services/ai";
import { useTheme } from "@/hooks/useTheme";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

type Props = {
    report: AiReportData | null;
    coachLine: string;
    isLoading: boolean;
    isConfigured: boolean;
    configLabel: string | null;
    error: string | null;
    onGenerate: () => void;
    onOpenSettings: () => void;
};

export function CoachInsightCard({
    report,
    coachLine,
    isLoading,
    isConfigured,
    configLabel,
    error,
    onGenerate,
    onOpenSettings,
}: Props) {
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
                    {isConfigured && configLabel ? (
                        <View className="max-w-36 rounded-pill border border-border bg-surface-elevated px-3 py-1.5">
                            <Text variant="micro" className="text-foreground" numberOfLines={1}>{configLabel}</Text>
                        </View>
                    ) : null}
                </View>

                {report ? (
                    <View className="gap-4">
                        <View className="gap-4 rounded-lg bg-surface-elevated p-card-padding">
                            <View className="flex-row items-start justify-between gap-4">
                                <View className="min-w-0 flex-1 gap-2">
                                    <Text variant="micro" className="text-muted-foreground">今日训练强度</Text>
                                    <Text variant="subheading">{coachLine}</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-large-stat text-accent font-variant-numeric-tabular-nums">{score}</Text>
                                    <Text variant="micro" className="text-muted-foreground font-variant-numeric-tabular-nums">/ 100</Text>
                                </View>
                            </View>
                            <Text variant="body" className="text-muted-foreground">{report.overallEvaluation}</Text>
                        </View>

                        <Button variant="outline" size="sm" loading={isLoading} onPress={onGenerate}>
                            {!isLoading && <RefreshCw size={16} color={colors.foreground} />}
                            <ButtonText variant="outline" size="sm">重新生成</ButtonText>
                        </Button>
                    </View>
                ) : (
                    <View className="gap-4 rounded-lg bg-surface-elevated p-card-padding">
                        <View className="gap-2">
                            <Text variant="body-semibold">{isConfigured ? "生成今天的训练结论" : "尚未连接 AI 教练"}</Text>
                            <Text variant="body" className="text-muted-foreground">
                                {isConfigured ? "结合近期训练、身体数据和动作库，直接给出结论与计划。" : "完成 AI 配置后即可生成个性化结论与今日计划。"}
                            </Text>
                        </View>
                        <Button variant={isConfigured ? "accent" : "secondary"} size="lg" loading={isLoading} onPress={isConfigured ? onGenerate : onOpenSettings}>
                            {!isLoading && (isConfigured
                                ? <Sparkles size={18} color={colors.white} />
                                : <Settings2 size={18} color={colors.foreground} />)}
                            <ButtonText variant={isConfigured ? "accent" : "secondary"} size="lg">
                                {isConfigured ? "生成今日建议" : "前往 AI 设置"}
                            </ButtonText>
                        </Button>
                    </View>
                )}

                {error && (
                    <View className="flex-row items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                        <AlertCircle size={17} color={colors.red} />
                        <Text variant="caption" className="min-w-0 flex-1 text-destructive">{error}</Text>
                    </View>
                )}
            </Card>
        </Animated.View>
    );
}
