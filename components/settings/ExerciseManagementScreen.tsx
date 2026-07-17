import { useCallback, useMemo, useRef, useState } from "react";
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform, FlatList } from "react-native";
import { ChevronLeft, Plus, Search, X } from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { getStrengthPresets, addStrengthPreset, type StrengthPresetItem } from "@/db/services/workout";
import {
    getStrengthExerciseDetail,
    getStrengthExerciseSummaries,
    type StrengthExerciseAnalytics,
    type StrengthExerciseSummary,
} from "@/db/services/dashboard";
import { getStrengthCategoryVisual, STRENGTH_CATEGORIES } from "@/constants/exerciseVisuals";
import { ExerciseDetailModal } from "@/components/dashboard/ExerciseDetailModal";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

export default function ExerciseManagementScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [presets, setPresets] = useState<StrengthPresetItem[]>([]);
    const [analytics, setAnalytics] = useState<StrengthExerciseSummary[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<StrengthExerciseAnalytics | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("全部");
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newTag, setNewTag] = useState<string | null>(null);
    const loadSeqRef = useRef(0);
    const detailSeqRef = useRef(0);

    const categories = useMemo(() => ["全部", ...STRENGTH_CATEGORIES], []);
    const presetNames = useMemo(() => new Set(presets.map((preset) => preset.name)), [presets]);
    const normalizedSearchQuery = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);
    const libraryCount = presets.length;
    const trainedCount = useMemo(() => analytics.filter((item) => item.records > 0).length, [analytics]);

    const loadData = useCallback(async () => {
        const requestId = ++loadSeqRef.current;
        const [presetData, analyticsData] = await Promise.all([
            getStrengthPresets(),
            getStrengthExerciseSummaries({ includeLibraryOnly: true }),
        ]);
        if (requestId !== loadSeqRef.current) return;
        setPresets(presetData);
        setAnalytics(analyticsData);
    }, []);

    useFocusEffect(useCallback(() => {
        loadData().catch(console.error);
        return () => {
            loadSeqRef.current += 1;
        };
    }, [loadData]));

    const handleAdd = useCallback(async () => {
        const name = newName.trim();
        if (!name) return;
        if (presetNames.has(name)) {
            Alert.alert("动作已存在");
            return;
        }

        await addStrengthPreset(name, newTag || "全身训练");
        setNewName("");
        setNewTag(null);
        setIsCreating(false);
        await loadData();
    }, [loadData, newName, newTag, presetNames]);

    const filteredExercises = useMemo(
        () => analytics.filter((item) => {
            const matchSearch = !normalizedSearchQuery || item.name.toLowerCase().includes(normalizedSearchQuery);
            const matchCategory = selectedCategory === "全部" || item.tag === selectedCategory;
            return matchSearch && matchCategory;
        }),
        [analytics, normalizedSearchQuery, selectedCategory]
    );

    const openExerciseDetail = useCallback((item: StrengthExerciseSummary) => {
        const requestId = ++detailSeqRef.current;
        setSelectedExercise(null);
        getStrengthExerciseDetail(item.name)
            .then((detail) => {
                if (requestId === detailSeqRef.current) setSelectedExercise(detail);
            })
            .catch(console.error);
    }, []);

    const renderExerciseItem = useCallback(({ item }: { item: StrengthExerciseSummary }) => {
        return (
            <Card className="mb-1.5 overflow-hidden p-0">
                <AnimatedPressable
                    onPress={() => openExerciseDetail(item)}
                    activeScale={0.99}
                    className="min-h-12 flex-row items-center gap-3 px-card-padding py-2"
                    accessibilityRole="button"
                    accessibilityLabel={`查看 ${item.name} 训练详情`}
                >
                    <Text variant="caption" className="w-20 shrink-0 text-muted-foreground" numberOfLines={1}>
                        {item.tag || "力量训练"}
                    </Text>
                    <Text variant="body-semibold" className="min-w-0 flex-1 text-right" numberOfLines={1}>
                        {item.name}
                    </Text>
                </AnimatedPressable>
            </Card>
        );
    }, [openExerciseDetail]);

    const renderEmptyList = useCallback(() => (
        <Card className="items-center justify-center border-dashed py-12">
            <Text variant="body-semibold">暂无结果</Text>
            <Text variant="caption" className="mt-1">调整搜索词或分类筛选</Text>
        </Card>
    ), []);

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-transparent">
            <View className="flex-row items-center justify-between px-edge-x pb-4" style={{ paddingTop: insets.top + 16 }}>
                <Button onPress={() => router.back()} accessibilityLabel="返回设置" variant="ghost" size="icon" className="-ml-3">
                    <ChevronLeft size={22} color={colors.foreground} />
                </Button>
                <Text variant="title" className="font-black">动作库</Text>
                <View className="h-12 w-12" />
            </View>

            <View className="pb-3" style={{ paddingHorizontal: 20 }}>
                <Card className="gap-4 p-card-padding">
                    <View className="flex-row gap-3">
                        <View className="min-h-12 flex-1 flex-row items-center rounded-lg bg-surface-elevated px-3">
                            <Search size={18} color={colors.textTertiary} />
                            <Input
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="搜索动作"
                                className="ml-2 min-h-0 flex-1 border-0 bg-transparent p-0 text-body"
                            />
                            {searchQuery.length > 0 ? (
                                <Button
                                    onPress={() => setSearchQuery("")}
                                    accessibilityLabel="清空动作搜索"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                >
                                    <X size={16} color={colors.textTertiary} />
                                </Button>
                            ) : null}
                        </View>
                        <Button
                            onPress={() => setIsCreating(!isCreating)}
                            accessibilityLabel={isCreating ? "取消新增动作" : "新增动作"}
                            variant={isCreating ? "outline" : "accent"}
                            size="icon"
                        >
                            {isCreating ? <X size={19} color={colors.foreground} /> : <Plus size={19} color={colors.white} />}
                        </Button>
                    </View>

                    <View className="flex-row rounded-lg bg-surface-elevated p-card-padding">
                        {[
                            { label: "动作", value: libraryCount },
                            { label: "已训练", value: trainedCount },
                            { label: "当前结果", value: filteredExercises.length },
                        ].map((stat, index) => (
                            <View key={stat.label} className={`flex-1 items-center gap-1 ${index > 0 ? "border-l border-border" : ""}`}>
                                <Text className="text-stat-value font-variant-numeric-tabular-nums">{stat.value}</Text>
                                <Text variant="micro">{stat.label}</Text>
                            </View>
                        ))}
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-card-padding px-card-padding">
                        <View className="flex-row gap-2 pr-card-padding">
                            {categories.map((cat) => {
                                const isSelected = selectedCategory === cat;
                                const visual = cat === "全部" ? null : getStrengthCategoryVisual(cat, colors);
                                const accent = visual?.accent ?? colors.accent;
                                return (
                                    <Button
                                        key={cat}
                                        onPress={() => setSelectedCategory(cat)}
                                        variant={isSelected ? "secondary" : "outline"}
                                        size="sm"
                                        className="rounded-pill"
                                    >
                                        <Text variant="caption" className={isSelected ? "font-semibold" : "text-muted-foreground"} style={isSelected ? { color: accent } : undefined}>
                                            {cat}
                                        </Text>
                                    </Button>
                                );
                            })}
                        </View>
                    </ScrollView>

                    {isCreating && (
                        <View className="gap-3 rounded-lg bg-surface-elevated p-card-padding">
                            <Text variant="body-semibold">新增动作</Text>
                            <Input
                                value={newName}
                                onChangeText={setNewName}
                                placeholder="例如：杠铃卧推"
                            />
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row gap-2">
                                    {STRENGTH_CATEGORIES.map((tag) => {
                                        const visual = getStrengthCategoryVisual(tag, colors);
                                        const isSelected = tag === newTag;

                                        return (
                                            <Button
                                                key={tag}
                                                onPress={() => setNewTag(isSelected ? null : tag)}
                                                variant={isSelected ? "secondary" : "outline"}
                                                size="sm"
                                                className="rounded-pill"
                                            >
                                                <Text variant="caption" className={isSelected ? "font-semibold" : "text-muted-foreground"} style={isSelected ? { color: visual.accent } : undefined}>
                                                    {tag}
                                                </Text>
                                            </Button>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                            <Button
                                onPress={handleAdd}
                                disabled={!newName.trim()}
                                variant="accent"
                            >
                                <ButtonText variant="accent">保存动作</ButtonText>
                            </Button>
                        </View>
                    )}
                </Card>
            </View>

            <View className="flex-1">
                <FlatList
                    data={filteredExercises}
                    keyExtractor={(item) => item.name}
                    renderItem={renderExerciseItem}
                    ListEmptyComponent={renderEmptyList}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    initialNumToRender={10}
                    maxToRenderPerBatch={8}
                    removeClippedSubviews={Platform.OS !== "web"}
                    windowSize={7}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 0, paddingBottom: 110 + Math.max(insets.bottom, 0) + 20 }}
                />
            </View>

            <ExerciseDetailModal
                visible={!!selectedExercise}
                exercise={selectedExercise}
                onClose={() => setSelectedExercise(null)}
            />
        </KeyboardAvoidingView>
    );
}
