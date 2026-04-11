import { View, Text } from "react-native";
import { Target } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

type Props = {
    data: any;
};

export function ExerciseAnalytics({ data }: Props) {
    const { colors } = useTheme();

    return (
        <View style={{ backgroundColor: colors.bento, borderColor: colors.border, borderWidth: 1, padding: 14, borderRadius: 16 }} className="gap-3">
            <View className="flex-row items-center justify-between px-0.5">
                <View className="flex-row items-center gap-1.5">
                    <Target size={16} color={colors.orange} />
                    <Text style={{ color: colors.white, opacity: 0.9 }} className="font-bold text-xs tracking-wide">动作分析</Text>
                </View>
            </View>

            <View style={{ backgroundColor: colors.gray3, borderWidth: 1, borderColor: colors.border, padding: 8, minHeight: 100, borderRadius: 16 }}>
                {!data?.analytics || data.analytics.length === 0 ? (
                    <View className="items-center justify-center p-4">
                        <Text style={{ color: colors.gray4 }} className="text-sm italic">暂无动作分析数据</Text>
                    </View>
                ) : data.analytics.map((exercise: any, idx: number) => (
                    <View key={idx} style={{ borderRadius: 16 }} className="flex-row items-center justify-between p-2.5">
                        <View className="flex-row items-center gap-2.5">
                            <View style={{ width: 4, height: 24, backgroundColor: `${colors.orange}CC`, borderRadius: 2 }} />
                            <View>
                                <Text style={{ color: colors.white }} className="font-medium text-sm">{exercise.name}</Text>
                                <Text style={{ color: colors.gray4 }} className="text-xs font-medium tracking-wide mt-0.5">
                                    累计 {exercise.sessions} 次训练
                                </Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <View className="flex-row items-baseline gap-0.5">
                                <Text style={{ color: colors.white }} className="font-bold text-base tracking-tight">{exercise.volume}</Text>
                                <Text style={{ color: colors.gray4 }} className="text-xs font-medium">{exercise.unit}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}
