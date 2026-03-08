import { View, Text, Pressable } from "react-native";
import { Moon, Sun } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

export function AppearanceSettings() {
    const { colors, theme, preference, setTheme } = useTheme();
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
                        {preference === "system" ? `跟随系统 (${isDark ? "暗夜" : "日间"})` : (isDark ? "当前: 暗夜模式" : "当前: 日间模式")}
                    </Text>
                </View>
                <View style={{ flexDirection: "row", backgroundColor: `${colors.gray3}80`, borderRadius: 8, padding: 2 }}>
                    {(["light", "dark", "system"] as const).map(p => (
                        <Pressable 
                            key={p} 
                            onPress={() => setTheme(p)}
                            style={{ 
                                paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6,
                                backgroundColor: preference === p ? colors.bento : "transparent",
                                shadowColor: preference === p ? "#000" : "transparent", shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: {width:0,height:1}
                            }}
                        >
                            <Text style={{ color: preference === p ? colors.white : colors.gray4, fontSize: 12, fontWeight: preference === p ? "700" : "500" }}>
                                {p === "light" ? "日间" : p === "dark" ? "暗夜" : "系统"}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        </View>
    );
}
