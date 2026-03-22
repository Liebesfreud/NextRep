import React, { useEffect, useRef } from "react";
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
    Dimensions,
    Easing,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Props = {
    visible: boolean;
    onClose: () => void;
    /** 弹窗内容高度，例如 "85%" 或 500 */
    sheetHeight?: `${number}%` | number;
    children: React.ReactNode;
    /** Sheet 背景色 */
    backgroundColor: string;
    /** 是否包裹 KeyboardAvoidingView（需要输入框时传 true）*/
    avoidKeyboard?: boolean;
};

export function BottomSheetModal({
    visible,
    onClose,
    sheetHeight = "85%",
    children,
    backgroundColor,
    avoidKeyboard = false,
}: Props) {
    // 遮罩层透明度动画
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    // 卡片滑动位移动画
    const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (visible) {
            // 打开：遮罩淡入 + 卡片上滑（cubic ease-out，顺滑无超调）
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 220,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(sheetTranslateY, {
                    toValue: 0,
                    duration: 300,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // 关闭：卡片快速下滑 + 遮罩淡出
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 180,
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(sheetTranslateY, {
                    toValue: SCREEN_HEIGHT,
                    duration: 220,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const sheetHeightStyle =
        typeof sheetHeight === "string"
            ? { height: sheetHeight as any }
            : { height: sheetHeight };

    const handleRequestClose = () => {
        Keyboard.dismiss();
        onClose();
    };

    const modalBody = (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* 深色遮罩 —— 固定整屏，不参与 slide 动画 */}
            <Animated.View
                style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}
            >
                {/* disabled 控制触摸穿透，不触发布局重算 */}
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={handleRequestClose}
                    disabled={!visible}
                />
            </Animated.View>

            {/* 底部卡片 —— 从底部弹入 */}
            <Animated.View
                style={[
                    styles.sheet,
                    sheetHeightStyle,
                    { backgroundColor, transform: [{ translateY: sheetTranslateY }] },
                ]}
            >
                {avoidKeyboard ? (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "position" : "height"}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
                        style={styles.sheetKeyboardAvoider}
                    >
                        {children}
                    </KeyboardAvoidingView>
                ) : (
                    children
                )}
            </Animated.View>
        </View>
    );

    return (
        <Modal
            visible={visible}
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
    backdrop: {
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    sheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 48,
        overflow: "hidden",
    },
    sheetKeyboardAvoider: {
        flex: 1,
    },
});
