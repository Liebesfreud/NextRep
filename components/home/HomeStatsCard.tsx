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
        <Card className="flex-1 justify-around p-4">
            <View className="mb-4 gap-1">
                <View className="mb-1 flex-row items-center gap-2">
                    <Flame size={14} color={colors.orange} />
                    <Text variant="caption">消耗</Text>
                </View>
                <View className="flex-row items-baseline gap-1">
                    {isAiPredicting ? (
                        <Text className="text-lg text-muted-foreground">计算中...</Text>
                    ) : (
                        <Text className="text-2xl font-semibold">{displayCal}</Text>
                    )}
                    {!isAiPredicting && <Text variant="caption">千卡</Text>}
                </View>
            </View>

            <Separator className="my-0.5" />

            <View className="mt-4 gap-1">
                <View className="mb-1 flex-row items-center gap-2">
                    <Layers size={14} color={colors.green} />
                    <Text variant="caption">总组数</Text>
                </View>
                <View className="flex-row items-baseline gap-1">
                    <Text className="text-2xl font-semibold">{totalSets}</Text>
                    <Text variant="caption">组</Text>
                </View>
            </View>
        </Card>
    );
}
