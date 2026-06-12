import { View } from "react-native";
import { CheckCircle } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Text } from "@/components/ui/text";

type Props = {
    greeting: string;
    userName: string;
    isCheckedIn: boolean;
};

export function HomeHeader({ greeting, userName, isCheckedIn }: Props) {
    const { colors } = useTheme();
    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat("zh-CN", {
        month: "long", day: "numeric", weekday: "long",
    }).format(now);

    return (
        <View className="gap-3">
            <View className="flex-row items-end justify-between">
            <View className="gap-1">
                <Text variant="caption" className="text-muted-foreground">
                    {formattedDate}
                </Text>
                <Text variant="title" className="font-semibold">
                    {greeting}，{userName}
                </Text>
            </View>
            {isCheckedIn && (
                <CheckCircle size={24} color={colors.green} strokeWidth={2.25} />
            )}
            </View>
        </View>
    );
}
