import { View } from "react-native";
import { Activity, Dumbbell, Plus, Target } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { type AiReportData } from "@/db/services/ai";
import { useTheme } from "@/hooks/useTheme";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

export type PlanItem = AiReportData["todaysPlan"][number];

type Props = {
    plan: PlanItem[];
    isApplying: boolean;
    onApply: () => void;
};

function PlanRow({ item, index }: { item: PlanItem; index: number }) {
    const { colors } = useTheme();
    const isCardio = item.type === "cardio";
    const Icon = isCardio ? Activity : Dumbbell;

    return (
        <View className="flex-row items-center gap-3 rounded-lg bg-surface-elevated p-3">
            <View className={isCardio ? "h-10 w-10 items-center justify-center rounded-md bg-accent/10" : "h-10 w-10 items-center justify-center rounded-md bg-surface-hover"}>
                <Icon size={18} color={isCardio ? colors.accent : colors.foreground} />
            </View>
            <View className="min-w-0 flex-1">
                <Text variant="body-semibold" numberOfLines={1}>{item.name}</Text>
                <Text variant="micro" className="mt-1 text-muted-foreground">{isCardio ? "有氧训练" : `第 ${index + 1} 项 · 力量训练`}</Text>
            </View>
            <Text variant="caption" className="max-w-28 text-right text-muted-foreground font-variant-numeric-tabular-nums">
                {item.sets || item.stats || "待定"}
            </Text>
        </View>
    );
}

export function CoachPlanSection({ plan, isApplying, onApply }: Props) {
    const { colors } = useTheme();

    return (
        <>
            <Animated.View entering={FadeInDown.delay(60).duration(300).springify()}>
                <Card className="gap-4 p-card-padding">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <Target size={18} color={colors.accent} />
                            <Text variant="subheading">今日计划</Text>
                        </View>
                        {plan.length > 0 && (
                            <Text variant="micro" className="text-muted-foreground font-variant-numeric-tabular-nums">{plan.length} 个项目</Text>
                        )}
                    </View>

                    {plan.length > 0 ? (
                        <View className="gap-2">
                            {plan.map((item, index) => <PlanRow key={`${item.name}-${index}`} item={item} index={index} />)}
                        </View>
                    ) : (
                        <View className="items-center justify-center rounded-lg border border-dashed border-border bg-surface-elevated py-8">
                            <Dumbbell size={24} color={colors.textTertiary} />
                            <Text variant="body-semibold" className="mt-3">等待生成今日计划</Text>
                            <Text variant="caption" className="mt-1 text-muted-foreground">计划会根据教练结论自动生成</Text>
                        </View>
                    )}

                    <Button variant="accent" loading={isApplying} disabled={plan.length === 0} onPress={onApply}>
                        {!isApplying && <Plus size={16} color={colors.white} />}
                        <ButtonText variant="accent">加入今日训练</ButtonText>
                    </Button>
                </Card>
            </Animated.View>
        </>
    );
}
