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
        <View className="flex-row justify-between items-end">
            <View>
                <Text variant="caption" className="mb-0.5 font-bold tracking-widest">
                    {formattedDate}
                </Text>
                <Text variant="title" className="mt-1 font-extrabold">
                    <Text style={{ color: colors.green }}>{greeting}, </Text>
                    <Text className="opacity-90">{userName}</Text>
                </Text>
            </View>
            {isCheckedIn && (
                <CheckCircle size={32} color={colors.green} strokeWidth={2.5} />
            )}
        </View>
    );
}
