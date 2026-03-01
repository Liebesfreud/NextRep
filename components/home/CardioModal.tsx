import { useState, useEffect } from "react";
import { View, Text, Pressable, Modal, TextInput } from "react-native";
import { X, ChevronLeft, Activity, Plus, Timer, Flame, Trash2 } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { type WorkoutItem } from "@/db/services/workout";

const CARDIO_EXERCISES = ["跑步机", "椭圆机", "爬楼机"];

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
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
                onPress={onClose}>
                <Pressable onPress={() => { }} style={{ backgroundColor: colors.bento, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, height: "75%" }}>
                    <View className="flex-row justify-between items-center mb-6">
                        {modalStep === "form" && !initialWorkout ? (
                            <Pressable onPress={() => { setModalStep("select"); setSelectedExercise(""); }}
                                className="flex-row items-center gap-1">
                                <ChevronLeft size={20} color={colors.orange} />
                                <Text style={{ color: colors.orange }} className="font-bold text-sm">返回</Text>
                            </Pressable>
                        ) : (
                            <Text style={{ color: colors.white }} className="text-2xl font-extrabold tracking-tight">
                                {initialWorkout ? "修改有氧运动" : "添加有氧运动"}
                            </Text>
                        )}
                        <Pressable onPress={onClose}
                            style={{ backgroundColor: colors.gray3 }}
                            className="w-8 h-8 rounded-lg items-center justify-center">
                            <X size={20} color={colors.gray4} />
                        </Pressable>
                    </View>

                    {modalStep === "select" ? (
                        <View className="gap-3">
                            {CARDIO_EXERCISES.map((ex, i) => (
                                <Pressable key={i} onPress={() => { setSelectedExercise(ex); setModalStep("form"); }}
                                    style={{ backgroundColor: colors.gray2 }}
                                    className="w-full p-5 rounded-2xl flex-row justify-between items-center">
                                    <View className="flex-row items-center gap-3">
                                        <Activity size={20} color={colors.orange} />
                                        <Text style={{ color: colors.white }} className="font-bold text-lg">{ex}</Text>
                                    </View>
                                    <Plus size={20} color={colors.gray4} />
                                </Pressable>
                            ))}
                        </View>
                    ) : (
                        <View className="flex-1">
                            <View className="flex-row items-center gap-3 mb-6">
                                <View style={{ backgroundColor: `${colors.orange}33` }} className="w-12 h-12 rounded-xl items-center justify-center">
                                    <Activity size={24} color={colors.orange} />
                                </View>
                                <Text style={{ color: colors.white }} className="text-xl font-bold">{selectedExercise}</Text>
                            </View>
                            <View className="gap-4 flex-1">
                                <View>
                                    <View className="flex-row items-center gap-1.5 mb-2">
                                        <Timer size={14} color={colors.gray4} />
                                        <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider">时长 (分钟)</Text>
                                    </View>
                                    <TextInput
                                        keyboardType="number-pad"
                                        value={formDuration}
                                        onChangeText={setFormDuration}
                                        placeholder="例如 30"
                                        placeholderTextColor={`${colors.gray4}66`}
                                        style={{ color: colors.white, backgroundColor: colors.gray2, padding: 16, borderRadius: 12, fontWeight: "bold", fontSize: 18, borderWidth: 1, borderColor: `${colors.gray3}4D` }}
                                    />
                                </View>
                                <View>
                                    <View className="flex-row items-center gap-1.5 mb-2">
                                        <Flame size={14} color={colors.gray4} />
                                        <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider">消耗 (千卡)</Text>
                                    </View>
                                    <TextInput
                                        keyboardType="number-pad"
                                        value={formCalories}
                                        onChangeText={setFormCalories}
                                        placeholder="例如 300"
                                        placeholderTextColor={`${colors.gray4}66`}
                                        style={{ color: colors.white, backgroundColor: colors.gray2, padding: 16, borderRadius: 12, fontWeight: "bold", fontSize: 18, borderWidth: 1, borderColor: `${colors.gray3}4D` }}
                                    />
                                </View>
                            </View>
                            <View className="flex-row gap-2 mt-6">
                                {initialWorkout && (
                                    <Pressable onPress={() => onDelete(initialWorkout.id)} disabled={isPending}
                                        style={{ backgroundColor: `${colors.red}1A`, width: 64, opacity: isPending ? 0.5 : 1 }}
                                        className="py-4 rounded-xl items-center justify-center">
                                        <Trash2 size={20} color={colors.red} />
                                    </Pressable>
                                )}
                                <Pressable onPress={handleSave} disabled={isPending || !selectedExercise}
                                    style={{ backgroundColor: colors.orange, flex: 1, opacity: (isPending || !selectedExercise) ? 0.5 : 1 }}
                                    className="py-4 rounded-xl items-center">
                                    <Text className="font-bold text-lg text-black">
                                        {isPending ? "保存中..." : "保存记录"}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
}
