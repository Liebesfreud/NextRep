import { useMemo, useRef, useState, type ReactNode } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import {
    Activity,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Dumbbell,
    Flame,
    TrendingUp,
} from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { CalendarDayCell } from "@/components/common/calendar-day-cell";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

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
    stats: string | null;
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

function formatWorkoutDetail(workout: DayWorkout) {
    if (workout.type !== "strength") {
        return workout.stats?.replace(/\s*•\s*/g, " / ") || "--";
    }
    if (!workout.sets) return workout.weight || "--";

    try {
        if (workout.sets.trim().startsWith("[")) {
            const parsed = JSON.parse(workout.sets);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const completedSets = parsed.filter((set: { isCompleted?: boolean }) => set.isCompleted);
                const visibleSets = completedSets.length > 0 ? completedSets : parsed;
                const weightText = workout.weight ? `${workout.weight} · ` : "";
                return `${weightText}${visibleSets.length} 组`;
            }
        }
    } catch {
        // Fall back to the stored text.
    }

    return workout.sets;
}

function SectionHeader({
    icon,
    title,
    expanded,
    onPress,
}: {
    icon: ReactNode;
    title: string;
    expanded: boolean;
    onPress: () => void;
}) {
    const { colors } = useTheme();

    return (
        <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
                {icon}
                <View className="min-w-0 flex-1">
                    <Text variant="subheading" className="text-foreground">{title}</Text>
                </View>
            </View>
            <Button
                onPress={onPress}
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-pill bg-surface-elevated"
                accessibilityLabel={expanded ? `收起${title}` : `展开${title}`}
            >
                {expanded ? (
                    <ChevronUp size={17} color={colors.textSecondary} />
                ) : (
                    <ChevronDown size={17} color={colors.textSecondary} />
                )}
            </Button>
        </View>
    );
}

function CompactStat({ label, value, unit, icon }: { label: string; value: string; unit: string; icon: ReactNode }) {
    return (
        <View className="gap-1">
            <View className="flex-row items-center gap-1.5">
                {icon}
                <Text variant="micro" className="font-medium">{label}</Text>
            </View>
            <View className="flex-row items-baseline gap-1">
                <Text className="text-xl font-bold text-foreground font-variant-numeric-tabular-nums">{value}</Text>
                <Text variant="micro" className="text-tertiary">{unit}</Text>
            </View>
        </View>
    );
}

