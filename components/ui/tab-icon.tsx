import * as React from "react";
import { View } from "react-native";
import { MotiView } from "moti";
import { type LucideIcon } from "lucide-react-native";

type TabIconProps = {
    icon: LucideIcon;
    color: string;
    size: number;
    focused: boolean;
};

const TabIcon = React.memo(function TabIcon({ icon: Icon, color, size, focused }: TabIconProps) {
    return (
        <View className="h-11 w-14 items-center justify-center">
            <MotiView
                animate={{
                    opacity: focused ? 1 : 0,
                    scale: focused ? 1 : 0.96,
                }}
                transition={{ type: "timing", duration: 180 }}
                className="absolute h-8 w-10 rounded-full border border-border bg-card"
            />
            <MotiView
                animate={{
                    scale: focused ? 1.03 : 1,
                    translateY: focused ? -0.5 : 0,
                }}
                transition={{ type: "spring", damping: 16, stiffness: 220 }}
            >
                <Icon color={color} size={size} strokeWidth={focused ? 2.45 : 2.1} />
            </MotiView>
        </View>
    );
});

export { TabIcon, type TabIconProps };
