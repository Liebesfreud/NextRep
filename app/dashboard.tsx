import { useState, useCallback } from "react";
import { View, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { getDashboardData, addBodyMetric } from "@/db/services/dashboard";

// Dashboard Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TrainingOverview } from "@/components/dashboard/TrainingOverview";
import { BodyMetricsCard } from "@/components/dashboard/BodyMetricsCard";
import { ExerciseAnalytics } from "@/components/dashboard/ExerciseAnalytics";
import { BodyMetricModal } from "@/components/dashboard/BodyMetricModal";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export default function DashboardScreen() {
    const { colors } = useTheme();
    const todayNum = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const [selectedDay, setSelectedDay] = useState(todayNum);
    const [calendarExpanded, setCalendarExpanded] = useState(false);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedMetric, setExpandedMetric] = useState<"weight" | "bodyFat" | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getDashboardData(currentYear, currentMonth);
            setData(res);
        } finally {
            setLoading(false);
        }
    }, [currentYear, currentMonth]);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    const handleSaveMetric = async (metricType: "weight" | "bodyFat", valueStr: string, dateStr: string) => {
        const value = Number(valueStr);
        await addBodyMetric({ metricType, value, dateStr });
        await loadData();
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 100, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <DashboardHeader />

                <TrainingOverview
                    data={data}
                    loading={loading}
                    currentYear={currentYear}
                    currentMonth={currentMonth}
                    calendarExpanded={calendarExpanded}
                    setCalendarExpanded={setCalendarExpanded}
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                    todayNum={todayNum}
                />

                <BodyMetricsCard
                    data={data}
                    loading={loading}
                    expandedMetric={expandedMetric}
                    setExpandedMetric={setExpandedMetric}
                />

                <ExerciseAnalytics data={data} />
            </ScrollView>

            <BodyMetricModal
                visible={!!expandedMetric}
                metricType={expandedMetric}
                onClose={() => setExpandedMetric(null)}
                data={data}
                onSave={handleSaveMetric}
            />
        </View>
    );
}
