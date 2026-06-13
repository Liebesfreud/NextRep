import * as React from "react";
import { View, type ColorValue } from "react-native";
import { type LucideIcon } from "lucide-react-native";
import { MotiView } from "moti";
import { DURATION, SNAPPY_SPRING } from "@/constants/animations";

type TabIconProps = {
    icon: LucideIcon;
    color: ColorValue;
    size: number;
    focused: boolean;
};

const TabIcon = React.memo(function TabIcon({ icon: Icon, color, size, focused }: TabIconProps) {
    return (
        <View className="h-12 w-14 items-center justify-center">
            <MotiView
                className="absolute top-0 h-0.5 w-5 rounded-pill bg-accent"
                animate={{ opacity: focused ? 1 : 0, scaleX: focused ? 1 : 0.35 }}
                transition={{ type: "timing", duration: DURATION.micro }}
            />
            <MotiView
                animate={{ scale: focused ? 1.08 : 1 }}
                transition={SNAPPY_SPRING}
            >
                <Icon color={color} size={size} strokeWidth={focused ? 2.25 : 2} />
            </MotiView>
        </View>
    );
});

export { TabIcon, type TabIconProps };
