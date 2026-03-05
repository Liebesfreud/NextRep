import { View, Text } from "react-native";
import { Check, Save } from "lucide-react-native";
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
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <View>
                <Text style={{
                    color: colors.gray4,
                    fontSize: 11, fontWeight: "800",
                    letterSpacing: 1.5, textTransform: "uppercase",
                    marginBottom: 4,
                }}>
                    NEXTREP
                </Text>
                <Text style={{
                    color: colors.white,
                    fontSize: 30, fontWeight: "800",
                    letterSpacing: -0.5,
                }}>
                    个人配置
                </Text>
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
