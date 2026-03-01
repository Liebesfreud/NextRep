import { useEffect, useState } from "react";
import {
    View, Text, ScrollView, Pressable, TextInput,
    Alert, Switch,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import {
    Moon, Sun, Settings as SettingsIcon, User, ChevronRight,
    Save, Check, Database, Download, Upload, Trash2,
} from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { getUserProfile, updateUserProfile, type UserProfileData } from "@/db/services/profile";
import { exportAllData, importAllData, clearDatabase } from "@/db/services/data";

// ─── Simple Picker Option ─────────────────────────────────────────────────────

function PickerSelect({
    label, value, options, onChange, colors,
}: {
    label: string;
    value: string | null;
    options: { label: string; value: string }[];
    onChange: (v: string | null) => void;
    colors: any;
}) {
    const currentLabel = options.find(o => o.value === value)?.label || "未设置";
    return (
        <Pressable
            onPress={() => {
                const allOpts = [{ label: "未设置", value: "" }, ...options];
                Alert.alert(label, undefined, [
                    ...allOpts.map(o => ({
                        text: o.label,
                        style: o.value === value ? "destructive" as const : "default" as const,
                        onPress: () => onChange(o.value || null),
                    })),
                    { text: "取消", style: "cancel" },
                ]);
            }}
            style={{ flex: 1, alignItems: "flex-end" }}
        >
            <Text style={{ color: colors.white, backgroundColor: colors.gray2, fontWeight: "700", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, minWidth: 80, textAlign: "right" }}>
                {currentLabel}
            </Text>
        </Pressable>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SettingsScreen() {
    const { colors, theme, toggleTheme } = useTheme();
    const [isSaved, setIsSaved] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const [profile, setProfile] = useState<UserProfileData>({
        name: "健身达人",
        height: null,
        age: null,
        gender: null,
        goal: null,
        aiBaseUrl: null,
        aiApiKey: null,
        aiModel: null,
    });

    useEffect(() => {
        getUserProfile().then(setProfile);
    }, []);

    const handleSave = async () => {
        setIsPending(true);
        try {
            await updateUserProfile(profile);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } finally {
            setIsPending(false);
        }
    };

    const handleExport = async () => {
        try {
            const data = await exportAllData();
            const json = JSON.stringify(data, null, 2);
            const filename = `nextrep-backup-${new Date().toISOString().slice(0, 10)}.json`;
            const docDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? "";
            const path = `${docDir}${filename}`;
            await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });
            await Sharing.shareAsync(path, { mimeType: "application/json", dialogTitle: "导出 NextRep 数据" });
        } catch (e: any) {
            Alert.alert("导出失败", e.message);
        }
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: "application/json" });
            if (result.canceled) return;
            const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
            const data = JSON.parse(content);
            Alert.alert("确认导入", "确定要导入数据吗？这将覆盖当前的所有数据且不可撤销。", [
                { text: "取消", style: "cancel" },
                {
                    text: "确认导入",
                    style: "destructive",
                    onPress: async () => {
                        await importAllData(data);
                        Alert.alert("导入成功", "数据已成功恢复");
                    },
                },
            ]);
        } catch (e: any) {
            Alert.alert("导入失败", "文件格式不正确");
        }
    };

    const handleClear = () => {
        Alert.alert("⚠️ 清空数据", "确定要清空所有数据吗？此操作无法恢复！", [
            { text: "取消", style: "cancel" },
            {
                text: "确认清空",
                style: "destructive",
                onPress: async () => {
                    await clearDatabase();
                    Alert.alert("已完成", "所有数据已清空");
                },
            },
        ]);
    };

    // ─── Shared Styles ─────────────────────────────────────────────────────────

    const inputStyle = {
        color: colors.white,
        backgroundColor: colors.gray2,
        fontWeight: "700" as const,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        textAlign: "right" as const,
        minWidth: 128,
        borderWidth: 1,
        borderColor: `${colors.gray3}4D`,
    };

    const markdownStyles = {
        body: { color: colors.white, fontSize: 14, lineHeight: 22 },
        strong: { color: colors.green },
        link: { color: colors.green },
        code_block: { backgroundColor: colors.gray2, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: colors.border },
        code_inline: { backgroundColor: colors.gray2, borderRadius: 4, paddingHorizontal: 4 },
        heading1: { color: colors.white, fontWeight: "700" as const },
        heading2: { color: colors.white, fontWeight: "700" as const },
        heading3: { color: colors.white, fontWeight: "600" as const },
        list_item: { color: colors.white },
        bullet_list_icon: { color: colors.green },
        ordered_list_icon: { color: colors.green },
    };

    const cardStyle = {
        backgroundColor: colors.bento,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    };

    const rowStyle = {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "space-between" as const,
        padding: 8,
    };

    const dividerStyle = {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: 8,
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 120, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Title + Save ── */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <SettingsIcon size={24} color={colors.white} />
                        <Text style={{ color: colors.white }} className="text-2xl font-bold">设置</Text>
                    </View>
                    <Pressable
                        onPress={handleSave}
                        disabled={isPending}
                        style={{
                            backgroundColor: isSaved ? colors.green : colors.green,
                            opacity: isPending ? 0.5 : 1,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 12,
                        }}
                    >
                        {isSaved
                            ? <Check size={16} color="#000" />
                            : <Save size={16} color={colors.white} />
                        }
                        <Text style={{ color: isSaved ? "#000" : colors.white, fontWeight: "700" }}>
                            {isPending ? "保存中..." : isSaved ? "已保存" : "保存设置"}
                        </Text>
                    </Pressable>
                </View>

                {/* ── Appearance ── */}
                <View style={cardStyle}>
                    <View className="flex-row items-center gap-2 mb-3">
                        {theme === "dark" ? <Moon size={16} color={colors.gray4} /> : <Sun size={16} color={colors.gray4} />}
                        <Text style={{ color: colors.gray4 }} className="text-sm font-bold tracking-wide uppercase">外观</Text>
                    </View>
                    <View style={rowStyle}>
                        <Text style={{ color: colors.white, fontWeight: "700", fontSize: 15 }}>深色模式</Text>
                        <Switch
                            value={theme === "dark"}
                            onValueChange={() => toggleTheme()}
                            trackColor={{ false: colors.gray2, true: colors.green }}
                            thumbColor={colors.white}
                        />
                    </View>
                </View>

                {/* ── Profile ── */}
                <View style={cardStyle}>
                    <View className="flex-row items-center gap-2 mb-3">
                        <User size={16} color={colors.gray4} />
                        <Text style={{ color: colors.gray4 }} className="text-sm font-bold tracking-wide uppercase">用户画像</Text>
                    </View>

                    <View style={rowStyle}>
                        <Text style={{ color: colors.white, fontWeight: "700", fontSize: 15 }}>昵称</Text>
                        <TextInput
                            value={profile.name}
                            onChangeText={(v) => setProfile(p => ({ ...p, name: v }))}
                            placeholder="你的名字"
                            placeholderTextColor={`${colors.gray4}66`}
                            style={inputStyle}
                        />
                    </View>

                    <View style={dividerStyle} />

                    <View style={rowStyle}>
                        <Text style={{ color: colors.white, fontWeight: "700", fontSize: 15 }}>身高 (cm)</Text>
                        <TextInput
                            keyboardType="number-pad"
                            value={profile.height ? String(profile.height) : ""}
                            onChangeText={(v) => setProfile(p => ({ ...p, height: v ? parseFloat(v) : null }))}
                            placeholder="175"
                            placeholderTextColor={`${colors.gray4}66`}
                            style={inputStyle}
                        />
                    </View>

                    <View style={dividerStyle} />

                    <View style={rowStyle}>
                        <Text style={{ color: colors.white, fontWeight: "700", fontSize: 15 }}>年龄</Text>
                        <TextInput
                            keyboardType="number-pad"
                            value={profile.age ? String(profile.age) : ""}
                            onChangeText={(v) => setProfile(p => ({ ...p, age: v ? parseInt(v) : null }))}
                            placeholder="25"
                            placeholderTextColor={`${colors.gray4}66`}
                            style={inputStyle}
                        />
                    </View>

                    <View style={dividerStyle} />

                    <View style={rowStyle}>
                        <Text style={{ color: colors.white, fontWeight: "700", fontSize: 15 }}>性别</Text>
                        <PickerSelect
                            label="选择性别"
                            value={profile.gender}
                            options={[
                                { label: "男", value: "male" },
                                { label: "女", value: "female" },
                                { label: "其他", value: "other" },
                            ]}
                            onChange={(v) => setProfile(p => ({ ...p, gender: v }))}
                            colors={colors}
                        />
                    </View>

                    <View style={dividerStyle} />

                    <View style={rowStyle}>
                        <Text style={{ color: colors.white, fontWeight: "700", fontSize: 15 }}>健身目标</Text>
                        <PickerSelect
                            label="选择目标"
                            value={profile.goal}
                            options={[
                                { label: "增肌", value: "build-muscle" },
                                { label: "减脂", value: "lose-weight" },
                                { label: "保持", value: "maintain" },
                            ]}
                            onChange={(v) => setProfile(p => ({ ...p, goal: v }))}
                            colors={colors}
                        />
                    </View>
                </View>

                {/* ── AI Config ── */}
                <View style={cardStyle}>
                    <View className="flex-row items-center gap-2 mb-3">
                        <SettingsIcon size={16} color={colors.gray4} />
                        <Text style={{ color: colors.gray4 }} className="text-sm font-bold tracking-wide uppercase">AI 配置</Text>
                    </View>

                    {[
                        { label: "Base URL", key: "aiBaseUrl" as const, placeholder: "https://api.openai.com/v1", secure: false },
                        { label: "API Key", key: "aiApiKey" as const, placeholder: "sk-...", secure: true },
                        { label: "Model", key: "aiModel" as const, placeholder: "gpt-4o", secure: false },
                    ].map(({ label, key, placeholder, secure }, i) => (
                        <View key={key}>
                            {i > 0 && <View style={dividerStyle} />}
                            <View style={rowStyle}>
                                <Text style={{ color: colors.white, fontWeight: "700", fontSize: 15 }}>{label}</Text>
                                <TextInput
                                    value={profile[key] || ""}
                                    onChangeText={(v) => setProfile(p => ({ ...p, [key]: v || null }))}
                                    placeholder={placeholder}
                                    placeholderTextColor={`${colors.gray4}66`}
                                    secureTextEntry={secure}
                                    autoCapitalize="none"
                                    style={{ ...inputStyle, minWidth: 160 }}
                                />
                            </View>
                        </View>
                    ))}
                </View>

                {/* ── Data Management ── */}
                <View style={cardStyle}>
                    <View className="flex-row items-center gap-2 mb-3">
                        <Database size={16} color={colors.gray4} />
                        <Text style={{ color: colors.gray4 }} className="text-sm font-bold tracking-wide uppercase">数据管理</Text>
                    </View>

                    <View className="gap-bento">
                        {/* Export */}
                        <Pressable onPress={handleExport}
                            style={{ backgroundColor: colors.border, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <View className="flex-row items-center gap-3">
                                <View style={{ backgroundColor: `${colors.green}1A`, width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                                    <Download size={20} color={colors.green} />
                                </View>
                                <View>
                                    <Text style={{ color: colors.white, fontWeight: "700", fontSize: 14 }}>导出备份</Text>
                                    <Text style={{ color: colors.gray4, fontSize: 10, fontWeight: "500" }}>将所有记录导出为 JSON 文件</Text>
                                </View>
                            </View>
                            <ChevronRight size={16} color={colors.gray4} />
                        </Pressable>

                        {/* Import */}
                        <Pressable onPress={handleImport}
                            style={{ backgroundColor: `${colors.gray3}80`, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <View className="flex-row items-center gap-3">
                                <View style={{ backgroundColor: `${colors.green}1A`, width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                                    <Upload size={20} color={colors.green} />
                                </View>
                                <View>
                                    <Text style={{ color: colors.white, fontWeight: "700", fontSize: 14 }}>导入数据</Text>
                                    <Text style={{ color: colors.gray4, fontSize: 10, fontWeight: "500" }}>从备份文件恢复数据（将覆盖当前）</Text>
                                </View>
                            </View>
                            <ChevronRight size={16} color={colors.gray4} />
                        </Pressable>

                        {/* Clear */}
                        <Pressable onPress={handleClear}
                            style={{ backgroundColor: `${colors.red}0D`, borderWidth: 1, borderColor: `${colors.red}1A`, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <View className="flex-row items-center gap-3">
                                <View style={{ backgroundColor: `${colors.red}1A`, width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                                    <Trash2 size={20} color={colors.red} />
                                </View>
                                <View>
                                    <Text style={{ color: colors.red, fontWeight: "700", fontSize: 14 }}>清空所有数据</Text>
                                    <Text style={{ color: colors.gray4, fontSize: 10, fontWeight: "500" }}>永久删除所有运动记录和设置</Text>
                                </View>
                            </View>
                            <ChevronRight size={16} color={colors.gray4} />
                        </Pressable>
                    </View>
                </View>

                {/* ── Version ── */}
                <View style={{ ...cardStyle, alignItems: "center", paddingVertical: 32 }}>
                    <Text style={{ color: colors.gray4, fontSize: 11, fontWeight: "700", letterSpacing: 3, opacity: 0.8 }}>NEXTREP V1.0</Text>
                    <Text style={{ color: colors.gray4, fontSize: 10, marginTop: 4, opacity: 0.5 }}>数据存储于本地 SQLite 数据库</Text>
                </View>
            </ScrollView>
        </View>
    );
}
