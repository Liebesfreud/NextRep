import { useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Bot, Check, ChevronRight, Plus, ShieldCheck, Trash2, Zap } from "lucide-react-native";
import { type UserProfileData } from "@/db/services/profile";
import { testAIConnection } from "@/db/services/ai";
import { useTheme } from "@/hooks/useTheme";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type Props = {
    profile: UserProfileData;
    setProfile: React.Dispatch<React.SetStateAction<UserProfileData>>;
};

export function AiConfigSettings({ profile, setProfile }: Props) {
    const { colors } = useTheme();
    const [sheetVisible, setSheetVisible] = useState(false);
    const [testingId, setTestingId] = useState<string | null>(null);
    const activeConfig = useMemo(
        () => profile.aiConfigs.find((config) => config.id === profile.activeAiConfigId) ?? profile.aiConfigs[0] ?? null,
        [profile.activeAiConfigId, profile.aiConfigs]
    );

    const addConfig = () => {
        const id = `config-${Date.now()}`;
        setProfile((current) => ({
            ...current,
            aiConfigs: [...current.aiConfigs, { id, name: "新配置", baseUrl: "", apiKey: "", model: "" }],
            activeAiConfigId: current.activeAiConfigId || id,
        }));
    };

    const updateConfig = (id: string, patch: Partial<{ name: string; baseUrl: string; apiKey: string; model: string }>) => {
        setProfile((current) => ({
            ...current,
            aiConfigs: current.aiConfigs.map((config) => config.id === id ? { ...config, ...patch } : config),
        }));
    };

    const deleteConfig = (id: string, name: string) => {
        Alert.alert("删除 AI 配置", `确定删除“${name}”吗？`, [
            { text: "取消", style: "cancel" },
            {
                text: "删除",
                style: "destructive",
                onPress: () => setProfile((current) => {
                    const nextConfigs = current.aiConfigs.filter((config) => config.id !== id);
                    return {
                        ...current,
                        aiConfigs: nextConfigs,
                        activeAiConfigId: current.activeAiConfigId === id ? nextConfigs[0]?.id ?? null : current.activeAiConfigId,
                    };
                }),
            },
        ]);
    };

    const handleTest = async (id: string) => {
        const config = profile.aiConfigs.find((item) => item.id === id);
        if (!config?.apiKey.trim()) {
            Alert.alert("无法测试", "请先填写 API Key。");
            return;
        }
        setTestingId(id);
        try {
            await testAIConnection(config.baseUrl, config.apiKey, config.model);
            Alert.alert("连接成功", `已成功连接到“${config.name}”。`);
        } catch (cause: any) {
            Alert.alert("连接失败", cause?.message || "请检查地址、模型和 API Key 后重试。");
        } finally {
            setTestingId(null);
        }
    };

    return (
        <>
            <Card className="gap-4 p-card-padding">
                <View className="flex-row items-center justify-between gap-3">
                    <View className="flex-row items-center gap-2">
                        <Bot size={18} color={colors.accent} />
                        <Text variant="subheading">AI 设置</Text>
                    </View>
                    <Badge variant={activeConfig?.apiKey ? "default" : "outline"}>
                        <BadgeText variant={activeConfig?.apiKey ? "default" : "outline"}>
                            {activeConfig?.apiKey ? "已连接" : "未配置"}
                        </BadgeText>
                    </Badge>
                </View>

                <View className="flex-row gap-3">
                    <View className="min-w-0 flex-1 rounded-lg bg-surface-elevated p-card-padding">
                        <Text variant="micro" className="text-muted-foreground">今日用量</Text>
                        <View className="mt-2 flex-row items-baseline gap-1">
                            <Text className="text-stat-value font-variant-numeric-tabular-nums">{profile.aiTokensToday.toLocaleString()}</Text>
                            <Text variant="micro" className="text-muted-foreground">tokens</Text>
                        </View>
                    </View>
                    <View className="min-w-0 flex-1 rounded-lg bg-surface-elevated p-card-padding">
                        <Text variant="micro" className="text-muted-foreground">累计用量</Text>
                        <View className="mt-2 flex-row items-baseline gap-1">
                            <Text className="text-stat-value font-variant-numeric-tabular-nums">{profile.aiTokensTotal.toLocaleString()}</Text>
                            <Text variant="micro" className="text-muted-foreground">tokens</Text>
                        </View>
                    </View>
                </View>

                <AnimatedPressable
                    onPress={() => setSheetVisible(true)}
                    className="flex-row items-center gap-3 rounded-lg bg-surface-elevated p-card-padding"
                    accessibilityRole="button"
                    accessibilityLabel="管理 AI 配置"
                >
                    <View className="h-10 w-10 items-center justify-center rounded-md bg-accent/10">
                        <Zap size={18} color={colors.accent} />
                    </View>
                    <View className="min-w-0 flex-1">
                        <Text variant="body-semibold" numberOfLines={1}>{activeConfig?.name || "添加 AI 服务"}</Text>
                        {activeConfig?.model ? <Text variant="caption" className="mt-1 text-muted-foreground" numberOfLines={1}>{activeConfig.model}</Text> : null}
                    </View>
                    <ChevronRight size={18} color={colors.textTertiary} />
                </AnimatedPressable>
            </Card>

            <Sheet visible={sheetVisible} onClose={() => setSheetVisible(false)} sheetHeight="90%" avoidKeyboard>
                <View className="mb-4 flex-row items-center justify-between">
                    <View>
                        <Text variant="heading">AI 配置</Text>
                    </View>
                    <Button variant="secondary" size="sm" onPress={addConfig}>
                        <Plus size={16} color={colors.foreground} />
                        <ButtonText variant="secondary">新增</ButtonText>
                    </Button>
                </View>

                <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24, gap: 12 }} showsVerticalScrollIndicator={false}>
                    {profile.aiConfigs.length === 0 ? (
                        <View className="items-center justify-center rounded-lg border border-dashed border-border bg-surface-elevated py-10">
                            <Bot size={26} color={colors.textTertiary} />
                            <Text variant="body-semibold" className="mt-3">暂无配置</Text>
                        </View>
                    ) : profile.aiConfigs.map((config) => {
                        const active = profile.activeAiConfigId === config.id;
                        return (
                            <Card key={config.id} className={cn("gap-4 p-card-padding", active && "border-accent/40 bg-surface-elevated")}>
                                <View className="flex-row items-center justify-between gap-3">
                                    <View className="min-w-0 flex-1">
                                        <Text variant="micro" className="text-muted-foreground">配置名称</Text>
                                        <Input
                                            value={config.name}
                                            onChangeText={(name) => updateConfig(config.id, { name })}
                                            placeholder="配置名称"
                                            className="mt-1 border-0 bg-transparent px-0 text-body-semibold"
                                        />
                                    </View>
                                    {active && <Badge><BadgeText>当前</BadgeText></Badge>}
                                    <Button variant="ghost" size="icon" className="h-10 w-10" onPress={() => deleteConfig(config.id, config.name)} accessibilityLabel={`删除 ${config.name}`}>
                                        <Trash2 size={17} color={colors.red} />
                                    </Button>
                                </View>

                                <View className="gap-3">
                                    <View className="gap-1.5">
                                        <Text variant="caption" className="text-muted-foreground">Base URL</Text>
                                        <Input value={config.baseUrl} onChangeText={(baseUrl) => updateConfig(config.id, { baseUrl })} placeholder="https://api.openai.com/v1" autoCapitalize="none" />
                                    </View>
                                    <View className="gap-1.5">
                                        <Text variant="caption" className="text-muted-foreground">Model</Text>
                                        <Input value={config.model} onChangeText={(model) => updateConfig(config.id, { model })} placeholder="gpt-4o" autoCapitalize="none" />
                                    </View>
                                    <View className="gap-1.5">
                                        <Text variant="caption" className="text-muted-foreground">API Key</Text>
                                        <Input value={config.apiKey} onChangeText={(apiKey) => updateConfig(config.id, { apiKey })} placeholder="sk-..." secureTextEntry autoCapitalize="none" />
                                    </View>
                                </View>

                                <View className="flex-row gap-3">
                                    <Button
                                        variant={active ? "outline" : "secondary"}
                                        className="flex-1"
                                        disabled={active}
                                        onPress={() => setProfile((current) => ({ ...current, activeAiConfigId: config.id }))}
                                    >
                                        {active && <Check size={16} color={colors.accent} />}
                                        <ButtonText variant={active ? "outline" : "secondary"}>{active ? "当前配置" : "设为当前"}</ButtonText>
                                    </Button>
                                    <Button variant="secondary" className="flex-1" loading={testingId === config.id} onPress={() => handleTest(config.id)}>
                                        {testingId !== config.id && <ShieldCheck size={16} color={colors.foreground} />}
                                        <ButtonText variant="secondary">测试连接</ButtonText>
                                    </Button>
                                </View>
                            </Card>
                        );
                    })}
                </ScrollView>
            </Sheet>
        </>
    );
}
