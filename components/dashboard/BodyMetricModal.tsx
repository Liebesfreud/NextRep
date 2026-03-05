import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { X, ChevronLeft, ChevronRight, Save } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { type BodyMetricPoint } from "@/db/services/dashboard";

type Props = {
    visible: boolean;
    metricType: "weight" | "bodyFat" | null;
    onClose: () => void;
    data: any;
    onSave: (metricType: "weight" | "bodyFat", valueStr: string, dateStr: string) => Promise<void>;
};

export function BodyMetricModal({ visible, metricType, onClose, data, onSave }: Props) {
    const { colors } = useTheme();

    const [formValue, setFormValue] = useState("");
    const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
    const [metricCalendarDate, setMetricCalendarDate] = useState(new Date());
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when opened
    useEffect(() => {
        if (visible) {
            setFormValue("");
            // Keep today's date or the last selected date logic if you prefer
            // but normally we reset to today when newly opened:
            setFormDate(new Date().toISOString().slice(0, 10));
            setError(null);
            setMetricCalendarDate(new Date());
        }
    }, [visible, metricType]);

    const handleSave = async () => {
        if (!metricType) return;
        setError(null);
        const val = Number(formValue.trim());
        if (!Number.isFinite(val) || val <= 0) {
            setError("请输入有效的数值");
            return;
        }
        setIsSaving(true);
        try {
            await onSave(metricType, formValue, formDate);
            onClose();
        } catch (e) {
            setError("保存失败，请重试");
        } finally {
            setIsSaving(false);
        }
    };

    if (!metricType) return null;

    return (
        <BottomSheetModal
            visible={visible}
            onClose={onClose}
            sheetHeight="85%"
            backgroundColor={colors.bento}
            avoidKeyboard
        >
            <View className="flex-row justify-between items-center mb-6">
                <Text style={{ color: colors.white }} className="text-2xl font-extrabold tracking-tight">
                    {metricType === "weight" ? "记录体重" : "记录体脂率"}
                </Text>
                <Pressable onPress={onClose}
                    style={{ backgroundColor: colors.gray3 }}
                    className="w-8 h-8 rounded-lg items-center justify-center">
                    <X size={20} color={colors.gray4} />
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Current Value */}
                <View style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
                    <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider mb-1 uppercase">
                        当前{metricType === "weight" ? "体重" : "体脂率"}
                    </Text>
                    <View className="flex-row items-baseline gap-1">
                        <Text style={{ color: colors.white }} className="text-3xl font-black tracking-tighter">
                            {data?.bodyMetrics?.[metricType]?.latestValue ?? "-"}
                        </Text>
                        <Text style={{ color: colors.gray4 }} className="font-bold">
                            {metricType === "weight" ? "kg" : "%"}
                        </Text>
                    </View>
                </View>

                {/* Input Form */}
                <View className="flex-row gap-3 items-end mb-3">
                    <View className="flex-1">
                        <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider mb-1.5 pl-1">
                            {metricType === "weight" ? "体重 (kg)" : "体脂率 (%)"}
                        </Text>
                        <TextInput
                            keyboardType="decimal-pad"
                            value={formValue}
                            onChangeText={setFormValue}
                            placeholder={metricType === "weight" ? "例如：75.5" : "例如：15.0"}
                            placeholderTextColor={`${colors.gray4}66`}
                            style={{ color: colors.white, backgroundColor: colors.gray2, height: 44, paddingHorizontal: 16, borderRadius: 10, fontWeight: "bold", fontSize: 15, borderWidth: 1, borderColor: `${colors.gray3}4D` }}
                            autoFocus
                        />
                    </View>
                    <View className="flex-1">
                        <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider mb-1.5 pl-1">记录日期</Text>
                        <TextInput
                            value={formDate}
                            onChangeText={setFormDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={`${colors.gray4}66`}
                            style={{ color: colors.white, backgroundColor: colors.gray2, height: 44, paddingHorizontal: 16, borderRadius: 10, fontWeight: "bold", fontSize: 15, borderWidth: 1, borderColor: `${colors.gray3}4D` }}
                        />
                    </View>
                </View>

                {error && (
                    <Text style={{ color: colors.red }} className="text-xs font-bold px-1 mb-2">{error}</Text>
                )}

                <Pressable
                    onPress={handleSave}
                    disabled={isSaving}
                    style={{ backgroundColor: colors.green, borderRadius: 12, paddingVertical: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, opacity: isSaving ? 0.5 : 1, marginBottom: 8 }}
                >
                    <Save size={16} color={colors.white} />
                    <Text style={{ color: colors.white }} className="font-bold text-base">
                        {isSaving ? "保存中..." : "保存记录"}
                    </Text>
                </Pressable>

                {/* Metric Calendar */}
                <View className="mt-1">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-wider">
                            {metricCalendarDate.getFullYear()}年{metricCalendarDate.getMonth() + 1}月记录日历
                        </Text>
                        <View className="flex-row gap-1">
                            <Pressable onPress={() => setMetricCalendarDate(new Date(metricCalendarDate.getFullYear(), metricCalendarDate.getMonth() - 1, 1))}
                                style={{ backgroundColor: colors.border }}
                                className="w-6 h-6 rounded-md items-center justify-center">
                                <ChevronLeft size={12} color={colors.gray4} />
                            </Pressable>
                            <Pressable onPress={() => setMetricCalendarDate(new Date(metricCalendarDate.getFullYear(), metricCalendarDate.getMonth() + 1, 1))}
                                style={{ backgroundColor: colors.border }}
                                className="w-6 h-6 rounded-md items-center justify-center">
                                <ChevronRight size={12} color={colors.gray4} />
                            </Pressable>
                        </View>
                    </View>

                    <View style={{ backgroundColor: colors.gray2, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: colors.border }}>
                        <View style={{ flexDirection: "row", marginBottom: 6 }}>
                            {["日", "一", "二", "三", "四", "五", "六"].map(d => (
                                <View key={d} style={{ flex: 1, alignItems: "center" }}>
                                    <Text style={{ color: colors.gray4, fontSize: 10, fontWeight: "700", opacity: 0.6 }}>{d}</Text>
                                </View>
                            ))}
                        </View>
                        {(() => {
                            const mYear = metricCalendarDate.getFullYear();
                            const mMonth = metricCalendarDate.getMonth();
                            const mStart = new Date(mYear, mMonth, 1).getDay();
                            const mDays = new Date(mYear, mMonth + 1, 0).getDate();
                            const mTotal = Math.ceil((mStart + mDays) / 7) * 7;

                            const recordsMap = new Map<number, number>();
                            (data?.bodyMetrics?.[metricType]?.recentRecords || []).forEach((r: BodyMetricPoint) => {
                                const parts = r.dateStr.split("-");
                                if (parseInt(parts[0]) === mYear && parseInt(parts[1]) - 1 === mMonth) {
                                    recordsMap.set(parseInt(parts[2]), r.value);
                                }
                            });

                            return (
                                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                                    {Array.from({ length: mTotal }).map((_, i) => {
                                        const isPad = i < mStart || i >= mStart + mDays;
                                        const dayN = i - mStart + 1;
                                        const val = isPad ? null : recordsMap.get(dayN);
                                        return (
                                            <Pressable
                                                key={i}
                                                style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}
                                                onPress={() => {
                                                    if (!isPad) {
                                                        const ds = `${mYear}-${String(mMonth + 1).padStart(2, "0")}-${String(dayN).padStart(2, "0")}`;
                                                        setFormDate(ds);
                                                        if (val) setFormValue(String(val));
                                                    }
                                                }}
                                            >
                                                {!isPad && (
                                                    <View style={{
                                                        flex: 1, borderRadius: 8, alignItems: "center", justifyContent: "center",
                                                        backgroundColor: val ? `${colors.green}33` : "transparent",
                                                    }}>
                                                        <Text style={{ color: val ? colors.green : colors.white, fontSize: 11, fontWeight: val ? "700" : "400", opacity: val ? 1 : 0.8 }}>
                                                            {dayN}
                                                        </Text>
                                                        {val && (
                                                            <Text style={{ color: colors.green, fontSize: 8, fontWeight: "800" }}>{val}</Text>
                                                        )}
                                                    </View>
                                                )}
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            );
                        })()}
                    </View>
                </View>
            </ScrollView>
        </BottomSheetModal>
    );
}
