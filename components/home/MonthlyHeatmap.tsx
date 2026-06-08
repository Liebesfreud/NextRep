import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { View, PanResponder, ScrollView } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { X, CalendarCheck } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { getCheckinsByMonth, getWorkoutsByMonth } from "@/db/services/workout";
import { Button, ButtonText } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";

type Props = {
    refreshKey?: string;
};

const MONTH_FORMATTER = new Intl.DateTimeFormat("zh-CN", { month: "long" });

export function MonthlyHeatmap({ refreshKey }: Props) {
    const { colors } = useTheme();
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

    // PanResponder for swipe gestures
    const panResponder = useMemo(
        () => PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dx > 50) {
                    goToPrev(); // Swipe right -> prev month
                } else if (gestureState.dx < -50) {
                    goToNext(); // Swipe left -> next month
                }
            },
        }),
        [goToNext, goToPrev]
    );

    const totalCells = 42; // Strictly 6 weeks * 7 days to maintain fixed height
    const todayNum = (year === currentYear && month === currentMonth) ? currentDate : -1;
    const monthlyCheckinCount = Object.values(checkins).filter(Boolean).length;

    // Compute week alignment (Monday = 0)
    const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;

    // Allowed selection range
    const years = useMemo(() => Array.from({ length: 5 }, (_, i) => currentYear - i), [currentYear]);
    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);
    const monthLabels = useMemo(() => months.map((m) => MONTH_FORMATTER.format(new Date(year, m))), [months, year]);

    return (
        <View className="flex-row justify-between items-center w-full" {...panResponder.panHandlers}>
            {/* Left Panel: Summary */}
            <View className="justify-center" style={{ paddingVertical: 2 }}>
                <View>
                    <Button
                        onPress={() => setIsPickerVisible(true)}
                        variant="ghost"
                        className="h-auto items-start justify-start bg-transparent p-0"
                    >
                        <View>
                            <Text variant="caption" className="mb-0.5 font-bold tracking-wider">
                                {year}
                            </Text>
                            <Text className="text-[22px] font-black">
                                {monthName}
                            </Text>
                        </View>
                    </Button>
                </View>

                <View className="mt-4">
                    <View className="flex-row items-center gap-1 mb-0.5">
                        <CalendarCheck size={12} color={colors.green} />
                        <Text variant="caption" className="font-extrabold tracking-wider">打卡</Text>
                    </View>
                    <View className="flex-row items-baseline gap-0.5">
                        <Text className="text-2xl font-black">
                            {monthlyCheckinCount}
                        </Text>
                        <Text variant="caption" className="text-[10px] font-extrabold">天</Text>
                    </View>
                </View>
            </View>

            {/* Right Panel: Minimalist Heatmap Grid */}
            <Animated.View style={[{ gap: 3 }, heatmapAnimatedStyle]}>
                {Array.from({ length: 6 }).map((_, r) => (
                    <View key={r} style={{ flexDirection: "row", gap: 3 }}>
                        {Array.from({ length: 7 }).map((_, c) => {
                            const i = r * 7 + c;
                            const dayNum = i - firstDayIndex + 1;
                            const isValidDay = dayNum >= 1 && dayNum <= daysInMonth;
                            const isCheckedIn = isValidDay && checkins[dayNum];
                            const isToday = isValidDay && dayNum === todayNum;

                            // Compute background logic
                            let bg: string = colors.gray2;
                            if (isCheckedIn) bg = colors.green;
                            else if (!isValidDay) bg = "transparent";
                            else if (isToday) bg = colors.border;

                            return (
                                <View
                                    key={i}
                                    style={{
                                        width: 14,
                                        height: 14,
                                        minWidth: 14,
                                        minHeight: 14,
                                        flexShrink: 0,
                                        borderRadius: 4,
                                        backgroundColor: bg,
                                        borderCurve: "continuous",
                                    } as any}
                                />
                            );
                        })}
                    </View>
                ))}
            </Animated.View>

            <Sheet visible={isPickerVisible} onClose={() => setIsPickerVisible(false)} sheetHeight="50%" backgroundColor={colors.bento}>
                <View className="flex-1 p-6 pb-12">
                        <View className="mb-6 flex-row items-center justify-between">
                            <Text variant="subheading" className="tracking-tight">选择时间</Text>
                            <Button onPress={() => setIsPickerVisible(false)}
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8 rounded-full">
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
                                        className="rounded-bento-sm py-3"
                                    >
                                        <ButtonText variant="ghost" style={{ color: year === y ? colors.white : colors.gray4, fontWeight: year === y ? "bold" : "normal", textAlign: "center" }}>
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
                                                backgroundColor: month === m ? colors.green : "transparent",
                                                marginBottom: 4,
                                                opacity: isFuture ? 0.3 : 1,
                                            }}
                                            className="rounded-bento-sm py-3"
                                        >
                                            <ButtonText variant="ghost" style={{ color: month === m ? colors.accentForeground : colors.gray4, fontWeight: month === m ? "bold" : "normal", textAlign: "center" }}>
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
