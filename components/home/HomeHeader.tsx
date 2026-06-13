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
        <View className="gap-1">
            <Text variant="caption" className="font-normal text-muted-foreground">
                {formattedDate}
            </Text>
            <View className="flex-row items-center justify-between">
                <Text variant="title" className="font-black">
                    <Text className="text-accent font-black">{greeting}，</Text>
                    {userName}
                </Text>
                {isCheckedIn && (
                    <CheckCircle size={30} color={colors.green} strokeWidth={2.5} />
                )}
            </View>
        </View>
    );
}
