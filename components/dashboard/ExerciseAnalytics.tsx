import { useState } from "react";
import { View } from "react-native";
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
            <Card className="gap-4 p-card-padding">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1.5">
                        <Target size={18} color={colors.accent} />
                        <Text variant="subheading" className="text-foreground">高频动作</Text>
                    </View>
                    <Button
                        onPress={() => router.push("/settings/exercises")}
                        accessibilityLabel="打开动作库"
                        variant="secondary"
                        size="icon"
                        className="h-9 w-9 rounded-pill bg-surface-elevated"
                    >
                        <Library size={17} color={colors.gray4} />
                    </Button>
                </View>

                <View className="min-h-[112px]">
                    {analytics.length === 0 ? (
                        <View className="items-center justify-center py-8">
                            <Target size={20} color={colors.gray4} />
                            <Text variant="muted" className="mt-3">
                                暂无数据
                            </Text>
                        </View>
                    ) : analytics.map((exercise, idx) => {
                        const visual = getStrengthCategoryVisual(exercise.tag, colors);
                        const Icon = visual.icon;

                        return (
                            <Button
                                key={exercise.name}
                                onPress={() => setSelectedExercise(exercise)}
                                variant="ghost"
                                className="h-auto justify-between rounded-lg px-2 py-3"
                            >
                                <View className="flex-row items-center gap-3 flex-1">
                                    <View className="w-7 items-center">
                                        <Text className="text-body-semibold text-foreground font-variant-numeric-tabular-nums">
                                            {idx + 1}
                                        </Text>
                                    </View>
                                    <View className="h-9 w-9 items-center justify-center rounded-md bg-surface-elevated">
                                        <Icon size={18} color={visual.accent} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-body-semibold text-foreground" numberOfLines={1}>
                                            {exercise.name}
                                        </Text>
                                    </View>
                                </View>
                                <View className="items-end flex-row gap-1.5">
                                    <Text variant="caption" className="text-foreground font-variant-numeric-tabular-nums">
                                        {formatVolume(exercise.totalVolumeKg)}
                                    </Text>
                                    <ChevronRight size={15} color={colors.gray4} />
                                </View>
                            </Button>
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
