import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert, Keyboard } from "react-native";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { X, ChevronLeft, Dumbbell, Trash2, Plus, Check, Search, Library } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { type WorkoutItem, type StrengthPresetItem, removeStrengthPreset, addStrengthPreset } from "@/db/services/workout";
import { getStrengthCategoryVisual, STRENGTH_CATEGORIES } from "@/constants/exerciseVisuals";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";

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
    const router = useRouter();

    const [modalStep, setModalStep] = useState<"select" | "form">("select");
    const [selectedExercise, setSelectedExercise] = useState("");
    const [sets, setSets] = useState<WorkoutSet[]>([{
        id: Math.random().toString(36).substring(2, 10),
        setNumber: 1,
        weight: "",
        reps: "",
        isCompleted: false,
    }]);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("全部");

    const categories = ["全部", ...STRENGTH_CATEGORIES];

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

    const dismissKeyboardAndRun = (callback: () => void, delay = 80) => {
        Keyboard.dismiss();
        setTimeout(callback, delay);
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
        <BottomSheetModal
            visible={visible}
            onClose={onClose}
            sheetHeight="85%"
            backgroundColor={colors.bento}
            avoidKeyboard
        >
            <Pressable onPress={() => { }} style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    {modalStep === "form" && !initialWorkout ? (
                        <Pressable
                            onPress={() => dismissKeyboardAndRun(() => {
                                setModalStep("select");
                                setSelectedExercise("");
                            })}
                            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                        >
                            <ChevronLeft size={20} color={colors.green} />
                            <Text style={{ color: colors.green, fontWeight: "bold", fontSize: 14 }}>返回</Text>
                        </Pressable>
                    ) : (
                        <Text style={{ color: colors.white, fontSize: 24, fontWeight: "800", letterSpacing: -0.5 }}>
                            {modalStep === "select" ? "选择动作" : (initialWorkout ? "修改力量训练" : "添加力量训练")}
                        </Text>
                    )}
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        {modalStep === "select" && (
                            <AnimatedPressable
                                onPress={() => dismissKeyboardAndRun(() => {
                                    onClose();
                                    setTimeout(() => router.push("/settings/exercises"), 120);
                                })}
                                activeScale={0.92}
                                activeOpacity={0.75}
                                style={{ backgroundColor: colors.gray3, width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" }}
                            >
                                <Library size={18} color={colors.gray4} />
                            </AnimatedPressable>
                        )}
                        <Pressable
                            onPress={() => dismissKeyboardAndRun(onClose)}
                            style={{ backgroundColor: colors.gray3, width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" }}
                        >
                            <X size={20} color={colors.gray4} />
                        </Pressable>
                    </View>
                </View>

                {modalStep === "select" ? (
                    <View style={{ flex: 1 }}>
                        {/* Modern Search Bar */}
                        <View style={{ backgroundColor: colors.gray2, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, marginBottom: 16 }}>
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
                        <View style={{ marginBottom: 16, marginHorizontal: -24, paddingHorizontal: 24 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={{ flexDirection: "row", gap: 8, paddingBottom: 8, paddingRight: 24 }}>
                                    {categories.map(cat => {
                                        const isSelected = selectedCategory === cat;
                                        const visual = cat === "全部" ? null : getStrengthCategoryVisual(cat, colors);
                                        const accent = visual?.accent ?? colors.blue;
                                        const backgroundColor = isSelected ? (visual?.iconBg ?? `${colors.blue}08`) : (visual?.chipBg ?? `${colors.blue}06`);
                                        return (
                                            <Pressable
                                                key={cat}
                                                onPress={() => setSelectedCategory(cat)}
                                                style={{
                                                    backgroundColor,
                                                    borderColor: isSelected ? accent : `${accent}40`,
                                                    borderWidth: 0.75,
                                                    paddingHorizontal: 16,
                                                    paddingVertical: 8,
                                                    borderRadius: 9999,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color: colors.white,
                                                        fontWeight: isSelected ? '800' : '700',
                                                        fontSize: 14,
                                                    }}
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
                        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginHorizontal: -24, paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
                            {filteredPresets.map((ex, i) => {
                                const visual = getStrengthCategoryVisual(ex.tag, colors);
                                const Icon = visual.icon;

                                return (
                                    <Pressable
                                        key={i}
                                        onPress={() => {
                                            setSelectedExercise(ex.name);
                                            setModalStep("form");
                                        }}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            paddingVertical: 12,
                                            paddingHorizontal: 12,
                                            borderWidth: 0.75,
                                            borderColor: `${visual.accent}26`,
                                            backgroundColor: visual.cardBg ?? colors.gray2,
                                            borderRadius: 18,
                                            marginBottom: 10,
                                        }}
                                    >
                                        <View style={{ backgroundColor: visual.iconBg, width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                                            <Icon size={20} color={visual.accent} />
                                        </View>
                                        <View style={{ flex: 1, justifyContent: "center" }}>
                                            <Text style={{ color: colors.white, fontSize: 16, fontWeight: "bold", marginBottom: 6 }}>{ex.name}</Text>
                                            <Text style={{ color: visual.accent, fontSize: 12, fontWeight: "700" }}>
                                                {ex.tag || "力量训练"}
                                            </Text>
                                        </View>
                                        <Plus size={20} color={visual.accent} style={{ opacity: 0.7, marginLeft: 8 }} />
                                    </Pressable>
                                );
                            })}

                            {filteredPresets.length === 0 && (
                                <View style={{ paddingVertical: 48, alignItems: "center", justifyContent: "center", opacity: 0.6 }}>
                                    <Dumbbell size={40} color={colors.gray4} style={{ marginBottom: 16 }} />
                                    <Text style={{ color: colors.gray4, fontSize: 14, fontWeight: "bold", textAlign: "center", marginBottom: 8 }}>
                                        没有找到相关动作
                                    </Text>
                                    <Text style={{ color: colors.gray4, fontSize: 12, textAlign: "center" }}>
                                        请前往“设置 {'->'} 数据与备份”新增你的自定义动作库
                                    </Text>
                                </View>
                            )}
                            <View style={{ height: 100 }} />
                        </ScrollView>
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
                            <View style={{ backgroundColor: `${colors.green}33`, width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                                <Dumbbell size={24} color={colors.green} />
                            </View>
                            <Text style={{ color: colors.white, fontSize: 20, fontWeight: "bold" }}>{selectedExercise}</Text>
                        </View>

                        {/* Set-by-Set Header */}
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4, paddingHorizontal: 4 }}>
                            <Text style={{ color: colors.gray4, width: 40, fontSize: 10, fontWeight: "bold", textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>组次</Text>
                            <Text style={{ color: colors.gray4, flex: 1, fontSize: 10, fontWeight: "bold", textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>重量 (kg)</Text>
                            <Text style={{ color: colors.gray4, flex: 1, fontSize: 10, fontWeight: "bold", textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>次数</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        {/* Set-by-Set Rows */}
                        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                            {sets.map((set) => (
                                <Pressable key={set.id} onLongPress={() => deleteSet(set.id)} delayLongPress={500}>
                                    <View style={{ backgroundColor: set.isCompleted ? 'rgba(255,255,255,0.03)' : 'transparent', borderRadius: 10, flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 4, marginBottom: 4 }}>
                                        {/* Set Number */}
                                        <View style={{ width: 40, alignItems: "center" }}>
                                            <View style={{ backgroundColor: set.isCompleted ? 'transparent' : colors.gray2, borderColor: set.isCompleted ? colors.green : 'transparent', borderWidth: set.isCompleted ? 1 : 0, width: 24, height: 24, borderRadius: 6, alignItems: "center", justifyContent: "center" }}>
                                                <Text style={{ color: set.isCompleted ? colors.green : colors.gray4, fontWeight: "bold", fontSize: 12 }}>{set.setNumber}</Text>
                                            </View>
                                        </View>

                                        {/* Weight Input */}
                                        <View style={{ flex: 1, paddingHorizontal: 6 }}>
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
                                        <View style={{ flex: 1, paddingHorizontal: 6 }}>
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
                                        <Pressable onPress={() => toggleSetComplete(set.id)} style={{ width: 40, alignItems: "center" }}>
                                            <View style={{ backgroundColor: set.isCompleted ? colors.green : colors.gray2, width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" }}>
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
                            <Pressable onPress={handleAddSet} style={{ backgroundColor: `${colors.gray2}80`, width: "100%", marginTop: 12, paddingVertical: 12, borderRadius: 8, alignItems: "center", justifyContent: "center" }}>
                                <Text style={{ color: colors.green, fontWeight: "bold", fontSize: 14 }}>+ 添加下一组</Text>
                            </Pressable>
                            <Text style={{ color: colors.gray4, textAlign: 'center', marginTop: 12, fontSize: 11, opacity: 0.6 }}>长按某组即可删除</Text>
                            <View style={{ height: 24 }} />
                        </ScrollView>

                        <View style={{ flexDirection: "row", gap: 8, marginTop: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: `${colors.gray3}4D` }}>
                            {initialWorkout && (
                                <Pressable onPress={() => onDelete(initialWorkout.id)} disabled={isPending} style={{ backgroundColor: `${colors.red}1A`, width: 64, opacity: isPending ? 0.5 : 1, paddingVertical: 16, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                                    <Trash2 size={20} color={colors.red} />
                                </Pressable>
                            )}
                            <Pressable onPress={handleSave} disabled={isPending || !selectedExercise} style={{ backgroundColor: colors.green, flex: 1, opacity: (isPending || !selectedExercise) ? 0.5 : 1, paddingVertical: 16, borderRadius: 12, alignItems: "center" }}>
                                <Text style={{ color: colors.white, fontWeight: "bold", fontSize: 18 }}>
                                    {isPending ? "保存中..." : "保存记录"}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </Pressable>
        </BottomSheetModal>
    );
}
