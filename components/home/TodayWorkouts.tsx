import { useEffect, useState } from "react";
import { View, Modal, Pressable } from "react-native";
import { Plus, Dumbbell, Activity, CheckCircle, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react-native";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { LightEffect } from "@/components/ui/LightEffect";
import { useTheme } from "@/hooks/useTheme";
import { getCheckinsByMonth, type WorkoutItem } from "@/db/services/workout";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

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
    const [checkins, setCheckins] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (!visible) return;
        const parts = selectedDate.split("-").map(Number);
        setCheckins({});
        setViewYear(parts[0]);
        setViewMonth(parts[1] - 1);
    }, [visible, selectedDate]);

    useEffect(() => {
        if (!visible) return;
        let isActive = true;
        setCheckins({});
        getCheckinsByMonth(viewYear, viewMonth)
            .then((data) => {
                if (isActive) setCheckins(data);
            })
            .catch(() => {
                if (isActive) setCheckins({});
            });
        return () => {
            isActive = false;
        };
    }, [visible, viewYear, viewMonth]);

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

    const totalCells = 42;
    const cells: (number | null)[] = Array.from({ length: totalCells }, (_, i) => {
        const day = i - firstDayOfWeek + 1;
        return day >= 1 && day <= daysInMonth ? day : null;
    });

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable className="flex-1 items-center justify-center bg-black/60" onPress={onClose}>
                <Pressable onPress={() => { }}>
                    <Card
                    className="w-[320px] rounded-[20px] p-5"
                >
                    {/* 月份导航 */}
                    <View className="mb-4 flex-row items-center justify-between">
                        <Button onPress={prevMonth} variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronLeft size={20} color={colors.white} />
                        </Button>
                        <Text className="text-base font-extrabold">
                            {viewYear}年 {MONTH_NAMES[viewMonth]}
                        </Text>
                        <Button onPress={nextMonth} variant="ghost" size="icon" disabled={isNextDisabled} className="h-8 w-8">
                            <ChevronRight size={20} color={colors.white} />
                        </Button>
                    </View>

                    {/* 星期标签 */}
                    <View className="mb-2 flex-row">
                        {WEEK_LABELS.map(w => (
                            <View key={w} className="flex-1 items-center">
                                <Text variant="caption" className="text-[11px] font-bold">{w}</Text>
                            </View>
                        ))}
                    </View>

                    {/* 日期格子 */}
                    <View className="flex-row flex-wrap">
                        {cells.map((day, idx) => {
                            if (!day) return <View key={idx} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;

                            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            const isToday = dateStr === today;
                            const isSelected = dateStr === selectedDate;
                            const isFuture = dateStr > today;
                            const isCheckedIn = !!checkins[day];

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
                                        borderWidth: isCheckedIn && !isSelected ? 1 : 0,
                                        borderColor: isCheckedIn && !isSelected ? `${colors.green}99` : "transparent",
                                        backgroundColor: isSelected
                                            ? colors.green
                                            : isToday
                                                ? `${colors.green}33`
                                                : isCheckedIn
                                                    ? `${colors.green}1A`
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
                                        {isCheckedIn && (
                                            <View
                                                style={{
                                                    position: "absolute",
                                                    bottom: 5,
                                                    width: 4,
                                                    height: 4,
                                                    borderRadius: 2,
                                                    backgroundColor: isSelected ? "#000" : colors.green,
                                                }}
                                            />
                                        )}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* 快捷跳转 */}
                    <View className="mt-4 flex-row gap-2">
                        <Button
                            onPress={() => { onSelect(today); onClose(); }}
                            variant="secondary"
                            className="flex-1 rounded-[10px] py-2.5"
                        >
                            <ButtonText variant="secondary" className="text-[13px] text-accent">回到今天</ButtonText>
                        </Button>
                    </View>
                    </Card>
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
        <Card className="gap-bento overflow-hidden p-4">
            <LightEffect 
                color={colors.green} 
                opacity={0.05} 
                size={300} 
                position={{ top: -120, right: -100 }} 
            />

            <View className="flex-row justify-between items-center px-1">
                <View className="flex-row items-center gap-2">
                    {/* 标题 / 已选日期 */}
                    <AnimatedPressable
                        onPress={() => setShowDatePicker(true)}
                        className="flex-row items-center gap-1.5"
                    >
                        <Text className="text-lg font-bold tracking-tight">
                            {titleText}
                        </Text>
                        <View className="rounded-md p-1" style={{ backgroundColor: isToday ? colors.border : `${colors.green}33` }}>
                            <Calendar size={13} color={isToday ? colors.gray4 : colors.green} />
                        </View>
                    </AnimatedPressable>

                    {workouts.length > 0 && (
                        <Badge variant="secondary" className="rounded-md px-2 py-0.5">
                            <BadgeText variant="secondary" className="uppercase tracking-wider text-foreground">
                                {workouts.length} 次
                            </BadgeText>
                        </Badge>
                    )}
                </View>

                {/* 非今日时显示"返回今天"快捷按钮 */}
                {!isToday && (
                    <Button
                        onPress={() => onDateChange(toDateStr(new Date()))}
                        variant="ghost"
                        size="sm"
                        className="h-auto bg-accent/10 px-2.5 py-1.5"
                    >
                        <ButtonText variant="ghost" size="sm" className="text-[11px] text-accent">返回今天</ButtonText>
                    </Button>
                )}
            </View>

            {workouts.length > 0 ? (
                <View className="gap-bento">
                    {/* Cardio */}
                    {cardioWorkouts.length > 0 && (
                        <Card style={{ backgroundColor: `${colors.orange}1A`, borderColor: `${colors.orange}33` }}
                            className="rounded-bento-sm p-3 gap-2">
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
                                            <Text className="text-sm font-bold">{w.name}</Text>
                                            <View style={{ backgroundColor: `${colors.orange}1A` }} className="px-2 py-0.5 rounded-md">
                                                <Text style={{ color: colors.orange }} className="text-xs font-semibold">{formatTime(w.createdAt)}</Text>
                                            </View>
                                        </View>
                                        {w.stats && <Text className="mt-0.5 text-xs font-semibold opacity-90">{w.stats}</Text>}
                                    </View>
                                </AnimatedPressable>
                            ))}
                        </Card>
                    )}

                    {/* Strength */}
                    {strengthWorkouts.length > 0 && (
                        <Card className="rounded-bento-sm bg-secondary p-3 gap-2">
                            <View className="flex-row justify-between items-center ml-1 mb-0.5">
                                <Text variant="caption" className="text-xs font-extrabold uppercase tracking-widest opacity-70">
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
                                            <Text className="text-sm font-bold">{w.name}</Text>
                                            <View style={{ backgroundColor: colors.border }} className="px-2 py-0.5 rounded-md">
                                                <Text variant="caption" className="text-xs font-semibold">{formatTime(w.createdAt)}</Text>
                                            </View>
                                        </View>
                                        <Text className="text-xs font-semibold mt-0.5">
                                            {w.weight && <Text className="opacity-90">{w.weight}</Text>}
                                            {w.weight && w.sets && <Text className="text-muted-foreground"> • </Text>}
                                            {w.sets && <Text className="text-muted-foreground">{formatSets(w.sets)}</Text>}
                                        </Text>
                                    </View>
                                </AnimatedPressable>
                            ))}
                        </Card>
                    )}
                </View>
            ) : (
                <View className="items-center justify-center py-8 opacity-60">
                    <Dumbbell size={40} color={colors.gray4} />
                    <Text variant="muted" className="mt-3 font-bold">
                        {isToday ? "今天还没有记录运动" : "这一天暂无运动记录"}
                    </Text>
                </View>
            )}

            {/* Quick-add buttons —— 仅今天显示 */}
            {isToday && (
                <View className="flex-row gap-bento">
                    {cardioWorkouts.length === 0 && (
                        <Button onPress={handleOpenCardio}
                            style={{ backgroundColor: `${colors.orange}26`, borderColor: `${colors.orange}33` }}
                            variant="outline"
                            className="flex-1 border py-3">
                            <Activity size={16} color={colors.orange} />
                            <ButtonText variant="outline" className="text-sm" style={{ color: colors.orange }}>有氧运动</ButtonText>
                        </Button>
                    )}
                    {strengthWorkouts.length === 0 && (
                        <Button onPress={handleOpenStrength}
                            style={{ backgroundColor: colors.gray2, borderColor: colors.border }}
                            variant="outline"
                            className="flex-1 border py-3">
                            <Dumbbell size={16} color={colors.white} />
                            <ButtonText variant="outline" className="text-sm text-foreground">力量训练</ButtonText>
                        </Button>
                    )}
                </View>
            )}

            {/* 历史日期也可以补录记录 */}
            {!isToday && (
                <View className="flex-row gap-bento">
                    <Button onPress={handleOpenCardio}
                        style={{ backgroundColor: `${colors.orange}26`, borderColor: `${colors.orange}33` }}
                        variant="outline"
                        className="flex-1 border py-3">
                        <Activity size={16} color={colors.orange} />
                        <ButtonText variant="outline" className="text-sm" style={{ color: colors.orange }}>补录有氧</ButtonText>
                    </Button>
                    <Button onPress={handleOpenStrength}
                        style={{ backgroundColor: colors.gray2, borderColor: colors.border }}
                        variant="outline"
                        className="flex-1 border py-3">
                        <Dumbbell size={16} color={colors.white} />
                        <ButtonText variant="outline" className="text-sm text-foreground">补录力量</ButtonText>
                    </Button>
                </View>
            )}

            {/* Check-in Button —— 仅今天且有记录 */}
            {workouts.length > 0 && !isCheckedIn && (
                <Button
                    onPress={handleCheckin}
                    disabled={isPending}
                    className="w-full bg-accent py-4"
                >
                    <CheckCircle size={18} color="#000" strokeWidth={2.5} />
                    <ButtonText className="text-base tracking-widest text-accent-foreground">
                        {isPending ? "打卡中..." : isToday ? "完成今日打卡" : "补打卡"}
                    </ButtonText>
                </Button>
            )}
            {isCheckedIn && (
                <View
                    style={{ backgroundColor: `${colors.green}1A`, borderColor: `${colors.green}33` }}
                    className="w-full flex-row items-center justify-center gap-2 rounded-bento-sm border py-4"
                >
                    <CheckCircle size={18} color={colors.green} strokeWidth={2.5} />
                    <Text style={{ color: colors.green }} className="font-extrabold text-base tracking-widest">{isToday ? "今日打卡已完成" : "已补打卡"}</Text>
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
        </Card>
    );
}
