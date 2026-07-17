import { View } from "react-native";
import { Check, Save } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

type Props = {
    onSave: () => void;
    isPending: boolean;
    isSaved: boolean;
    isDirty: boolean;
};

export function SettingsHeader({ onSave, isPending, isSaved, isDirty }: Props) {
    const { colors } = useTheme();

    return (
        <View className="flex-row items-center justify-between gap-4">
            <View className="min-w-0 flex-1">
                <Text variant="title" className="font-black">
                    <Text className="font-black text-accent">设</Text>
                    <Text className="font-black text-foreground">置</Text>
                </Text>
            </View>

            <Button
                onPress={onSave}
                disabled={isPending || !isDirty}
                variant={isSaved || !isDirty ? "outline" : "default"}
                size="sm"
                className="min-w-20"
            >
                {isSaved || !isDirty
                    ? <Check size={15} color={colors.accent} strokeWidth={3} />
                    : <Save size={15} color={colors.accent} strokeWidth={2.5} />
                }
                <ButtonText variant={isSaved || !isDirty ? "outline" : "default"} size="sm" className={isSaved || !isDirty ? "text-accent" : ""}>
                    {isPending ? "保存中" : isSaved || !isDirty ? "已保存" : "保存"}
                </ButtonText>
            </Button>
        </View>
    );
}
