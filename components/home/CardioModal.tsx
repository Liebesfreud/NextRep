import { useState, useEffect } from "react";
import { View, Pressable, Keyboard } from "react-native";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { X, ChevronLeft, Activity, Plus, Timer, Flame, Trash2 } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { type WorkoutItem } from "@/db/services/workout";
import { CARDIO_EXERCISES, getCardioExerciseVisual } from "@/constants/exerciseVisuals";
import { Button, ButtonText } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        setTimeout(callback, delay);
    };

    const handleClose = () => {
        Keyboard.dismiss();
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
        <BottomSheetModal
            visible={visible}
            onClose={onClose}
            sheetHeight="75%"
            backgroundColor={colors.bento}
            avoidKeyboard
        >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                {modalStep === "form" && !initialWorkout ? (
                    <Pressable
                        onPress={() => dismissKeyboardAndRun(() => {
                            setModalStep("select");
                            setSelectedExercise("");
                        })}
                        style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                    >
                        <ChevronLeft size={20} color={colors.orange} />
                        <Text style={{ color: colors.orange, fontWeight: "bold", fontSize: 14 }}>返回</Text>
                    </Pressable>
                ) : (
                    <Text style={{ color: colors.white, fontSize: 24, fontWeight: "800", letterSpacing: -0.5 }}>
                        {initialWorkout ? "修改有氧运动" : "添加有氧运动"}
                    </Text>
                )}
                <Pressable
                    onPress={handleClose}
                    style={{ backgroundColor: colors.gray3, width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" }}
                >
                    <X size={20} color={colors.gray4} />
                </Pressable>
            </View>

            {modalStep === "select" ? (
                <View style={{ gap: 12 }}>
                    {CARDIO_EXERCISES.map((ex, i) => {
                        const visual = getCardioExerciseVisual(ex, colors);
                        const Icon = visual.icon;

                        return (
                            <Pressable
                                key={i}
                                onPress={() => { setSelectedExercise(ex); setModalStep("form"); }}
                                style={{
                                    backgroundColor: visual.cardBg ?? colors.gray2,
                                    borderWidth: 0.75,
                                    borderColor: `${visual.accent}26`,
                                    width: "100%",
                                    padding: 18,
                                    borderRadius: 18,
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                                    <View style={{ backgroundColor: visual.iconBg, width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" }}>
                                        <Icon size={20} color={visual.accent} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: colors.white, fontWeight: "bold", fontSize: 18, marginBottom: 6 }}>{ex}</Text>
                                        <Text style={{ color: visual.accent, fontSize: 12, fontWeight: "700" }}>{visual.label}</Text>
                                    </View>
                                </View>
                                <Plus size={20} color={visual.accent} />
                            </Pressable>
                        );
                    })}
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {(() => {
                        const visual = getCardioExerciseVisual(selectedExercise, colors);
                        const Icon = visual.icon;

                        return (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
                                <View style={{ backgroundColor: visual.iconBg, width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                                    <Icon size={24} color={visual.accent} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.white, fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>{selectedExercise}</Text>
                                    <Text style={{ color: visual.accent, fontSize: 12, fontWeight: "700" }}>{visual.label}</Text>
                                </View>
                            </View>
                        );
                    })()}
                    <View style={{ gap: 16, flex: 1 }}>
                        <View>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                <Timer size={14} color={colors.gray4} />
                                <Text style={{ color: colors.gray4, fontSize: 12, fontWeight: "bold", letterSpacing: 1 }}>时长 (分钟)</Text>
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
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                <Flame size={14} color={colors.gray4} />
                                <Text style={{ color: colors.gray4, fontSize: 12, fontWeight: "bold", letterSpacing: 1 }}>消耗 (千卡)</Text>
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
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 24 }}>
                        {initialWorkout && (
                            <Button onPress={() => onDelete(initialWorkout.id)} disabled={isPending} variant="destructive" className="w-16 bg-destructive/10 py-4">
                                <Trash2 size={20} color={colors.red} />
                            </Button>
                        )}
                        <Button onPress={handleSave} disabled={isPending || !selectedExercise} className="flex-1 py-4">
                            <ButtonText className="text-lg">
                                {isPending ? "保存中..." : "保存记录"}
                            </ButtonText>
                        </Button>
                    </View>
                </View>
            )}
        </BottomSheetModal>
    );
}
