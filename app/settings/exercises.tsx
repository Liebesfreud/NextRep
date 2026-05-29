import { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform, FlatList } from "react-native";
import { ChevronLeft, ChevronRight, Dumbbell, Plus, Search, Trash2, X } from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { getStrengthPresets, addStrengthPreset, removeStrengthPreset, type StrengthPresetItem } from "@/db/services/workout";
import { getStrengthExerciseAnalytics, type StrengthExerciseAnalytics } from "@/db/services/dashboard";
import { getStrengthCategoryVisual, STRENGTH_CATEGORIES } from "@/constants/exerciseVisuals";
import { AnimatedEnter } from "@/components/ui/AnimatedEnter";
import { ExerciseDetailModal } from "@/components/dashboard/ExerciseDetailModal";

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

    const handleAdd = async () => {
        const name = newName.trim();
        if (!name) return;
        if (presets.some((p) => p.name === name)) {
            Alert.alert("动作已存在");
            return;
        }

        await addStrengthPreset(name, newTag || "全身训练");
        setNewName("");
        setNewTag(null);
        setIsCreating(false);
        await loadData();
    };

    const handleDelete = (name: string) => {
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
    };

    const filteredExercises = analytics.filter((item) => {
        const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = selectedCategory === "全部" || item.tag === selectedCategory;
        return matchSearch && matchCategory;
    });

    const renderExerciseItem = ({ item }: { item: StrengthExerciseAnalytics }) => {
        const visual = getStrengthCategoryVisual(item.tag, colors);
        const Icon = visual.icon;
        const isPreset = presetNames.has(item.name);

        return (
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 0.75,
                    borderColor: `${visual.accent}24`,
                    borderRadius: 14,
                    backgroundColor: visual.cardBg ?? colors.gray2,
                    marginBottom: 8,
                    overflow: "hidden",
                }}
            >
                <Pressable
                    onPress={() => setSelectedExercise(item)}
                    style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingVertical: 12, paddingLeft: 12, paddingRight: 4 }}
                >
                    <View style={{ backgroundColor: visual.iconBg, width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                        <Icon size={19} color={visual.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <View className="flex-row items-center gap-2">
                            <Text style={{ color: colors.white, fontSize: 15, fontWeight: "900", flex: 1 }} numberOfLines={1}>
                                {item.name}
                            </Text>
                            {!isPreset ? (
                                <Text style={{ color: colors.gray4, fontSize: 10, fontWeight: "800" }}>
                                    历史
                                </Text>
                            ) : null}
                        </View>
                        <Text style={{ color: colors.gray4, fontSize: 11, fontWeight: "700", marginTop: 5 }} numberOfLines={1}>
                            {item.tag || "力量训练"} · {item.trainingDays} 天 · 最高 {formatWeight(item.maxWeightKg)} · {formatVolume(item.totalVolumeKg)}
                        </Text>
                        <Text style={{ color: colors.gray4, fontSize: 10, fontWeight: "600", marginTop: 3 }}>
                            最近 {formatDate(item.latestDateStr)}
                        </Text>
                    </View>
                    <ChevronRight size={18} color={colors.gray4} style={{ marginLeft: 6 }} />
                </Pressable>
                {isPreset ? (
                    <Pressable
                        onPress={() => handleDelete(item.name)}
                        hitSlop={8}
                        style={{ alignSelf: "stretch", width: 42, alignItems: "center", justifyContent: "center" }}
                    >
                        <Trash2 size={18} color={`${colors.red}99`} />
                    </Pressable>
                ) : null}
            </View>
        );
    };

    const renderEmptyList = () => (
        <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40, opacity: 0.6 }}>
            <Dumbbell size={40} color={colors.gray4} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.gray4, fontWeight: "bold" }}>没有找到动作</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: colors.bg }}>
            <AnimatedEnter delay={0} distance={10}>
                <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.bento, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <ChevronLeft size={24} color={colors.white} />
                        <Text style={{ color: colors.white, fontSize: 16, fontWeight: "bold" }}>返回</Text>
                    </Pressable>
                    <Text style={{ color: colors.white, fontSize: 18, fontWeight: "900" }}>动作库</Text>
                    <View style={{ width: 60 }} />
                </View>
            </AnimatedEnter>

            <AnimatedEnter delay={50} distance={12}>
                <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 }}>
                    <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                        <View style={{ backgroundColor: colors.gray2, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, height: 44, borderRadius: 12, flex: 1 }}>
                            <Search size={18} color={colors.gray4} />
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="搜索动作"
                                placeholderTextColor={`${colors.gray4}80`}
                                style={{ color: colors.white, fontSize: 15, fontWeight: "700", marginLeft: 10, flex: 1, padding: 0 }}
                            />
                            {searchQuery.length > 0 ? (
                                <Pressable onPress={() => setSearchQuery("")}>
                                    <X size={16} color={colors.gray4} />
                                </Pressable>
                            ) : null}
                        </View>
                        <Pressable
                            onPress={() => setIsCreating(!isCreating)}
                            style={{ backgroundColor: isCreating ? `${colors.green}1A` : colors.gray2, borderColor: isCreating ? colors.green : colors.border, borderWidth: 1, width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
                        >
                            {isCreating ? <X size={20} color={colors.green} /> : <Plus size={20} color={colors.white} />}
                        </Pressable>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
                        <View style={{ flexDirection: "row", gap: 8, paddingRight: 20, paddingBottom: 8 }}>
                            {categories.map((cat) => {
                                const isSelected = selectedCategory === cat;
                                const visual = cat === "全部" ? null : getStrengthCategoryVisual(cat, colors);
                                const accent = visual?.accent ?? colors.blue;
                                return (
                                    <Pressable
                                        key={cat}
                                        onPress={() => setSelectedCategory(cat)}
                                        style={{
                                            backgroundColor: isSelected ? `${accent}1A` : colors.gray2,
                                            borderColor: isSelected ? accent : colors.border,
                                            borderWidth: 1,
                                            paddingHorizontal: 12,
                                            paddingVertical: 7,
                                            borderRadius: 999,
                                        }}
                                    >
                                        <Text style={{ color: isSelected ? colors.white : colors.gray4, fontSize: 12, fontWeight: "800" }}>
                                            {cat}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </ScrollView>

                    {isCreating && (
                        <AnimatedEnter delay={0} distance={8}>
                            <View style={{ backgroundColor: colors.bento, borderColor: colors.border, borderWidth: 1, padding: 14, borderRadius: 16, marginTop: 6 }}>
                                <TextInput
                                    value={newName}
                                    onChangeText={setNewName}
                                    placeholder="例如：杠铃卧推"
                                    placeholderTextColor={`${colors.gray4}66`}
                                    style={{ color: colors.white, backgroundColor: colors.gray2, paddingHorizontal: 12, height: 42, borderRadius: 10, fontWeight: "800", fontSize: 15, marginBottom: 10 }}
                                />
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                                    <View style={{ flexDirection: "row", gap: 8 }}>
                                        {STRENGTH_CATEGORIES.map((tag) => {
                                            const visual = getStrengthCategoryVisual(tag, colors);
                                            const isSelected = tag === newTag;

                                            return (
                                                <Pressable
                                                    key={tag}
                                                    onPress={() => setNewTag(isSelected ? null : tag)}
                                                    style={{
                                                        backgroundColor: isSelected ? visual.iconBg : colors.gray2,
                                                        borderColor: isSelected ? visual.accent : colors.border,
                                                        borderWidth: 1,
                                                        paddingHorizontal: 12,
                                                        paddingVertical: 7,
                                                        borderRadius: 999,
                                                    }}
                                                >
                                                    <Text style={{ color: isSelected ? colors.white : colors.gray4, fontSize: 12, fontWeight: "800" }}>{tag}</Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </ScrollView>
                                <Pressable
                                    onPress={handleAdd}
                                    disabled={!newName.trim()}
                                    style={{ backgroundColor: colors.green, opacity: newName.trim() ? 1 : 0.5, paddingVertical: 12, borderRadius: 10, alignItems: "center" }}
                                >
                                    <Text style={{ color: colors.white, fontWeight: "900", fontSize: 15 }}>保存动作</Text>
                                </Pressable>
                            </View>
                        </AnimatedEnter>
                    )}
                </View>
            </AnimatedEnter>

            <AnimatedEnter delay={100} distance={14} style={{ flex: 1 }}>
                <FlatList
                    data={filteredExercises}
                    keyExtractor={(item) => item.name}
                    renderItem={renderExerciseItem}
                    ListEmptyComponent={renderEmptyList}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
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
