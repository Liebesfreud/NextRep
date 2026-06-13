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
        <Card className="min-w-0 flex-1 justify-around p-3">
            <View>
                <View className="flex-row items-center gap-2">
                    <Flame size={14} color={colors.orange} />
                    {isAiPredicting ? (
                        <Text className="text-lg font-medium text-muted-foreground">计算中...</Text>
                    ) : (
                        <Text className="text-2xl font-bold font-variant-numeric-tabular-nums">{displayCal}</Text>
                    )}
                    {!isAiPredicting && <Text variant="caption" className="font-normal">千卡</Text>}
                </View>
            </View>

            <Separator className="my-2" />

            <View>
                <View className="flex-row items-center gap-2">
                    <Layers size={14} color={colors.green} />
                    <Text className="text-2xl font-bold font-variant-numeric-tabular-nums">{totalSets}</Text>
                    <Text variant="caption" className="font-normal">组</Text>
                </View>
            </View>
        </Card>
    );
}
