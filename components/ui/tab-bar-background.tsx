import { StyleSheet, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export function TabBarBackground() {
    const { colors } = useTheme();

    return (
        <View
            style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: colors.bento,
                borderRadius: 16,
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
                    backgroundColor: "#FFFFFF",
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
                    backgroundColor: "#FFFFFF",
                    shadowColor: "#FFFFFF",
                    shadowOffset: { width: 0, height: 25 },
                    shadowOpacity: 0.08,
                    shadowRadius: 40,
                    borderRadius: 100,
                    elevation: 0,
                }}
            />
        </View>
    );
}
