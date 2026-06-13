import { View } from "react-native";
import { Moon, Sun } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { SettingsRow } from "@/components/ui/settings-row";

export function AppearanceSettings() {
  const { colors, theme, preference, setTheme } = useTheme();
  const isDark = theme === "dark";
  const themeLabel =
    preference === "system"
      ? `系统 · ${isDark ? "深色" : "浅色"}`
      : isDark
        ? "深色"
        : "浅色";

  return (
    <Card className="overflow-hidden p-0">
      <View className="px-3.5 pt-2.5 pb-1.5">
        <Text variant="caption" className="font-semibold text-tertiary">
          外观
        </Text>
      </View>

      <SettingsRow
        label="深色模式"
        desc={themeLabel}
        icon={
          isDark ? (
            <Moon size={15} color={colors.textSecondary} />
          ) : (
            <Sun size={15} color={colors.textSecondary} />
          )
        }
        value={
          <View className="flex-row rounded-md bg-surface-elevated p-0.5">
            {(["light", "dark", "system"] as const).map((p) => (
              <Button
                key={p}
                onPress={() => setTheme(p)}
                variant={preference === p ? "secondary" : "ghost"}
                size="sm"
                className="h-auto rounded-sm px-2.5 py-1.5"
              >
                <ButtonText
                  variant={preference === p ? "secondary" : "ghost"}
                  size="sm"
                  className={preference === p ? "font-medium" : "text-tertiary"}
                >
                  {p === "light" ? "浅色" : p === "dark" ? "深色" : "系统"}
                </ButtonText>
              </Button>
            ))}
          </View>
        }
        isLast
      />
    </Card>
  );
}
