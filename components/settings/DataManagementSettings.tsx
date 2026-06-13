import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { ChevronDown, Download, Trash2, Upload } from "lucide-react-native";
import Animated, { FadeIn, FadeInDown, FadeOutUp } from "react-native-reanimated";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { clearDatabase, exportAllData, importAllData } from "@/db/services/data";
import { useTheme } from "@/hooks/useTheme";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { SettingsRow } from "@/components/ui/settings-row";

export function DataManagementSettings() {
  const { colors } = useTheme();
  const [pendingAction, setPendingAction] = useState<"export" | "import" | "clear" | null>(null);
  const isPending = pendingAction !== null;

  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapse = () => {
    setCollapsed((p) => !p);
  };

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
      const result = await DocumentPicker.getDocumentAsync({ type: "application/json" });
      if (result.canceled) {
        setPendingAction(null);
        return;
      }
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
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
      Alert.alert("导入失败", "文件格式不正确");
      setPendingAction(null);
    }
  };

  const handleClear = () => {
    if (isPending) return;
    setPendingAction("clear");
    Alert.alert(
      "⚠️ 清空数据",
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
    <Card className="overflow-hidden p-0">
      <Pressable
        onPress={toggleCollapse}
        className="flex-row items-center justify-between px-3.5 pt-2.5 pb-1.5"
      >
        <Text variant="caption" className="font-semibold text-tertiary">
          数据
        </Text>
        <Animated.View
          key={collapsed ? "collapsed" : "expanded"}
          entering={FadeIn.duration(150)}
          style={{ transform: [{ rotate: collapsed ? "0deg" : "180deg" }] }}
        >
          <ChevronDown size={14} color={colors.textTertiary} />
        </Animated.View>
      </Pressable>

      {!collapsed && (
        <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOutUp.duration(160)}>
      <SettingsRow
        label="导出备份"
        icon={<Download size={15} color={colors.textSecondary} />}
        onPress={handleExport}
        disabled={isPending}
      />

      <SettingsRow
        label="导入数据"
        icon={<Upload size={15} color={colors.textSecondary} />}
        onPress={handleImport}
        disabled={isPending}
      />

      <SettingsRow
        variant="destructive"
        label="清空所有记录"
        desc="不可撤销"
        onPress={handleClear}
        disabled={isPending}
        isLast
      />
        </Animated.View>
      )}
    </Card>
  );
}
