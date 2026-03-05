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
        <View className="flex-row items-center justify-between">
            <Text style={{ color: colors.white }} className="text-3xl font-extrabold tracking-tight">配置</Text>
            <AnimatedPressable
                onPress={onSave}
                disabled={isPending}
                style={{
                    backgroundColor: isSaved ? `${colors.green}1A` : colors.green,
                    opacity: isPending ? 0.5 : 1,
                    borderColor: isSaved ? `${colors.green}33` : "transparent",
                    borderWidth: 1,
                }}
                className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl"
            >
                {isSaved
                    ? <Check size={16} color={colors.green} strokeWidth={3} />
                    : <Save size={16} color={colors.bg} strokeWidth={2.5} />
                }
                <Text style={{ color: isSaved ? colors.green : colors.bg }} className="font-bold">
                    {isPending ? "保存中" : isSaved ? "已保存" : "保存所有配置"}
                </Text>
            </AnimatedPressable>
        </View>
    );
}
