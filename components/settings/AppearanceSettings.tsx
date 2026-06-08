import { View } from "react-native";
import { Moon, Sun } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";

export function AppearanceSettings() {
    const { colors, theme, preference, setTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <Card className="overflow-hidden p-0">
            {/* Section Header */}
            <View className="flex-row items-center gap-2 px-3.5 py-3">
                {isDark
                    ? <Moon size={14} color={colors.gray4} />
                    : <Sun size={14} color={colors.gray4} />}
                <Text variant="caption" className="font-extrabold uppercase tracking-[1.5px]">
                    外观与显示
                </Text>
            </View>
            <Separator />

            {/* Dark Mode Row */}
            <View className="flex-row items-center px-3.5 py-3.5">
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
                    <Text variant="label">深色模式</Text>
                    <Text variant="caption" className="mt-0.5 font-semibold">
                        {preference === "system" ? `跟随系统 (${isDark ? "暗夜" : "日间"})` : (isDark ? "当前: 暗夜模式" : "当前: 日间模式")}
                    </Text>
                </View>
                <View className="flex-row rounded-lg bg-muted/80 p-0.5">
                    {(["light", "dark", "system"] as const).map(p => (
                        <Button
                            key={p}
                            onPress={() => setTheme(p)}
                            variant={preference === p ? "secondary" : "ghost"}
                            size="sm"
                            className="h-auto rounded-md px-2.5 py-1.5"
                        >
                            <ButtonText variant={preference === p ? "secondary" : "ghost"} size="sm" className={preference === p ? "font-bold" : "font-medium text-muted-foreground"}>
                                {p === "light" ? "日间" : p === "dark" ? "暗夜" : "系统"}
                            </ButtonText>
                        </Button>
                    ))}
                </View>
            </View>
        </Card>
    );
}
