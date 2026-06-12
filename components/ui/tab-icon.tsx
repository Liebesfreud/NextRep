import * as React from "react";
import { Platform, View, type ViewStyle } from "react-native";
import { MotiView } from "moti";
import { type LucideIcon } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

type TabIconProps = {
    icon: LucideIcon;
    color: string;
    size: number;
    focused: boolean;
};

const TabIcon = React.memo(function TabIcon({ icon: Icon, color, size, focused }: TabIconProps) {
    const { colors } = useTheme();

    return (
        <View className="h-11 w-14 items-center justify-center">
            <MotiView
                animate={{
                    opacity: focused ? 1 : 0,
                    scale: focused ? 1 : 0.82,
                }}
                transition={{ type: "timing", duration: 180 }}
                className="absolute h-9 w-12 rounded-full border border-accent/20 bg-accent/10"
                style={Platform.select<ViewStyle>({
                    web: {
                        boxShadow: focused ? `0 0 16px ${colors.green}29` : "none",
                    },
                    default: {
                        shadowColor: colors.green,
                        shadowOpacity: focused ? 0.16 : 0,
                        shadowRadius: 16,
                    },
                })}
            />
            <MotiView
                animate={{
                    scale: focused ? 1.08 : 1,
                    translateY: focused ? -1 : 0,
                }}
                transition={{ type: "spring", damping: 16, stiffness: 220 }}
            >
                <Icon color={color} size={size} strokeWidth={focused ? 2.7 : 2.1} />
            </MotiView>
        </View>
    );
});

export { TabIcon, type TabIconProps };
