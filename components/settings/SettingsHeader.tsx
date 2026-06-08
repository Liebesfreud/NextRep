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
                <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <Settings size={20} color={colors.green} />
                </View>
                <View>
                    <Text variant="heading" className="leading-none">个人配置</Text>
                    <Text variant="caption" className="mt-1 text-[10px] font-bold uppercase tracking-widest opacity-80">
                        Settings
                    </Text>
                </View>
            </View>

            <Button
                onPress={onSave}
                disabled={isPending}
                variant={isSaved ? "outline" : "default"}
                size="sm"
                className={isSaved ? "border-accent/30 bg-accent/10" : "bg-accent"}
            >
                {isSaved
                    ? <Check size={15} color={colors.green} strokeWidth={3} />
                    : <Save size={15} color={colors.bg} strokeWidth={2.5} />
                }
                <ButtonText variant={isSaved ? "outline" : "default"} size="sm" className={isSaved ? "text-accent" : "text-accent-foreground"}>
                    {isPending ? "保存中..." : isSaved ? "已保存" : "保存配置"}
                </ButtonText>
            </Button>
        </View>
    );
}
