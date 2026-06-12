import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";

const TAB_BAR_HEIGHT = 70;
const TAB_BAR_RADIUS = 16;

function getTabBarStyle(borderColor: string): ViewStyle {
    return {
        position: "absolute",
        bottom: 32,
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
                boxShadow: "0 16px 32px rgba(0, 0, 0, 0.08)",
            },
            default: {
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.08,
                shadowRadius: 32,
                elevation: 8,
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
                ...StyleSheet.absoluteFillObject,
                backgroundColor: colors.bento,
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
                    bottom: 0,
                    backgroundColor: colors.white,
                    opacity: 0.03,
                }}
            />
            <View
                style={{
                    position: "absolute",
                    top: -50,
                    left: "10%",
                    right: "10%",
                    height: 50,
                    backgroundColor: colors.white,
                    borderRadius: 100,
                    ...Platform.select<ViewStyle>({
                        web: {
                            boxShadow: `0 25px 40px ${colors.white}14`,
                        },
                        default: {
                            shadowColor: colors.white,
                            shadowOffset: { width: 0, height: 25 },
                            shadowOpacity: 0.08,
                            shadowRadius: 40,
                            elevation: 0,
                        },
                    }),
                }}
            />
        </View>
    );
}

export { getTabBarStyle, TAB_BAR_ITEM_STYLE };
