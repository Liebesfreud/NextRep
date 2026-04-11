import { useMemo, useRef, useState, type ReactNode } from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { Activity, BarChart2, Calendar, Dumbbell, Flame, TrendingUp } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

type ReviewSummary = {
    workouts: number;
    activeDays: number;
    totalVolumeKg: number;
    strengthWorkouts: number;
    cardioWorkouts: number;
    topExercise: string | null;
    averageVolumePerWorkoutKg: number;
    consistencyRate: number;
    summary: string;
};

type DayWorkout = {
    id: string;
    name: string;
    weight: string | null;
    sets: string | null;
    type: string;
};

type DaySummary = {
    day: number;
    isWorkout: boolean;
    workouts: DayWorkout[];
    volume: number;
    duration: number;
};

type DashboardData = {
    streak?: number;
    workoutsThisWeek?: number;
    monthlyVolumeTon?: string;
    dailyData?: Record<number, DaySummary>;
    weeklyReview?: ReviewSummary;
    monthlyReview?: ReviewSummary;
    allTimeReview?: ReviewSummary;
};

type Props = {
    data: DashboardData | null;
    loading: boolean;
    currentYear: number;
    currentMonth: number;
    calendarExpanded: boolean;
    setCalendarExpanded: (expanded: boolean) => void;
    reviewExpanded: boolean;
    setReviewExpanded: (expanded: boolean) => void;
    selectedDay: number;
    setSelectedDay: (day: number) => void;
    todayNum: number;
};

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];
const DAY_CELL_WIDTH = "14.2857%";

function formatVolumeKg(value: number) {
    if (!value) return "0 kg";
    if (value >= 1000) return `${(value / 1000).toFixed(1)} t`;
    return `${Math.round(value)} kg`;
}

function formatRate(rate: number) {
    return `${Math.round(rate * 100)}%`;
}

function getMonthLabel(month: number) {
    return `${month + 1} 月`;
}

function Divider() {
    const { colors } = useTheme();
    return <View style={{ height: 1, backgroundColor: colors.border }} />;
}

function SectionTitle({ icon, title, action }: { icon: ReactNode; title: string; action?: ReactNode }) {
    const { colors } = useTheme();

    return (
        <View className="flex-row items-center justify-between gap-3">
            <View className="flex-row items-center gap-2">
                {icon}
                <Text style={{ color: colors.white }} className="text-sm font-black tracking-wide">
                    {title}
                </Text>
            </View>
            {action}
        </View>
    );
}

