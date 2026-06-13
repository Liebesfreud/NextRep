import React, { useEffect, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    View,
    useWindowDimensions,
    type ViewStyle,
} from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";

type Props = {
    visible: boolean;
    onClose: () => void;
    sheetHeight?: `${number}%` | number;
    children: React.ReactNode;
    backgroundColor?: string;
    backdropColor?: string;
    avoidKeyboard?: boolean;
};

export function BottomSheetModal({
    visible,
    onClose,
    sheetHeight = "85%",
    children,
    backgroundColor,
    backdropColor,
    avoidKeyboard = false,
}: Props) {
    const { theme, colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { height: windowHeight } = useWindowDimensions();
    const [rendered, setRendered] = useState(visible);
    const resolvedBackgroundColor = backgroundColor ?? colors.card;
    const resolvedBackdropColor = backdropColor ?? colors.overlay;
    const sheetHeightStyle: ViewStyle = { height: sheetHeight };
    const backdropOpacity = useSharedValue(0);
    const sheetTranslateY = useSharedValue(windowHeight);
    const sheetScale = useSharedValue(0.985);
    const sheetOpacity = useSharedValue(0.85);

    useEffect(() => {
        if (visible) {
            setRendered(true);
            return;
        }

        if (!rendered) return;

        const unmountTimer = setTimeout(() => {
            setRendered(false);
        }, 300);

        return () => clearTimeout(unmountTimer);
    }, [rendered, visible]);

    useEffect(() => {
        if (!rendered) return;

        if (visible) {
            backdropOpacity.value = 0;
            sheetTranslateY.value = Math.max(windowHeight * 0.32, 240);
            sheetScale.value = 0.985;
            sheetOpacity.value = 0.85;

            backdropOpacity.value = withDelay(
                45,
                withTiming(0.8, {
                    duration: 280,
                    easing: Easing.bezier(0.16, 1, 0.3, 1),
                })
            );
            sheetTranslateY.value = withSpring(0, {
                damping: 24,
                stiffness: 260,
                mass: 0.9,
            });
            sheetScale.value = withSpring(1, {
                damping: 26,
                stiffness: 280,
                mass: 0.9,
            });
            sheetOpacity.value = withTiming(1, {
                duration: 180,
                easing: Easing.out(Easing.cubic),
            });
            return;
        }

        backdropOpacity.value = withTiming(0, {
            duration: 180,
            easing: Easing.in(Easing.quad),
        });
        sheetScale.value = withTiming(0.99, {
            duration: 220,
            easing: Easing.in(Easing.quad),
        });
        sheetOpacity.value = withTiming(0.92, { duration: 220 });
        sheetTranslateY.value = withTiming(windowHeight, {
            duration: 280,
            easing: Easing.bezier(0.4, 0, 1, 1),
        });
    }, [
        backdropOpacity,
        rendered,
        sheetOpacity,
        sheetScale,
        sheetTranslateY,
        visible,
        windowHeight,
    ]);

    const backdropAnimatedStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    const sheetAnimatedStyle = useAnimatedStyle(() => ({
        opacity: sheetOpacity.value,
        transform: [
            { translateY: sheetTranslateY.value },
            { scale: sheetScale.value },
        ],
    }));

    const handleRequestClose = () => {
        Keyboard.dismiss();
        onClose();
    };

    const content = avoidKeyboard ? (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
            style={styles.sheetContent}
        >
            {children}
        </KeyboardAvoidingView>
    ) : (
        <View style={styles.sheetContent}>{children}</View>
    );

    return (
        <Modal
            visible={rendered}
            transparent
            animationType="none"
            presentationStyle="overFullScreen"
            statusBarTranslucent
            onRequestClose={handleRequestClose}
        >
            <StatusBar translucent backgroundColor="transparent" barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
            <View style={styles.modalRoot}>
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: resolvedBackdropColor },
                        backdropAnimatedStyle,
                    ]}
                >
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="关闭弹层"
                        style={StyleSheet.absoluteFill}
                        onPress={handleRequestClose}
                    />
                </Animated.View>
                <Animated.View
                    style={[
                        styles.sheet,
                        sheetHeightStyle,
                        {
                            backgroundColor: resolvedBackgroundColor,
                            borderTopColor: colors.border,
                            paddingBottom: Math.max(insets.bottom, 20),
                        },
                        sheetAnimatedStyle,
                    ]}
                >
                    <View className="rounded-pill" style={[styles.handle, { backgroundColor: colors.mutedForeground }]} />
                    {content}
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
        justifyContent: "flex-end",
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    handle: {
        alignSelf: "center",
        width: 36,
        height: 4,
        marginBottom: 12,
        opacity: 0.4,
    },
    sheetContent: {
        flex: 1,
    },
});
