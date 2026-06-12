import * as React from "react";
import { View, type ColorValue } from "react-native";
import { type LucideIcon } from "lucide-react-native";

type TabIconProps = {
    icon: LucideIcon;
    color: ColorValue;
    size: number;
    focused: boolean;
};

const TabIcon = React.memo(function TabIcon({ icon: Icon, color, size, focused }: TabIconProps) {
    return (
        <View className="h-11 w-14 items-center justify-center">
            <View className={focused ? "rounded-full border border-border bg-card px-3 py-1.5" : undefined}>
                <Icon color={color} size={size} strokeWidth={2.1} />
            </View>
        </View>
    );
});

export { TabIcon, type TabIconProps };
