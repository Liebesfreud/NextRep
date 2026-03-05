import { View, Text } from "react-native";
import { Plus, Dumbbell, Activity, CheckCircle } from "lucide-react-native";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { useTheme } from "@/hooks/useTheme";
import { type WorkoutItem } from "@/db/services/workout";

function formatTime(iso: string) {
    return new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date(iso));
}

function formatSets(setsStr: string | null) {
    if (!setsStr) return null;
    try {
        if (setsStr.startsWith("[")) {
            const parsed = JSON.parse(setsStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const completedSets = parsed.filter((s: any) => s.isCompleted);
                // 如果有完成的组，则显示完成的组数；如果都没有打勾但记录了，保底显示总行数
                const count = completedSets.length > 0 ? completedSets.length : parsed.length;
                return `${count} 组`;
            }
        }
    } catch (e) {
        // ignore
    }
    return setsStr;
}

type Props = {
    workouts: WorkoutItem[];
    cardioWorkouts: WorkoutItem[];
    strengthWorkouts: WorkoutItem[];
    handleOpenCardio: () => void;
    handleOpenStrength: () => void;
    openEditModal: (w: WorkoutItem) => void;
    handleCheckin: () => void;
    isCheckedIn: boolean;
    isPending: boolean;
};

export function TodayWorkouts({
    workouts, cardioWorkouts, strengthWorkouts,
    handleOpenCardio, handleOpenStrength, openEditModal,
    handleCheckin, isCheckedIn, isPending
}: Props) {
    const { colors } = useTheme();

    return (
        <View
            style={{ backgroundColor: colors.bento, borderColor: colors.border }}
            className="rounded-bento-lg border p-4 gap-bento"
        >
            <View className="flex-row justify-between items-center px-1">
                <View className="flex-row items-center gap-2">
                    <Text style={{ color: colors.white }} className="text-lg font-bold tracking-tight">今日运动</Text>
                    {workouts.length > 0 && (
                        <View style={{ backgroundColor: colors.border }} className="px-2 py-0.5 rounded-md">
                            <Text style={{ color: colors.white }} className="text-xs font-bold uppercase tracking-wider">
                                {workouts.length} 次
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {workouts.length > 0 ? (
                <View className="gap-bento">
                    {/* Cardio */}
                    {cardioWorkouts.length > 0 && (
                        <View style={{ backgroundColor: `${colors.orange}1A`, borderColor: `${colors.orange}33` }}
                            className="rounded-bento-sm border p-3 gap-2">
                            <View className="flex-row justify-between items-center ml-1">
                                <Text style={{ color: colors.orange }} className="text-xs font-extrabold tracking-widest uppercase opacity-90">
                                    有氧训练
                                </Text>
                                <AnimatedPressable onPress={handleOpenCardio}
                                    style={{ backgroundColor: `${colors.orange}33` }}
                                    className="w-6 h-6 rounded-md items-center justify-center">
                                    <Plus size={14} color={colors.orange} strokeWidth={3} />
                                </AnimatedPressable>
                            </View>
                            {cardioWorkouts.map((w) => (
                                <AnimatedPressable key={w.id} onPress={() => openEditModal(w)}
                                    className="flex-row items-center gap-2.5 p-1.5 -mx-1.5 rounded-lg">
                                    <View style={{ backgroundColor: `${colors.orange}33` }} className="w-9 h-9 rounded-lg items-center justify-center">
                                        <Activity size={16} color={colors.orange} />
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-center">
                                            <Text style={{ color: colors.white }} className="font-bold text-sm">{w.name}</Text>
                                            <View style={{ backgroundColor: `${colors.orange}1A` }} className="px-2 py-0.5 rounded-md">
                                                <Text style={{ color: colors.orange }} className="text-xs font-semibold">{formatTime(w.createdAt)}</Text>
                                            </View>
                                        </View>
                                        {w.stats && <Text style={{ color: colors.white, opacity: 0.9 }} className="text-xs font-semibold mt-0.5">{w.stats}</Text>}
                                    </View>
                                </AnimatedPressable>
                            ))}
                        </View>
                    )}

                    {/* Strength */}
                    {strengthWorkouts.length > 0 && (
                        <View style={{ backgroundColor: colors.gray2 }} className="rounded-bento-sm p-3 gap-2">
                            <View className="flex-row justify-between items-center ml-1 mb-0.5">
                                <Text style={{ color: colors.gray4, opacity: 0.7 }} className="text-xs font-extrabold tracking-widest uppercase">
                                    力量训练
                                </Text>
                                <AnimatedPressable onPress={handleOpenStrength}
                                    style={{ backgroundColor: colors.gray2, borderColor: colors.border, borderWidth: 1 }}
                                    className="w-6 h-6 rounded-md items-center justify-center">
                                    <Plus size={14} color={colors.white} strokeWidth={3} />
                                </AnimatedPressable>
                            </View>
                            {strengthWorkouts.map((w) => (
                                <AnimatedPressable key={w.id} onPress={() => openEditModal(w)}
                                    className="flex-row items-center gap-2.5 p-1.5 -mx-1.5 rounded-lg">
                                    <View style={{ backgroundColor: colors.gray3 }} className="w-9 h-9 rounded-lg items-center justify-center">
                                        <Dumbbell size={16} color={colors.gray4} />
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-center">
                                            <Text style={{ color: colors.white }} className="font-bold text-sm">{w.name}</Text>
                                            <View style={{ backgroundColor: colors.border }} className="px-2 py-0.5 rounded-md">
                                                <Text style={{ color: colors.gray4 }} className="text-xs font-semibold">{formatTime(w.createdAt)}</Text>
                                            </View>
                                        </View>
                                        <Text className="text-xs font-semibold mt-0.5">
                                            {w.weight && <Text style={{ color: colors.white, opacity: 0.9 }}>{w.weight}</Text>}
                                            {w.weight && w.sets && <Text style={{ color: colors.gray4 }}> • </Text>}
                                            {w.sets && <Text style={{ color: colors.gray4 }}>{formatSets(w.sets)}</Text>}
                                        </Text>
                                    </View>
                                </AnimatedPressable>
                            ))}
                        </View>
                    )}
                </View>
            ) : (
                <View className="items-center justify-center py-8" style={{ opacity: 0.6 }}>
                    <Dumbbell size={40} color={colors.gray4} />
                    <Text style={{ color: colors.gray4 }} className="text-sm font-bold mt-3">今天还没有记录运动</Text>
                </View>
            )}

            {/* Quick-add buttons */}
            <View className="flex-row gap-bento">
                {cardioWorkouts.length === 0 && (
                    <AnimatedPressable onPress={handleOpenCardio}
                        style={{ backgroundColor: `${colors.orange}26`, borderColor: `${colors.orange}33`, borderWidth: 1 }}
                        className="flex-1 py-3 rounded-bento-sm flex-row items-center justify-center gap-2">
                        <Activity size={16} color={colors.orange} />
                        <Text style={{ color: colors.orange }} className="font-bold text-sm">有氧运动</Text>
                    </AnimatedPressable>
                )}
                {strengthWorkouts.length === 0 && (
                    <AnimatedPressable onPress={handleOpenStrength}
                        style={{ backgroundColor: colors.gray2, borderColor: colors.border, borderWidth: 1 }}
                        className="flex-1 py-3 rounded-bento-sm flex-row items-center justify-center gap-2">
                        <Dumbbell size={16} color={colors.white} />
                        <Text style={{ color: colors.white }} className="font-bold text-sm">力量训练</Text>
                    </AnimatedPressable>
                )}
            </View>

            {/* Check-in Button */}
            {workouts.length > 0 && !isCheckedIn && (
                <AnimatedPressable
                    onPress={handleCheckin}
                    disabled={isPending}
                    style={{ backgroundColor: colors.green, opacity: isPending ? 0.5 : 1 }}
                    className="w-full py-4 rounded-bento-sm flex-row items-center justify-center gap-2"
                >
                    <CheckCircle size={18} color="#000" strokeWidth={2.5} />
                    <Text className="font-extrabold text-base tracking-widest text-black">
                        {isPending ? "打卡中..." : "完成今日打卡"}
                    </Text>
                </AnimatedPressable>
            )}
            {isCheckedIn && (
                <View
                    style={{ backgroundColor: `${colors.green}1A`, borderColor: `${colors.green}33`, borderWidth: 1 }}
                    className="w-full py-4 rounded-bento-sm flex-row items-center justify-center gap-2"
                >
                    <CheckCircle size={18} color={colors.green} strokeWidth={2.5} />
                    <Text style={{ color: colors.green }} className="font-extrabold text-base tracking-widest">今日打卡已完成</Text>
                </View>
            )}
        </View>
    );
}
