import { View } from "react-native";
import { Text } from "@/components/ui/text";

export function DashboardHeader() {
    return (
        <View>
            <Text variant="title" className="font-black">
                <Text className="text-accent font-black">训练</Text>
                <Text className="text-foreground font-black">看板</Text>
            </Text>
        </View>
    );
}
