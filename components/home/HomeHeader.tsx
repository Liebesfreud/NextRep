import { View } from "react-native";
import { CheckCircle } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { BrandMark } from "@/components/ui/brand-mark";
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
        <View className="gap-4">
            <BrandMark compact subtitle="TRAIN LOCAL · PLAN SMART" />
            <View className="flex-row items-end justify-between">
            <View>
                <Text variant="caption" className="mb-0.5 font-bold tracking-widest">
                    {formattedDate}
                </Text>
                <Text variant="title" className="mt-1 font-extrabold">
                    <Text className="text-accent">{greeting}, </Text>
                    <Text className="opacity-90">{userName}</Text>
                </Text>
            </View>
            {isCheckedIn && (
                <CheckCircle size={32} color={colors.green} strokeWidth={2.5} />
            )}
            </View>
        </View>
    );
}
