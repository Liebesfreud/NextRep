import { View, Text, Switch } from "react-native";
import { Moon, Sun } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

export function AppearanceSettings() {
    const { colors, theme, toggleTheme } = useTheme();

    return (
        <View style={{ backgroundColor: colors.bento, borderColor: colors.border }} className="rounded-bento-lg border p-4 gap-4">
            <View className="flex-row items-center gap-2 px-1">
                {theme === "dark" ? <Moon size={18} color={colors.gray4} /> : <Sun size={18} color={colors.gray4} />}
                <Text style={{ color: colors.gray4 }} className="text-xs font-extrabold tracking-widest uppercase">外观与显示</Text>
            </View>
            <View style={{ backgroundColor: colors.gray2, borderColor: colors.border }} className="flex-row items-center justify-between p-4 rounded-bento-sm border">
                <Text style={{ color: colors.white }} className="font-bold text-base">深色模式</Text>
                <Switch
                    value={theme === "dark"}
                    onValueChange={() => toggleTheme()}
                    trackColor={{ false: colors.gray4, true: colors.green }}
                    thumbColor={colors.white}
                />
            </View>
        </View>
    );
}