function ReviewPage({ title, summary }: { title: string; summary?: ReviewSummary }) {
    const metrics = [
        { label: "训练", value: String(summary?.workouts ?? 0), unit: "次" },
        { label: "活跃", value: String(summary?.activeDays ?? 0), unit: "天" },
        { label: "完成率", value: formatRate(summary?.consistencyRate ?? 0), unit: "" },
    ];

    return (
        <View className="gap-4 rounded-lg bg-surface-elevated p-card-padding">
            <View className="flex-row items-center justify-between">
                <Text variant="body-semibold" className="text-foreground">{title}</Text>
                <Text variant="caption" className="font-variant-numeric-tabular-nums">
                    {formatVolumeKg(summary?.totalVolumeKg ?? 0)}
                </Text>
            </View>
            <View className="flex-row gap-4">
                {metrics.map((metric) => (
                    <View key={metric.label} className="flex-1 gap-1">
                        <Text variant="micro">{metric.label}</Text>
                        <View className="flex-row items-baseline gap-1">
                            <Text className="text-stat-value text-foreground font-variant-numeric-tabular-nums">{metric.value}</Text>
                            {metric.unit ? <Text variant="micro">{metric.unit}</Text> : null}
                        </View>
                    </View>
                ))}
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
            { key: "month", title: `${currentMonth + 1} 月`, summary: data?.monthlyReview },
            { key: "all", title: "累计", summary: data?.allTimeReview },
        ],
        [currentMonth, data?.allTimeReview, data?.monthlyReview, data?.weeklyReview],
    );
    const reviewPageGap = 12;
    const reviewPageWidth = Math.max(0, width - 64);
    const reviewSnapInterval = reviewPageWidth + reviewPageGap;

    const selectReviewPage = (index: number) => {
        const nextIndex = Math.max(0, Math.min(reviewPages.length - 1, index));
        setActiveReviewPage(nextIndex);
        reviewScrollRef.current?.scrollTo({ x: nextIndex * reviewSnapInterval, animated: true });
    };

    return (
        <View className="gap-4">
            <View className="flex-row gap-4">
                <Card className="min-w-0 flex-1 justify-around p-2.5">
                    <CompactStat
                        label="本周训练"
                        value={loading ? "-" : String(data?.workoutsThisWeek ?? 0)}
                        unit="次"
                        icon={<Activity size={13} color={colors.accent} />}
                    />
                    <Separator className="my-2" />
                    <CompactStat
                        label="连续打卡"
                        value={loading ? "-" : String(data?.streak ?? 0)}
                        unit="天"
                        icon={<Flame size={13} color={colors.accent} />}
                    />
                </Card>

                <Card className="min-w-0 flex-[2] justify-between p-card-padding">
                    <View className="flex-row items-center justify-between">
                        <View className="gap-1">
                            <Text variant="micro">{currentYear}</Text>
                            <Text variant="heading" className="font-black text-foreground font-variant-numeric-tabular-nums">
                                {currentMonth + 1} 月
                            </Text>
                        </View>
                        <View className="h-9 w-9 items-center justify-center rounded-pill bg-accent/10">
                            <Dumbbell size={17} color={colors.accent} />
                        </View>
                    </View>
                    <Separator className="my-2" />
                    <View className="gap-1">
                        <Text variant="micro">本月训练量</Text>
                        <View className="flex-row items-baseline gap-1.5">
                            <Text className="text-large-stat text-foreground font-variant-numeric-tabular-nums">
                                {loading ? "-" : String(data?.monthlyVolumeTon ?? "0.0")}
                            </Text>
                            <Text variant="caption" className="text-tertiary">吨</Text>
                        </View>
                    </View>
                </Card>
            </View>

            <Card className="gap-3 p-card-padding">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <Calendar size={18} color={colors.success} />
                        <Text variant="subheading" className="text-foreground">训练日历</Text>
                        <Text variant="caption" className="font-variant-numeric-tabular-nums">
                            {currentMonth + 1} 月
                        </Text>
                    </View>
                    <Button
                        onPress={() => setCalendarExpanded(!calendarExpanded)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-pill bg-surface-elevated"
                        accessibilityLabel={calendarExpanded ? "收起训练日历" : "展开训练日历"}
                    >
                        {calendarExpanded ? (
                            <ChevronUp size={16} color={colors.textSecondary} />
                        ) : (
                            <ChevronDown size={16} color={colors.textSecondary} />
                        )}
                    </Button>
                </View>

                {calendarExpanded ? (
                    <View className="flex-row flex-wrap">
                        {WEEKDAY_LABELS.map((weekday) => (
                            <View key={weekday} style={{ width: DAY_CELL_WIDTH }} className="mb-2 items-center">
                                <Text variant="micro">{weekday}</Text>
                            </View>
                        ))}
                        {Array.from({ length: firstDayOfMonth }, (_, index) => (
                            <View key={`blank-${index}`} style={{ width: DAY_CELL_WIDTH, height: 36 }} />
                        ))}
                        {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((dayNum) => (
                            <CalendarDayCell
                                key={dayNum}
                                day={dayNum}
                                width={DAY_CELL_WIDTH}
                                selected={dayNum === selectedDay}
                                today={dayNum === todayNum}
                                marked={!!data?.dailyData?.[dayNum]?.isWorkout}
                                onPress={() => setSelectedDay(dayNum)}
                                className="mb-2"
                            />
                        ))}
                    </View>
                ) : (
                    <View className="flex-row">
                        {compactDays.map((dayNum) => (
                            <CalendarDayCell
                                key={dayNum}
                                day={dayNum}
                                width={DAY_CELL_WIDTH}
                                size={36}
                                selected={dayNum === selectedDay}
                                today={dayNum === todayNum}
                                marked={!!data?.dailyData?.[dayNum]?.isWorkout}
                                onPress={() => setSelectedDay(dayNum)}
                            />
                        ))}
                    </View>
                )}

                <Separator />

                <View className="gap-3 px-1">
                    <View className="flex-row items-center justify-between">
                        <Text variant="body-semibold" className="text-foreground font-variant-numeric-tabular-nums">
                            {currentMonth + 1} 月 {selectedDay} 日
                        </Text>
                        <Text variant="micro">
                            {selectedDay === todayNum ? "今天" : hasWorkout ? "训练日" : "休息日"}
                        </Text>
                    </View>
                    {hasWorkout ? (
                        <View className="gap-2 border-t border-border pt-3">
                            {selectedDayData?.workouts.slice(0, 3).map((workout) => (
                                <View key={workout.id} className="flex-row items-center justify-between gap-3">
                                    <View className="min-w-0 flex-1">
                                        <Text className="text-body-semibold text-foreground" numberOfLines={1}>{workout.name}</Text>
                                    </View>
                                    <Text variant="caption" className="font-variant-numeric-tabular-nums">
                                        {formatWorkoutDetail(workout)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text variant="caption">暂无训练记录</Text>
                    )}
                </View>
            </Card>

            <Card className="gap-4 p-card-padding">
                <SectionHeader
                    icon={<TrendingUp size={18} color={colors.info} />}
                    title="阶段复盘"
                    expanded={reviewExpanded}
                    onPress={() => {
                        if (!reviewExpanded) selectReviewPage(0);
                        setReviewExpanded(!reviewExpanded);
                    }}
                />

                {reviewExpanded ? (
                    <>
                        <ScrollView
                            ref={reviewScrollRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={reviewSnapInterval}
                            snapToAlignment="start"
                            decelerationRate="fast"
                            disableIntervalMomentum
                            contentContainerStyle={{ gap: reviewPageGap }}
                            onMomentumScrollEnd={(event) => {
                                const page = Math.round(event.nativeEvent.contentOffset.x / reviewSnapInterval);
                                setActiveReviewPage(Math.max(0, Math.min(reviewPages.length - 1, page)));
                            }}
                        >
                            {reviewPages.map((page) => (
                                <View key={page.key} style={{ width: reviewPageWidth }}>
                                    <ReviewPage title={page.title} summary={page.summary} />
                                </View>
                            ))}
                        </ScrollView>
                        <View className="flex-row items-center justify-center gap-3">
                            <Button
                                onPress={() => selectReviewPage(activeReviewPage - 1)}
                                variant="ghost"
                                size="icon"
                                disabled={activeReviewPage === 0}
                                className="h-8 w-8 rounded-pill"
                                accessibilityLabel="上一阶段"
                            >
                                <ChevronLeft size={16} color={activeReviewPage === 0 ? colors.textTertiary : colors.foreground} />
                            </Button>
                            <View className="flex-row gap-1.5">
                                {reviewPages.map((page, index) => (
                                    <View
                                        key={page.key}
                                        className={cn(
                                            "h-1.5 rounded-pill",
                                            index === activeReviewPage ? "w-5 bg-accent" : "w-1.5 bg-surface-hover",
                                        )}
                                    />
                                ))}
                            </View>
                            <Button
                                onPress={() => selectReviewPage(activeReviewPage + 1)}
                                variant="ghost"
                                size="icon"
                                disabled={activeReviewPage === reviewPages.length - 1}
                                className="h-8 w-8 rounded-pill"
                                accessibilityLabel="下一阶段"
                            >
                                <ChevronRight size={16} color={activeReviewPage === reviewPages.length - 1 ? colors.textTertiary : colors.foreground} />
                            </Button>
                        </View>
                    </>
                ) : null}
            </Card>
        </View>
    );
}
