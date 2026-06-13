import * as React from "react";
import { View, type ColorValue } from "react-native";
import { type LucideIcon } from "lucide-react-native";
import { MotiView } from "moti";
import { SNAPPY_SPRING } from "@/constants/animations";

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
                <MotiView
                    animate={{ scale: focused ? 1.08 : 1 }}
                    transition={SNAPPY_SPRING}
                >
                    <Icon color={color} size={size} strokeWidth={focused ? 2.25 : 2} />
                </MotiView>
            </View>
        </View>
    );
});

export { TabIcon, type TabIconProps };
