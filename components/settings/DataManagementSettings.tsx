import { View, Text, Alert } from "react-native";
import { Database, Download, Upload, Trash2, ChevronRight } from "lucide-react-native";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "@/hooks/useTheme";
import { exportAllData, importAllData, clearDatabase } from "@/db/services/data";

type ActionRowProps = {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    desc: string;
    labelColor: string;
    descColor: string;
    onPress: () => void;
    isLast?: boolean;
    colors: any;
};

function ActionRow({ icon, iconBg, label, desc, labelColor, descColor, onPress, isLast, colors }: ActionRowProps) {
    return (
        <AnimatedPressable
            onPress={onPress}
            style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingVertical: 13,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: colors.border,
            }}
        >
            <View style={{
                width: 34, height: 34, borderRadius: 10,
                backgroundColor: iconBg,
                alignItems: "center", justifyContent: "center",
                marginRight: 12,
            }}>
                {icon}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ color: labelColor, fontWeight: "700", fontSize: 14 }}>{label}</Text>
                <Text style={{ color: descColor, fontSize: 11, fontWeight: "600", marginTop: 1 }}>{desc}</Text>
            </View>
            <ChevronRight size={16} color={colors.gray4} style={{ opacity: 0.5 }} />
        </AnimatedPressable>
    );
}

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
                    text: "确认导入", style: "destructive",
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
                text: "确认清空", style: "destructive",
                onPress: async () => {
                    await clearDatabase();
                    Alert.alert("已完成", "所有数据已清空");
                },
            },
        ]);
    };

    return (
        <View style={{
            backgroundColor: colors.bento,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            overflow: "hidden",
        }}>
            {/* Section Header */}
            <View style={{
                flexDirection: "row", alignItems: "center", gap: 8,
                paddingHorizontal: 14, paddingVertical: 12,
                borderBottomWidth: 1, borderBottomColor: colors.border,
            }}>
                <Database size={14} color={colors.gray4} />
                <Text style={{ color: colors.gray4, fontSize: 11, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase" }}>
                    数据与备份
                </Text>
            </View>

            <ActionRow
                icon={<Download size={16} color={colors.green} />}
                iconBg={`${colors.green}1A`}
                label="导出备份"
                desc="将所有数据导出为 JSON 文件"
                labelColor={colors.white}
                descColor={colors.gray4}
                onPress={handleExport}
                colors={colors}
            />
            <ActionRow
                icon={<Upload size={16} color={colors.orange} />}
                iconBg={`${colors.orange}1A`}
                label="导入数据"
                desc="从备份文件全量恢复数据"
                labelColor={colors.white}
                descColor={colors.gray4}
                onPress={handleImport}
                colors={colors}
            />
            <ActionRow
                icon={<Trash2 size={16} color={colors.red} />}
                iconBg={`${colors.red}1A`}
                label="清空所有记录"
                desc="危险操作，不可撤销"
                labelColor={colors.red}
                descColor={`${colors.red}88`}
                onPress={handleClear}
                isLast
                colors={colors}
            />
        </View>
    );
}
