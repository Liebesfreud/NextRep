import { View, Text } from "react-native";
import { CheckCircle } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

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
                <Text style={{ color: colors.gray4 }} className="text-xs font-bold tracking-widest mb-0.5">
                    {formattedDate}
                </Text>
                <Text className="text-3xl font-extrabold tracking-tight mt-1">
                    <Text style={{ color: colors.green }}>{greeting}, </Text>
                    <Text style={{ color: colors.white, opacity: 0.9 }}>{userName}</Text>
                </Text>
            </View>
            {isCheckedIn && (
                <CheckCircle size={32} color={colors.green} strokeWidth={2.5} />
            )}
        </View>
    );
}
