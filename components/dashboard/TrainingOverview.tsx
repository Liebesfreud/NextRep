import { View, Text, Pressable } from "react-native";
import { BarChart2, Flame, Activity, Dumbbell, Calendar, History } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

type Props = {
    data: any;
    loading: boolean;
    currentYear: number;
    currentMonth: number;
    calendarExpanded: boolean;
    setCalendarExpanded: (expanded: boolean) => void;
    selectedDay: number;
    setSelectedDay: (day: number) => void;
    todayNum: number;
};

export function TrainingOverview({
    data, loading, currentYear, currentMonth,
    calendarExpanded, setCalendarExpanded,
    selectedDay, setSelectedDay, todayNum
}: Props) {
    const { colors } = useTheme();

    // ─── Calendar helpers ──────────────────────────────────────────────────────
    const startDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
    const selectedDayIndex = startDay + selectedDay - 1;
    const selectedWeekRow = Math.floor(selectedDayIndex / 7);

    return (
        <View style={{ backgroundColor: colors.bento, borderColor: colors.border, borderWidth: 1, padding: 14 }} className="rounded-bento-lg gap-3">
            <View className="flex-row items-center justify-between px-0.5">
                <View className="flex-row items-center gap-1.5">
                    <BarChart2 size={16} color={colors.green} />
                    <Text style={{ color: colors.white, opacity: 0.9 }} className="font-bold text-xs tracking-wide">训练表现</Text>
                </View>
                <Text style={{ color: colors.gray4 }} className="text-xs italic">Weekly Focus</Text>
            </View>

            {/* Stats Bar */}
            <View style={{ flexDirection: "row", backgroundColor: colors.gray2, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }} className="rounded-bento-sm">
                {[
                    { label: "连续打卡", value: loading ? "-" : String(data?.streak || 0), unit: "天", icon: <Flame size={14} color={colors.orange} />, color: colors.orange },
                    { label: "本周训练", value: loading ? "-" : String(data?.workoutsThisWeek || 0), unit: "次", icon: <Activity size={14} color={colors.green} />, color: colors.green },
                    { label: "月容量", value: loading ? "-" : String(data?.monthlyVolumeTon || "0"), unit: "t", icon: <Dumbbell size={14} color={colors.green} />, color: colors.green },
                ].map((item, i) => (
                    <View key={i} style={{ flex: 1, paddingVertical: 16, alignItems: "center", borderLeftWidth: i > 0 ? 1 : 0, borderColor: colors.border }}>
                        <View className="flex-row items-center gap-1 mb-1.5">
                            {item.icon}
                            <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-tight opacity-80">{item.label}</Text>
                        </View>
                        <View className="flex-row items-baseline gap-0.5">
                            <Text style={{ color: colors.white }} className="text-2xl font-black leading-none">{item.value}</Text>
                            <Text style={{ color: colors.gray4 }} className="text-sm font-bold">{item.unit}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 14 }} />

            {/* Calendar */}
            <View className="gap-3 px-0.5">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1.5">
                        <Calendar size={16} color={colors.green} />
                        <Text style={{ color: colors.white, opacity: 0.9 }} className="font-semibold text-xs tracking-wide">
                            {currentMonth + 1}月 {currentYear}
                        </Text>
                    </View>
                    <Pressable onPress={() => setCalendarExpanded(!calendarExpanded)}>
                        <Text style={{ color: colors.green }} className="text-xs font-bold">
                            {calendarExpanded ? "收起" : "展开"}
                        </Text>
                    </Pressable>
                </View>

                {/* Day headers */}
                <View style={{ flexDirection: "row" }}>
                    {["日", "一", "二", "三", "四", "五", "六"].map(d => (
                        <View key={d} style={{ flex: 1, alignItems: "center" }}>
                            <Text style={{ color: colors.gray4, fontSize: 10 }}>{d}</Text>
                        </View>
                    ))}
                </View>

                {/* Days */}
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {Array.from({ length: totalCells }).map((_, i) => {
                        const currentRow = Math.floor(i / 7);
                        if (!calendarExpanded && currentRow !== selectedWeekRow) return null;
                        const isPadding = i < startDay || i >= startDay + daysInMonth;
                        const dayNum = i - startDay + 1;
                        const isWorkout = data?.dailyData?.[dayNum]?.isWorkout;
                        const isSelected = dayNum === selectedDay;

                        return (
                            <View key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}>
                                {!isPadding && (
                                    <Pressable
                                        onPress={() => setSelectedDay(dayNum)}
                                        style={{
                                            flex: 1,
                                            borderRadius: 999,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: isSelected ? colors.green
                                                : isWorkout ? `${colors.green}1A` : "transparent",
                                            transform: [{ scale: isSelected ? 1.1 : 1 }],
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: "600",
                                            color: isSelected ? colors.white
                                                : isWorkout ? colors.green : colors.white,
                                            opacity: isSelected ? 1 : 0.9,
                                        }}>
                                            {dayNum}
                                        </Text>
                                    </Pressable>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Daily Detail */}
                <View className="pt-2 gap-2">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-1.5">
                            <History size={14} color={colors.green} style={{ opacity: 0.8 }} />
                            <Text style={{ color: colors.white, opacity: 0.9 }} className="text-xs font-bold">
                                {currentMonth + 1}月{selectedDay}日
                            </Text>
                            <View style={{ backgroundColor: colors.border }} className="px-1.5 py-0.5 rounded">
                                <Text style={{ color: colors.gray4 }} className="text-xs font-medium tracking-wide">
                                    {selectedDay === todayNum ? "今天" : (data?.dailyData?.[selectedDay]?.isWorkout ? "训练日" : "休息")}
                                </Text>
                            </View>
                        </View>
                        {data?.dailyData?.[selectedDay]?.isWorkout && (
                            <View className="flex-row items-baseline gap-0.5">
                                <Text style={{ color: colors.green }} className="font-black text-sm tracking-tight">
                                    {(data.dailyData[selectedDay].volume / 1000).toFixed(1)}
                                </Text>
                                <Text style={{ color: colors.green }} className="text-xs font-bold">t</Text>
                            </View>
                        )}
                    </View>
                    {data?.dailyData?.[selectedDay]?.isWorkout ? (
                        <View style={{ backgroundColor: colors.gray3, borderColor: colors.border, borderWidth: 1 }}
                            className="rounded-xl px-3 py-2.5 flex-row items-center justify-between gap-3">
                            <Text style={{ color: colors.white }} className="flex-1 text-sm font-medium" numberOfLines={1}>
                                {data.dailyData[selectedDay].workouts.map((w: any) => w.name).join(" • ")}
                            </Text>
                            <Text style={{ color: colors.gray4 }} className="text-xs font-medium whitespace-nowrap">
                                {data.dailyData[selectedDay].workouts.length} 项 • ~{data.dailyData[selectedDay].duration} min
                            </Text>
                        </View>
                    ) : (
                        <Text style={{ color: colors.gray4 }} className="text-xs font-medium italic pt-1">休息，是为了更好的开始 💤</Text>
                    )}
                </View>
            </View>
        </View>
    );
}
