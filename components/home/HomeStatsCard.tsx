import { View, Text } from "react-native";
import { Flame, Layers } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

type Props = {
    displayCal: number;
    totalSets: number;
    isAiPredicting: boolean;
};

export function HomeStatsCard({ displayCal, totalSets, isAiPredicting }: Props) {
    const { colors } = useTheme();

    return (
        <View
            style={{ backgroundColor: colors.bento, borderColor: colors.border, flex: 1 }}
            className="rounded-bento-lg border p-3 justify-around"
        >
            <View className="mb-3">
                <View className="flex-row items-center gap-1 mb-1">
                    <Flame size={14} color={colors.orange} />
                    <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-widest">燃脂</Text>
                </View>
                <View className="flex-row items-baseline gap-1">
                    {isAiPredicting ? (
                        <Text style={{ color: colors.white, opacity: 0.5 }} className="text-lg">预测中...</Text>
                    ) : (
                        <Text style={{ color: colors.white }} className="text-2xl font-extrabold">{displayCal}</Text>
                    )}
                    {!isAiPredicting && <Text style={{ color: colors.gray4 }} className="text-xs font-bold">千卡</Text>}
                </View>
            </View>

            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 2 }} />

            <View className="mt-3">
                <View className="flex-row items-center gap-1 mb-1">
                    <Layers size={14} color={colors.green} />
                    <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-widest">组数</Text>
                </View>
                <View className="flex-row items-baseline gap-1">
                    <Text style={{ color: colors.white }} className="text-2xl font-extrabold">{totalSets}</Text>
                    <Text style={{ color: colors.gray4 }} className="text-xs font-bold">组</Text>
                </View>
            </View>
        </View>
    );
}
