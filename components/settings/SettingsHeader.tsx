import { View, Text } from "react-native";
import { Check, Save, Settings } from "lucide-react-native";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { useTheme } from "@/hooks/useTheme";

type Props = {
    onSave: () => void;
    isPending: boolean;
    isSaved: boolean;
};

export function SettingsHeader({ onSave, isPending, isSaved }: Props) {
    const { colors } = useTheme();

    return (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View className="flex-row items-center gap-3">
                <View style={{ backgroundColor: `${colors.green}22` }} className="w-10 h-10 rounded-full items-center justify-center">
                    <Settings size={20} color={colors.green} />
                </View>
                <View>
                    <Text style={{ color: colors.white }} className="text-2xl font-black leading-none">个人配置</Text>
                    <Text style={{ color: colors.gray4, opacity: 0.8 }} className="text-[10px] font-bold tracking-widest mt-1 uppercase">
                        Settings
                    </Text>
                </View>
            </View>

            <AnimatedPressable
                onPress={onSave}
                disabled={isPending}
                style={{
                    flexDirection: "row", alignItems: "center", gap: 6,
                    paddingHorizontal: 16, paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: isSaved ? `${colors.green}1A` : colors.green,
                    borderWidth: 1,
                    borderColor: isSaved ? `${colors.green}44` : "transparent",
                    opacity: isPending ? 0.5 : 1,
                }}
            >
                {isSaved
                    ? <Check size={15} color={colors.green} strokeWidth={3} />
                    : <Save size={15} color={colors.bg} strokeWidth={2.5} />
                }
                <Text style={{
                    color: isSaved ? colors.green : colors.bg,
                    fontWeight: "700", fontSize: 13,
                }}>
                    {isPending ? "保存中..." : isSaved ? "已保存" : "保存配置"}
                </Text>
            </AnimatedPressable>
        </View>
    );
}
