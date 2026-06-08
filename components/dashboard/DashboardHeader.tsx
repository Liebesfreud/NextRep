import { View } from "react-native";
import { LayoutDashboard } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Text } from "@/components/ui/text";

export function DashboardHeader() {
    const { colors } = useTheme();

    return (
        <View className="flex-row items-center justify-between pt-2 px-1">
            <View className="flex-row items-center gap-3">
                <View style={{ backgroundColor: `${colors.green}22` }} className="w-10 h-10 rounded-full items-center justify-center">
                    <LayoutDashboard size={20} color={colors.green} />
                </View>
                <View>
                    <Text variant="heading" className="leading-none">数据看板</Text>
                    <Text variant="caption" className="mt-1 text-[10px] font-bold uppercase tracking-widest opacity-80">
                        Dashboard
                    </Text>
                </View>
            </View>
        </View>
    );
}
