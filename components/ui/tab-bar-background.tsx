import { Platform, View, type ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";

const TAB_BAR_HEIGHT = 70;
const TAB_BAR_RADIUS = 12;

function getTabBarStyle(borderColor: string): ViewStyle {
    return {
        position: "absolute",
        bottom: 20,
        marginHorizontal: 20,
        left: 0,
        right: 0,
        backgroundColor: "transparent",
        borderColor,
        borderTopColor: borderColor,
        borderWidth: 1,
        borderTopWidth: 1,
        borderRadius: TAB_BAR_RADIUS,
        height: TAB_BAR_HEIGHT,
        paddingBottom: 0,
        paddingTop: 0,
        ...Platform.select<ViewStyle>({
            web: {
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.04)",
            },
            default: {
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.04,
                shadowRadius: 16,
                elevation: 3,
            },
        }),
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
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: TAB_BAR_RADIUS,
                overflow: "hidden",
            }}
        >
            <View
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 1,
                    backgroundColor: colors.border,
                    opacity: 0.9,
                }}
            />
        </View>
    );
}

export { getTabBarStyle, TAB_BAR_ITEM_STYLE };
