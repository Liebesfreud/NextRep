import { useState } from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { Plus, Dumbbell, Activity, CheckCircle, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react-native";
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
                const count = completedSets.length > 0 ? completedSets.length : parsed.length;
                return `${count} 组`;
            }
        }
    } catch (e) {
        // ignore
    }
    return setsStr;
}

function toDateStr(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

// 微型月历选择器
function DatePickerModal({
    visible,
    onClose,
    selectedDate,
    onSelect,
    colors,
}: {
    visible: boolean;
    onClose: () => void;
    selectedDate: string;
    onSelect: (dateStr: string) => void;
    colors: any;
}) {
    const today = toDateStr(new Date());
    const selParts = selectedDate.split("-").map(Number);
    const [viewYear, setViewYear] = useState(selParts[0]);
    const [viewMonth, setViewMonth] = useState(selParts[1] - 1); // 0-indexed

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        // 不允许切换到未来月份
        const now = new Date();
        if (viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth())) return;
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };

    const isNextDisabled = (() => {
        const now = new Date();
        return (viewYear > now.getFullYear()) ||
            (viewYear === now.getFullYear() && viewMonth >= now.getMonth());
    })();

    const WEEK_LABELS = ["日", "一", "二", "三", "四", "五", "六"];
    const MONTH_NAMES = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

    const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
    const cells: (number | null)[] = Array.from({ length: totalCells }, (_, i) => {
        const day = i - firstDayOfWeek + 1;
        return day >= 1 && day <= daysInMonth ? day : null;
    });

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}
                onPress={onClose}
            >
                <Pressable
                    onPress={() => { }}
                    style={{
                        backgroundColor: colors.bento,
                        borderRadius: 20,
                        padding: 20,
                        width: 320,
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    {/* 月份导航 */}
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <Pressable onPress={prevMonth} style={{ padding: 6 }}>
                            <ChevronLeft size={20} color={colors.white} />
                        </Pressable>
                        <Text style={{ color: colors.white, fontWeight: "800", fontSize: 16 }}>
                            {viewYear}年 {MONTH_NAMES[viewMonth]}
                        </Text>
                        <Pressable onPress={nextMonth} style={{ padding: 6, opacity: isNextDisabled ? 0.3 : 1 }}>
                            <ChevronRight size={20} color={colors.white} />
                        </Pressable>
                    </View>

                    {/* 星期标签 */}
                    <View style={{ flexDirection: "row", marginBottom: 8 }}>
                        {WEEK_LABELS.map(w => (
                            <View key={w} style={{ flex: 1, alignItems: "center" }}>
                                <Text style={{ color: colors.gray4, fontSize: 11, fontWeight: "700" }}>{w}</Text>
                            </View>
                        ))}
                    </View>

                    {/* 日期格子 */}
                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                        {cells.map((day, idx) => {
                            if (!day) return <View key={idx} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;

                            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            const isToday = dateStr === today;
                            const isSelected = dateStr === selectedDate;
                            const isFuture = dateStr > today;

                            return (
                                <Pressable
                                    key={idx}
                                    style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}
                                    onPress={() => {
                                        if (!isFuture) {
                                            onSelect(dateStr);
                                            onClose();
                                        }
                                    }}
                                    disabled={isFuture}
                                >
                                    <View style={{
                                        flex: 1,
                                        borderRadius: 8,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: isSelected
                                            ? colors.green
                                            : isToday
                                                ? `${colors.green}33`
                                                : "transparent",
                                        opacity: isFuture ? 0.2 : 1,
                                    }}>
                                        <Text style={{
                                            color: isSelected ? "#000" : isToday ? colors.green : colors.white,
                                            fontSize: 13,
                                            fontWeight: isSelected || isToday ? "800" : "500",
                                        }}>
                                            {day}
                                        </Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* 快捷跳转 */}
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
                        <Pressable
                            onPress={() => { onSelect(today); onClose(); }}
                            style={{ flex: 1, backgroundColor: colors.gray2, paddingVertical: 10, borderRadius: 10, alignItems: "center" }}
                        >
                            <Text style={{ color: colors.green, fontWeight: "700", fontSize: 13 }}>回到今天</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
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
    selectedDate: string;
    onDateChange: (dateStr: string) => void;
    isToday: boolean;
};

export function TodayWorkouts({
    workouts, cardioWorkouts, strengthWorkouts,
    handleOpenCardio, handleOpenStrength, openEditModal,
    handleCheckin, isCheckedIn, isPending,
    selectedDate, onDateChange, isToday,
}: Props) {
    const { colors } = useTheme();
    const [showDatePicker, setShowDatePicker] = useState(false);

    const titleText = isToday
        ? "今日运动"
        : (() => {
            const parts = selectedDate.split("-");
            return `${parseInt(parts[1])}月${parseInt(parts[2])}日`;
        })();

    return (
        <View
            style={{ backgroundColor: colors.bento, borderColor: colors.border }}
            className="rounded-bento-lg border p-4 gap-bento"
        >
            <View className="flex-row justify-between items-center px-1">
                <View className="flex-row items-center gap-2">
                    {/* 标题 / 已选日期 */}
                    <AnimatedPressable
                        onPress={() => setShowDatePicker(true)}
                        style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                    >
                        <Text style={{ color: colors.white }} className="text-lg font-bold tracking-tight">
                            {titleText}
                        </Text>
                        <View style={{ backgroundColor: isToday ? colors.border : `${colors.green}33`, borderRadius: 6, padding: 4 }}>
                            <Calendar size={13} color={isToday ? colors.gray4 : colors.green} />
                        </View>
                    </AnimatedPressable>

                    {workouts.length > 0 && (
                        <View style={{ backgroundColor: colors.border }} className="px-2 py-0.5 rounded-md">
                            <Text style={{ color: colors.white }} className="text-xs font-bold uppercase tracking-wider">
                                {workouts.length} 次
                            </Text>
                        </View>
                    )}
                </View>

                {/* 非今日时显示"返回今天"快捷按钮 */}
                {!isToday && (
                    <AnimatedPressable
                        onPress={() => onDateChange(toDateStr(new Date()))}
                        style={{ backgroundColor: `${colors.green}1A`, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}
                    >
                        <Text style={{ color: colors.green, fontSize: 11, fontWeight: "700" }}>返回今天</Text>
                    </AnimatedPressable>
                )}
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
                    <Text style={{ color: colors.gray4 }} className="text-sm font-bold mt-3">
                        {isToday ? "今天还没有记录运动" : "这一天暂无运动记录"}
                    </Text>
                </View>
            )}

            {/* Quick-add buttons —— 仅今天显示 */}
            {isToday && (
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
            )}

            {/* 历史日期也可以补录记录 */}
            {!isToday && (
                <View className="flex-row gap-bento">
                    <AnimatedPressable onPress={handleOpenCardio}
                        style={{ backgroundColor: `${colors.orange}26`, borderColor: `${colors.orange}33`, borderWidth: 1 }}
                        className="flex-1 py-3 rounded-bento-sm flex-row items-center justify-center gap-2">
                        <Activity size={16} color={colors.orange} />
                        <Text style={{ color: colors.orange }} className="font-bold text-sm">补录有氧</Text>
                    </AnimatedPressable>
                    <AnimatedPressable onPress={handleOpenStrength}
                        style={{ backgroundColor: colors.gray2, borderColor: colors.border, borderWidth: 1 }}
                        className="flex-1 py-3 rounded-bento-sm flex-row items-center justify-center gap-2">
                        <Dumbbell size={16} color={colors.white} />
                        <Text style={{ color: colors.white }} className="font-bold text-sm">补录力量</Text>
                    </AnimatedPressable>
                </View>
            )}

            {/* Check-in Button —— 仅今天且有记录 */}
            {isToday && workouts.length > 0 && !isCheckedIn && (
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
            {isToday && isCheckedIn && (
                <View
                    style={{ backgroundColor: `${colors.green}1A`, borderColor: `${colors.green}33`, borderWidth: 1 }}
                    className="w-full py-4 rounded-bento-sm flex-row items-center justify-center gap-2"
                >
                    <CheckCircle size={18} color={colors.green} strokeWidth={2.5} />
                    <Text style={{ color: colors.green }} className="font-extrabold text-base tracking-widest">今日打卡已完成</Text>
                </View>
            )}

            {/* 日期选择器 */}
            <DatePickerModal
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                selectedDate={selectedDate}
                onSelect={onDateChange}
                colors={colors}
            />
        </View>
    );
}
