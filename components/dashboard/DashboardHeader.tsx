import { View } from "react-native";
import { LayoutDashboard } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Text } from "@/components/ui/text";

export function DashboardHeader() {
    const { colors } = useTheme();

    return (
        <View className="flex-row items-center gap-2 px-1 pt-2">
            <LayoutDashboard size={18} color={colors.white} />
            <Text variant="title" className="font-semibold">
                数据看板
            </Text>
        </View>
    );
}
