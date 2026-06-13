import { View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";

const TAB_BAR_HEIGHT = 64;

function getTabBarStyle(borderColor: string, bottomInset = 0): ViewStyle {
    return {
        backgroundColor: "transparent",
        borderTopColor: borderColor,
        borderTopWidth: 1,
        height: TAB_BAR_HEIGHT + bottomInset,
        paddingBottom: bottomInset,
        paddingTop: 6,
    };
}

const TAB_BAR_ITEM_STYLE: ViewStyle = {
    height: TAB_BAR_HEIGHT,
};

export function TabBarBackground() {
    const { colors } = useTheme();

    return (
        <View
            style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                backgroundColor: colors.surface,
            }}
        />
    );
}

/**
 * Hook that returns a safe-area-aware tab bar style.
 * Uses `useSafeAreaInsets` to avoid the home indicator on iPhone X+.
 */
export function useTabBarStyle(borderColor: string): ViewStyle {
    const insets = useSafeAreaInsets();
    return getTabBarStyle(borderColor, insets.bottom);
}

export { getTabBarStyle, TAB_BAR_ITEM_STYLE };
