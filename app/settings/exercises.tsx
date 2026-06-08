import { useCallback, useMemo, useState } from "react";
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform, FlatList } from "react-native";
import { ChevronLeft, ChevronRight, Dumbbell, Plus, Search, Trash2, X } from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { getStrengthPresets, addStrengthPreset, removeStrengthPreset, type StrengthPresetItem } from "@/db/services/workout";
import { getStrengthExerciseAnalytics, type StrengthExerciseAnalytics } from "@/db/services/dashboard";
import { getStrengthCategoryVisual, STRENGTH_CATEGORIES } from "@/constants/exerciseVisuals";
import { AnimatedEnter } from "@/components/ui/AnimatedEnter";
import { ExerciseDetailModal } from "@/components/dashboard/ExerciseDetailModal";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

function formatWeight(value: number | null | undefined) {
    if (!value) return "--";
    return Number.isInteger(value) ? `${value} kg` : `${value.toFixed(1)} kg`;
}

function formatVolume(value: number) {
    if (!value) return "0 kg";
    if (value >= 1000) return `${(value / 1000).toFixed(1)} t`;
    return `${Math.round(value)} kg`;
}

function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return "未训练";
    return dateStr.slice(5).replace("-", "/");
}

export default function ExerciseManagementScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const [presets, setPresets] = useState<StrengthPresetItem[]>([]);
    const [analytics, setAnalytics] = useState<StrengthExerciseAnalytics[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<StrengthExerciseAnalytics | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("全部");
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newTag, setNewTag] = useState<string | null>(null);

    const categories = useMemo(() => ["全部", ...STRENGTH_CATEGORIES], []);
    const presetNames = useMemo(() => new Set(presets.map((preset) => preset.name)), [presets]);
    const normalizedSearchQuery = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);
    const libraryCount = presets.length;
    const trainedCount = useMemo(() => analytics.filter((item) => item.records > 0).length, [analytics]);

    const loadData = useCallback(async () => {
        const [presetData, analyticsData] = await Promise.all([
            getStrengthPresets(),
            getStrengthExerciseAnalytics(),
        ]);
        setPresets(presetData);
        setAnalytics(analyticsData);
    }, []);

    useFocusEffect(useCallback(() => {
        loadData().catch(console.error);
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

    const handleDelete = useCallback((name: string) => {
        Alert.alert("删除动作", `确定要从动作库删除 "${name}" 吗？历史训练记录不会被删除。`, [
            { text: "取消", style: "cancel" },
            {
                text: "删除",
                style: "destructive",
                onPress: async () => {
                    await removeStrengthPreset(name);
                    await loadData();
                }
            }
        ]);
    }, [loadData]);

    const filteredExercises = useMemo(
        () => analytics.filter((item) => {
            const matchSearch = !normalizedSearchQuery || item.name.toLowerCase().includes(normalizedSearchQuery);
            const matchCategory = selectedCategory === "全部" || item.tag === selectedCategory;
            return matchSearch && matchCategory;
        }),
        [analytics, normalizedSearchQuery, selectedCategory]
    );

    const renderExerciseItem = useCallback(({ item }: { item: StrengthExerciseAnalytics }) => {
        const visual = getStrengthCategoryVisual(item.tag, colors);
        const Icon = visual.icon;
        const isPreset = presetNames.has(item.name);

        return (
            <Card
                style={{
                    borderColor: `${visual.accent}24`,
                    backgroundColor: visual.cardBg ?? colors.gray2,
                }}
                className="mb-2 flex-row items-center overflow-hidden rounded-[14px] border p-0"
            >
                <Button
                    onPress={() => setSelectedExercise(item)}
                    variant="ghost"
                    className="flex-1 justify-start rounded-none py-3 pl-3 pr-1"
                >
                    <View style={{ backgroundColor: visual.iconBg }} className="mr-3 h-[42px] w-[42px] items-center justify-center rounded-xl">
                        <Icon size={19} color={visual.accent} />
                    </View>
                    <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                            <Text className="flex-1 text-[15px] font-black" numberOfLines={1}>
                                {item.name}
                            </Text>
                            {!isPreset ? (
                                <Text variant="caption" className="text-[10px] font-extrabold">
                                    历史
                                </Text>
                            ) : null}
                        </View>
                        <Text variant="caption" className="mt-1 font-bold" numberOfLines={1}>
                            {item.tag || "力量训练"} · {item.trainingDays} 天 · 最高 {formatWeight(item.maxWeightKg)} · {formatVolume(item.totalVolumeKg)}
                        </Text>
                        <Text variant="caption" className="mt-0.5 text-[10px] font-semibold">
                            最近 {formatDate(item.latestDateStr)}
                        </Text>
                    </View>
                    <ChevronRight size={18} color={colors.gray4} className="ml-1.5" />
                </Button>
                {isPreset ? (
                    <Button
                        onPress={() => handleDelete(item.name)}
                        variant="ghost"
                        size="icon"
                        hitSlop={8}
                        className="h-auto self-stretch rounded-none"
                    >
                        <Trash2 size={18} color={`${colors.red}99`} />
                    </Button>
                ) : null}
            </Card>
        );
    }, [colors, handleDelete, presetNames]);

    const renderEmptyList = useCallback(() => (
        <View className="items-center justify-center gap-3 rounded-bento-lg border border-border bg-card/60 px-6 py-10 opacity-80">
            <Dumbbell size={40} color={colors.gray4} />
            <Text variant="label" className="text-center">没有找到动作</Text>
            <Text variant="caption" className="text-center font-semibold">
                {searchQuery || selectedCategory !== "全部" ? "试试清空搜索或切换分类" : "点击右上角 + 添加你的第一个力量动作"}
            </Text>
        </View>
    ), [colors.gray4, searchQuery, selectedCategory]);

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-background">
            <AnimatedEnter delay={0} distance={10}>
                <View className="flex-row items-center justify-between border-b border-border bg-card px-5 pb-4 pt-[60px]">
                    <Button onPress={() => router.back()} variant="ghost" size="sm" className="h-auto gap-1 px-0 py-0">
                        <ChevronLeft size={24} color={colors.white} />
                        <ButtonText variant="ghost" className="text-base text-foreground">返回</ButtonText>
                    </Button>
                    <Text className="text-lg font-black">动作库</Text>
                    <View className="w-[60px]" />
                </View>
            </AnimatedEnter>

            <AnimatedEnter delay={50} distance={12}>
                <View className="px-5 pb-2.5 pt-4">
                    <View className="mb-3 flex-row gap-2.5">
                        <View className="h-11 flex-1 flex-row items-center rounded-bento-sm bg-secondary px-3.5">
                            <Search size={18} color={colors.gray4} />
                            <Input
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="搜索动作"
                                className="ml-2.5 min-h-0 flex-1 border-0 bg-transparent p-0 text-[15px] font-bold"
                            />
                            {searchQuery.length > 0 ? (
                                <Button
                                    onPress={() => setSearchQuery("")}
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                >
                                    <X size={16} color={colors.gray4} />
                                </Button>
                            ) : null}
                        </View>
                        <Button
                            onPress={() => setIsCreating(!isCreating)}
                            variant={isCreating ? "outline" : "secondary"}
                            size="icon"
                            className={isCreating ? "border-accent bg-accent/10" : undefined}
                        >
                            {isCreating ? <X size={20} color={colors.green} /> : <Plus size={20} color={colors.white} />}
                        </Button>
                    </View>

                    <View className="mb-3 flex-row gap-2.5">
                        <Card className="flex-1 p-3">
                            <Text variant="caption" className="font-extrabold uppercase tracking-widest">动作库</Text>
                            <Text className="mt-1 text-xl font-black">{libraryCount}</Text>
                        </Card>
                        <Card className="flex-1 p-3">
                            <Text variant="caption" className="font-extrabold uppercase tracking-widest">已训练</Text>
                            <Text className="mt-1 text-xl font-black">{trainedCount}</Text>
                        </Card>
                        <Card className="flex-1 p-3">
                            <Text variant="caption" className="font-extrabold uppercase tracking-widest">筛选后</Text>
                            <Text className="mt-1 text-xl font-black">{filteredExercises.length}</Text>
                        </Card>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
                        <View className="flex-row gap-2 pb-2 pr-5">
                            {categories.map((cat) => {
                                const isSelected = selectedCategory === cat;
                                const visual = cat === "全部" ? null : getStrengthCategoryVisual(cat, colors);
                                const accent = visual?.accent ?? colors.blue;
                                return (
                                    <Button
                                        key={cat}
                                        onPress={() => setSelectedCategory(cat)}
                                        variant="ghost"
                                        className="h-auto bg-transparent p-0"
                                    >
                                        <Badge
                                            variant={isSelected ? "default" : "secondary"}
                                            style={isSelected ? { backgroundColor: `${accent}1A`, borderColor: accent } : undefined}
                                            className={isSelected ? "border px-3 py-2" : "border border-border bg-secondary px-3 py-2"}
                                        >
                                            <BadgeText className={isSelected ? "text-white" : "text-muted-foreground"}>{cat}</BadgeText>
                                        </Badge>
                                    </Button>
                                );
                            })}
                        </View>
                    </ScrollView>

                    {isCreating && (
                        <AnimatedEnter delay={0} distance={8}>
                            <Card className="mt-1.5 p-3.5">
                                <Input
                                    value={newName}
                                    onChangeText={setNewName}
                                    placeholder="例如：杠铃卧推"
                                    className="mb-2.5 h-[42px] font-extrabold"
                                />
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                                    <View className="flex-row gap-2">
                                        {STRENGTH_CATEGORIES.map((tag) => {
                                            const visual = getStrengthCategoryVisual(tag, colors);
                                            const isSelected = tag === newTag;

                                            return (
                                                <Button
                                                    key={tag}
                                                    onPress={() => setNewTag(isSelected ? null : tag)}
                                                    variant="ghost"
                                                    className="h-auto bg-transparent p-0"
                                                >
                                                    <Badge
                                                        variant={isSelected ? "default" : "secondary"}
                                                        style={isSelected ? { backgroundColor: visual.iconBg, borderColor: visual.accent } : undefined}
                                                        className={isSelected ? "border px-3 py-2" : "border border-border bg-secondary px-3 py-2"}
                                                    >
                                                        <BadgeText className={isSelected ? "text-white" : "text-muted-foreground"}>{tag}</BadgeText>
                                                    </Badge>
                                                </Button>
                                            );
                                        })}
                                    </View>
                                </ScrollView>
                                <Button
                                    onPress={handleAdd}
                                    disabled={!newName.trim()}
                                    className="bg-accent"
                                >
                                    <ButtonText className="text-accent-foreground">保存动作</ButtonText>
                                </Button>
                            </Card>
                        </AnimatedEnter>
                    )}
                </View>
            </AnimatedEnter>

            <AnimatedEnter delay={100} distance={14} className="flex-1">
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
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 110 }}
                />
            </AnimatedEnter>

            <ExerciseDetailModal
                visible={!!selectedExercise}
                exercise={selectedExercise}
                onClose={() => setSelectedExercise(null)}
            />
        </KeyboardAvoidingView>
    );
}
