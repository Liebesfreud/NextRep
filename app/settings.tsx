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
    Activity, ShieldCheck, AlertCircle, Zap
} from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { getUserProfile, updateUserProfile, type UserProfileData } from "@/db/services/profile";
import { exportAllData, importAllData, clearDatabase } from "@/db/services/data";
import { testAIConnection } from "@/db/services/ai";

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
    const [isTestingAI, setIsTestingAI] = useState(false);

    const [profile, setProfile] = useState<UserProfileData>({
        name: "健身达人",
        height: null,
        age: null,
        gender: null,
        goal: null,
        aiBaseUrl: null,
        aiApiKey: null,
        aiModel: null,
        aiConfigs: [],
        activeAiConfigId: null,
        aiTokensTotal: 0,
        aiTokensToday: 0,
        aiTokensDate: null,
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

    const handleTestAI = async () => {
        const activeConfig = profile.aiConfigs.find(c => c.id === profile.activeAiConfigId);
        if (!activeConfig || !activeConfig.apiKey) {
            Alert.alert("测试失败", "当前激活的配置缺少 API Key");
            return;
        }

        setIsTestingAI(true);
        try {
            await testAIConnection(activeConfig.baseUrl, activeConfig.apiKey, activeConfig.model);
            Alert.alert(`🎉 测试成功`, `已成功连接到 [${activeConfig.name}]，可以正常与模型通信。`);
        } catch (e: any) {
            Alert.alert("测试失败", e.message);
        } finally {
            setIsTestingAI(false);
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

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 120, gap: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ── */}
                <View className="flex-row items-center justify-between">
                    <Text style={{ color: colors.white }} className="text-3xl font-extrabold tracking-tight">配置</Text>
                    <Pressable
                        onPress={handleSave}
                        disabled={isPending}
                        style={{
                            backgroundColor: isSaved ? `${colors.green}1A` : colors.green,
                            opacity: isPending ? 0.5 : 1,
                            borderColor: isSaved ? `${colors.green}33` : "transparent",
                            borderWidth: 1,
                        }}
                        className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl"
                    >
                        {isSaved
                            ? <Check size={16} color={colors.green} strokeWidth={3} />
                            : <Save size={16} color={colors.bg} strokeWidth={2.5} />
                        }
                        <Text style={{ color: isSaved ? colors.green : colors.bg }} className="font-bold">
                            {isPending ? "保存中" : isSaved ? "已保存" : "保存所有配置"}
                        </Text>
                    </Pressable>
                </View>

                {/* ── Appearance ── */}
                <View style={{ backgroundColor: colors.bento, borderColor: colors.border }} className="rounded-bento-lg border p-4 gap-4">
                    <View className="flex-row items-center gap-2 px-1">
                        {theme === "dark" ? <Moon size={18} color={colors.gray4} /> : <Sun size={18} color={colors.gray4} />}
                        <Text style={{ color: colors.gray4 }} className="text-xs font-extrabold tracking-widest uppercase">外观与显示</Text>
                    </View>
                    <View style={{ backgroundColor: colors.gray2, borderColor: colors.border }} className="flex-row items-center justify-between p-4 rounded-bento-sm border">
                        <Text style={{ color: colors.white }} className="font-bold text-base">深色模式</Text>
                        <Switch
                            value={theme === "dark"}
                            onValueChange={() => toggleTheme()}
                            trackColor={{ false: colors.gray4, true: colors.green }}
                            thumbColor={colors.white}
                        />
                    </View>
                </View>

                {/* ── Profile ── */}
                <View style={{ backgroundColor: colors.bento, borderColor: colors.border }} className="rounded-bento-lg border p-4 gap-4">
                    <View className="flex-row items-center gap-2 px-1">
                        <User size={18} color={colors.gray4} />
                        <Text style={{ color: colors.gray4 }} className="text-xs font-extrabold tracking-widest uppercase">个人指标</Text>
                    </View>

                    <View className="gap-3">
                        <View style={{ backgroundColor: colors.gray2, borderColor: colors.border }} className="flex-row items-center justify-between pl-4 pr-3 py-3 rounded-bento-sm border">
                            <Text style={{ color: colors.white }} className="font-bold text-base">昵称</Text>
                            <TextInput
                                value={profile.name}
                                onChangeText={(v) => setProfile(p => ({ ...p, name: v }))}
                                placeholder="输入昵称"
                                placeholderTextColor={`${colors.gray4}66`}
                                className="text-right font-bold text-base min-w-[120px]"
                                style={{ color: colors.gray4 }}
                            />
                        </View>

                        <View className="flex-row gap-3">
                            <View style={{ backgroundColor: colors.gray2, borderColor: colors.border }} className="flex-1 items-center p-4 rounded-bento-sm border gap-2">
                                <Text style={{ color: colors.white }} className="font-bold text-sm">身高 (cm)</Text>
                                <TextInput
                                    keyboardType="number-pad"
                                    value={profile.height ? String(profile.height) : ""}
                                    onChangeText={(v) => setProfile(p => ({ ...p, height: v ? parseFloat(v) : null }))}
                                    placeholder="--"
                                    placeholderTextColor={`${colors.gray4}66`}
                                    className="text-center font-extrabold text-2xl"
                                    style={{ color: colors.green }}
                                />
                            </View>
                            <View style={{ backgroundColor: colors.gray2, borderColor: colors.border }} className="flex-1 items-center p-4 rounded-bento-sm border gap-2">
                                <Text style={{ color: colors.white }} className="font-bold text-sm">年龄</Text>
                                <TextInput
                                    keyboardType="number-pad"
                                    value={profile.age ? String(profile.age) : ""}
                                    onChangeText={(v) => setProfile(p => ({ ...p, age: v ? parseInt(v) : null }))}
                                    placeholder="--"
                                    placeholderTextColor={`${colors.gray4}66`}
                                    className="text-center font-extrabold text-2xl"
                                    style={{ color: colors.orange }}
                                />
                            </View>
                        </View>

                        <View className="flex-row gap-3">
                            <View style={{ flex: 1 }}>
                                <PickerSelect
                                    label="选择性别"
                                    value={profile.gender}
                                    options={[
                                        { label: "男生", value: "male" },
                                        { label: "女生", value: "female" },
                                        { label: "其他", value: "other" },
                                    ]}
                                    onChange={(v) => setProfile(p => ({ ...p, gender: v }))}
                                    colors={colors}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <PickerSelect
                                    label="当前目标"
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
                    </View>
                </View>

                {/* ── AI Config ── */}
                <View style={{ backgroundColor: colors.bento, borderColor: colors.border }} className="rounded-bento-lg border p-4 gap-4">
                    <View className="flex-row items-center gap-2 px-1 mb-1">
                        <Zap size={18} color={colors.orange} />
                        <Text style={{ color: colors.orange }} className="text-xs font-extrabold tracking-widest uppercase">AI 燃脂运算引擎</Text>
                    </View>

                    {/* Token Stats */}
                    <View className="flex-row gap-3">
                        <View style={{ backgroundColor: colors.gray2, borderColor: colors.border }} className="flex-1 p-3 rounded-bento-sm border items-center">
                            <Text style={{ color: colors.gray4 }} className="text-xs font-bold mb-1">今日消耗 Token</Text>
                            <Text style={{ color: colors.white }} className="text-xl font-extrabold font-mono">
                                {profile.aiTokensToday.toLocaleString()}
                            </Text>
                        </View>
                        <View style={{ backgroundColor: colors.gray2, borderColor: colors.border }} className="flex-1 p-3 rounded-bento-sm border items-center">
                            <Text style={{ color: colors.gray4 }} className="text-xs font-bold mb-1">历史总计 Token</Text>
                            <Text style={{ color: colors.white }} className="text-xl font-extrabold font-mono">
                                {profile.aiTokensTotal.toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    <Text style={{ color: colors.gray4 }} className="text-xs font-bold mt-2 px-1">配置列表 (点击可切换勾选的提供商)</Text>

                    <View className="gap-2">
                        {profile.aiConfigs.map((config, index) => {
                            const isActive = profile.activeAiConfigId === config.id;
                            return (
                                <View key={config.id} style={{ backgroundColor: isActive ? `${colors.orange}1A` : colors.gray2, borderColor: isActive ? colors.orange : colors.border }} className="rounded-bento-sm border overflow-hidden">
                                    <Pressable
                                        onPress={() => setProfile(p => ({ ...p, activeAiConfigId: config.id }))}
                                        className="flex-row items-center justify-between p-3"
                                    >
                                        <View className="flex-row items-center gap-2">
                                            <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: isActive ? colors.orange : colors.gray4, alignItems: 'center', justifyContent: 'center' }}>
                                                {isActive && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.orange }} />}
                                            </View>
                                            <TextInput
                                                value={config.name}
                                                onChangeText={(val) => {
                                                    const newConfigs = [...profile.aiConfigs];
                                                    newConfigs[index].name = val;
                                                    setProfile(p => ({ ...p, aiConfigs: newConfigs }));
                                                }}
                                                placeholder="配置名称"
                                                placeholderTextColor={`${colors.gray4}66`}
                                                style={{ color: isActive ? colors.orange : colors.white }}
                                                className="font-bold text-base w-32"
                                            />
                                        </View>
                                        <Pressable
                                            onPress={() => {
                                                Alert.alert("删除配置", `确定删除 "${config.name}" 吗？`, [
                                                    { text: "取消", style: "cancel" },
                                                    {
                                                        text: "删除", style: "destructive",
                                                        onPress: () => {
                                                            let newConfigs = profile.aiConfigs.filter(c => c.id !== config.id);
                                                            let newActive = profile.activeAiConfigId;
                                                            if (newActive === config.id) {
                                                                newActive = newConfigs.length > 0 ? newConfigs[0].id : null;
                                                            }
                                                            setProfile(p => ({ ...p, aiConfigs: newConfigs, activeAiConfigId: newActive }));
                                                        }
                                                    }
                                                ]);
                                            }}
                                        >
                                            <Trash2 size={16} color={colors.red} className="opacity-70" />
                                        </Pressable>
                                    </Pressable>

                                    {/* Editable Fields for each config */}
                                    <View className="px-3 pb-3 gap-2">
                                        {[
                                            { label: "Base", key: "baseUrl" as const, placeholder: "https://api.openai...", secure: false },
                                            { label: "Key", key: "apiKey" as const, placeholder: "sk-...", secure: true },
                                            { label: "Model", key: "model" as const, placeholder: "gpt-4o", secure: false },
                                        ].map(({ label, key, placeholder, secure }) => (
                                            <View key={key} className="flex-row items-center border-b border-white/5 pb-1">
                                                <Text style={{ color: colors.gray4, width: 45 }} className="text-xs font-bold">{label}</Text>
                                                <TextInput
                                                    value={config[key] || ""}
                                                    onChangeText={(v) => {
                                                        const newConfigs = [...profile.aiConfigs];
                                                        newConfigs[index][key] = v;
                                                        setProfile(p => ({ ...p, aiConfigs: newConfigs }));
                                                    }}
                                                    placeholder={placeholder}
                                                    placeholderTextColor={`${colors.gray4}55`}
                                                    secureTextEntry={secure}
                                                    autoCapitalize="none"
                                                    className="flex-1 text-xs font-medium"
                                                    style={{ color: colors.gray4 }}
                                                />
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )
                        })}

                        <Pressable
                            onPress={() => {
                                const newConfig = {
                                    id: `config-${Date.now()}`,
                                    name: "新配置",
                                    baseUrl: "",
                                    apiKey: "",
                                    model: ""
                                };
                                const newConfigs = [...profile.aiConfigs, newConfig];
                                setProfile(p => ({
                                    ...p,
                                    aiConfigs: newConfigs,
                                    activeAiConfigId: p.activeAiConfigId || newConfig.id
                                }));
                            }}
                            style={{ backgroundColor: `transparent`, borderColor: colors.border, borderWidth: 1, borderStyle: 'dashed' }}
                            className="flex-row items-center justify-center p-3 rounded-bento-sm"
                        >
                            <Text style={{ color: colors.gray4 }} className="font-bold text-sm">+ 点击添加新的服务端配置</Text>
                        </Pressable>
                    </View>

                    {/* Test Connection Button */}
                    <Pressable
                        onPress={handleTestAI}
                        disabled={isTestingAI || !profile.activeAiConfigId}
                        style={{ backgroundColor: `${colors.orange}1A`, borderColor: `${colors.orange}33`, borderWidth: 1, opacity: (!profile.activeAiConfigId || isTestingAI) ? 0.5 : 1 }}
                        className="mt-2 flex-row items-center justify-center py-3.5 rounded-bento-sm gap-2"
                    >
                        {isTestingAI ? (
                            <Activity size={18} color={colors.orange} />
                        ) : (
                            <ShieldCheck size={18} color={colors.orange} />
                        )}
                        <Text style={{ color: colors.orange }} className="font-bold text-sm">
                            {isTestingAI ? "连接测试中..." : "测试当前激活的 API 连接"}
                        </Text>
                    </Pressable>
                </View>

                {/* ── Data Management ── */}
                <View style={{ backgroundColor: colors.bento, borderColor: colors.border }} className="rounded-bento-lg border p-4 gap-4">
                    <View className="flex-row items-center gap-2 px-1">
                        <Database size={18} color={colors.gray4} />
                        <Text style={{ color: colors.gray4 }} className="text-xs font-extrabold tracking-widest uppercase">数据管理中心</Text>
                    </View>

                    <View className="gap-3">
                        <Pressable onPress={handleExport}
                            style={{ backgroundColor: colors.gray2, borderColor: colors.border }}
                            className="flex-row items-center justify-between p-4 rounded-bento-sm border">
                            <View className="flex-row items-center gap-3">
                                <View style={{ backgroundColor: `${colors.blue}1A` }} className="w-10 h-10 rounded-xl items-center justify-center">
                                    <Download size={20} color={colors.blue} />
                                </View>
                                <View>
                                    <Text style={{ color: colors.white }} className="font-bold text-base mb-0.5">导出备份</Text>
                                    <Text style={{ color: colors.gray4 }} className="text-xs font-semibold">将数据安全导出为 JSON</Text>
                                </View>
                            </View>
                            <ChevronRight size={18} color={colors.gray4} />
                        </Pressable>

                        <Pressable onPress={handleImport}
                            style={{ backgroundColor: colors.gray2, borderColor: colors.border }}
                            className="flex-row items-center justify-between p-4 rounded-bento-sm border">
                            <View className="flex-row items-center gap-3">
                                <View style={{ backgroundColor: `${colors.orange}1A` }} className="w-10 h-10 rounded-xl items-center justify-center">
                                    <Upload size={20} color={colors.orange} />
                                </View>
                                <View>
                                    <Text style={{ color: colors.white }} className="font-bold text-base mb-0.5">导入数据</Text>
                                    <Text style={{ color: colors.gray4 }} className="text-xs font-semibold">从备份文件全量恢复数据</Text>
                                </View>
                            </View>
                            <ChevronRight size={18} color={colors.gray4} />
                        </Pressable>

                        <Pressable onPress={handleClear}
                            style={{ backgroundColor: `${colors.red}0D`, borderColor: `${colors.red}1A` }}
                            className="flex-row items-center justify-between p-4 rounded-bento-sm border mt-1">
                            <View className="flex-row items-center gap-3">
                                <View style={{ backgroundColor: `${colors.red}1A` }} className="w-10 h-10 rounded-xl items-center justify-center">
                                    <Trash2 size={20} color={colors.red} />
                                </View>
                                <View>
                                    <Text style={{ color: colors.red }} className="font-bold text-base mb-0.5">清空所有记录</Text>
                                    <Text style={{ color: `${colors.red}99` }} className="text-xs font-semibold">此危险操作无法被撤销</Text>
                                </View>
                            </View>
                            <ChevronRight size={18} color={`${colors.red}66`} />
                        </Pressable>
                    </View>
                </View>

                {/* ── Version ── */}
                <View className="items-center py-8 opacity-60">
                    <Text style={{ color: colors.gray4 }} className="text-xs font-extrabold tracking-widest mb-1.5">NEXTREP V1.0</Text>
                    <Text style={{ color: colors.gray4 }} className="text-xs font-semibold">本地优先の健身数据管家</Text>
                </View>
            </ScrollView>
        </View>
    );
}
