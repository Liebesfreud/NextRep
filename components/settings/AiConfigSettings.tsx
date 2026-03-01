import { useState } from "react";
import { View, Text, Pressable, TextInput, Alert } from "react-native";
import { Zap, Trash2, Activity, ShieldCheck } from "lucide-react-native";
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
            Alert.alert(`🎉 测试成功`, `已成功连接到 [${activeConfig.name}]，可以正常与模型通信。`);
        } catch (e: any) {
            Alert.alert("测试失败", e.message);
        } finally {
            setIsTestingAI(false);
        }
    };

    return (
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
    );
}
