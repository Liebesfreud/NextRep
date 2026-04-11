import { View, Text } from "react-native";
import { LayoutDashboard } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

export function DashboardHeader() {
    const { colors } = useTheme();

    return (
        <View className="flex-row items-center justify-between pt-2 px-1">
            <View className="flex-row items-center gap-3">
                <View style={{ backgroundColor: `${colors.green}22` }} className="w-10 h-10 rounded-full items-center justify-center">
                    <LayoutDashboard size={20} color={colors.green} />
                </View>
                <View>
                    <Text style={{ color: colors.white }} className="text-2xl font-black leading-none">数据看板</Text>
                    <Text style={{ color: colors.gray4, opacity: 0.8 }} className="text-[10px] font-bold tracking-widest mt-1 uppercase">
                        Dashboard
                    </Text>
                </View>
            </View>
        </View>
    );
}
