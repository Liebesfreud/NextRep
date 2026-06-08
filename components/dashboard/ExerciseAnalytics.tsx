import { useState } from "react";
import { View, Pressable } from "react-native";
import { ChevronRight, Library, Target } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { getStrengthCategoryVisual } from "@/constants/exerciseVisuals";
import { ExerciseDetailModal } from "@/components/dashboard/ExerciseDetailModal";
import { type StrengthExerciseAnalytics } from "@/db/services/dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

type DashboardData = {
    analytics?: StrengthExerciseAnalytics[];
};

type Props = {
    data: DashboardData | null;
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

export function ExerciseAnalytics({ data }: Props) {
    const { colors } = useTheme();
    const router = useRouter();
    const [selectedExercise, setSelectedExercise] = useState<StrengthExerciseAnalytics | null>(null);

    const analytics = data?.analytics ?? [];

    return (
        <>
            <Card className="gap-3 p-3.5">
                <View className="flex-row items-center justify-between px-0.5">
                    <View className="flex-row items-center gap-1.5">
                        <Target size={16} color={colors.orange} />
                        <Text variant="caption" className="font-bold tracking-wide opacity-90">高频动作 TOP5</Text>
                    </View>
                    <Button
                        onPress={() => router.push("/settings/exercises")}
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-lg border border-border"
                    >
                        <Library size={17} color={colors.gray4} />
                    </Button>
                </View>

                <View style={{ backgroundColor: colors.gray3, borderWidth: 1, borderColor: colors.border, padding: 8, minHeight: 112, borderRadius: 14 }}>
                    {analytics.length === 0 ? (
                        <View className="items-center justify-center p-5">
                            <Text variant="muted" className="italic">暂无力量动作分析数据</Text>
                        </View>
                    ) : analytics.map((exercise, idx) => {
                        const visual = getStrengthCategoryVisual(exercise.tag, colors);
                        const Icon = visual.icon;

                        return (
                            <Pressable
                                key={exercise.name}
                                onPress={() => setSelectedExercise(exercise)}
                                style={{ borderRadius: 12, padding: 10 }}
                                className="flex-row items-center justify-between gap-3"
                            >
                                <View className="flex-row items-center gap-3 flex-1">
                                    <View style={{ width: 28, alignItems: "center" }}>
                                        <Text style={{ color: visual.accent }} className="text-base font-black">
                                            {idx + 1}
                                        </Text>
                                    </View>
                                    <View style={{ backgroundColor: visual.iconBg, width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" }}>
                                        <Icon size={18} color={visual.accent} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-bold" numberOfLines={1}>
                                            {exercise.name}
                                        </Text>
                                        <Text variant="caption" className="mt-0.5 font-semibold" numberOfLines={1}>
                                            {exercise.trainingDays} 天 · {exercise.records} 条记录 · 最高 {formatWeight(exercise.maxWeightKg)}
                                        </Text>
                                    </View>
                                </View>
                                <View className="items-end flex-row gap-1.5">
                                    <Text variant="caption" className="font-black text-foreground">
                                        {formatVolume(exercise.totalVolumeKg)}
                                    </Text>
                                    <ChevronRight size={15} color={colors.gray4} />
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </Card>

            <ExerciseDetailModal
                visible={!!selectedExercise}
                exercise={selectedExercise}
                onClose={() => setSelectedExercise(null)}
            />
        </>
    );
}
