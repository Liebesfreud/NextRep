import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export function DashboardHeader() {
    const { colors } = useTheme();

    return (
        <View className="flex-row items-end justify-between pt-2 px-1">
            <View>
                <Text style={{ color: colors.white }} className="text-2xl font-black leading-none">数据看板</Text>
                <Text style={{ color: colors.gray4, opacity: 0.6 }} className="text-xs font-bold tracking-widest mt-1.5 uppercase">
                    Performance Insights
                </Text>
            </View>
            <View style={{ backgroundColor: colors.border, borderColor: colors.border, borderWidth: 1 }}
                className="px-2 py-1 rounded-lg flex-row items-center gap-1.5">
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green }} />
                <Text style={{ color: colors.gray4 }} className="text-xs font-bold">LIVE DATA</Text>
            </View>
        </View>
    );
}
