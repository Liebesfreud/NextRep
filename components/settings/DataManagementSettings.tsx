import { useState } from "react";
import { Alert, View } from "react-native";
import { ChevronRight, Database, Download, Trash2, Upload } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { clearDatabase, exportAllData, importAllData } from "@/db/services/data";
import { useTheme } from "@/hooks/useTheme";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type ActionRowProps = {
    icon: React.ReactNode;
    iconClassName: string;
    label: string;
    desc: string;
    destructive?: boolean;
    onPress: () => void;
    disabled?: boolean;
    isLast?: boolean;
};

function ActionRow({ icon, iconClassName, label, desc, destructive, onPress, disabled, isLast }: ActionRowProps) {
    const { colors } = useTheme();
    const content = (
        <>
            <View className={cn("mr-3 h-[34px] w-[34px] items-center justify-center rounded-[10px]", iconClassName)}>{icon}</View>
            <View className="flex-1">
                <Text variant="label" className={destructive ? "text-destructive-foreground" : undefined}>
                    {label}
                </Text>
                <Text variant="caption" className={cn("mt-0.5 font-semibold", destructive && "text-destructive-foreground/80")}>
                    {desc}
                </Text>
            </View>
            <ChevronRight size={16} color={destructive ? "#FFFFFF" : colors.gray4} className={destructive ? "opacity-80" : "opacity-50"} />
        </>
    );

    if (destructive) {
        return (
            <Button
                onPress={onPress}
                disabled={disabled}
                variant="destructive"
                className={cn("mx-3.5 my-2 justify-start rounded-bento-sm px-3.5 py-3.5", disabled && "opacity-50")}
            >
                {content}
            </Button>
        );
    }

    return (
        <AnimatedPressable
            onPress={onPress}
            disabled={disabled}
            className={cn("flex-row items-center px-3.5 py-3.5", !isLast && "border-b border-border", disabled && "opacity-50")}
        >
            {content}
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
                            } catch (error: any) {
                                Alert.alert("导入失败", error?.message || "导入过程中发生错误，请稍后再试");
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
                        } catch (error: any) {
                            Alert.alert("清空失败", error?.message || "清空数据时发生错误，请稍后再试");
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
            <View className="flex-row items-center gap-2 px-3.5 py-3">
                <Database size={14} color={colors.gray4} />
                <Text variant="caption" className="font-extrabold uppercase tracking-[1.5px]">
                    数据与备份
                </Text>
            </View>
            <Separator />

            <ActionRow
                icon={<Download size={16} color={colors.green} />}
                iconClassName="bg-accent/10"
                label="导出备份"
                desc="将所有数据导出为 JSON 文件"
                onPress={handleExport}
                disabled={isPending}
            />
            <ActionRow
                icon={<Upload size={16} color={colors.orange} />}
                iconClassName="bg-primary/10"
                label="导入数据"
                desc="从备份文件全量恢复数据"
                onPress={handleImport}
                disabled={isPending}
            />
            <ActionRow
                icon={<Trash2 size={16} color="#FFFFFF" />}
                iconClassName="bg-destructive-foreground/15"
                label="清空所有记录"
                desc="危险操作，不可撤销"
                onPress={handleClear}
                disabled={isPending}
                destructive
                isLast
            />
        </Card>
    );
}