function ToggleAction({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    const { colors } = useTheme();

    return (
        <Pressable
            onPress={onPress}
            hitSlop={8}
            style={{ backgroundColor: colors.gray3, borderColor: colors.border, borderWidth: 1, minHeight: 32, paddingHorizontal: 12, borderRadius: 16 }}
            className="items-center justify-center"
        >
            <Text style={{ color: active ? colors.green : colors.gray4 }} className="text-xs font-bold">
                {label}
            </Text>
        </Pressable>
    );
}

function MetricStat({ label, value, unit, icon }: { label: string; value: string; unit?: string; icon: ReactNode }) {
    const { colors } = useTheme();

    return (
        <View className="flex-1 gap-2">
            <View className="flex-row items-center gap-1.5">
                {icon}
                <Text style={{ color: colors.gray4 }} className="text-[11px] font-bold">
                    {label}
                </Text>
            </View>
            <View className="flex-row items-end gap-1">
                <Text style={{ color: colors.white }} className="text-xl font-black tracking-tight">
                    {value}
                </Text>
                {unit ? (
                    <Text style={{ color: colors.gray4 }} className="text-xs font-bold pb-0.5">
                        {unit}
                    </Text>
                ) : null}
            </View>
        </View>
    );
}

function ReviewCard({ title, summary }: { title: string; summary?: ReviewSummary }) {
    const { colors } = useTheme();

    const metrics = [
        { label: "训练次数", value: String(summary?.workouts ?? 0) },
        { label: "活跃天数", value: String(summary?.activeDays ?? 0) },
        { label: "完成率", value: formatRate(summary?.consistencyRate ?? 0) },
        { label: "总训练量", value: formatVolumeKg(summary?.totalVolumeKg ?? 0) },
    ];

    return (
        <View style={{ backgroundColor: colors.gray3, borderColor: colors.border, borderWidth: 1, padding: 12, borderRadius: 16 }} className="gap-3">
            <Text style={{ color: colors.white }} className="text-sm font-black">
                {title}
            </Text>

            <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
                {metrics.map((item) => (
                    <View key={item.label} style={{ width: "50%", padding: 6 }}>
                        <Text style={{ color: colors.gray4 }} className="text-[11px] font-bold">
                            {item.label}
                        </Text>
                        <Text style={{ color: colors.white }} className="text-base font-black mt-1">
                            {item.value}
                        </Text>
                    </View>
                ))}
            </View>

            <Divider />

            <View className="gap-2">
                <View className="flex-row items-center justify-between gap-3">
                    <Text style={{ color: colors.gray4 }} className="text-[11px] font-bold">
                        训练结构
                    </Text>
                    <Text style={{ color: colors.white }} className="text-xs font-bold">
                        力量 {summary?.strengthWorkouts ?? 0} · 有氧 {summary?.cardioWorkouts ?? 0}
                    </Text>
                </View>
                <View className="flex-row items-center justify-between gap-3">
                    <Text style={{ color: colors.gray4 }} className="text-[11px] font-bold">
                        高频动作
                    </Text>
                    <Text style={{ color: colors.white }} className="flex-1 text-right text-xs font-bold" numberOfLines={1}>
                        {summary?.topExercise ?? "暂无"}
                    </Text>
                </View>
                <View className="flex-row items-center justify-between gap-3">
                    <Text style={{ color: colors.gray4 }} className="text-[11px] font-bold">
                        单次均量
                    </Text>
                    <Text style={{ color: colors.white }} className="text-xs font-bold">
                        {formatVolumeKg(summary?.averageVolumePerWorkoutKg ?? 0)}
                    </Text>
                </View>
            </View>
        </View>
    );
}

export function TrainingOverview({
    data,
    loading,
    currentYear,
    currentMonth,
    calendarExpanded,
    setCalendarExpanded,
    reviewExpanded,
    setReviewExpanded,
    selectedDay,
    setSelectedDay,
    todayNum,
}: Props) {
    const { colors } = useTheme();
    const reviewScrollRef = useRef<ScrollView>(null);
    const { width } = useWindowDimensions();
    const [activeReviewPage, setActiveReviewPage] = useState(0);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const selectedDayData = data?.dailyData?.[selectedDay];
    const hasWorkout = !!selectedDayData?.isWorkout;

    const collapsedStartDay = Math.max(1, Math.min(daysInMonth - 6, todayNum - 6));
    const compactDays = Array.from({ length: Math.min(7, daysInMonth) }, (_, index) => collapsedStartDay + index);

    const reviewPages = useMemo(
        () => [
            { key: "week", title: "近 7 天", summary: data?.weeklyReview },
            { key: "month", title: getMonthLabel(currentMonth), summary: data?.monthlyReview },
            { key: "all", title: "累计", summary: data?.allTimeReview },
        ],
        [currentMonth, data?.allTimeReview, data?.monthlyReview, data?.weeklyReview],
    );

    const reviewPageGap = 10;
    const reviewPageWidth = Math.max(0, width - 96);
    const reviewSnapInterval = reviewPageWidth + reviewPageGap;

    return (
        <View style={{ backgroundColor: colors.bento, borderColor: colors.border, borderWidth: 1, padding: 16, borderRadius: 16 }} className="gap-5">
            <SectionTitle icon={<BarChart2 size={17} color={colors.green} />} title="训练表现" />

            <View style={{ backgroundColor: colors.gray3, borderColor: colors.border, borderWidth: 1, padding: 12, borderRadius: 16 }} className="gap-3">
                <View className="flex-row gap-4">
                    <MetricStat label="本周训练" value={loading ? "-" : String(data?.workoutsThisWeek ?? 0)} unit="次" icon={<Activity size={14} color={colors.green} />} />
                    <MetricStat label="本月训练量" value={loading ? "-" : String(data?.monthlyVolumeTon ?? "0.0")} unit="t" icon={<Dumbbell size={14} color={colors.orange} />} />
                    <MetricStat label="累计打卡" value={loading ? "-" : String(data?.streak ?? 0)} unit="天" icon={<Flame size={14} color={colors.red} />} />
                </View>
            </View>

            <Divider />

            <SectionTitle
                icon={<Calendar size={17} color={colors.green} />}
                title="训练日历"
                action={
                    <ToggleAction label={calendarExpanded ? "收起" : "展开"} active={calendarExpanded} onPress={() => setCalendarExpanded(!calendarExpanded)} />
                }
            />

            {calendarExpanded ? (
                <>
                    <View className="flex-row flex-wrap">
                        {WEEKDAY_LABELS.map((weekday) => (
                            <View key={weekday} style={{ width: DAY_CELL_WIDTH }} className="items-center mb-2">
                                <Text style={{ color: colors.gray4 }} className="text-[11px] font-bold">
                                    {weekday}
                                </Text>
                            </View>
                        ))}

                        {Array.from({ length: firstDayOfMonth }, (_, index) => (
                            <View key={`blank-${index}`} style={{ width: DAY_CELL_WIDTH, height: 36 }} />
                        ))}

                        {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((dayNum) => {
                            const isSelected = dayNum === selectedDay;
                            const isToday = dayNum === todayNum;
                            const isWorkoutDay = !!data?.dailyData?.[dayNum]?.isWorkout;

                            return (
                                <View key={dayNum} style={{ width: DAY_CELL_WIDTH }} className="items-center mb-2">
                                    <Pressable
                                        onPress={() => setSelectedDay(dayNum)}
                                        style={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: 999,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: isSelected ? colors.green : isWorkoutDay ? `${colors.green}18` : "transparent",
                                            borderWidth: isToday && !isSelected ? 1 : 0,
                                            borderColor: isToday ? `${colors.green}66` : "transparent",
                                        }}
                                    >
                                        <Text style={{ color: isSelected ? colors.black : isWorkoutDay ? colors.green : colors.white }} className="text-xs font-bold">
                                            {dayNum}
                                        </Text>
                                    </Pressable>
                                </View>
                            );
                        })}
                    </View>
                </>
            ) : (
                <View className="flex-row flex-wrap">
                    {compactDays.map((dayNum) => {
                        const isSelected = dayNum === selectedDay;
                        const isWorkoutDay = !!data?.dailyData?.[dayNum]?.isWorkout;

                        return (
                            <View key={dayNum} style={{ width: DAY_CELL_WIDTH }} className="items-center">
                                <Pressable onPress={() => setSelectedDay(dayNum)} className="items-center gap-1">
                                    <View
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 999,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: isSelected ? colors.green : isWorkoutDay ? `${colors.green}18` : "transparent",
                                            borderWidth: dayNum === todayNum && !isSelected ? 1 : 0,
                                            borderColor: dayNum === todayNum ? `${colors.green}66` : "transparent",
                                        }}
                                    >
                                        <Text style={{ color: isSelected ? colors.black : isWorkoutDay ? colors.green : colors.white }} className="text-sm font-black">
                                            {dayNum}
                                        </Text>
                                    </View>
                                </Pressable>
                            </View>
                        );
                    })}
                </View>
            )}

            <View style={{ backgroundColor: colors.gray3, borderColor: colors.border, borderWidth: 1, padding: 12, borderRadius: 16 }} className="gap-3">
                <View className="flex-row items-center justify-between">
                    <Text style={{ color: colors.white }} className="text-sm font-bold">
                        {currentMonth + 1} 月 {selectedDay} 日
                    </Text>
                    <Text style={{ color: colors.gray4 }} className="text-[11px] font-bold">
                        {selectedDay === todayNum ? "今天" : hasWorkout ? "训练日" : "休息日"}
                    </Text>
                </View>

                {hasWorkout ? (
                    <View className="gap-2">
                        {selectedDayData.workouts.slice(0, 3).map((workout) => (
                            <View key={workout.id} className="flex-row items-center justify-between gap-3 py-1">
                                <View className="flex-1 gap-1">
                                    <Text style={{ color: colors.white }} className="text-sm font-bold" numberOfLines={1}>
                                        {workout.name}
                                    </Text>
                                    <Text style={{ color: colors.gray4 }} className="text-[11px] font-medium">
                                        {workout.type === "strength" ? "力量训练" : "有氧训练"}
                                    </Text>
                                </View>
                                <Text style={{ color: colors.gray4 }} className="text-[11px] font-medium">
                                    {workout.sets || "--"} 组
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={{ color: colors.gray4 }} className="text-xs font-medium">
                        暂无记录
                    </Text>
                )}
            </View>

            <Divider />

            <SectionTitle
                icon={<TrendingUp size={17} color={colors.blue} />}
                title="阶段复盘"
                action={
                    <ToggleAction
                        label={reviewExpanded ? "收起" : "展开"}
                        active={reviewExpanded}
                        onPress={() => {
                            if (!reviewExpanded) {
                                setActiveReviewPage(0);
                                requestAnimationFrame(() => {
                                    reviewScrollRef.current?.scrollTo({ x: 0, animated: false });
                                });
                            }
                            setReviewExpanded(!reviewExpanded);
                        }}
                    />
                }
            />

            {reviewExpanded ? (
                <>
                    <ScrollView
                        ref={reviewScrollRef}
                        horizontal
                        pagingEnabled
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={reviewSnapInterval}
                        snapToAlignment="start"
                        disableIntervalMomentum
                        contentContainerStyle={{ gap: reviewPageGap, paddingRight: 4 }}
                        onMomentumScrollEnd={(event) => {
                            const offsetX = event.nativeEvent.contentOffset.x;
                            const page = Math.round(offsetX / reviewSnapInterval);
                            setActiveReviewPage(Math.max(0, Math.min(reviewPages.length - 1, page)));
                        }}
                    >
                        {reviewPages.map((page) => (
                            <View key={page.key} style={{ width: reviewPageWidth }}>
                                <ReviewCard title={page.title} summary={page.summary} />
                            </View>
                        ))}
                    </ScrollView>

                    <View className="flex-row items-center justify-center gap-2 pt-1">
                        {reviewPages.map((page, index) => (
                            <Pressable
                                key={page.key}
                                onPress={() => {
                                    setActiveReviewPage(index);
                                    reviewScrollRef.current?.scrollTo({ x: index * reviewSnapInterval, animated: true });
                                }}
                                style={{
                                    width: activeReviewPage === index ? 18 : 6,
                                    height: 6,
                                    borderRadius: 999,
                                    backgroundColor: activeReviewPage === index ? colors.blue : colors.border,
                                }}
                            />
                        ))}
                    </View>
                </>
            ) : null}
        </View>
    );
}
