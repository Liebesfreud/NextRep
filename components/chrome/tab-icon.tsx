import * as React from "react";
import { View, type ColorValue } from "react-native";
import { type LucideIcon } from "lucide-react-native";
import Animated, {
    interpolate,
    ReduceMotion,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { SNAPPY_SPRING } from "@/constants/animations";

type TabIconProps = {
    icon: LucideIcon;
    color: ColorValue;
    size: number;
    focused: boolean;
};

const TabIcon = React.memo(function TabIcon({ icon: Icon, color, size, focused }: TabIconProps) {
    const focusProgress = useSharedValue(focused ? 1 : 0);

    React.useEffect(() => {
        focusProgress.value = withSpring(focused ? 1 : 0, {
            ...SNAPPY_SPRING,
            reduceMotion: ReduceMotion.System,
        });
    }, [focusProgress, focused]);

    const highlightStyle = useAnimatedStyle(() => ({
        opacity: interpolate(focusProgress.value, [0, 1], [0, 0.22]),
        transform: [{ scaleX: interpolate(focusProgress.value, [0, 1], [0.82, 1]) }],
    }));

    return (
        <View className="h-14 w-20 items-center justify-center">
            <View className="h-12 w-[72px] translate-y-2 items-center justify-center">
                <Animated.View
                    className="absolute h-full w-full"
                    style={highlightStyle}
                >
                    <View
                        className="h-full w-full rounded-pill"
                        style={{ backgroundColor: color }}
                    />
                </Animated.View>
                <Icon color={color} size={size} strokeWidth={focused ? 2.25 : 2} />
            </View>
        </View>
    );
});

export { TabIcon, type TabIconProps };
