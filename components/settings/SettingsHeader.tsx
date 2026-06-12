import { View } from "react-native";
import { Check, Save, Settings } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

type Props = {
    onSave: () => void;
    isPending: boolean;
    isSaved: boolean;
};

export function SettingsHeader({ onSave, isPending, isSaved }: Props) {
    const { colors } = useTheme();

    return (
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
                <View className="items-center justify-center rounded-lg border border-border bg-card h-10 w-10">
                    <Settings size={18} color={colors.foreground} strokeWidth={2} />
                </View>
                <Text variant="heading">设置</Text>
            </View>

            <Button
                onPress={onSave}
                disabled={isPending}
                variant={isSaved ? "outline" : "default"}
                size="sm"
                className="min-w-20"
            >
                {isSaved
                    ? <Check size={15} color={colors.foreground} strokeWidth={3} />
                    : <Save size={15} color={colors.primaryForeground} strokeWidth={2.5} />
                }
                <ButtonText variant={isSaved ? "outline" : "default"} size="sm">
                    {isPending ? "保存中" : isSaved ? "已保存" : "保存"}
                </ButtonText>
            </Button>
        </View>
    );
}
