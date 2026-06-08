import { View } from "react-native";
import { Flame, Layers } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { LightEffect } from "@/components/ui/LightEffect";
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
        <Card className="flex-1 justify-around overflow-hidden p-3">
            <LightEffect 
                color={colors.orange} 
                opacity={0.07} 
                size={250} 
                position={{ top: -100, left: -60 }} 
            />
            
            <View className="mb-3">
                <View className="flex-row items-center gap-1 mb-1">
                    <Flame size={14} color={colors.orange} />
                    <Text variant="caption" className="font-bold tracking-widest">燃脂</Text>
                </View>
                <View className="flex-row items-baseline gap-1">
                    {isAiPredicting ? (
                        <Text className="text-lg opacity-50">预测中...</Text>
                    ) : (
                        <Text className="text-2xl font-extrabold">{displayCal}</Text>
                    )}
                    {!isAiPredicting && <Text variant="caption" className="font-bold">千卡</Text>}
                </View>
            </View>

            <Separator className="my-0.5" />

            <View className="mt-3">
                <View className="flex-row items-center gap-1 mb-1">
                    <Layers size={14} color={colors.green} />
                    <Text variant="caption" className="font-bold tracking-widest">组数</Text>
                </View>
                <View className="flex-row items-baseline gap-1">
                    <Text className="text-2xl font-extrabold">{totalSets}</Text>
                    <Text variant="caption" className="font-bold">组</Text>
                </View>
            </View>
        </Card>
    );
}
