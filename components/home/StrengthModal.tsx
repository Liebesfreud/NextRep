import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { View, ScrollView, Alert, Keyboard, FlatList, Platform } from "react-native";
import { X, ChevronLeft, Dumbbell, Trash2, Plus, Search, Library } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { type WorkoutItem, type StrengthPresetItem } from "@/db/services/workout";
import { getStrengthCategoryVisual, STRENGTH_CATEGORIES } from "@/constants/exerciseVisuals";
import { Button, ButtonText } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { StrengthSetRow } from "@/components/home/StrengthSetRow";
import { createWorkoutSet, normalizeWorkoutSet, type WorkoutSet } from "@/components/home/strengthModalState";

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
    presets,
    onSave, onDelete, isPending
}: Props) {
    const { colors } = useTheme();
    const router = useRouter();

    const [modalStep, setModalStep] = useState<"select" | "form">("select");
    const [selectedExercise, setSelectedExercise] = useState("");
    const [sets, setSets] = useState<WorkoutSet[]>(() => [createWorkoutSet()]);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("全部");
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const categories = useMemo(() => ["全部", ...STRENGTH_CATEGORIES], []);
    const normalizedSearchQuery = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

    const filteredPresets = useMemo(
        () => presets.filter(p => {
            const matchSearch = !normalizedSearchQuery || p.name.toLowerCase().includes(normalizedSearchQuery);
            const matchCat = selectedCategory === "全部" || p.tag === selectedCategory;
            return matchSearch && matchCat;
        }),
        [normalizedSearchQuery, presets, selectedCategory]
    );

    useEffect(() => () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

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
                            parsedSets.push(createWorkoutSet({
                                setNumber: i + 1,
                                weight: weightVal,
                                reps: repsVal,
                                isCompleted: true,
                            }));
                        }
                    } else {
                        parsedSets.push(createWorkoutSet({
                            weight: weightVal,
                            reps: repsVal,
                            isCompleted: false,
                        }));
                    }
                }
            } catch {
                // Ignore parse errors and fallback
            }

            if (parsedSets.length === 0) {
                parsedSets.push(createWorkoutSet());
            }

            // Fix set numbers
            parsedSets = parsedSets.map(normalizeWorkoutSet);
            setSets(parsedSets);

        } else {
            setModalStep("select");
            setSelectedExercise("");
            setSets([createWorkoutSet()]);
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

    const handleAddSet = useCallback(() => {
        setSets(prev => [...prev, createWorkoutSet({
            setNumber: prev.length + 1,
            weight: prev[prev.length - 1]?.weight ?? "",
            reps: prev[prev.length - 1]?.reps ?? "",
            isCompleted: false,
        })]);
    }, []);

    const updateSet = useCallback((id: string, field: "weight" | "reps", value: string) => {
        setSets(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    }, []);

    const toggleSetComplete = useCallback((id: string) => {
        setSets(prev => prev.map(s => s.id === id ? { ...s, isCompleted: !s.isCompleted } : s));
    }, []);

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

    const deleteSet = useCallback((id: string) => {
        if (sets.length === 1) {
            // If it's the last set, just clear it
            setSets([createWorkoutSet()]);
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
    }, [sets.length]);

    const renderExerciseItem = useCallback(({ item: ex }: { item: StrengthPresetItem }) => {
        const visual = getStrengthCategoryVisual(ex.tag, colors);
        const Icon = visual.icon;

        return (
            <Button
                onPress={() => {
                    setSelectedExercise(ex.name);
                    setModalStep("form");
                }}
                style={{ borderColor: colors.border }}
                variant="outline"
                className="mb-4 h-auto min-h-20 justify-start rounded-lg px-4 py-4 native:h-auto"
            >
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <Icon size={20} color={colors.foreground} />
                </View>
                <View className="flex-1 justify-center gap-2">
                    <Text className="text-base font-bold">{ex.name}</Text>
                    <Text variant="muted" className="text-xs">
                        {ex.tag || "力量训练"}
                    </Text>
                </View>
                <Plus size={20} color={colors.mutedForeground} className="ml-2 opacity-70" />
            </Button>
        );
    }, [colors]);

    const renderExerciseEmpty = () => (
        <View className="items-center justify-center gap-2 py-12 opacity-60">
            <Dumbbell size={40} color={colors.gray4} />
            <Text variant="muted" className="text-center font-bold">
                没有找到相关动作
            </Text>
        </View>
    );

    const renderSetItem = useCallback(({ item }: { item: WorkoutSet }) => (
        <StrengthSetRow
            item={item}
            onDelete={deleteSet}
            onToggleComplete={toggleSetComplete}
            onUpdate={updateSet}
        />
    ), [deleteSet, toggleSetComplete, updateSet]);

    return (
        <Sheet
            visible={visible}
            onClose={onClose}
            sheetHeight="85%"
            avoidKeyboard
        >
            <View className="flex-1">
                <View className="mb-6 flex-row items-center justify-between">
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
                            <ChevronLeft size={20} color={colors.foreground} />
                            <ButtonText variant="ghost" size="sm">返回</ButtonText>
                        </Button>
                    ) : (
                        <Text variant="heading">
                            {modalStep === "select" ? "选择动作" : (initialWorkout ? "修改力量训练" : "添加力量训练")}
                        </Text>
                    )}
                    <View className="flex-row gap-2">
                        {modalStep === "select" && (
                            <Button
                                onPress={() => dismissKeyboardAndRun(() => {
                                    onClose();
                                    dismissKeyboardAndRun(() => router.push("/settings/exercises"), 120);
                                }, 0)}
                                accessibilityLabel="打开动作库"
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                            >
                                <Library size={18} color={colors.gray4} />
                            </Button>
                        )}
                        <Button
                            onPress={handleClose}
                            accessibilityLabel="关闭力量训练弹窗"
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                        >
                            <X size={20} color={colors.gray4} />
                        </Button>
                    </View>
                </View>

                {modalStep === "select" ? (
                    <View className="flex-1">
                        {/* Modern Search Bar */}
                        <View className="mb-4 flex-row items-center rounded-lg bg-secondary px-4 py-3">
                            <Search size={18} color={colors.gray4} />
                            <Input
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="搜索动作..."
                                className="ml-2.5 min-h-0 flex-1 border-0 bg-transparent p-0 text-base font-semibold"
                            />
                            {searchQuery.length > 0 && (
                                <Button
                                    onPress={() => setSearchQuery("")}
                                    accessibilityLabel="清空动作搜索"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                >
                                    <X size={16} color={colors.gray4} />
                                </Button>
                            )}
                        </View>

                        {/* Filter Chips */}
                        <View className="-mx-5 mb-5 px-5">
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row gap-3 pb-3 pr-5">
                                    {categories.map(cat => {
                                        const isSelected = selectedCategory === cat;
                                        const visual = cat === "全部" ? null : getStrengthCategoryVisual(cat, colors);
                                        const accent = visual?.accent ?? colors.blue;
                                        return (
                                            <Button
                                                key={cat}
                                                onPress={() => setSelectedCategory(cat)}
                                                variant={isSelected ? "secondary" : "outline"}
                                                className="h-auto rounded-pill px-4 py-2"
                                            >
                                                <Text
                                                    className="text-sm"
                                                    style={{ color: isSelected ? accent : colors.foreground }}
                                                >
                                                    {cat}
                                                </Text>
                                            </Button>
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
                            initialNumToRender={10}
                            maxToRenderPerBatch={8}
                            removeClippedSubviews={Platform.OS !== "web"}
                            windowSize={7}
                            className="flex-1"
                            contentContainerStyle={{ paddingBottom: 40 }}
                        />
                    </View>
                ) : (
                    <View className="flex-1">
                        <View className="mb-6 flex-row items-center gap-3">
                            <View className="h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                                <Dumbbell size={24} color={colors.foreground} />
                            </View>
                            <Text variant="subheading">{selectedExercise}</Text>
                        </View>

                        {/* Set-by-Set Header */}
                        <View className="mb-1 flex-row items-center px-1">
                            <Text variant="caption" className="w-10 text-center text-[10px] font-bold uppercase tracking-[1px]">组次</Text>
                            <Text variant="caption" className="flex-1 text-center text-[10px] font-bold uppercase tracking-[1px]">重量 (kg)</Text>
                            <Text variant="caption" className="flex-1 text-center text-[10px] font-bold uppercase tracking-[1px]">次数</Text>
                            <View className="w-10" />
                        </View>

                        {/* Set-by-Set Rows */}
                        <FlatList
                            data={sets}
                            keyExtractor={(item) => item.id}
                            renderItem={renderSetItem}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            initialNumToRender={8}
                            maxToRenderPerBatch={8}
                            removeClippedSubviews={Platform.OS !== "web"}
                            windowSize={7}
                            className="flex-1"
                            ListFooterComponent={(
                                <>
                                    <Button onPress={handleAddSet} variant="secondary" className="mt-3 w-full py-3">
                                        <ButtonText variant="secondary">+ 添加下一组</ButtonText>
                                    </Button>
                                    <View className="h-6" />
                                </>
                            )}
                        />

                        <View className="mt-4 flex-row gap-2 border-t pt-2" style={{ borderTopColor: `${colors.gray3}4D` }}>
                            {initialWorkout && (
                                <Button
                                    onPress={handleDeleteWorkout}
                                    accessibilityLabel="删除力量训练记录"
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
            </View>
        </Sheet>
    );
}
