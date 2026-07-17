import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { View, ScrollView, processColor, type GestureResponderEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { CalendarCheck, X } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { getCheckinsByMonth, getWorkoutsByMonth } from "@/db/services/workout";
import { Button, ButtonText } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";

type Props = {
    refreshKey?: string;
};

const MONTH_FORMATTER = new Intl.DateTimeFormat("zh-CN", { month: "long" });
const HEATMAP_CELL_SIZE = 15;
const HEATMAP_GAP = 2;
const HEATMAP_HEIGHT = HEATMAP_CELL_SIZE * 6 + HEATMAP_GAP * 5;
const HEATMAP_FRAME_HEIGHT = HEATMAP_HEIGHT + 10;

function withAlpha(color: string, alpha: number) {
    const processed = processColor(color);
    if (typeof processed !== "number") return color;

    const red = (processed >> 16) & 255;
    const green = (processed >> 8) & 255;
    const blue = processed & 255;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function MonthlyHeatmap({ refreshKey }: Props) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();
    const [year, setYear] = useState(() => currentYear);
    const [month, setMonth] = useState(() => currentMonth);
    const [checkins, setCheckins] = useState<Record<number, boolean>>({});
    const [workoutDays, setWorkoutDays] = useState<Record<number, number>>({});
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const currentMonthRef = useRef({ year: currentYear, month: currentMonth });
    const loadSeqRef = useRef(0);
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

    const heatmapOpacity = useSharedValue(1);
    const heatmapAnimatedStyle = useAnimatedStyle(() => ({ opacity: heatmapOpacity.value }));

    useEffect(() => {
        currentMonthRef.current = { year, month };
    }, [year, month]);

    useEffect(() => {
        const requestId = ++loadSeqRef.current;

        Promise.all([
            getCheckinsByMonth(year, month),
            getWorkoutsByMonth(year, month),
        ]).then(([c, w]) => {
            if (requestId !== loadSeqRef.current) return;
            setCheckins(c);
            setWorkoutDays(w);
        }).catch(console.error);
    }, [year, month, refreshKey]);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthName = useMemo(() => MONTH_FORMATTER.format(new Date(year, month)), [year, month]);
    const placeholderColor = useMemo(() => withAlpha(colors.foreground, 0.01), [colors.foreground]);
    const heatmapBorderColor = useMemo(() => withAlpha(colors.foreground, 0.01), [colors.foreground]);

    const playSwipeTransition = useCallback(() => {
        heatmapOpacity.value = withSequence(
            withTiming(0.5, { duration: 100 }),
            withTiming(1, { duration: 200 })
        );
    }, [heatmapOpacity]);

    const navigateMonth = useCallback((direction: -1 | 1) => {
        const current = currentMonthRef.current;
        const next = new Date(current.year, current.month + direction, 1);
        if (next > new Date(currentYear, currentMonth, 1)) return;

        playSwipeTransition();
        setYear(next.getFullYear());
        setMonth(next.getMonth());
    }, [currentMonth, currentYear, playSwipeTransition]);

    const goToPrev = useCallback(() => navigateMonth(-1), [navigateMonth]);
    const goToNext = useCallback(() => navigateMonth(1), [navigateMonth]);

    const handleTouchStart = useCallback((event: GestureResponderEvent) => {
        touchStartRef.current = {
            x: event.nativeEvent.pageX,
            y: event.nativeEvent.pageY,
        };
    }, []);

    const handleTouchEnd = useCallback((event: GestureResponderEvent) => {
        const start = touchStartRef.current;
        touchStartRef.current = null;
        if (!start) return;

        const dx = event.nativeEvent.pageX - start.x;
        const dy = event.nativeEvent.pageY - start.y;
        if (Math.abs(dx) <= 50 || Math.abs(dx) <= Math.abs(dy)) return;
        if (dx > 0) goToPrev();
        else goToNext();
    }, [goToNext, goToPrev]);

    const todayNum = (year === currentYear && month === currentMonth) ? currentDate : -1;
    const monthlyCheckinCount = Object.values(checkins).filter(Boolean).length;

    // Compute week alignment (Monday = 0)
    const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;

    // Allowed selection range
    const years = useMemo(() => Array.from({ length: 5 }, (_, i) => currentYear - i), [currentYear]);
    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);
    const monthLabels = useMemo(() => months.map((m) => MONTH_FORMATTER.format(new Date(year, m))), [months, year]);

    return (
        <View
            className="w-full flex-row items-center justify-between"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => { touchStartRef.current = null; }}
        >
            <View className="justify-around" style={{ height: HEATMAP_FRAME_HEIGHT }}>
                <View className="gap-1">
                    <Button
                        onPress={() => setIsPickerVisible(true)}
                        variant="ghost"
                        className="h-auto items-start justify-start bg-transparent p-0"
                    >
                        <View>
                            <Text variant="micro" className="font-medium font-variant-numeric-tabular-nums">
                                {year}
                            </Text>
                            <Text className="text-xl font-black font-variant-numeric-tabular-nums">{monthName}</Text>
                        </View>
                    </Button>
                </View>

                <Separator className="my-2" />

                <View className="gap-1">
                    <View className="flex-row items-center gap-1.5">
                        <CalendarCheck size={13} color={colors.orange} />
                        <Text variant="micro" className="font-medium">打卡</Text>
                    </View>
                    <View className="flex-row items-baseline gap-1.5">
                        <Text className="text-xl font-black font-variant-numeric-tabular-nums">
                            {monthlyCheckinCount}
                        </Text>
                        <Text className="text-unit text-tertiary">天</Text>
                    </View>
                </View>
            </View>

            <View className="flex-1 items-center justify-center" style={{ height: HEATMAP_FRAME_HEIGHT }}>
                <Animated.View
                    className="rounded-sm border p-1"
                    style={[{ gap: HEATMAP_GAP, borderColor: heatmapBorderColor }, heatmapAnimatedStyle]}
                >
                    {Array.from({ length: 6 }, (_, row) => (
                        <View key={row} className="flex-row" style={{ gap: HEATMAP_GAP }}>
                            {Array.from({ length: 7 }, (_, column) => {
                                const index = row * 7 + column;
                                const day = index - firstDayIndex + 1;
                                const isValidDay = day >= 1 && day <= daysInMonth;
                                const isCheckedIn = isValidDay && Boolean(checkins[day]);
                                const hasWorkout = isValidDay && Boolean(workoutDays[day]);
                                const isToday = isValidDay && day === todayNum;
                                const backgroundColor = isCheckedIn || hasWorkout
                                    ? colors.orange
                                    : !isValidDay
                                        ? placeholderColor
                                        : isToday
                                            ? colors.gray3
                                            : colors.gray2;

                                return (
                                    <View
                                        key={index}
                                        className="shrink-0"
                                        style={{
                                            width: HEATMAP_CELL_SIZE,
                                            height: HEATMAP_CELL_SIZE,
                                            backgroundColor,
                                            borderCurve: "continuous",
                                            borderRadius: 3,
                                        } as any}
                                    />
                                );
                            })}
                        </View>
                    ))}
                </Animated.View>
            </View>

            <Sheet visible={isPickerVisible} onClose={() => setIsPickerVisible(false)} sheetHeight="50%" backgroundColor={colors.bg}>
                <View className="flex-1 p-6" style={{ paddingBottom: Math.max(insets.bottom, 48) }}>
                        <View className="mb-6 flex-row items-center justify-between">
                            <Text variant="subheading">选择时间</Text>
                            <Button onPress={() => setIsPickerVisible(false)}
                                accessibilityLabel="关闭日期选择器"
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 rounded-pill">
                                <X size={18} color={colors.gray4} />
                            </Button>
                        </View>

                        <View className="flex-row gap-4">
                            {/* Year Scroll */}
                            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                {years.map(y => (
                                    <Button
                                        key={y}
                                        onPress={() => setYear(y)}
                                        variant="ghost"
                                        style={{
                                            backgroundColor: year === y ? colors.border : "transparent",
                                            marginBottom: 4,
                                        }}
                                        className="py-3"
                                    >
                                        <ButtonText variant="ghost" style={{ color: year === y ? colors.white : colors.gray4, textAlign: "center" }}>
                                            {y}年
                                        </ButtonText>
                                    </Button>
                                ))}
                            </ScrollView>

                            {/* Month Scroll */}
                            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                {months.map(m => {
                                    const mName = monthLabels[m];
                                    const isFuture = year === currentYear && m > currentMonth;
                                    return (
                                        <Button
                                            key={m}
                                            onPress={() => !isFuture && setMonth(m)}
                                            variant="ghost"
                                            style={{
                                                backgroundColor: month === m ? colors.border : "transparent",
                                                marginBottom: 4,
                                                opacity: isFuture ? 0.3 : 1,
                                            }}
                                            className="py-3"
                                        >
                                            <ButtonText variant="ghost" style={{ color: month === m ? colors.white : colors.gray4, textAlign: "center" }}>
                                                {mName}
                                            </ButtonText>
                                        </Button>
                                    );
                                })}
                            </ScrollView>
                        </View>
                </View>
            </Sheet>
        </View>
    );
}
