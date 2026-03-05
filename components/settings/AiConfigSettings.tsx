import { useState } from "react";
import { View, Text, Pressable, TextInput, Alert } from "react-native";
import { Zap, Trash2, Activity, ShieldCheck, Plus, Radio } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { type UserProfileData } from "@/db/services/profile";
import { testAIConnection } from "@/db/services/ai";

type Props = {
    profile: UserProfileData;
    setProfile: React.Dispatch<React.SetStateAction<UserProfileData>>;
};

export function AiConfigSettings({ profile, setProfile }: Props) {
    const { colors } = useTheme();
    const [isTestingAI, setIsTestingAI] = useState(false);

    const handleTestAI = async () => {
        const activeConfig = profile.aiConfigs.find(c => c.id === profile.activeAiConfigId);
        if (!activeConfig || !activeConfig.apiKey) {
            Alert.alert("测试失败", "当前激活的配置缺少 API Key");
            return;
        }
        setIsTestingAI(true);
        try {
            await testAIConnection(activeConfig.baseUrl, activeConfig.apiKey, activeConfig.model);
            Alert.alert(`🎉 测试成功`, `已成功连接到 [${activeConfig.name}]`);
        } catch (e: any) {
            Alert.alert("测试失败", e.message);
        } finally {
            setIsTestingAI(false);
        }
    };

    const addConfig = () => {
        const newConfig = {
            id: `config-${Date.now()}`,
            name: "新配置",
            baseUrl: "",
            apiKey: "",
            model: "",
        };
        setProfile(p => ({
            ...p,
            aiConfigs: [...p.aiConfigs, newConfig],
            activeAiConfigId: p.activeAiConfigId || newConfig.id,
        }));
    };

    const deleteConfig = (id: string, name: string) => {
        Alert.alert("删除配置", `确定删除 "${name}" 吗？`, [
            { text: "取消", style: "cancel" },
            {
                text: "删除", style: "destructive",
                onPress: () => {
                    const newConfigs = profile.aiConfigs.filter(c => c.id !== id);
                    const newActive = profile.activeAiConfigId === id
                        ? (newConfigs[0]?.id ?? null)
                        : profile.activeAiConfigId;
                    setProfile(p => ({ ...p, aiConfigs: newConfigs, activeAiConfigId: newActive }));
                },
            },
        ]);
    };

    return (
        <View style={{ gap: 12 }}>
            {/* ── Token Stats ── */}
            <View style={{
                backgroundColor: colors.bento,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 16,
                overflow: "hidden",
            }}>
                <View style={{
                    flexDirection: "row", alignItems: "center", gap: 8,
                    paddingHorizontal: 14, paddingVertical: 12,
                    borderBottomWidth: 1, borderBottomColor: colors.border,
                }}>
                    <Zap size={14} color={colors.orange} />
                    <Text style={{ color: colors.orange, fontSize: 11, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase" }}>
                        AI 运算引擎
                    </Text>
                </View>

                {/* Token 统计行 */}
                <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <View style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 14, borderRightWidth: 1, borderRightColor: colors.border }}>
                        <Text style={{ color: colors.gray4, fontSize: 11, fontWeight: "600", marginBottom: 4 }}>今日消耗</Text>
                        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                            <Text style={{ color: colors.white, fontSize: 20, fontWeight: "800" }}>
                                {profile.aiTokensToday.toLocaleString()}
                            </Text>
                            <Text style={{ color: colors.gray4, fontSize: 11, fontWeight: "600" }}>tokens</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 14 }}>
                        <Text style={{ color: colors.gray4, fontSize: 11, fontWeight: "600", marginBottom: 4 }}>历史总计</Text>
                        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                            <Text style={{ color: colors.white, fontSize: 20, fontWeight: "800" }}>
                                {profile.aiTokensTotal.toLocaleString()}
                            </Text>
                            <Text style={{ color: colors.gray4, fontSize: 11, fontWeight: "600" }}>tokens</Text>
                        </View>
                    </View>
                </View>

                {/* 测试连接按钮 */}
                <Pressable
                    onPress={handleTestAI}
                    disabled={isTestingAI || !profile.activeAiConfigId}
                    style={{
                        flexDirection: "row", alignItems: "center", justifyContent: "center",
                        paddingVertical: 13, gap: 8,
                        opacity: (!profile.activeAiConfigId || isTestingAI) ? 0.4 : 1,
                    }}
                >
                    {isTestingAI
                        ? <Activity size={15} color={colors.orange} />
                        : <ShieldCheck size={15} color={colors.orange} />}
                    <Text style={{ color: colors.orange, fontSize: 13, fontWeight: "700" }}>
                        {isTestingAI ? "连接测试中..." : "测试当前激活的 API 连接"}
                    </Text>
                </Pressable>
            </View>

            {/* ── AI 配置列表 ── */}
            <View style={{
                backgroundColor: colors.bento,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 16,
                overflow: "hidden",
            }}>
                <View style={{
                    flexDirection: "row", alignItems: "center", gap: 8,
                    paddingHorizontal: 14, paddingVertical: 12,
                    borderBottomWidth: 1, borderBottomColor: colors.border,
                }}>
                    <Radio size={14} color={colors.gray4} />
                    <Text style={{ color: colors.gray4, fontSize: 11, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase", flex: 1 }}>
                        服务端配置
                    </Text>
                    <Text style={{ color: colors.gray4, fontSize: 10, fontWeight: "600", opacity: 0.6 }}>
                        点击名称旁圆点切换激活
                    </Text>
                </View>

                {profile.aiConfigs.map((config, index) => {
                    const isActive = profile.activeAiConfigId === config.id;
                    const isLast = index === profile.aiConfigs.length - 1;
                    return (
                        <View
                            key={config.id}
                            style={{
                                borderBottomWidth: isLast ? 0 : 1,
                                borderBottomColor: colors.border,
                                backgroundColor: isActive ? `${colors.orange}0A` : "transparent",
                            }}
                        >
                            {/* 配置头部行：激活指示 + 名称 + 删除 */}
                            <View style={{
                                flexDirection: "row", alignItems: "center",
                                paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8, gap: 10,
                            }}>
                                <Pressable
                                    onPress={() => setProfile(p => ({ ...p, activeAiConfigId: config.id }))}
                                    style={{
                                        width: 18, height: 18, borderRadius: 9,
                                        borderWidth: 2,
                                        borderColor: isActive ? colors.orange : colors.gray4,
                                        alignItems: "center", justifyContent: "center",
                                    }}
                                >
                                    {isActive && (
                                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.orange }} />
                                    )}
                                </Pressable>
                                <TextInput
                                    value={config.name}
                                    onChangeText={(val) => {
                                        const newConfigs = [...profile.aiConfigs];
                                        newConfigs[index] = { ...newConfigs[index], name: val };
                                        setProfile(p => ({ ...p, aiConfigs: newConfigs }));
                                    }}
                                    placeholder="配置名称"
                                    placeholderTextColor={`${colors.gray4}55`}
                                    style={{
                                        flex: 1,
                                        color: isActive ? colors.orange : colors.white,
                                        fontWeight: "700",
                                        fontSize: 14,
                                        padding: 0,
                                    }}
                                />
                                {isActive && (
                                    <View style={{
                                        backgroundColor: `${colors.orange}1A`,
                                        paddingHorizontal: 8, paddingVertical: 3,
                                        borderRadius: 6,
                                    }}>
                                        <Text style={{ color: colors.orange, fontSize: 10, fontWeight: "800" }}>激活</Text>
                                    </View>
                                )}
                                <Pressable
                                    onPress={() => deleteConfig(config.id, config.name)}
                                    style={{ padding: 4, opacity: 0.6 }}
                                >
                                    <Trash2 size={14} color={colors.red} />
                                </Pressable>
                            </View>

                            {/* 字段：Base / Key / Model */}
                            {([
                                { label: "Base URL", key: "baseUrl" as const, placeholder: "https://api.openai.com/v1", secure: false },
                                { label: "API Key", key: "apiKey" as const, placeholder: "sk-...", secure: true },
                                { label: "Model", key: "model" as const, placeholder: "gpt-4o", secure: false },
                            ]).map(({ label, key, placeholder, secure }, fi) => (
                                <View
                                    key={key}
                                    style={{
                                        flexDirection: "row", alignItems: "center",
                                        paddingHorizontal: 14, paddingVertical: 8,
                                        borderTopWidth: 1, borderTopColor: `${colors.border}66`,
                                        gap: 10,
                                    }}
                                >
                                    <Text style={{
                                        color: colors.gray4, fontSize: 11, fontWeight: "700",
                                        width: 56, letterSpacing: 0.5,
                                    }}>
                                        {label}
                                    </Text>
                                    <TextInput
                                        value={config[key] || ""}
                                        onChangeText={(v) => {
                                            const newConfigs = [...profile.aiConfigs];
                                            newConfigs[index] = { ...newConfigs[index], [key]: v };
                                            setProfile(p => ({ ...p, aiConfigs: newConfigs }));
                                        }}
                                        placeholder={placeholder}
                                        placeholderTextColor={`${colors.gray4}44`}
                                        secureTextEntry={secure}
                                        autoCapitalize="none"
                                        style={{
                                            flex: 1, color: colors.gray4,
                                            fontSize: 12, fontWeight: "500",
                                            padding: 0,
                                        }}
                                    />
                                </View>
                            ))}

                            <View style={{ height: 8 }} />
                        </View>
                    );
                })}

                {/* 添加按钮 */}
                <Pressable
                    onPress={addConfig}
                    style={{
                        flexDirection: "row", alignItems: "center", justifyContent: "center",
                        gap: 6, paddingVertical: 13,
                        borderTopWidth: profile.aiConfigs.length > 0 ? 1 : 0,
                        borderTopColor: colors.border,
                    }}
                >
                    <Plus size={14} color={colors.green} strokeWidth={3} />
                    <Text style={{ color: colors.green, fontSize: 13, fontWeight: "700" }}>添加新的服务端配置</Text>
                </Pressable>
            </View>
        </View>
    );
}
