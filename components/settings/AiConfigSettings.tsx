import { useState } from "react";
import { Alert, View } from "react-native";
import { Activity, Plus, Radio, ShieldCheck, Trash2, Zap } from "lucide-react-native";
import { type UserProfileData } from "@/db/services/profile";
import { testAIConnection } from "@/db/services/ai";
import { useTheme } from "@/hooks/useTheme";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type Props = {
    profile: UserProfileData;
    setProfile: React.Dispatch<React.SetStateAction<UserProfileData>>;
};

export function AiConfigSettings({ profile, setProfile }: Props) {
    const { colors } = useTheme();
    const [isTestingAI, setIsTestingAI] = useState(false);

    const handleTestAI = async () => {
        const activeConfig = profile.aiConfigs.find((config) => config.id === profile.activeAiConfigId);
        if (!activeConfig || !activeConfig.apiKey) {
            Alert.alert("测试失败", "当前激活的配置缺少 API Key");
            return;
        }
        setIsTestingAI(true);
        try {
            await testAIConnection(activeConfig.baseUrl, activeConfig.apiKey, activeConfig.model);
            Alert.alert("🎉 测试成功", `已成功连接到 [${activeConfig.name}]`);
        } catch (error: any) {
            Alert.alert("测试失败", error.message);
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
        setProfile((current) => ({
            ...current,
            aiConfigs: [...current.aiConfigs, newConfig],
            activeAiConfigId: current.activeAiConfigId || newConfig.id,
        }));
    };

    const deleteConfig = (id: string, name: string) => {
        Alert.alert("删除配置", `确定删除 "${name}" 吗？`, [
            { text: "取消", style: "cancel" },
            {
                text: "删除",
                style: "destructive",
                onPress: () => {
                    const nextConfigs = profile.aiConfigs.filter((config) => config.id !== id);
                    const nextActive = profile.activeAiConfigId === id ? (nextConfigs[0]?.id ?? null) : profile.activeAiConfigId;
                    setProfile((current) => ({ ...current, aiConfigs: nextConfigs, activeAiConfigId: nextActive }));
                },
            },
        ]);
    };

    return (
        <View className="gap-3">
            <Card className="overflow-hidden p-0">
                <View className="flex-row items-center gap-2 px-3.5 py-3">
                    <Zap size={14} color={colors.gray4} />
                    <Text variant="caption" className="font-semibold">
                        AI
                    </Text>
                </View>
                <Separator />

                <View className="flex-row border-b border-border">
                    <View className="flex-1 border-r border-border px-3.5 py-3.5">
                        <Text variant="caption" className="mb-1">
                            今日
                        </Text>
                        <View className="flex-row items-baseline gap-1">
                            <Text className="text-xl font-semibold">{profile.aiTokensToday.toLocaleString()}</Text>
                            <Text variant="caption">
                                tokens
                            </Text>
                        </View>
                    </View>
                    <View className="flex-1 px-3.5 py-3.5">
                        <Text variant="caption" className="mb-1">
                            总计
                        </Text>
                        <View className="flex-row items-baseline gap-1">
                            <Text className="text-xl font-semibold">{profile.aiTokensTotal.toLocaleString()}</Text>
                            <Text variant="caption">
                                tokens
                            </Text>
                        </View>
                    </View>
                </View>

                <Button
                    onPress={handleTestAI}
                    disabled={isTestingAI || !profile.activeAiConfigId}
                    variant="ghost"
                    className="rounded-none py-3.5"
                >
                    {isTestingAI ? <Activity size={15} color={colors.foreground} /> : <ShieldCheck size={15} color={colors.foreground} />}
                    <ButtonText variant="ghost">
                        {isTestingAI ? "测试中" : "测试连接"}
                    </ButtonText>
                </Button>
            </Card>

            <Card className="overflow-hidden p-0">
                <View className="flex-row items-center gap-2 px-3.5 py-3">
                    <Radio size={14} color={colors.gray4} />
                    <Text variant="caption" className="flex-1 font-semibold">
                        配置
                    </Text>
                </View>
                <Separator />

                {profile.aiConfigs.map((config, index) => {
                    const isActive = profile.activeAiConfigId === config.id;
                    return (
                        <View key={config.id} className={cn("border-b border-border", isActive && "bg-muted/40")}>
                            <View className="flex-row items-center gap-2.5 px-3.5 pb-2 pt-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onPress={() => setProfile((current) => ({ ...current, activeAiConfigId: config.id }))}
                                    accessibilityLabel={`激活配置 ${config.name || index + 1}`}
                                    accessibilityRole="radio"
                                    accessibilityState={{ selected: isActive }}
                                >
                                    <View
                                        className={cn(
                                            "h-5 w-5 items-center justify-center rounded-full border-2",
                                            isActive ? "border-foreground" : "border-muted-foreground"
                                        )}
                                    >
                                        {isActive && <View className="h-2.5 w-2.5 rounded-full bg-foreground" />}
                                    </View>
                                </Button>
                                <Input
                                    value={config.name}
                                    onChangeText={(value) => {
                                        const nextConfigs = [...profile.aiConfigs];
                                        nextConfigs[index] = { ...nextConfigs[index], name: value };
                                        setProfile((current) => ({ ...current, aiConfigs: nextConfigs }));
                                    }}
                                    placeholder="配置名称"
                                    className="min-h-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium"
                                />
                                {isActive && (
                                    <Badge variant="outline" className="px-2 py-0.5">
                                        <BadgeText variant="outline">当前</BadgeText>
                                    </Badge>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-70"
                                    onPress={() => deleteConfig(config.id, config.name)}
                                    accessibilityLabel={`删除配置 ${config.name || index + 1}`}
                                >
                                    <Trash2 size={14} color={colors.red} />
                                </Button>
                            </View>

                            {([
                                { label: "Base URL", key: "baseUrl" as const, placeholder: "https://api.openai.com/v1", secure: false },
                                { label: "API Key", key: "apiKey" as const, placeholder: "sk-...", secure: true },
                                { label: "Model", key: "model" as const, placeholder: "gpt-4o", secure: false },
                            ]).map(({ label, key, placeholder, secure }) => (
                                <View key={key} className="flex-row items-center gap-2.5 border-t border-border/60 px-3.5 py-2">
                                    <Text variant="caption" className="w-14">
                                        {label}
                                    </Text>
                                    <Input
                                        value={config[key] || ""}
                                        onChangeText={(value) => {
                                            const nextConfigs = [...profile.aiConfigs];
                                            nextConfigs[index] = { ...nextConfigs[index], [key]: value };
                                            setProfile((current) => ({ ...current, aiConfigs: nextConfigs }));
                                        }}
                                        placeholder={placeholder}
                                        secureTextEntry={secure}
                                        autoCapitalize="none"
                                        className="min-h-0 flex-1 border-0 bg-transparent p-0 text-xs text-muted-foreground"
                                    />
                                </View>
                            ))}
                            <View className="h-2" />
                        </View>
                    );
                })}

                <Button onPress={addConfig} variant="ghost" className="rounded-none py-3.5">
                    <Plus size={14} color={colors.foreground} strokeWidth={2.5} />
                    <ButtonText variant="ghost">
                        新增配置
                    </ButtonText>
                </Button>
            </Card>
        </View>
    );
}
