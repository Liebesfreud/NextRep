import React from "react";
import { View } from "react-native";
import { Check } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { WorkoutSet } from "@/components/home/strengthModalState";

type StrengthSetRowProps = {
    item: WorkoutSet;
    onDelete: (id: string) => void;
    onToggleComplete: (id: string) => void;
    onUpdate: (id: string, field: "weight" | "reps", value: string) => void;
};

export const StrengthSetRow = React.memo(function StrengthSetRow({
    item,
    onDelete,
    onToggleComplete,
    onUpdate,
}: StrengthSetRowProps) {
    const { colors } = useTheme();

    return (
        <AnimatedPressable
            onLongPress={() => onDelete(item.id)}
            delayLongPress={500}
            className={cn(
                "mb-1 flex-row items-center rounded-md px-1 py-1.5",
                item.isCompleted && "bg-foreground/[0.03]"
            )}
        >
            <View className="w-10 items-center">
                <View
                    className="h-6 w-6 items-center justify-center rounded-md"
                    style={{
                        backgroundColor: item.isCompleted ? "transparent" : colors.gray2,
                        borderColor: item.isCompleted ? colors.orange : "transparent",
                        borderWidth: item.isCompleted ? 1 : 0,
                    }}
                >
                    <Text className="text-xs font-bold" style={{ color: item.isCompleted ? colors.orange : colors.gray4 }}>
                        {item.setNumber}
                    </Text>
                </View>
            </View>

            <View className="flex-1 px-1.5">
                <Input
                    keyboardType="decimal-pad"
                    value={item.weight}
                    onChangeText={(value) => onUpdate(item.id, "weight", value)}
                    placeholder="-"
                    selectTextOnFocus
                    className="min-h-0 rounded-lg border-0 bg-secondary px-2 py-2 text-center text-sm font-bold"
                />
            </View>

            <View className="flex-1 px-1.5">
                <Input
                    keyboardType="number-pad"
                    value={item.reps}
                    onChangeText={(value) => onUpdate(item.id, "reps", value)}
                    placeholder="-"
                    selectTextOnFocus
                    className="min-h-0 rounded-lg border-0 bg-secondary px-2 py-2 text-center text-sm font-bold"
                />
            </View>

            <View className="w-10 items-center">
                <Button
                    onPress={() => onToggleComplete(item.id)}
                    accessibilityLabel={`第 ${item.setNumber} 组${item.isCompleted ? "，已完成" : "，未完成"}`}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: item.isCompleted }}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-transparent p-0"
                >
                    <View
                        className="h-7 w-7 items-center justify-center rounded-lg"
                        style={{ backgroundColor: item.isCompleted ? colors.orange : colors.gray2 }}
                    >
                        {item.isCompleted ? (
                            <Check size={16} color={colors.primaryForeground} strokeWidth={3} />
                        ) : (
                            <View className="h-3 w-3 rounded-sm bg-foreground/10" />
                        )}
                    </View>
                </Button>
            </View>
        </AnimatedPressable>
    );
});

