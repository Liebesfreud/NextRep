import { View, ScrollView } from "react-native";
import { type ReactNode } from "react";
import { Activity, Calendar, Dumbbell, Target, TrendingUp, X } from "lucide-react-native";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { useTheme } from "@/hooks/useTheme";
import { getStrengthCategoryVisual } from "@/constants/exerciseVisuals";
import { type StrengthExerciseAnalytics } from "@/db/services/dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

type Props = {
    visible: boolean;
    exercise: StrengthExerciseAnalytics | null;
    onClose: () => void;
};

function formatWeight(value: number | null | undefined) {
    if (!value) return "--";
    return Number.isInteger(value) ? `${value} kg` : `${value.toFixed(1)} kg`;
}

function formatVolume(value: number) {
    if (!value) return "0 kg";
    if (value >= 1000) return `${(value / 1000).toFixed(1)} t`;
    return `${Math.round(value)} kg`;
}

function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return "暂无记录";
    return dateStr.slice(5).replace("-", "/");
}

function StatTile({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: ReactNode;
}) {
    return (
        <View className="w-1/2 p-[5px]">
            <Card className="min-h-[82px] rounded-xl bg-secondary p-3">
                <View className="flex-row items-center gap-1.5 mb-2">
                    {icon}
                    <Text variant="caption" className="text-[11px] font-bold">
                        {label}
                    </Text>
                </View>
                <Text className="text-lg font-black" numberOfLines={1}>
                    {value}
                </Text>
            </Card>
        </View>
    );
}

export function ExerciseDetailModal({ visible, exercise, onClose }: Props) {
    const { colors } = useTheme();

    if (!exercise) return null;

    const visual = getStrengthCategoryVisual(exercise.tag, colors);
    const Icon = visual.icon;
    const realBreakthroughs = exercise.breakthroughs.filter((item) => item.previousWeightKg !== null);
    const recentHistory = exercise.history.slice(0, 6);
    const recentBreakthroughs = exercise.breakthroughs.slice(0, 5);

    return (
        <BottomSheetModal
            visible={visible}
            onClose={onClose}
            sheetHeight="82%"
            backgroundColor={colors.bento}
        >
            <View className="flex-row justify-between items-start mb-5">
                <View className="flex-row items-center gap-3 flex-1 pr-3">
                    <View style={{ backgroundColor: visual.iconBg }} className="h-[46px] w-[46px] items-center justify-center rounded-xl">
                        <Icon size={22} color={visual.accent} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xl font-black" numberOfLines={1}>
                            {exercise.name}
                        </Text>
                        <Text style={{ color: visual.accent }} className="text-xs font-bold mt-1">
                            {exercise.tag || "力量训练"}
                        </Text>
                    </View>
                </View>
                <Button
                    onPress={onClose}
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                >
                    <X size={20} color={colors.gray4} />
                </Button>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <View className="-mx-[5px] mb-2 flex-row flex-wrap">
                    <StatTile label="历史最高" value={formatWeight(exercise.maxWeightKg)} icon={<Dumbbell size={14} color={visual.accent} />} />
                    <StatTile label="重量突破" value={`${realBreakthroughs.length} 次`} icon={<TrendingUp size={14} color={colors.green} />} />
                    <StatTile label="训练天数" value={`${exercise.trainingDays} 天`} icon={<Calendar size={14} color={colors.blue} />} />
                    <StatTile label="累计容量" value={formatVolume(exercise.totalVolumeKg)} icon={<Target size={14} color={colors.orange} />} />
                </View>

                <Card className="mb-3 rounded-[14px] bg-secondary p-3.5">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text variant="label">最近训练</Text>
                        <Text variant="caption" className="font-bold">
                            {formatDate(exercise.latestDateStr)}
                        </Text>
                    </View>
                    {recentHistory.length === 0 ? (
                        <View className="items-center py-[22px]">
                            <Activity size={28} color={colors.gray4} />
                            <Text variant="muted" className="mt-3 font-bold">
                                还没有训练记录
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-2">
                            {recentHistory.map((record, index) => (
                                <View key={`${record.createdAt}-${index}`} className="flex-row items-center justify-between gap-3">
                                    <View className="flex-1">
                                        <Text className="text-sm font-bold">
                                            {record.dateStr}
                                        </Text>
                                        <Text variant="caption" className="mt-0.5 font-semibold">
                                            {record.setCount} 组 · {record.totalReps} 次 · {formatVolume(record.volumeKg)}
                                        </Text>
                                    </View>
                                    <Text className="text-sm font-black">
                                        {formatWeight(record.maxWeightKg)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </Card>

                <Card className="rounded-[14px] bg-secondary p-3.5">
                    <Text variant="label" className="mb-3">重量里程碑</Text>
                    {recentBreakthroughs.length === 0 ? (
                        <Text variant="muted" className="py-2 font-bold">
                            有最高重量记录后会显示突破历程
                        </Text>
                    ) : (
                        <View className="gap-2">
                            {recentBreakthroughs.map((item, index) => (
                                <View key={`${item.createdAt}-${index}`} className="flex-row items-center justify-between gap-3">
                                    <View className="flex-1">
                                        <Text className="text-sm font-bold">
                                            {item.previousWeightKg === null ? "初始记录" : "刷新最高重量"}
                                        </Text>
                                        <Text variant="caption" className="mt-0.5 font-semibold">
                                            {item.dateStr}
                                            {item.previousWeightKg !== null ? ` · 从 ${formatWeight(item.previousWeightKg)} 到` : ""}
                                        </Text>
                                    </View>
                                    <Text style={{ color: visual.accent }} className="text-sm font-black">
                                        {formatWeight(item.weightKg)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </Card>
            </ScrollView>
        </BottomSheetModal>
    );
}
