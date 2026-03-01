import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Modal, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { X, ChevronLeft, Dumbbell, Trash2, Plus, Check, Search } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { type WorkoutItem, type StrengthPresetItem, removeStrengthPreset, addStrengthPreset } from "@/db/services/workout";

export interface WorkoutSet {
    id: string;
    setNumber: number;
    weight: string;
    reps: string;
    isCompleted: boolean;
}

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
    const [sets, setSets] = useState<WorkoutSet[]>([{
        id: Math.random().toString(36).substring(2, 10),
        setNumber: 1,
        weight: "",
        reps: "",
        isCompleted: false,
    }]);

    const [isCreatingPreset, setIsCreatingPreset] = useState(false);
    const [newPresetName, setNewPresetName] = useState("");
    const [newPresetTag, setNewPresetTag] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("全部");

    const categories = ["全部", "胸部训练", "肩部训练", "背部训练", "腿部训练", "手臂训练", "核心训练", "全身训练"];

    const filteredPresets = presets.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCat = selectedCategory === "全部" || p.tag === selectedCategory;
        return matchSearch && matchCat;
    });

    // Reset state when modal opens or initialWorkout changes
    useEffect(() => {
        if (!visible) return;
        if (initialWorkout) {
            setModalStep("form");
            setSelectedExercise(initialWorkout.name);

            let parsedSets: WorkoutSet[] = [];
            try {
                if (initialWorkout.sets && initialWorkout.sets.startsWith("[")) {
                    parsedSets = JSON.parse(initialWorkout.sets);
                } else {
                    const wMatch = initialWorkout.weight?.match(/([\d.]+)/);
                    const weightVal = wMatch ? wMatch[1] : "";
                    const sMatch = initialWorkout.sets?.match(/(\d+)\s*[×x]\s*(\d+)/i);
                    const setsCount = parseInt(sMatch ? sMatch[1] : '0') || 0;
                    const repsVal = sMatch ? sMatch[2] : "";

                    if (setsCount > 0) {
                        for (let i = 0; i < setsCount; i++) {
                            parsedSets.push({
                                id: Math.random().toString(36).substring(2, 10) + i,
                                setNumber: i + 1,
                                weight: weightVal,
                                reps: repsVal,
                                isCompleted: true,
                            });
                        }
                    } else {
                        parsedSets.push({
                            id: Math.random().toString(36).substring(2, 10),
                            setNumber: 1,
                            weight: weightVal,
                            reps: repsVal,
                            isCompleted: false,
                        });
                    }
                }
            } catch (e) {
                // Ignore parse errors and fallback
            }

            if (parsedSets.length === 0) {
                parsedSets.push({
                    id: Math.random().toString(36).substring(2, 10),
                    setNumber: 1,
                    weight: "",
                    reps: "",
                    isCompleted: false,
                });
            }

            // Fix set numbers
            parsedSets.forEach((s, idx) => s.setNumber = idx + 1);
            setSets(parsedSets);

        } else {
            setModalStep("select");
            setSelectedExercise("");
            setSets([{
                id: Math.random().toString(36).substring(2, 10),
                setNumber: 1,
                weight: "",
                reps: "",
                isCompleted: false,
            }]);
            setIsCreatingPreset(false);
            setNewPresetName("");
            setNewPresetTag(null);
        }
    }, [visible, initialWorkout]);

    const handleSave = () => {
        if (!selectedExercise) return;

        // Filter out completely empty uncompleted sets (unless it's the only one)
        let validSets = sets.filter(s => s.isCompleted || s.weight || s.reps);
        if (validSets.length === 0) {
            // Keep at least one if everything is empty
            validSets = sets.slice(0, 1);
        }

        const savedSetsStr = JSON.stringify(validSets);

        // Calculate max weight for the summary text
        const maxWeightNum = validSets.reduce((max, s) => {
            const w = parseFloat(s.weight);
            return (!isNaN(w) && w > max) ? w : max;
        }, 0);

        const summaryWeight = maxWeightNum > 0 ? `${maxWeightNum} kg` : undefined;

        const payload = {
            type: "strength" as const,
            name: selectedExercise,
            weight: summaryWeight,
            sets: savedSetsStr,
        };
        onSave(payload);
    };

    const handleAddSet = () => {
        const lastSet = sets[sets.length - 1];
        setSets(prev => [...prev, {
            id: Math.random().toString(36).substring(2, 10),
            setNumber: prev.length + 1,
            weight: lastSet ? lastSet.weight : "",
            reps: lastSet ? lastSet.reps : "",
            isCompleted: false,
        }]);
    };

    const updateSet = (id: string, field: "weight" | "reps", value: string) => {
        setSets(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const toggleSetComplete = (id: string) => {
        setSets(prev => prev.map(s => s.id === id ? { ...s, isCompleted: !s.isCompleted } : s));
    };

    const deleteSet = (id: string) => {
        if (sets.length === 1) {
            // If it's the last set, just clear it
            setSets([{
                id: Math.random().toString(36).substring(2, 10),
                setNumber: 1,
                weight: "",
                reps: "",
                isCompleted: false,
            }]);
            return;
        }

        Alert.alert("删除该组", "确定要删除这条记录吗？", [
            { text: "取消", style: "cancel" },
            {
                text: "删除", style: "destructive", onPress: () => {
                    setSets(prev => {
                        const newSets = prev.filter(s => s.id !== id);
                        return newSets.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
                    });
                }
            }
        ]);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }} onPress={onClose}>
                    <Pressable onPress={() => { }} style={{ backgroundColor: colors.bento, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, height: "85%" }}>
                        <View className="flex-row justify-between items-center mb-6">
                            {modalStep === "form" && !initialWorkout ? (
                                <Pressable onPress={() => { setModalStep("select"); setSelectedExercise(""); }} className="flex-row items-center gap-1">
                                    <ChevronLeft size={20} color={colors.green} />
                                    <Text style={{ color: colors.green }} className="font-bold text-sm">返回</Text>
                                </Pressable>
                            ) : (
                                <Text style={{ color: colors.white }} className="text-2xl font-extrabold tracking-tight">
                                    {modalStep === "select" ? "选择动作" : (initialWorkout ? "修改力量训练" : "添加力量训练")}
                                </Text>
                            )}
                            <Pressable onPress={onClose} style={{ backgroundColor: colors.gray3 }} className="w-8 h-8 rounded-lg items-center justify-center">
                                <X size={20} color={colors.gray4} />
                            </Pressable>
                        </View>

                        {modalStep === "select" ? (
                            <View className="flex-1">
                                {/* Modern Search Bar */}
                                <View style={{ backgroundColor: colors.gray2 }} className="flex-row items-center px-4 py-3 rounded-2xl mb-4">
                                    <Search size={18} color={colors.gray4} />
                                    <TextInput
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        placeholder="搜索动作..."
                                        placeholderTextColor={`${colors.gray4}80`}
                                        style={{ color: colors.white, fontSize: 16, fontWeight: "600", marginLeft: 10, flex: 1, padding: 0 }}
                                    />
                                    {searchQuery.length > 0 && (
                                        <Pressable onPress={() => setSearchQuery("")}>
                                            <X size={16} color={colors.gray4} />
                                        </Pressable>
                                    )}
                                </View>

                                {/* Filter Chips */}
                                <View className="mb-4 -mx-6 px-6">
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View className="flex-row gap-2 pb-2 pr-6">
                                            {categories.map(cat => {
                                                const isSelected = selectedCategory === cat;
                                                return (
                                                    <Pressable
                                                        key={cat}
                                                        onPress={() => setSelectedCategory(cat)}
                                                        style={{
                                                            backgroundColor: isSelected ? colors.green : colors.gray2,
                                                        }}
                                                        className="px-4 py-2 rounded-full"
                                                    >
                                                        <Text
                                                            style={{
                                                                color: isSelected ? colors.white : colors.gray4,
                                                                fontWeight: isSelected ? 'bold' : '600'
                                                            }}
                                                            className="text-sm"
                                                        >
                                                            {cat}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>
                                </View>

                                {/* FlatList of Exercises */}
                                <ScrollView showsVerticalScrollIndicator={false} className="flex-1 -mx-6 px-6">
                                    {filteredPresets.length > 0 ? (
                                        filteredPresets.map((ex, i) => (
                                            <Pressable
                                                key={i}
                                                onPress={() => {
                                                    setSelectedExercise(ex.name);
                                                    setModalStep("form");
                                                }}
                                                className="flex-row items-center py-3 border-b border-gray-800"
                                                style={{ borderBottomColor: `${colors.gray3}4D` }}
                                            >
                                                <View style={{ backgroundColor: `${colors.green}1A` }} className="w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                                    <Dumbbell size={20} color={colors.green} />
                                                </View>
                                                <View className="flex-1 justify-center">
                                                    <Text style={{ color: colors.white }} className="text-base font-bold mb-1">{ex.name}</Text>
                                                    <Text style={{ color: colors.gray4 }} className="text-xs font-semibold">{ex.tag || "自定义动作"}</Text>
                                                </View>
                                                <Plus size={20} color={colors.gray4} style={{ opacity: 0.5 }} />
                                            </Pressable>
                                        ))
                                    ) : (
                                        <View className="py-12 items-center justify-center opacity-60">
                                            <Dumbbell size={40} color={colors.gray4} className="mb-4" />
                                            <Text style={{ color: colors.gray4 }} className="text-sm font-bold text-center">
                                                没有找到相关动作
                                            </Text>
                                        </View>
                                    )}
                                    <View style={{ height: 100 }} />
                                </ScrollView>

                                {/* Create New Exercise Modal inline/FAB interaction */}
                                {isCreatingPreset ? (
                                    <View style={{ backgroundColor: colors.gray2, borderColor: `${colors.green}80`, borderWidth: 1, position: 'absolute', bottom: 10, left: 0, right: 0 }} className="p-4 rounded-3xl shadow-xl">
                                        <View className="flex-row justify-between items-center mb-3">
                                            <Text style={{ color: colors.white }} className="font-bold text-lg">自定义新动作</Text>
                                            <Pressable onPress={() => { setNewPresetName(""); setNewPresetTag(null); setIsCreatingPreset(false); }}>
                                                <X size={20} color={colors.gray4} />
                                            </Pressable>
                                        </View>
                                        <TextInput
                                            value={newPresetName}
                                            onChangeText={setNewPresetName}
                                            placeholder="例如：杠铃区卧推"
                                            placeholderTextColor={`${colors.gray4}66`}
                                            style={{ color: colors.white, backgroundColor: "rgba(0,0,0,0.2)", padding: 14, borderRadius: 12, fontWeight: "bold", fontSize: 16, marginBottom: 12 }}
                                            autoFocus
                                        />
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 mb-4">
                                            <View className="flex-row gap-2">
                                                {categories.filter(c => c !== "全部").map(tag => (
                                                    <Pressable key={tag} onPress={() => setNewPresetTag(tag === newPresetTag ? null : tag)}
                                                        style={{
                                                            backgroundColor: tag === newPresetTag ? `${colors.green}33` : "rgba(255,255,255,0.05)",
                                                            borderColor: tag === newPresetTag ? `${colors.green}80` : "transparent",
                                                            borderWidth: 1,
                                                        }}
                                                        className="px-3 py-2 rounded-xl">
                                                        <Text style={{ color: tag === newPresetTag ? colors.green : colors.gray4 }} className="text-sm font-bold">{tag}</Text>
                                                    </Pressable>
                                                ))}
                                            </View>
                                        </ScrollView>
                                        <Pressable
                                            onPress={async () => {
                                                const name = newPresetName.trim();
                                                if (name && !presets.find(p => p.name === name)) {
                                                    const tag = newPresetTag || "全身训练";
                                                    onPresetsChange(prev => [{ name, tag }, ...prev]);
                                                    await addStrengthPreset(name, tag);
                                                }
                                                setNewPresetName(""); setNewPresetTag(null); setIsCreatingPreset(false);
                                            }}
                                            disabled={!newPresetName.trim()}
                                            style={{ backgroundColor: colors.green, opacity: newPresetName.trim() ? 1 : 0.5 }}
                                            className="py-3.5 rounded-xl items-center">
                                            <Text style={{ color: colors.white }} className="font-bold text-base">保存并添加</Text>
                                        </Pressable>
                                    </View>
                                ) : (
                                    <View style={{ position: 'absolute', bottom: 10, left: 0, right: 0 }}>
                                        <Pressable onPress={() => setIsCreatingPreset(true)}
                                            style={{ backgroundColor: colors.bento, borderColor: colors.border, borderWidth: 1 }}
                                            className="mx-4 py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-sm">
                                            <Plus size={20} color={colors.green} />
                                            <Text style={{ color: colors.white }} className="font-bold text-base">自定义新动作</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View className="flex-1">
                                <View className="flex-row items-center gap-3 mb-6">
                                    <View style={{ backgroundColor: `${colors.green}33` }} className="w-12 h-12 rounded-xl items-center justify-center">
                                        <Dumbbell size={24} color={colors.green} />
                                    </View>
                                    <Text style={{ color: colors.white }} className="text-xl font-bold">{selectedExercise}</Text>
                                </View>

                                {/* Set-by-Set Header */}
                                <View className="flex-row items-center mb-1 px-1">
                                    <Text style={{ color: colors.gray4, width: 40 }} className="text-[10px] font-bold text-center uppercase tracking-wider">组次</Text>
                                    <Text style={{ color: colors.gray4, flex: 1 }} className="text-[10px] font-bold text-center uppercase tracking-wider">重量 (kg)</Text>
                                    <Text style={{ color: colors.gray4, flex: 1 }} className="text-[10px] font-bold text-center uppercase tracking-wider">次数</Text>
                                    <View style={{ width: 40 }} />
                                </View>

                                {/* Set-by-Set Rows */}
                                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                    {sets.map((set) => (
                                        <Pressable key={set.id} onLongPress={() => deleteSet(set.id)} delayLongPress={500}>
                                            <View style={{ backgroundColor: set.isCompleted ? 'rgba(255,255,255,0.03)' : 'transparent', borderRadius: 10 }} className="flex-row items-center py-1.5 px-1 mb-1">
                                                {/* Set Number */}
                                                <View style={{ width: 40 }} className="items-center">
                                                    <View style={{ backgroundColor: set.isCompleted ? 'transparent' : colors.gray2, borderColor: set.isCompleted ? colors.green : 'transparent', borderWidth: set.isCompleted ? 1 : 0, width: 24, height: 24 }} className="rounded-md items-center justify-center">
                                                        <Text style={{ color: set.isCompleted ? colors.green : colors.gray4 }} className="font-bold text-xs">{set.setNumber}</Text>
                                                    </View>
                                                </View>

                                                {/* Weight Input */}
                                                <View className="flex-1 px-1.5">
                                                    <TextInput
                                                        keyboardType="decimal-pad"
                                                        value={set.weight}
                                                        onChangeText={(val) => updateSet(set.id, "weight", val)}
                                                        placeholder="-"
                                                        placeholderTextColor={`${colors.gray4}4D`}
                                                        selectTextOnFocus
                                                        style={{ color: colors.white, backgroundColor: colors.gray2, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8, textAlign: 'center', fontWeight: "bold", fontSize: 14 }}
                                                    />
                                                </View>

                                                {/* Reps Input */}
                                                <View className="flex-1 px-1.5">
                                                    <TextInput
                                                        keyboardType="number-pad"
                                                        value={set.reps}
                                                        onChangeText={(val) => updateSet(set.id, "reps", val)}
                                                        placeholder="-"
                                                        placeholderTextColor={`${colors.gray4}4D`}
                                                        selectTextOnFocus
                                                        style={{ color: colors.white, backgroundColor: colors.gray2, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8, textAlign: 'center', fontWeight: "bold", fontSize: 14 }}
                                                    />
                                                </View>

                                                {/* Complete Checkbox */}
                                                <Pressable onPress={() => toggleSetComplete(set.id)} style={{ width: 40 }} className="items-center">
                                                    <View style={{ backgroundColor: set.isCompleted ? colors.green : colors.gray2, width: 28, height: 28 }} className="rounded-lg items-center justify-center">
                                                        {set.isCompleted ? (
                                                            <Check size={16} color={colors.white} strokeWidth={3} />
                                                        ) : (
                                                            <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                                                        )}
                                                    </View>
                                                </Pressable>
                                            </View>
                                        </Pressable>
                                    ))}

                                    {/* Add Set Button */}
                                    <Pressable onPress={handleAddSet} style={{ backgroundColor: `${colors.gray2}80` }} className="w-full mt-3 py-3 rounded-lg items-center justify-center">
                                        <Text style={{ color: colors.green }} className="font-bold text-sm">+ 添加下一组</Text>
                                    </Pressable>
                                    <Text style={{ color: colors.gray4, textAlign: 'center', marginTop: 12, fontSize: 11, opacity: 0.6 }}>长按某组即可删除</Text>
                                    <View style={{ height: 24 }} />
                                </ScrollView>

                                <View className="flex-row gap-2 mt-4 pt-2 border-t border-gray-800" style={{ borderColor: `${colors.gray3}4D` }}>
                                    {initialWorkout && (
                                        <Pressable onPress={() => onDelete(initialWorkout.id)} disabled={isPending} style={{ backgroundColor: `${colors.red}1A`, width: 64, opacity: isPending ? 0.5 : 1 }} className="py-4 rounded-xl items-center justify-center">
                                            <Trash2 size={20} color={colors.red} />
                                        </Pressable>
                                    )}
                                    <Pressable onPress={handleSave} disabled={isPending || !selectedExercise} style={{ backgroundColor: colors.green, flex: 1, opacity: (isPending || !selectedExercise) ? 0.5 : 1 }} className="py-4 rounded-xl items-center">
                                        <Text style={{ color: colors.white }} className="font-bold text-lg">
                                            {isPending ? "保存中..." : "保存记录"}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
}

