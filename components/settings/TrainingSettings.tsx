import { View } from "react-native";
import { ChevronRight, Dumbbell, Library } from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

export function TrainingSettings() {
    const { colors } = useTheme();

    return (
        <Card className="gap-4 p-card-padding">
            <View className="flex-row items-center gap-2">
                <Dumbbell size={18} color={colors.accent} />
                <Text variant="subheading">训练设置</Text>
            </View>
            <AnimatedPressable
                onPress={() => router.push("/settings/exercises")}
                className="flex-row items-center gap-3 rounded-lg bg-surface-elevated p-card-padding"
                accessibilityRole="button"
                accessibilityLabel="打开动作库"
            >
                <View className="h-10 w-10 items-center justify-center rounded-md bg-surface-hover">
                    <Library size={18} color={colors.foreground} />
                </View>
                <View className="min-w-0 flex-1">
                    <Text variant="body-semibold">动作库</Text>
                </View>
                <ChevronRight size={18} color={colors.textTertiary} />
            </AnimatedPressable>
        </Card>
    );
}
