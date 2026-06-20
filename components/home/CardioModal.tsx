import { useState, useEffect, useRef } from "react";
import { View, ScrollView, Keyboard } from "react-native";
import { X, ChevronLeft, Plus, Timer, Flame, Trash2 } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { type WorkoutItem } from "@/db/services/workout";
import { CARDIO_EXERCISES, getCardioExerciseVisual } from "@/constants/exerciseVisuals";
import { Button, ButtonText } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";

type Props = {
    visible: boolean;
    onClose: () => void;
    initialWorkout: WorkoutItem | null;
    onSave: (payload: any) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    isPending: boolean;
};

export function CardioModal({
    visible, onClose, initialWorkout,
    onSave, onDelete, isPending
}: Props) {
    const { colors } = useTheme();

    const [modalStep, setModalStep] = useState<"select" | "form">("select");
    const [selectedExercise, setSelectedExercise] = useState("");
    const [formDuration, setFormDuration] = useState("");
    const [formCalories, setFormCalories] = useState("");
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    useEffect(() => {
        if (!visible) return;
        if (initialWorkout) {
            setModalStep("form");
            setSelectedExercise(initialWorkout.name);
            const mMin = initialWorkout.stats?.match(/(\d+)\s*分钟/);
            const mCal = initialWorkout.stats?.match(/(\d+)\s*千卡/);
            setFormDuration(mMin ? mMin[1] : "");
            setFormCalories(mCal ? mCal[1] : "");
        } else {
            setModalStep("select");
            setSelectedExercise("");
            setFormDuration(""); setFormCalories("");
        }
    }, [visible, initialWorkout]);

    const dismissKeyboardAndRun = (callback: () => void, delay = 80) => {
        Keyboard.dismiss();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            timeoutRef.current = null;
            callback();
        }, delay);
    };

    const handleClose = () => {
        Keyboard.dismiss();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        onClose();
    };

    const handleSave = () => {
        if (!selectedExercise) return;
        const parts: string[] = [];
        if (formDuration) parts.push(`${formDuration} 分钟`);
        if (formCalories) parts.push(`${formCalories} 千卡`);
        const payload = {
            type: "cardio" as const,
            name: selectedExercise,
            stats: parts.length ? parts.join(" • ") : undefined,
        };
        onSave(payload);
    };

    return (
        <Sheet
            visible={visible}
            onClose={onClose}
            sheetHeight="75%"
            avoidKeyboard
        >
            <View className="mb-6 flex-row items-center justify-between">
                {modalStep === "form" && !initialWorkout ? (
                    <Button
                        onPress={() => dismissKeyboardAndRun(() => {
                            setModalStep("select");
                            setSelectedExercise("");
                        })}
                        variant="ghost"
                        size="sm"
                        className="h-auto px-0 py-1"
                    >
                        <ChevronLeft size={20} color={colors.foreground} />
                        <ButtonText variant="ghost" size="sm">返回</ButtonText>
                    </Button>
                ) : (
                    <Text variant="heading" className="tracking-[-0.5px]">
                        {initialWorkout ? "修改有氧运动" : "添加有氧运动"}
                    </Text>
                )}
                <Button
                    onPress={handleClose}
                    accessibilityLabel="关闭有氧运动弹窗"
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                >
                    <X size={20} color={colors.gray4} />
                </Button>
            </View>

            {modalStep === "select" ? (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="gap-4 pb-4">
                        {CARDIO_EXERCISES.map((ex, i) => {
                            const visual = getCardioExerciseVisual(ex, colors);
                            const Icon = visual.icon;

                            return (
                                <Button
                                    key={i}
                                    onPress={() => { setSelectedExercise(ex); setModalStep("form"); }}
                                    variant="outline"
                                    className="h-auto min-h-20 w-full justify-between rounded-lg px-4 py-4 native:h-auto"
                                >
                                    <View className="flex-1 flex-row items-center gap-3">
                                        <View className="h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                                            <Icon size={20} color={colors.foreground} />
                                        </View>
                                        <View className="flex-1 justify-center gap-2">
                                            <Text variant="subheading">{ex}</Text>
                                            <Text variant="muted" className="text-xs">{visual.label}</Text>
                                        </View>
                                    </View>
                                    <Plus size={20} color={colors.mutedForeground} />
                                </Button>
                            );
                        })}
                    </View>
                </ScrollView>
            ) : (
                <View className="flex-1">
                    {(() => {
                        const visual = getCardioExerciseVisual(selectedExercise, colors);
                        const Icon = visual.icon;

                        return (
                            <View className="mb-6 flex-row items-center gap-3">
                                <View className="h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                                    <Icon size={24} color={colors.foreground} />
                                </View>
                                <View className="flex-1">
                                    <Text variant="subheading" className="mb-1">{selectedExercise}</Text>
                                    <Text variant="muted" className="text-xs">{visual.label}</Text>
                                </View>
                            </View>
                        );
                    })()}
                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <View className="gap-4">
                            <View>
                                <View className="mb-2 flex-row items-center gap-1.5">
                                    <Timer size={14} color={colors.gray4} />
                                    <Text variant="caption" className="font-bold tracking-[1px]">时长 (分钟)</Text>
                                </View>
                                <Input
                                    keyboardType="number-pad"
                                    value={formDuration}
                                    onChangeText={setFormDuration}
                                    placeholder="例如 30"
                                    className="p-4 text-lg font-bold"
                                />
                            </View>
                            <View>
                                <View className="mb-2 flex-row items-center gap-1.5">
                                    <Flame size={14} color={colors.gray4} />
                                    <Text variant="caption" className="font-bold tracking-[1px]">消耗 (千卡)</Text>
                                </View>
                                <Input
                                    keyboardType="number-pad"
                                    value={formCalories}
                                    onChangeText={setFormCalories}
                                    placeholder="例如 300"
                                    className="p-4 text-lg font-bold"
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <View className="mt-4 flex-row gap-2 border-t pt-3" style={{ borderTopColor: `${colors.gray3}4D` }}>
                        {initialWorkout && (
                            <Button
                                onPress={() => onDelete(initialWorkout.id)}
                                accessibilityLabel="删除有氧运动记录"
                                disabled={isPending}
                                variant="destructive"
                                size="lg"
                                className="w-16"
                            >
                                <Trash2 size={20} color={colors.red} />
                            </Button>
                        )}
                        <Button onPress={handleSave} disabled={isPending || !selectedExercise} size="lg" className="flex-1">
                            <ButtonText className="text-lg">
                                {isPending ? "保存中..." : "保存记录"}
                            </ButtonText>
                        </Button>
                    </View>
                </View>
            )}
        </Sheet>
    );
}
