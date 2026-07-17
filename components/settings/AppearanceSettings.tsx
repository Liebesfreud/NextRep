import { View } from "react-native";
import { Monitor, Moon, Sun } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";

export function AppearanceSettings() {
  const { colors, preference, setTheme } = useTheme();

  return (
    <Card className="gap-4 p-card-padding">
      <View className="flex-row items-center gap-2">
        <Moon size={18} color={colors.accent} />
        <Text variant="subheading">外观</Text>
      </View>

      <View className="gap-3 rounded-lg bg-surface-elevated p-card-padding">
        <Text variant="body-semibold">显示模式</Text>
        <View className="flex-row gap-2">
          {(["light", "dark", "system"] as const).map((mode) => {
            const selected = preference === mode;
            const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;
            return (
              <Button
                key={mode}
                onPress={() => setTheme(mode)}
                variant={selected ? "secondary" : "ghost"}
                className="h-12 flex-1 rounded-md px-2"
                accessibilityLabel={`${mode === "light" ? "浅色" : mode === "dark" ? "深色" : "跟随系统"}模式`}
              >
                <Icon size={16} color={selected ? colors.foreground : colors.textSecondary} />
                <ButtonText variant={selected ? "secondary" : "ghost"} className={selected ? "font-semibold text-foreground" : "text-muted-foreground"}>
                  {mode === "light" ? "浅色" : mode === "dark" ? "深色" : "系统"}
                </ButtonText>
              </Button>
            );
          })}
        </View>
      </View>
    </Card>
  );
}
