import { useState } from "react";
import { Alert, LayoutAnimation, Pressable, View } from "react-native";
import { Activity, ChevronDown, Plus, ShieldCheck, Trash2, Zap } from "lucide-react-native";
import { MotiView } from "moti";
import { SNAPPY_SPRING } from "@/constants/animations";
import { type UserProfileData } from "@/db/services/profile";
import { testAIConnection } from "@/db/services/ai";
import { useTheme } from "@/hooks/useTheme";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { SettingsRow } from "@/components/ui/settings-row";
import { cn } from "@/lib/utils";

type Props = {
  profile: UserProfileData;
  setProfile: React.Dispatch<React.SetStateAction<UserProfileData>>;
};

export function AiConfigSettings({ profile, setProfile }: Props) {
  const { colors } = useTheme();
  const [isTestingAI, setIsTestingAI] = useState(false);

  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed((p) => !p);
  };

  const handleTestAI = async () => {
    const activeConfig = profile.aiConfigs.find(
      (c) => c.id === profile.activeAiConfigId
    );
    if (!activeConfig || !activeConfig.apiKey) {
      Alert.alert("测试失败", "当前激活的配置缺少 API Key");
      return;
    }
    setIsTestingAI(true);
    try {
      await testAIConnection(
        activeConfig.baseUrl,
        activeConfig.apiKey,
        activeConfig.model
      );
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
    setProfile((c) => ({
      ...c,
      aiConfigs: [...c.aiConfigs, newConfig],
      activeAiConfigId: c.activeAiConfigId || newConfig.id,
    }));
  };

  const deleteConfig = (id: string, name: string) => {
    Alert.alert("删除配置", `确定删除 "${name}" 吗？`, [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: () => {
          const nextConfigs = profile.aiConfigs.filter((c) => c.id !== id);
          const nextActive =
            profile.activeAiConfigId === id
              ? nextConfigs[0]?.id ?? null
              : profile.activeAiConfigId;
          setProfile((c) => ({
            ...c,
            aiConfigs: nextConfigs,
            activeAiConfigId: nextActive,
          }));
        },
      },
    ]);
  };

  const updateConfig = (
    index: number,
    patch: Partial<{
      name: string;
      baseUrl: string;
      apiKey: string;
      model: string;
    }>
  ) => {
    const next = [...profile.aiConfigs];
    next[index] = { ...next[index], ...patch };
    setProfile((c) => ({ ...c, aiConfigs: next }));
  };

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <Pressable
        onPress={toggleCollapse}
        className="flex-row items-center justify-between px-3.5 pt-2.5 pb-1.5"
      >
        <Text variant="caption" className="font-semibold text-tertiary">
          AI 设置
        </Text>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-baseline gap-1">
              <Text className="text-caption font-variant-numeric-tabular-nums text-foreground">
                {profile.aiTokensToday.toLocaleString()}
              </Text>
              <Text variant="caption">今日</Text>
            </View>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-caption font-variant-numeric-tabular-nums text-foreground">
                {profile.aiTokensTotal.toLocaleString()}
              </Text>
              <Text variant="caption">总计</Text>
            </View>
          </View>
          <MotiView
            animate={{ rotate: collapsed ? "0deg" : "180deg" }}
            transition={SNAPPY_SPRING}
          >
            <ChevronDown size={14} color={colors.textTertiary} />
          </MotiView>
        </View>
      </Pressable>

      {!collapsed && (<>
      {/* Config list */}
      {profile.aiConfigs.map((config, index) => {
        const isActive = profile.activeAiConfigId === config.id;
        return (
          <View
            key={config.id}
            className={cn("border-t border-border", isActive && "bg-surface-elevated")}
          >
            {/* Name row + radio + badge + delete */}
            <View className="flex-row items-center gap-2.5 px-3.5 py-2.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onPress={() =>
                  setProfile((c) => ({ ...c, activeAiConfigId: config.id }))
                }
                accessibilityLabel={`激活配置 ${config.name || index + 1}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
              >
                <View
                  className={cn(
                    "h-5 w-5 items-center justify-center rounded-pill border-2",
                    isActive ? "border-accent" : "border-border-strong"
                  )}
                >
                  {isActive && (
                    <View className="h-2.5 w-2.5 rounded-pill bg-accent" />
                  )}
                </View>
              </Button>

              <View className="flex-1">
                <Input
                  value={config.name}
                  onChangeText={(v) => updateConfig(index, { name: v })}
                  placeholder="配置名称"
                  className="min-h-0 border-0 bg-transparent p-0 text-body-semibold text-foreground"
                />
                <View className="flex-row items-center gap-2 mt-1">
                  <Input
                    value={config.baseUrl || ""}
                    onChangeText={(v) => updateConfig(index, { baseUrl: v })}
                    placeholder="Base URL"
                    autoCapitalize="none"
                    className="min-h-0 flex-1 border-0 bg-transparent p-0 text-caption text-muted-foreground"
                  />
                  <Input
                    value={config.model || ""}
                    onChangeText={(v) => updateConfig(index, { model: v })}
                    placeholder="Model"
                    autoCapitalize="none"
                    className="min-h-0 w-24 border-0 bg-transparent p-0 text-caption text-muted-foreground"
                  />
                </View>
                <Input
                  value={config.apiKey || ""}
                  onChangeText={(v) => updateConfig(index, { apiKey: v })}
                  placeholder="API Key"
                  secureTextEntry
                  autoCapitalize="none"
                  className="min-h-0 border-0 bg-transparent p-0 text-caption text-muted-foreground mt-0.5"
                />
              </View>

              {isActive && (
                <Badge variant="outline" className="px-2 py-0.5">
                  <BadgeText variant="outline" className="text-accent">
                    当前
                  </BadgeText>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onPress={() => deleteConfig(config.id, config.name)}
                accessibilityLabel={`删除配置 ${config.name || index + 1}`}
              >
                <Trash2 size={14} color={colors.red} />
              </Button>
            </View>
          </View>
        );
      })}

      {/* Actions */}
      <View className="border-t border-border">
        <SettingsRow
          label={isTestingAI ? "测试中" : "测试连接"}
          icon={
            isTestingAI ? (
              <Activity size={15} color={colors.textSecondary} />
            ) : (
              <ShieldCheck size={15} color={colors.textSecondary} />
            )
          }
          onPress={handleTestAI}
          disabled={isTestingAI || !profile.activeAiConfigId}
        />

        <SettingsRow
          label="新增配置"
          icon={<Plus size={15} color={colors.textSecondary} />}
          onPress={addConfig}
          isLast
        />
      </View>
        </>
      )}
    </Card>
  );
}
