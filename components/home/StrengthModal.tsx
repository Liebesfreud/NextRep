import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { View, ScrollView, Alert, Keyboard, FlatList, Platform } from "react-native";
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
import { cn } from "@/lib/utils";

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

let workoutSetIdSeq = 0;

function createWorkoutSetId() {
    workoutSetIdSeq += 1;
    return `set-${Date.now()}-${workoutSetIdSeq}`;
}

function createWorkoutSet(overrides: Partial<WorkoutSet> = {}): WorkoutSet {
    return {
        id: createWorkoutSetId(),
        setNumber: 1,
        weight: "",
        reps: "",
        isCompleted: false,
        ...overrides,
    };
}

function normalizeWorkoutSet(set: WorkoutSet, index: number): WorkoutSet {
    return {
        ...set,
        id: set.id || createWorkoutSetId(),
        setNumber: index + 1,
    };
}

type StrengthSetRowProps = {
    item: WorkoutSet;
    onDelete: (id: string) => void;
    onToggleComplete: (id: string) => void;
    onUpdate: (id: string, field: "weight" | "reps", value: string) => void;
};

const StrengthSetRow = React.memo(function StrengthSetRow({ item, onDelete, onToggleComplete, onUpdate }: StrengthSetRowProps) {
    const { colors } = useTheme();

    return (
        <AnimatedPressable
            onLongPress={() => onDelete(item.id)}
            delayLongPress={500}
            activeScale={0.99}
            activeOpacity={0.9}
            className={cn(
                "mb-1 flex-row items-center rounded-[10px] px-1 py-1.5",
                item.isCompleted && "bg-foreground/[0.03]"
            )}
        >
            <View className="w-10 items-center">
                <View
                    className="h-6 w-6 items-center justify-center rounded-md"
                    style={{
                        backgroundColor: item.isCompleted ? "transparent" : colors.gray2,
                        borderColor: item.isCompleted ? colors.green : "transparent",
                        borderWidth: item.isCompleted ? 1 : 0,
                    }}
                >
                    <Text
                        className="text-xs font-bold"
                        style={{ color: item.isCompleted ? colors.green : colors.gray4 }}
                    >
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
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-transparent p-0"
                >
                    <View className="h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: item.isCompleted ? colors.green : colors.gray2 }}>
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

export function StrengthModal({
    visible, onClose, initialWorkout,
    presets, onPresetsChange,
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
            } catch (e) {
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
                style={{
                    borderColor: `${visual.accent}26`,
                    backgroundColor: visual.cardBg ?? colors.gray2,
                }}
                variant="ghost"
                className="mb-2.5 h-auto justify-start rounded-[18px] border px-3 py-3"
            >
                <View style={{ backgroundColor: visual.iconBg }} className="mr-4 h-12 w-12 items-center justify-center rounded-2xl">
                    <Icon size={20} color={visual.accent} />
                </View>
                <View className="flex-1 justify-center">
                    <Text className="mb-1.5 text-base font-bold">{ex.name}</Text>
                    <Text className="text-xs font-bold" style={{ color: visual.accent }}>
                        {ex.tag || "力量训练"}
                    </Text>
                </View>
                <Plus size={20} color={visual.accent} className="ml-2 opacity-70" />
            </Button>
        );
    }, [colors]);

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
                            <ChevronLeft size={20} color={colors.green} />
                            <ButtonText variant="ghost" size="sm" className="text-accent">返回</ButtonText>
                        </Button>
                    ) : (
                        <Text variant="heading">
                            {modalStep === "select" ? "选择动作" : (initialWorkout ? "修改力量训练" : "添加力量训练")}
                        </Text>
                    )}
                    <View className="flex-row gap-2">
                        {modalStep === "select" && (
                            <AnimatedPressable
                                onPress={() => dismissKeyboardAndRun(() => {
                                    onClose();
                                    dismissKeyboardAndRun(() => router.push("/settings/exercises"), 120);
                                }, 0)}
                                activeScale={0.92}
                                activeOpacity={0.75}
                                className="h-8 w-8 items-center justify-center rounded-lg bg-muted"
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
                    <View className="flex-1">
                        {/* Modern Search Bar */}
                        <View className="mb-4 flex-row items-center rounded-2xl bg-secondary px-4 py-3">
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
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                >
                                    <X size={16} color={colors.gray4} />
                                </Button>
                            )}
                        </View>

                        {/* Filter Chips */}
                        <View className="-mx-6 mb-4 px-6">
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row gap-2 pb-2 pr-6">
                                    {categories.map(cat => {
                                        const isSelected = selectedCategory === cat;
                                        const visual = cat === "全部" ? null : getStrengthCategoryVisual(cat, colors);
                                        const accent = visual?.accent ?? colors.blue;
                                        const backgroundColor = isSelected ? (visual?.iconBg ?? `${colors.blue}08`) : (visual?.chipBg ?? `${colors.blue}06`);
                                        return (
                                            <Button
                                                key={cat}
                                                onPress={() => setSelectedCategory(cat)}
                                                variant="ghost"
                                                className="h-auto bg-transparent p-0"
                                            >
                                                <Badge
                                                    style={{ backgroundColor, borderColor: isSelected ? accent : `${accent}40`, borderWidth: 0.75 }}
                                                    className="px-4 py-2"
                                                >
                                                    <BadgeText
                                                        style={{ color: colors.white }}
                                                        className={cn("text-sm", isSelected ? "font-extrabold" : "font-bold")}
                                                    >
                                                    {cat}
                                                    </BadgeText>
                                                </Badge>
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
                            className="-mx-6 flex-1"
                            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                        />
                    </View>
                ) : (
                    <View className="flex-1">
                        <View className="mb-6 flex-row items-center gap-3">
                            <View className="h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${colors.green}33` }}>
                                <Dumbbell size={24} color={colors.green} />
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
                        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                            {sets.map((set) => (
                                <StrengthSetRow
                                    key={set.id}
                                    item={set}
                                    onDelete={deleteSet}
                                    onToggleComplete={toggleSetComplete}
                                    onUpdate={updateSet}
                                />
                            ))}

                            {/* Add Set Button */}
                            <Button onPress={handleAddSet} variant="secondary" className="mt-3 w-full bg-secondary/80 py-3">
                                <ButtonText variant="secondary" className="text-accent">+ 添加下一组</ButtonText>
                            </Button>
                            <Text variant="caption" className="mt-3 text-center opacity-60">长按某组即可删除</Text>
                            <View className="h-6" />
                        </ScrollView>

                        <View className="mt-4 flex-row gap-2 border-t pt-2" style={{ borderTopColor: `${colors.gray3}4D` }}>
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
            </View>
        </BottomSheetModal>
    );
}
