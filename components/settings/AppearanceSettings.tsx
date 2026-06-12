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
    const themeLabel = preference === "system"
        ? `系统 · ${isDark ? "深色" : "浅色"}`
        : isDark ? "深色" : "浅色";

    return (
        <Card className="overflow-hidden p-0">
            <View className="flex-row items-center gap-2 px-3.5 py-3">
                {isDark
                    ? <Moon size={14} color={colors.gray4} />
                    : <Sun size={14} color={colors.gray4} />}
                <Text variant="caption" className="font-semibold">
                    外观
                </Text>
            </View>
            <Separator />

            <View className="flex-row items-center px-3.5 py-3.5">
                <View className="mr-3 h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-muted">
                    {isDark
                        ? <Moon size={16} color={colors.foreground} />
                        : <Sun size={16} color={colors.foreground} />}
                </View>
                <View className="flex-1">
                    <Text variant="label">深色模式</Text>
                    <Text variant="caption" className="mt-0.5">
                        {themeLabel}
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
                            <ButtonText
                                variant={preference === p ? "secondary" : "ghost"}
                                size="sm"
                                className={preference === p ? "font-medium" : "text-muted-foreground"}
                            >
                                {p === "light" ? "浅色" : p === "dark" ? "深色" : "系统"}
                            </ButtonText>
                        </Button>
                    ))}
                </View>
            </View>
        </Card>
    );
}
