import * as React from "react";
import { View, type ColorValue } from "react-native";
import { type LucideIcon } from "lucide-react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

type TabIconProps = {
    icon: LucideIcon;
    color: ColorValue;
    size: number;
    focused: boolean;
};

const TabIcon = React.memo(function TabIcon({ icon: Icon, color, size, focused }: TabIconProps) {
    return (
        <View className="h-[72px] w-16 items-center justify-center overflow-hidden">
            <View style={{ transform: [{ translateY: 7 }] }}>
                <Animated.View
                    key={focused ? "focused" : "idle"}
                    entering={focused ? ZoomIn.duration(180) : FadeIn.duration(120)}
                >
                    <Icon color={color} size={size} strokeWidth={focused ? 2.25 : 2} />
                </Animated.View>
            </View>
        </View>
    );
});

export { TabIcon, type TabIconProps };
