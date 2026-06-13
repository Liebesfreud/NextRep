import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { View, ScrollView, type GestureResponderEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { X } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { getCheckinsByMonth, getWorkoutsByMonth } from "@/db/services/workout";
import { Button, ButtonText } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";

type Props = {
    refreshKey?: string;
};

const MONTH_FORMATTER = new Intl.DateTimeFormat("zh-CN", { month: "long" });
const HEATMAP_ROWS = 6;
const HEATMAP_COLUMNS = 7;

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
    const heatmapCells = useMemo(
        () => Array.from({ length: HEATMAP_ROWS * HEATMAP_COLUMNS }, (_, index) => {
            const day = index - firstDayIndex + 1;
            return day >= 1 && day <= daysInMonth ? day : null;
        }),
        [daysInMonth, firstDayIndex]
    );

    // Allowed selection range
    const years = useMemo(() => Array.from({ length: 5 }, (_, i) => currentYear - i), [currentYear]);
    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);
    const monthLabels = useMemo(() => months.map((m) => MONTH_FORMATTER.format(new Date(year, m))), [months, year]);

    return (
        <View
            className="w-full gap-4"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => { touchStartRef.current = null; }}
        >
            <View className="flex-row items-center justify-between">
                <Button
                    onPress={() => setIsPickerVisible(true)}
                    variant="ghost"
                    className="h-auto bg-transparent p-0"
                >
                    <View className="flex-row items-baseline">
                        <Text variant="body" className="font-variant-numeric-tabular-nums">{year}年</Text>
                        <Text variant="subheading" className="font-bold font-variant-numeric-tabular-nums">{monthName}</Text>
                    </View>
                </Button>

                <View className="flex-row items-baseline gap-1">
                    <Text className="text-stat-value font-bold font-variant-numeric-tabular-nums">
                        {monthlyCheckinCount}天
                    </Text>
                </View>
            </View>

            <Animated.View className="w-full gap-0.5" style={heatmapAnimatedStyle}>
                {Array.from({ length: HEATMAP_ROWS }, (_, row) => (
                    <View key={row} className="w-full flex-row gap-0.5">
                        {heatmapCells
                            .slice(row * HEATMAP_COLUMNS, (row + 1) * HEATMAP_COLUMNS)
                            .map((day, column) => {
                                if (day === null) {
                                    return <View key={`empty-${row}-${column}`} className="h-5 flex-1" />;
                                }

                                const isCheckedIn = Boolean(checkins[day]);
                                const isToday = day === todayNum;
                                const backgroundColor = isCheckedIn
                                    ? colors.green
                                    : isToday
                                        ? colors.border
                                        : colors.gray2;

                                return (
                                    <View
                                        key={day}
                                        className="h-5 flex-1 rounded-sm"
                                        style={{ backgroundColor, borderCurve: "continuous" } as any}
                                    />
                                );
                            })}
                    </View>
                ))}
            </Animated.View>

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
