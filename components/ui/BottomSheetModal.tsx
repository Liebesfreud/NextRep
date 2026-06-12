import React, { useEffect, useRef, useState } from "react";
import {
    Modal,
    View,
    Pressable,
    Animated,
    StyleSheet,
    KeyboardAvoidingView,
    Keyboard,
    Platform,
    StatusBar,
    Easing,
    useWindowDimensions,
    type ViewStyle,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";

type Props = {
    visible: boolean;
    onClose: () => void;
    /** 弹窗内容高度，例如 "85%" 或 500 */
    sheetHeight?: `${number}%` | number;
    children: React.ReactNode;
    /** Sheet 背景色 */
    backgroundColor?: string;
    /** 遮罩层背景色 */
    backdropColor?: string;
    /** 是否包裹 KeyboardAvoidingView（需要输入框时传 true）*/
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
    const { colors } = useTheme();
    const { height: screenHeight } = useWindowDimensions();
    const [isMounted, setIsMounted] = useState(visible);
    const resolvedBackgroundColor = backgroundColor ?? colors.card;
    const resolvedBackdropColor = backdropColor ?? colors.overlay;
    // 遮罩层透明度动画
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    // 卡片滑动位移动画
    const sheetTranslateY = useRef(new Animated.Value(screenHeight)).current;

    useEffect(() => {
        let cancelled = false;
        let animation: Animated.CompositeAnimation | null = null;

        if (visible) {
            setIsMounted(true);
            backdropOpacity.setValue(0);
            sheetTranslateY.setValue(screenHeight);
            // 打开：遮罩淡入 + 卡片上滑（cubic ease-out，顺滑无超调）
            animation = Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 220,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: Platform.OS !== "web",
                }),
                Animated.timing(sheetTranslateY, {
                    toValue: 0,
                    duration: 300,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: Platform.OS !== "web",
                }),
            ]);
            animation.start();
        } else if (isMounted) {
            // 关闭：卡片快速下滑 + 遮罩淡出
            Keyboard.dismiss();
            animation = Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 180,
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: Platform.OS !== "web",
                }),
                Animated.timing(sheetTranslateY, {
                    toValue: screenHeight,
                    duration: 220,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: Platform.OS !== "web",
                }),
            ]);
            animation.start(({ finished }) => {
                if (!cancelled && finished) setIsMounted(false);
            });
        }

        return () => {
            cancelled = true;
            animation?.stop();
        };
    }, [visible]);

    const sheetHeightStyle: ViewStyle = { height: sheetHeight };

    const handleRequestClose = () => {
        Keyboard.dismiss();
        onClose();
    };

    const modalBody = (
        <View style={[StyleSheet.absoluteFill, styles.modalRoot]}>
            {/* 遮罩层固定整屏，不参与 slide 动画 */}
            <Animated.View
                style={[StyleSheet.absoluteFill, { backgroundColor: resolvedBackdropColor, opacity: backdropOpacity }]}
            >
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={handleRequestClose}
                    disabled={!visible}
                />
            </Animated.View>

            <Animated.View
                style={[
                    styles.sheet,
                    sheetHeightStyle,
                    {
                        backgroundColor: resolvedBackgroundColor,
                        borderTopColor: colors.border,
                        pointerEvents: visible ? "auto" : "none",
                        transform: [{ translateY: sheetTranslateY }],
                    },
                ]}
            >
                <View style={[styles.handle, { backgroundColor: colors.mutedForeground }]} />
                {avoidKeyboard ? (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
                        style={styles.sheetContent}
                    >
                        {children}
                    </KeyboardAvoidingView>
                ) : (
                    <View style={styles.sheetContent}>{children}</View>
                )}
            </Animated.View>
        </View>
    );

    return (
        <Modal
            visible={visible || isMounted}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleRequestClose}
        >
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
            />
            {modalBody}
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalRoot: {
        pointerEvents: "box-none",
    },
    sheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 28,
        overflow: "hidden",
    },
    handle: {
        alignSelf: "center",
        width: 36,
        height: 4,
        borderRadius: 999,
        marginBottom: 12,
        opacity: 0.4,
    },
    sheetContent: {
        flex: 1,
    },
});
