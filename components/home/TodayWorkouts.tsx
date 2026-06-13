import { useEffect, useState } from "react";
import { View } from "react-native";
import { Plus, Dumbbell, Activity, CheckCircle, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { getCheckinsByMonth, type WorkoutItem } from "@/db/services/workout";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { CalendarDayCell } from "@/components/ui/calendar-day-cell";
import { Card } from "@/components/ui/card";
import { Sheet } from "@/components/ui/sheet";
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
        <Sheet visible={visible} onClose={onClose} sheetHeight={430} backgroundColor={colors.bg}>
            <View className="flex-1 px-5 pb-8 pt-5">
                    {/* 月份导航 */}
                    <View className="mb-4 flex-row items-center justify-between">
                        <Button onPress={prevMonth} accessibilityLabel="上一个月" variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronLeft size={20} color={colors.foreground} />
                        </Button>
                        <Text className="text-base font-semibold">
                            {viewYear}年 {MONTH_NAMES[viewMonth]}
                        </Text>
                        <Button onPress={nextMonth} accessibilityLabel="下一个月" variant="ghost" size="icon" disabled={isNextDisabled} className="h-8 w-8">
                            <ChevronRight size={20} color={colors.foreground} />
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
                            if (!day) return <View key={`blank-${viewYear}-${viewMonth}-${idx}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;

                            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            const isToday = dateStr === today;
                            const isSelected = dateStr === selectedDate;
                            const isFuture = dateStr > today;
                            const isCheckedIn = !!checkins[day];

                            return (
                                <View key={dateStr} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}>
                                    <CalendarDayCell
                                        day={day}
                                        selected={isSelected}
                                        today={isToday}
                                        marked={isCheckedIn}
                                        disabled={isFuture}
                                        size={38}
                                        onPress={() => {
                                            if (!isFuture) {
                                                onSelect(dateStr);
                                                onClose();
                                            }
                                        }}
                                    />
                                </View>
                            );
                        })}
                    </View>

                    {/* 快捷跳转 */}
                    <View className="mt-4 flex-row gap-2">
                        <Button
                            onPress={() => { onSelect(today); onClose(); }}
                            variant="secondary"
                            className="flex-1 py-2.5"
                        >
                            <ButtonText variant="secondary" className="text-[13px]">回到今天</ButtonText>
                        </Button>
                    </View>
            </View>
        </Sheet>
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
        <Card className="gap-4 p-4">
            <View className="flex-row justify-between items-center px-1">
                <View className="flex-row items-center gap-2">
                    {/* 标题 / 已选日期 */}
                    <Button
                        onPress={() => setShowDatePicker(true)}
                        variant="ghost"
                        className="h-auto flex-row items-center gap-1.5 px-0 py-0"
                    >
                        <Text className="text-lg font-bold">
                            {titleText}
                        </Text>
                        <View className="rounded-md border border-border p-1">
                            <Calendar size={13} color={colors.gray4} />
                        </View>
                    </Button>

                    {workouts.length > 0 && (
                        <Badge variant="secondary" className="px-2 py-0.5">
                            <BadgeText variant="secondary" className="font-semibold font-variant-numeric-tabular-nums">
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
                        className="h-auto px-2.5 py-1.5"
                    >
                        <ButtonText variant="ghost" size="sm" className="text-[11px] font-medium">返回今天</ButtonText>
                    </Button>
                )}
            </View>

            {workouts.length > 0 ? (
                <View className="gap-4">
                    {/* Cardio */}
                    {cardioWorkouts.length > 0 && (
                        <Card className="gap-2 p-3">
                            <View className="flex-row justify-between items-center ml-1">
                                <Text variant="caption" className="font-semibold">
                                    有氧训练
                                </Text>
                                <Button onPress={handleOpenCardio} variant="ghost" size="icon"
                                    className="h-6 w-6 rounded-md border border-border">
                                    <Plus size={14} color={colors.foreground} strokeWidth={2.5} />
                                </Button>
                            </View>
                            {cardioWorkouts.map((w) => (
                                <Button key={w.id} onPress={() => openEditModal(w)} variant="ghost"
                                    className="-mx-1.5 h-auto flex-row items-center gap-2.5 rounded-lg p-1.5">
                                    <View className="h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted">
                                        <Activity size={16} color={colors.foreground} />
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-sm font-semibold">{w.name}</Text>
                                            <View className="rounded-md border border-border px-2 py-0.5">
                                                <Text className="text-xs font-normal text-muted-foreground font-variant-numeric-tabular-nums">{formatTime(w.createdAt)}</Text>
                                            </View>
                                        </View>
                                        {w.stats && <Text className="mt-0.5 text-xs font-medium text-muted-foreground font-variant-numeric-tabular-nums">{w.stats}</Text>}
                                    </View>
                                </Button>
                            ))}
                        </Card>
                    )}

                    {/* Strength */}
                    {strengthWorkouts.length > 0 && (
                        <Card className="gap-2 p-3">
                            <View className="flex-row justify-between items-center ml-1 mb-0.5">
                                <Text variant="caption" className="font-semibold">
                                    力量训练
                                </Text>
                                <Button onPress={handleOpenStrength} variant="ghost" size="icon"
                                    className="h-6 w-6 rounded-md border border-border">
                                    <Plus size={14} color={colors.foreground} strokeWidth={2.5} />
                                </Button>
                            </View>
                            {strengthWorkouts.map((w) => (
                                <Button key={w.id} onPress={() => openEditModal(w)} variant="ghost"
                                    className="-mx-1.5 h-auto flex-row items-center gap-2.5 rounded-lg p-1.5">
                                    <View className="h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted">
                                        <Dumbbell size={16} color={colors.gray4} />
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-sm font-semibold">{w.name}</Text>
                                            <View className="rounded-md border border-border px-2 py-0.5">
                                                <Text variant="caption" className="text-xs font-normal text-muted-foreground font-variant-numeric-tabular-nums">{formatTime(w.createdAt)}</Text>
                                            </View>
                                        </View>
                                        <Text className="mt-0.5 text-xs font-medium text-muted-foreground font-variant-numeric-tabular-nums">
                                            {w.weight && <Text className="opacity-90">{w.weight}</Text>}
                                            {w.weight && w.sets && <Text className="text-muted-foreground"> • </Text>}
                                            {w.sets && <Text className="text-muted-foreground">{formatSets(w.sets)}</Text>}
                                        </Text>
                                    </View>
                                </Button>
                            ))}
                        </Card>
                    )}
                </View>
            ) : (
                <View className="items-center justify-center py-8">
                    <Dumbbell size={28} color={colors.gray4} />
                    <Text variant="muted" className="mt-3">
                        暂无记录
                    </Text>
                </View>
            )}

            {/* Quick-add buttons —— 仅今天显示 */}
            {isToday && (
                <View className="flex-row gap-3">
                    {cardioWorkouts.length === 0 && (
                        <Button onPress={handleOpenCardio}
                            variant="outline"
                            className="flex-1 py-3">
                            <Activity size={16} color={colors.foreground} />
                            <ButtonText variant="outline" className="text-sm font-semibold">有氧运动</ButtonText>
                        </Button>
                    )}
                    {strengthWorkouts.length === 0 && (
                        <Button onPress={handleOpenStrength}
                            variant="outline"
                            className="flex-1 py-3">
                            <Dumbbell size={16} color={colors.foreground} />
                            <ButtonText variant="outline" className="text-sm font-semibold">力量训练</ButtonText>
                        </Button>
                    )}
                </View>
            )}

            {/* 历史日期也可以补录记录 */}
            {!isToday && (
                <View className="flex-row gap-3">
                    <Button onPress={handleOpenCardio}
                        variant="outline"
                        className="flex-1 py-3">
                        <Activity size={16} color={colors.foreground} />
                        <ButtonText variant="outline" className="text-sm font-semibold">补录有氧</ButtonText>
                    </Button>
                    <Button onPress={handleOpenStrength}
                        variant="outline"
                        className="flex-1 py-3">
                        <Dumbbell size={16} color={colors.foreground} />
                        <ButtonText variant="outline" className="text-sm font-semibold">补录力量</ButtonText>
                    </Button>
                </View>
            )}

            {/* Check-in Button —— 仅今天且有记录 */}
            {workouts.length > 0 && !isCheckedIn && (
                <Button
                    onPress={handleCheckin}
                    disabled={isPending}
                    className="w-full py-4"
                >
                    <CheckCircle size={18} color={colors.primaryForeground} strokeWidth={2.25} />
                    <ButtonText className="text-base font-semibold">
                        {isPending ? "打卡中..." : isToday ? "完成今日打卡" : "补打卡"}
                    </ButtonText>
                </Button>
            )}
            {isCheckedIn && (
                <View
                    className="w-full flex-row items-center justify-center gap-2 rounded-lg border border-border py-4"
                >
                    <CheckCircle size={18} color={colors.green} strokeWidth={2.5} />
                    <Text className="text-base font-semibold">{isToday ? "今日已打卡" : "已补打卡"}</Text>
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
