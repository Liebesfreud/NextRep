import { useEffect, useRef, useState, useCallback } from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { getDashboardData, addBodyMetric } from "@/db/services/dashboard";
import * as SplashScreen from "expo-splash-screen";

// Dashboard Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TrainingOverview } from "@/components/dashboard/TrainingOverview";
import { BodyMetricsCard } from "@/components/dashboard/BodyMetricsCard";
import { ExerciseAnalytics } from "@/components/dashboard/ExerciseAnalytics";
import { BodyMetricModal } from "@/components/dashboard/BodyMetricModal";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export default function DashboardScreen() {
    const mountedRef = useRef(true);
    const loadSeqRef = useRef(0);
    const insets = useSafeAreaInsets();
    const todayNum = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const [selectedDay, setSelectedDay] = useState(todayNum);
    const [calendarExpanded, setCalendarExpanded] = useState(false);
    const [reviewExpanded, setReviewExpanded] = useState(false);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedMetric, setExpandedMetric] = useState<"weight" | "bodyFat" | null>(null);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
            loadSeqRef.current += 1;
        };
    }, []);

    const loadData = useCallback(async () => {
        if (!mountedRef.current) return;

        const requestId = ++loadSeqRef.current;
        setLoading(true);
        try {
            const res = await getDashboardData(currentYear, currentMonth);
            if (!mountedRef.current || requestId !== loadSeqRef.current) return;
            setData(res);
        } catch (error) {
            console.error(error);
        } finally {
            if (mountedRef.current && requestId === loadSeqRef.current) {
                setLoading(false);
                SplashScreen.hideAsync().catch(() => { });
            }
        }
    }, [currentYear, currentMonth]);

    useFocusEffect(useCallback(() => {
        loadData();
        return () => {
            loadSeqRef.current += 1;
        };
    }, [loadData]));

    const handleSaveMetric = async (metricType: "weight" | "bodyFat", valueStr: string, dateStr: string) => {
        const value = Number(valueStr);
        await addBodyMetric({ metricType, value, dateStr });
        await loadData();
    };

    return (
        <View className="flex-1 bg-transparent">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 100 + Math.max(insets.bottom - 20, 0), gap: 16 }}
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
                    reviewExpanded={reviewExpanded}
                    setReviewExpanded={setReviewExpanded}
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
