import { View, Text, Alert } from "react-native";
import { Database, Download, Upload, Trash2, ChevronRight } from "lucide-react-native";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "@/hooks/useTheme";
import { exportAllData, importAllData, clearDatabase } from "@/db/services/data";

export function DataManagementSettings() {
    const { colors } = useTheme();

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

    return (
        <View style={{ backgroundColor: colors.bento, borderColor: colors.border }} className="rounded-bento-lg border p-4 gap-4">
            <View className="flex-row items-center gap-2 px-1">
                <Database size={18} color={colors.gray4} />
                <Text style={{ color: colors.gray4 }} className="text-xs font-extrabold tracking-widest uppercase">数据管理中心</Text>
            </View>

            <View className="gap-3">
                <AnimatedPressable onPress={handleExport}
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
                </AnimatedPressable>

                <AnimatedPressable onPress={handleImport}
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
                </AnimatedPressable>

                <AnimatedPressable onPress={handleClear}
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
                </AnimatedPressable>
            </View>
        </View>
    );
}
