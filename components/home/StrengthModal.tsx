import React, { useState, useEffect } from "react";
import { View, Pressable, ScrollView, Alert, Keyboard, FlatList } from "react-native";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { X, ChevronLeft, Dumbbell, Trash2, Plus, Check, Search, Library } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { type WorkoutItem, type StrengthPresetItem } from "@/db/services/workout";
import { getStrengthCategoryVisual, STRENGTH_CATEGORIES } from "@/constants/exerciseVisuals";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

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

    const handleClose = () => {
        Keyboard.dismiss();
        onClose();
    };

    const handleDeleteWorkout = () => {
        if (!initialWorkout || isPending) return;
        Alert.alert("删除训练", `确定要删除「${initialWorkout.name}」吗？`, [
            { text: "取消", style: "cancel" },
            {
                text: "删除",
                style: "destructive",
                onPress: () => onDelete(initialWorkout.id),
            },
        ]);
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

    const renderExerciseItem = ({ item: ex }: { item: StrengthPresetItem }) => {
        const visual = getStrengthCategoryVisual(ex.tag, colors);
        const Icon = visual.icon;

        return (
            <Pressable
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
                <View style={{ backgroundColor: visual.iconBg }} className="mr-4 h-12 w-12 items-center justify-center rounded-2xl">
                    <Icon size={20} color={visual.accent} />
                </View>
                <View className="flex-1 justify-center">
                    <Text className="mb-1.5 text-base font-bold">{ex.name}</Text>
                    <Text style={{ color: visual.accent, fontSize: 12, fontWeight: "700" }}>
                        {ex.tag || "力量训练"}
                    </Text>
                </View>
                <Plus size={20} color={visual.accent} style={{ opacity: 0.7, marginLeft: 8 }} />
            </Pressable>
        );
    };

    const renderExerciseEmpty = () => (
        <View className="items-center justify-center gap-2 py-12 opacity-60">
            <Dumbbell size={40} color={colors.gray4} />
            <Text variant="muted" className="text-center font-bold">
                没有找到相关动作
            </Text>
            <Text variant="caption" className="text-center">
                请前往“设置 {'->'} 数据与备份”新增你的自定义动作库
            </Text>
        </View>
    );

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
                        <Button
                            onPress={() => dismissKeyboardAndRun(() => {
                                setModalStep("select");
                                setSelectedExercise("");
                            })}
                            variant="ghost"
                            size="sm"
                            className="h-auto gap-1 px-0 py-0"
                        >
                            <ChevronLeft size={20} color={colors.green} />
                            <ButtonText variant="ghost" size="sm" className="text-accent">返回</ButtonText>
                        </Button>
                    ) : (
                        <Text variant="heading">
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
                        <Button
                            onPress={handleClose}
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                        >
                            <X size={20} color={colors.gray4} />
                        </Button>
                    </View>
                </View>

                {modalStep === "select" ? (
                    <View style={{ flex: 1 }}>
                        {/* Modern Search Bar */}
                        <View style={{ backgroundColor: colors.gray2, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, marginBottom: 16 }}>
                            <Search size={18} color={colors.gray4} />
                            <Input
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="搜索动作..."
                                className="ml-2.5 min-h-0 flex-1 border-0 bg-transparent p-0 text-base font-semibold"
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
                                            <Pressable key={cat} onPress={() => setSelectedCategory(cat)}>
                                                <Badge
                                                    style={{ backgroundColor, borderColor: isSelected ? accent : `${accent}40`, borderWidth: 0.75 }}
                                                    className="px-4 py-2"
                                                >
                                                    <BadgeText style={{ color: colors.white, fontWeight: isSelected ? "800" : "700", fontSize: 14 }}>
                                                    {cat}
                                                    </BadgeText>
                                                </Badge>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        </View>

                        <FlatList
                            data={filteredPresets}
                            keyExtractor={(item) => item.name}
                            renderItem={renderExerciseItem}
                            ListEmptyComponent={renderExerciseEmpty}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            style={{ flex: 1, marginHorizontal: -24 }}
                            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                        />
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
                            <View style={{ backgroundColor: `${colors.green}33`, width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                                <Dumbbell size={24} color={colors.green} />
                            </View>
                            <Text variant="subheading">{selectedExercise}</Text>
                        </View>

                        {/* Set-by-Set Header */}
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4, paddingHorizontal: 4 }}>
                            <Text variant="caption" className="w-10 text-center text-[10px] font-bold uppercase tracking-[1px]">组次</Text>
                            <Text variant="caption" className="flex-1 text-center text-[10px] font-bold uppercase tracking-[1px]">重量 (kg)</Text>
                            <Text variant="caption" className="flex-1 text-center text-[10px] font-bold uppercase tracking-[1px]">次数</Text>
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
                                            <Input
                                                keyboardType="decimal-pad"
                                                value={set.weight}
                                                onChangeText={(val) => updateSet(set.id, "weight", val)}
                                                placeholder="-"
                                                selectTextOnFocus
                                                className="min-h-0 rounded-lg border-0 bg-secondary px-2 py-2 text-center text-sm font-bold"
                                            />
                                        </View>

                                        {/* Reps Input */}
                                        <View style={{ flex: 1, paddingHorizontal: 6 }}>
                                            <Input
                                                keyboardType="number-pad"
                                                value={set.reps}
                                                onChangeText={(val) => updateSet(set.id, "reps", val)}
                                                placeholder="-"
                                                selectTextOnFocus
                                                className="min-h-0 rounded-lg border-0 bg-secondary px-2 py-2 text-center text-sm font-bold"
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
                            <Button onPress={handleAddSet} variant="secondary" className="mt-3 w-full bg-secondary/80 py-3">
                                <ButtonText variant="secondary" className="text-accent">+ 添加下一组</ButtonText>
                            </Button>
                            <Text variant="caption" className="mt-3 text-center opacity-60">长按某组即可删除</Text>
                            <View style={{ height: 24 }} />
                        </ScrollView>

                        <View style={{ flexDirection: "row", gap: 8, marginTop: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: `${colors.gray3}4D` }}>
                            {initialWorkout && (
                                <Button onPress={handleDeleteWorkout} disabled={isPending} variant="destructive" className="w-16 bg-destructive/10 py-4">
                                    <Trash2 size={20} color={colors.red} />
                                </Button>
                            )}
                            <Button onPress={handleSave} disabled={isPending || !selectedExercise} className="flex-1 bg-accent py-4">
                                <ButtonText className="text-lg text-foreground">
                                    {isPending ? "保存中..." : "保存记录"}
                                </ButtonText>
                            </Button>
                        </View>
                    </View>
                )}
            </Pressable>
        </BottomSheetModal>
    );
}
