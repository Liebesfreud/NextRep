import { useState, useEffect } from "react";
import { View, Text, Pressable, Modal, ScrollView, TextInput, Alert } from "react-native";
import { X, ChevronLeft, Dumbbell, Trash2, Plus } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { type WorkoutItem, type StrengthPresetItem, removeStrengthPreset, addStrengthPreset } from "@/db/services/workout";

type Props = {
    visible: boolean;
    onClose: () => void;
    initialWorkout: WorkoutItem | null;
    presets: StrengthPresetItem[];
    onPresetsChange: React.Dispatch<React.SetStateAction<StrengthPresetItem[]>>;
    onSave: (payload: any) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    isPending: boolean;
};

export function StrengthModal({
    visible, onClose, initialWorkout,
    presets, onPresetsChange,
    onSave, onDelete, isPending
}: Props) {
    const { colors } = useTheme();

    const [modalStep, setModalStep] = useState<"select" | "form">("select");
    const [selectedExercise, setSelectedExercise] = useState("");
    const [formWeight, setFormWeight] = useState("");
    const [formSets, setFormSets] = useState("");
    const [formReps, setFormReps] = useState("");

    const [isCreatingPreset, setIsCreatingPreset] = useState(false);
    const [newPresetName, setNewPresetName] = useState("");
    const [newPresetTag, setNewPresetTag] = useState<string | null>(null);

    // Reset state when modal opens or initialWorkout changes
    useEffect(() => {
        if (!visible) return;
        if (initialWorkout) {
            setModalStep("form");
            setSelectedExercise(initialWorkout.name);
            const wMatch = initialWorkout.weight?.match(/([\d.]+)/);
            setFormWeight(wMatch ? wMatch[1] : "");
            const sMatch = initialWorkout.sets?.match(/(\d+)\s*[×x]\s*(\d+)/i);
            setFormSets(sMatch ? sMatch[1] : "");
            setFormReps(sMatch ? sMatch[2] : "");
        } else {
            setModalStep("select");
            setSelectedExercise("");
            setFormWeight(""); setFormSets(""); setFormReps("");
            setIsCreatingPreset(false);
            setNewPresetName("");
            setNewPresetTag(null);
        }
    }, [visible, initialWorkout]);

    const handleSave = () => {
        if (!selectedExercise) return;
        const payload = {
            type: "strength" as const,
            name: selectedExercise,
            weight: formWeight ? `${formWeight} kg` : undefined,
            sets: formSets && formReps ? `${formSets} × ${formReps}` : undefined,
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
                                <ChevronLeft size={20} color={colors.green} />
                                <Text style={{ color: colors.green }} className="font-bold text-sm">返回</Text>
                            </Pressable>
                        ) : (
                            <Text style={{ color: colors.white }} className="text-2xl font-extrabold tracking-tight">
                                {initialWorkout ? "修改力量训练" : "添加力量训练"}
                            </Text>
                        )}
                        <Pressable onPress={onClose}
                            style={{ backgroundColor: colors.gray3 }}
                            className="w-8 h-8 rounded-lg items-center justify-center">
                            <X size={20} color={colors.gray4} />
                        </Pressable>
                    </View>

                    {modalStep === "select" ? (
                        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                            {presets.map((ex, i) => (
                                <View key={i} className="relative mb-3">
                                    <Pressable onPress={() => { setSelectedExercise(ex.name); setModalStep("form"); }}
                                        style={{ backgroundColor: colors.gray2 }}
                                        className="w-full p-4 rounded-2xl flex-row justify-between items-center">
                                        <View className="gap-1">
                                            <View className="flex-row items-center gap-2">
                                                <Dumbbell size={16} color={colors.green} />
                                                <Text style={{ color: colors.white }} className="font-bold text-lg">{ex.name}</Text>
                                            </View>
                                            {ex.tag && (
                                                <View style={{ backgroundColor: `${colors.green}1A` }} className="self-start px-1.5 py-0.5 rounded">
                                                    <Text style={{ color: colors.green }} className="text-xs font-bold tracking-wide">{ex.tag}</Text>
                                                </View>
                                            )}
                                        </View>
                                        <View className="flex-row items-center gap-3">
                                            <Pressable onPress={() => {
                                                Alert.alert("删除预设", `确定删除 "${ex.name}"？`, [
                                                    { text: "取消", style: "cancel" },
                                                    {
                                                        text: "删除", style: "destructive", onPress: async () => {
                                                            onPresetsChange(p => p.filter(x => x.name !== ex.name));
                                                            await removeStrengthPreset(ex.name);
                                                        }
                                                    },
                                                ]);
                                            }}>
                                                <Trash2 size={16} color={`${colors.red}99`} />
                                            </Pressable>
                                            <Plus size={20} color={colors.gray4} />
                                        </View>
                                    </Pressable>
                                </View>
                            ))}

                            {isCreatingPreset ? (
                                <View style={{ backgroundColor: colors.gray2, borderColor: `${colors.green}80`, borderWidth: 1 }}
                                    className="p-4 rounded-2xl gap-3 mt-2">
                                    <TextInput
                                        value={newPresetName}
                                        onChangeText={setNewPresetName}
                                        placeholder="输入动作名称，例如：杠铃区卧推"
                                        placeholderTextColor={`${colors.gray4}66`}
                                        style={{ color: colors.white, backgroundColor: "rgba(0,0,0,0.2)", padding: 12, borderRadius: 12, fontWeight: "bold" }}
                                        autoFocus
                                    />
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View className="flex-row gap-1.5">
                                            {["胸部训练", "肩部训练", "背部训练", "腿部训练", "手臂训练", "核心训练", "全身训练"].map(tag => (
                                                <Pressable key={tag} onPress={() => setNewPresetTag(tag === newPresetTag ? null : tag)}
                                                    style={{
                                                        backgroundColor: tag === newPresetTag ? `${colors.green}33` : "rgba(255,255,255,0.05)",
                                                        borderColor: tag === newPresetTag ? `${colors.green}80` : "transparent",
                                                        borderWidth: 1,
                                                    }}
                                                    className="px-2 py-1.5 rounded-md">
                                                    <Text style={{ color: tag === newPresetTag ? colors.green : colors.gray4 }}
                                                        className="text-xs font-bold">{tag}</Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </ScrollView>
                                    <View className="flex-row gap-2">
                                        <Pressable
                                            onPress={async () => {
                                                const name = newPresetName.trim();
                                                if (name && !presets.find(p => p.name === name)) {
                                                    const tag = newPresetTag;
                                                    onPresetsChange(prev => [...prev, { name, tag }]);
                                                    await addStrengthPreset(name, tag || undefined);
                                                }
                                                setNewPresetName(""); setNewPresetTag(null); setIsCreatingPreset(false);
                                            }}
                                            disabled={!newPresetName.trim()}
                                            style={{ flex: 1, backgroundColor: colors.green, opacity: newPresetName.trim() ? 1 : 0.5 }}
                                            className="py-2.5 rounded-xl items-center">
                                            <Text style={{ color: colors.white }} className="font-bold">保存</Text>
                                        </Pressable>
                                        <Pressable onPress={() => { setNewPresetName(""); setNewPresetTag(null); setIsCreatingPreset(false); }}
                                            style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.1)" }}
                                            className="py-2.5 rounded-xl items-center">
                                            <Text style={{ color: colors.white }} className="font-bold">取消</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ) : (
                                <Pressable onPress={() => setIsCreatingPreset(true)}
                                    style={{ borderColor: colors.border, borderWidth: 1, borderStyle: "dashed" }}
                                    className="w-full mt-2 py-5 rounded-2xl items-center justify-center flex-row gap-2">
                                    <Plus size={20} color={colors.gray4} />
                                    <Text style={{ color: colors.gray4 }} className="font-bold">创建新项目预设</Text>
                                </Pressable>
                            )}
                        </ScrollView>
                    ) : (
                        <View className="flex-1">
                            <View className="flex-row items-center gap-3 mb-6">
                                <View style={{ backgroundColor: `${colors.green}33` }} className="w-12 h-12 rounded-xl items-center justify-center">
                                    <Dumbbell size={24} color={colors.green} />
                                </View>
                                <Text style={{ color: colors.white }} className="text-xl font-bold">{selectedExercise}</Text>
                            </View>
                            <View className="gap-4 flex-1">
                                <View>
                                    <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider mb-2">重量 (KG)</Text>
                                    <TextInput
                                        keyboardType="decimal-pad"
                                        value={formWeight}
                                        onChangeText={setFormWeight}
                                        placeholder="例如 100"
                                        placeholderTextColor={`${colors.gray4}66`}
                                        style={{ color: colors.white, backgroundColor: colors.gray2, padding: 16, borderRadius: 12, fontWeight: "bold", fontSize: 18, borderWidth: 1, borderColor: `${colors.gray3}4D` }}
                                    />
                                </View>
                                <View className="flex-row gap-3">
                                    <View className="flex-1">
                                        <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider mb-2">组数</Text>
                                        <TextInput
                                            keyboardType="number-pad"
                                            value={formSets}
                                            onChangeText={setFormSets}
                                            placeholder="5"
                                            placeholderTextColor={`${colors.gray4}66`}
                                            style={{ color: colors.white, backgroundColor: colors.gray2, padding: 16, borderRadius: 12, fontWeight: "bold", fontSize: 18, borderWidth: 1, borderColor: `${colors.gray3}4D` }}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider mb-2">每组次数</Text>
                                        <TextInput
                                            keyboardType="number-pad"
                                            value={formReps}
                                            onChangeText={setFormReps}
                                            placeholder="8"
                                            placeholderTextColor={`${colors.gray4}66`}
                                            style={{ color: colors.white, backgroundColor: colors.gray2, padding: 16, borderRadius: 12, fontWeight: "bold", fontSize: 18, borderWidth: 1, borderColor: `${colors.gray3}4D` }}
                                        />
                                    </View>
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
                                    style={{ backgroundColor: colors.green, flex: 1, opacity: (isPending || !selectedExercise) ? 0.5 : 1 }}
                                    className="py-4 rounded-xl items-center">
                                    <Text style={{ color: colors.white }} className="font-bold text-lg">
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
