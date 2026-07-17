import { type ReactNode, useState } from "react";
import { Alert, View } from "react-native";
import { ChevronRight, Database, Download, Trash2, Upload } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { clearDatabase, exportAllData, importAllData } from "@/db/services/data";
import { useTheme } from "@/hooks/useTheme";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type DataActionProps = {
  title: string;
  description: string;
  icon: ReactNode;
  onPress: () => void;
  disabled: boolean;
  destructive?: boolean;
};

function DataAction({ title, description, icon, onPress, disabled, destructive = false }: DataActionProps) {
  const { colors } = useTheme();

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      activeScale={0.99}
      className={cn(
        "min-h-20 flex-row items-center gap-3 rounded-lg bg-surface-elevated p-card-padding",
        disabled && "opacity-50"
      )}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
    >
      <View className={cn(
        "h-10 w-10 shrink-0 items-center justify-center rounded-md",
        "bg-surface-hover"
      )}>
        {icon}
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <Text variant="body-semibold" className={destructive ? "text-destructive" : undefined} numberOfLines={1}>{title}</Text>
        <Text variant="caption" className={destructive ? "text-destructive/70" : "text-muted-foreground"} numberOfLines={1}>{description}</Text>
      </View>
      <View className="shrink-0">
        <ChevronRight size={17} color={colors.textTertiary} />
      </View>
    </AnimatedPressable>
  );
}

export function DataManagementSettings() {
  const { colors } = useTheme();
  const [pendingAction, setPendingAction] = useState<"export" | "import" | "clear" | null>(null);
  const isPending = pendingAction !== null;

  const handleExport = async () => {
    if (isPending) return;
    setPendingAction("export");
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const filename = `nextrep-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const docDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? "";
      const path = `${docDir}${filename}`;
      await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(path, { mimeType: "application/json", dialogTitle: "导出 NextRep 数据" });
    } catch (error: any) {
      Alert.alert("导出失败", error?.message || "导出过程中发生错误，请稍后再试");
    } finally {
      setPendingAction(null);
    }
  };

  const handleImport = async () => {
    if (isPending) return;
    setPendingAction("import");
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "text/json", "text/plain", "application/octet-stream"],
        copyToCacheDirectory: false,
      });
      if (result.canceled) {
        setPendingAction(null);
        return;
      }
      const asset = result.assets[0];
      const content = asset.file
        ? await asset.file.text()
        : await new File(asset.uri).text();
      const data = JSON.parse(content);
      Alert.alert(
        "确认导入",
        "确定要导入数据吗？这将覆盖当前的所有数据且不可撤销。",
        [
          { text: "取消", style: "cancel", onPress: () => setPendingAction(null) },
          {
            text: "确认导入",
            style: "destructive",
            onPress: async () => {
              try {
                await importAllData(data);
                Alert.alert("导入成功", "数据已成功恢复");
              } catch (e: any) {
                Alert.alert("导入失败", e?.message || "导入过程中发生错误，请稍后再试");
              } finally {
                setPendingAction(null);
              }
            },
          },
        ],
        { onDismiss: () => setPendingAction(null) }
      );
    } catch (error: any) {
      Alert.alert("导入失败", error?.message || "文件格式不正确");
      setPendingAction(null);
    }
  };

  const handleClear = () => {
    if (isPending) return;
    setPendingAction("clear");
    Alert.alert(
      "清空所有数据",
      "确定要清空所有数据吗？此操作无法恢复！",
      [
        { text: "取消", style: "cancel", onPress: () => setPendingAction(null) },
        {
          text: "确认清空",
          style: "destructive",
          onPress: async () => {
            try {
              await clearDatabase();
              Alert.alert("已完成", "所有数据已清空");
            } catch (e: any) {
              Alert.alert("清空失败", e?.message || "清空数据时发生错误，请稍后再试");
            } finally {
              setPendingAction(null);
            }
          },
        },
      ],
      { onDismiss: () => setPendingAction(null) }
    );
  };

  return (
    <Card className="gap-4 p-card-padding">
      <View className="flex-row items-center gap-2">
        <Database size={18} color={colors.accent} />
        <Text variant="subheading">数据管理</Text>
      </View>

      <View className="gap-2">
        <DataAction
          title={pendingAction === "export" ? "正在导出" : "导出备份"}
          description="生成完整的 JSON 数据文件"
          icon={<Download size={18} color={colors.textSecondary} />}
          onPress={handleExport}
          disabled={isPending}
        />
        <DataAction
          title={pendingAction === "import" ? "正在导入" : "导入数据"}
          description="从备份文件恢复全部记录"
          icon={<Upload size={18} color={colors.textSecondary} />}
          onPress={handleImport}
          disabled={isPending}
        />
        <DataAction
          title={pendingAction === "clear" ? "正在清空" : "清空所有记录"}
          description="永久删除训练与身体数据"
          icon={<Trash2 size={18} color={colors.red} />}
          onPress={handleClear}
          disabled={isPending}
          destructive
        />
      </View>
    </Card>
  );
}
