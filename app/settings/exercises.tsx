import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Dumbbell, Plus, Trash2, ChevronLeft, Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import { getStrengthPresets, addStrengthPreset, removeStrengthPreset, type StrengthPresetItem } from "@/db/services/workout";

export default function ExerciseManagementScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const [presets, setPresets] = useState<StrengthPresetItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newTag, setNewTag] = useState<string | null>(null);

    const categories = ["胸部训练", "肩部训练", "背部训练", "腿部训练", "手臂训练", "核心训练", "全身训练"];

    useEffect(() => {
        loadPresets();
    }, []);

    const loadPresets = async () => {
        const data = await getStrengthPresets();
        setPresets(data);
    };

    const handleAdd = async () => {
        const name = newName.trim();
        if (!name) return;
        if (presets.some(p => p.name === name)) {
            Alert.alert("动作已存在");
            return;
        }

        await addStrengthPreset(name, newTag || "全身训练");
        setNewName("");
        setNewTag(null);
        setIsCreating(false);
        await loadPresets();
    };

    const handleDelete = (name: string) => {
        Alert.alert("删除动作", `确定要删除 "${name}" 吗？`, [
            { text: "取消", style: "cancel" },
            {
                text: "删除",
                style: "destructive",
                onPress: async () => {
                    await removeStrengthPreset(name);
                    await loadPresets();
                }
            }
        ]);
    };

    const filteredPresets = presets.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: colors.bg }}>
            {/* Header */}
            <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.bento, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <ChevronLeft size={24} color={colors.white} />
                    <Text style={{ color: colors.white, fontSize: 16, fontWeight: "bold" }}>设置</Text>
                </Pressable>
                <Text style={{ color: colors.white, fontSize: 18, fontWeight: "900" }}>动作库管理</Text>
                <View style={{ width: 60 }} />
            </View>

            <View style={{ flex: 1 }}>
                <View style={{ padding: 20 }}>
                    {/* Search */}
                    <View style={{ backgroundColor: colors.gray2, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, marginBottom: 16 }}>
                        <Search size={18} color={colors.gray4} />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="搜索动作..."
                            placeholderTextColor={`${colors.gray4}80`}
                            style={{ color: colors.white, fontSize: 16, fontWeight: "600", marginLeft: 10, flex: 1, padding: 0 }}
                        />
                    </View>

                    <Pressable onPress={() => setIsCreating(!isCreating)} style={{ backgroundColor: isCreating ? `${colors.green}1A` : colors.gray2, borderColor: isCreating ? colors.green : colors.border, borderWidth: 1, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
                        <Plus size={20} color={isCreating ? colors.green : colors.white} />
                        <Text style={{ color: isCreating ? colors.green : colors.white, fontWeight: "bold", fontSize: 16 }}>
                            {isCreating ? "取消添加" : "添加新动作"}
                        </Text>
                    </Pressable>

                    {isCreating && (
                        <View style={{ backgroundColor: colors.bento, borderColor: colors.border, borderWidth: 1, padding: 16, borderRadius: 24, marginBottom: 24 }}>
                            <TextInput
                                value={newName}
                                onChangeText={setNewName}
                                placeholder="例如：杠铃区卧推"
                                placeholderTextColor={`${colors.gray4}66`}
                                style={{ color: colors.white, backgroundColor: "rgba(0,0,0,0.2)", padding: 14, borderRadius: 12, fontWeight: "bold", fontSize: 16, marginBottom: 12 }}
                            />
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                                <View style={{ flexDirection: "row", gap: 8 }}>
                                    {categories.map(tag => (
                                        <Pressable key={tag} onPress={() => setNewTag(tag === newTag ? null : tag)}
                                            style={{
                                                backgroundColor: tag === newTag ? `${colors.green}33` : "rgba(255,255,255,0.05)",
                                                borderColor: tag === newTag ? `${colors.green}80` : "transparent",
                                                borderWidth: 1,
                                                paddingHorizontal: 12,
                                                paddingVertical: 8,
                                                borderRadius: 12,
                                            }}>
                                            <Text style={{ color: tag === newTag ? colors.green : colors.gray4, fontSize: 14, fontWeight: "bold" }}>{tag}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </ScrollView>
                            <Pressable
                                onPress={handleAdd}
                                disabled={!newName.trim()}
                                style={{ backgroundColor: colors.green, opacity: newName.trim() ? 1 : 0.5, paddingVertical: 14, borderRadius: 12, alignItems: "center" }}>
                                <Text style={{ color: colors.white, fontWeight: "bold", fontSize: 16 }}>保存</Text>
                            </Pressable>
                        </View>
                    )}
                </View>

                {/* List */}
                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
                    {filteredPresets.map((p, i) => (
                        <View key={i} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: `${colors.gray3}4D` }}>
                            <View style={{ backgroundColor: `${colors.green}1A`, width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                                <Dumbbell size={20} color={colors.green} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.white, fontSize: 16, fontWeight: "bold", marginBottom: 4 }}>{p.name}</Text>
                                <Text style={{ color: colors.gray4, fontSize: 12, fontWeight: "600" }}>{p.tag || "自定义动作"}</Text>
                            </View>
                            <Pressable onPress={() => handleDelete(p.name)} style={{ padding: 8 }}>
                                <Trash2 size={20} color={`${colors.red}99`} />
                            </Pressable>
                        </View>
                    ))}
                    {filteredPresets.length === 0 && (
                        <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40, opacity: 0.5 }}>
                            <Dumbbell size={40} color={colors.gray4} style={{ marginBottom: 12 }} />
                            <Text style={{ color: colors.gray4, fontWeight: "bold" }}>列表空空如也</Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}
