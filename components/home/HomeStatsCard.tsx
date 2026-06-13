import { View } from "react-native";
import { Flame, Layers } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
type Props = {
    displayCal: number;
    totalSets: number;
    isAiPredicting: boolean;
};

export function HomeStatsCard({ displayCal, totalSets, isAiPredicting }: Props) {
    const { colors } = useTheme();

    return (
        <Card className="h-full min-w-0 justify-around p-2.5">
            <View className="gap-1">
                <View className="flex-row items-center gap-1.5">
                    <Flame size={13} color={colors.orange} />
                    <Text variant="micro" className="font-medium">燃脂</Text>
                </View>
                <View className="flex-row items-baseline gap-1.5">
                    {isAiPredicting ? (
                        <Text className="text-sm font-medium text-muted-foreground">计算中...</Text>
                    ) : (
                        <Text className="text-xl font-bold font-variant-numeric-tabular-nums">{displayCal}</Text>
                    )}
                    {!isAiPredicting && <Text className="text-unit text-tertiary">千卡</Text>}
                </View>
            </View>

            <Separator className="my-2" />

            <View className="gap-1">
                <View className="flex-row items-center gap-1.5">
                    <Layers size={13} color={colors.green} />
                    <Text variant="micro" className="font-medium">组数</Text>
                </View>
                <View className="flex-row items-baseline gap-1.5">
                    <Text className="text-xl font-bold font-variant-numeric-tabular-nums">{totalSets}</Text>
                    <Text className="text-unit text-tertiary">组</Text>
                </View>
            </View>
        </Card>
    );
}
