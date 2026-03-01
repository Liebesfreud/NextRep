import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, PanResponder, Modal, ScrollView, Animated } from "react-native";
import { X, CalendarCheck } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { getCheckinsByMonth, getWorkoutsByMonth } from "@/db/services/workout";

type Props = {
    refreshKey?: string;
};

export function MonthlyHeatmap({ refreshKey }: Props) {
    const { colors } = useTheme();
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [checkins, setCheckins] = useState<Record<number, boolean>>({});
    const [workoutDays, setWorkoutDays] = useState<Record<number, number>>({});
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    // Fade animation for swipe transitions
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Promise.all([
            getCheckinsByMonth(year, month),
            getWorkoutsByMonth(year, month),
        ]).then(([c, w]) => {
            setCheckins(c);
            setWorkoutDays(w);
        });
    }, [year, month, refreshKey]);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthName = new Intl.DateTimeFormat("zh-CN", { month: "long" }).format(new Date(year, month));

    const goToPrev = () => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0.5, duration: 100, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true })
        ]).start();
        if (month === 0) { setYear(y => y - 1); setMonth(11); }
        else setMonth(m => m - 1);
    };
    const goToNext = () => {
        if (year === now.getFullYear() && month === now.getMonth()) return; // Prevent future months
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0.5, duration: 100, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true })
        ]).start();
        if (month === 11) { setYear(y => y + 1); setMonth(0); }
        else setMonth(m => m + 1);
    };

    // PanResponder for swipe gestures
    const panResponder = useRef(
        PanResponder.create({
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
        })
    ).current;

    const totalCells = 42; // Strictly 6 weeks * 7 days to maintain fixed height
    const todayNum = (year === now.getFullYear() && month === now.getMonth()) ? now.getDate() : -1;
    const monthlyCheckinCount = Object.values(checkins).filter(Boolean).length;

    // Compute week alignment (Monday = 0)
    const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;

    // Allowed selection range
    const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
        <View className="flex-row justify-between items-center w-full" {...panResponder.panHandlers}>
            {/* Left Panel: Summary */}
            <View className="justify-center" style={{ paddingVertical: 2 }}>
                <View>
                    <Pressable onPress={() => setIsPickerVisible(true)}>
                        <Text style={{ color: colors.gray4, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 2 }}>
                            {year}
                        </Text>
                        <Text style={{ color: colors.white, fontSize: 22, fontWeight: "900" }}>
                            {monthName}
                        </Text>
                    </Pressable>
                </View>

                <View className="mt-4">
                    <View className="flex-row items-center gap-1 mb-0.5">
                        <CalendarCheck size={12} color={colors.green} />
                        <Text style={{ color: colors.gray4, fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>打卡</Text>
                    </View>
                    <View className="flex-row items-baseline gap-0.5">
                        <Text style={{ color: colors.white, fontSize: 24, fontWeight: "900" }}>
                            {monthlyCheckinCount}
                        </Text>
                        <Text style={{ color: colors.gray4, fontSize: 10, fontWeight: "800" }}>天</Text>
                    </View>
                </View>
            </View>

            {/* Right Panel: Minimalist Heatmap Grid */}
            <Animated.View style={{ opacity: fadeAnim, gap: 3 }}>
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

            {/* Date Picker Modal */}
            <Modal visible={isPickerVisible} animationType="slide" transparent onRequestClose={() => setIsPickerVisible(false)}>
                <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
                    onPress={() => setIsPickerVisible(false)}>
                    <Pressable onPress={() => { }} style={{ backgroundColor: colors.bento, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, maxHeight: "50%" }}>
                        <View className="flex-row justify-between items-center mb-6">
                            <Text style={{ color: colors.white }} className="text-xl font-extrabold tracking-tight">选择时间</Text>
                            <Pressable onPress={() => setIsPickerVisible(false)}
                                style={{ backgroundColor: colors.border }}
                                className="w-8 h-8 rounded-full items-center justify-center">
                                <X size={18} color={colors.gray4} />
                            </Pressable>
                        </View>

                        <View className="flex-row gap-4">
                            {/* Year Scroll */}
                            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                {years.map(y => (
                                    <Pressable
                                        key={y}
                                        onPress={() => setYear(y)}
                                        style={{
                                            paddingVertical: 12,
                                            paddingHorizontal: 16,
                                            backgroundColor: year === y ? colors.border : "transparent",
                                            borderRadius: 12,
                                            marginBottom: 4,
                                        }}
                                    >
                                        <Text style={{ color: year === y ? colors.white : colors.gray4, fontWeight: year === y ? "bold" : "normal", textAlign: "center" }}>
                                            {y}年
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>

                            {/* Month Scroll */}
                            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                {months.map(m => {
                                    const mName = new Intl.DateTimeFormat("zh-CN", { month: "long" }).format(new Date(year, m));
                                    const isFuture = year === now.getFullYear() && m > now.getMonth();
                                    return (
                                        <Pressable
                                            key={m}
                                            onPress={() => !isFuture && setMonth(m)}
                                            style={{
                                                paddingVertical: 12,
                                                paddingHorizontal: 16,
                                                backgroundColor: month === m ? colors.green : "transparent",
                                                borderRadius: 12,
                                                marginBottom: 4,
                                                opacity: isFuture ? 0.3 : 1,
                                            }}
                                        >
                                            <Text style={{ color: month === m ? "#000" : colors.gray4, fontWeight: month === m ? "bold" : "normal", textAlign: "center" }}>
                                                {mName}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
