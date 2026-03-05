import { View, Text, Switch } from "react-native";
import { Moon, Sun } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

export function AppearanceSettings() {
    const { colors, theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <View style={{
            backgroundColor: colors.bento,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            overflow: "hidden",
        }}>
            {/* Section Header */}
            <View style={{
                flexDirection: "row", alignItems: "center", gap: 8,
                paddingHorizontal: 14, paddingVertical: 12,
                borderBottomWidth: 1, borderBottomColor: colors.border,
            }}>
                {isDark
                    ? <Moon size={14} color={colors.gray4} />
                    : <Sun size={14} color={colors.gray4} />}
                <Text style={{ color: colors.gray4, fontSize: 11, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase" }}>
                    外观与显示
                </Text>
            </View>

            {/* Dark Mode Row */}
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 13 }}>
                <View style={{
                    width: 34, height: 34, borderRadius: 10,
                    backgroundColor: isDark ? `${colors.green}1A` : `${colors.orange}1A`,
                    alignItems: "center", justifyContent: "center",
                    marginRight: 12,
                }}>
                    {isDark
                        ? <Moon size={16} color={colors.green} />
                        : <Sun size={16} color={colors.orange} />}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.white, fontWeight: "700", fontSize: 14 }}>深色模式</Text>
                    <Text style={{ color: colors.gray4, fontSize: 11, fontWeight: "600", marginTop: 1 }}>
                        {isDark ? "当前: 暗夜模式" : "当前: 日间模式"}
                    </Text>
                </View>
                <Switch
                    value={isDark}
                    onValueChange={() => toggleTheme()}
                    trackColor={{ false: colors.gray3, true: `${colors.green}99` }}
                    thumbColor={isDark ? colors.green : colors.gray4}
                />
            </View>
        </View>
    );
}
