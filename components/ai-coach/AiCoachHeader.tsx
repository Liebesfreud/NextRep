import { View } from "react-native";
import { Text } from "@/components/ui/text";

export function AiCoachHeader() {
    return (
        <View>
            <Text variant="title" className="font-black">
                <Text className="font-black text-accent">AI</Text>
                <Text className="font-black text-foreground"> 教练</Text>
            </Text>
        </View>
    );
}
