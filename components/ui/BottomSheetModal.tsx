import React from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    View,
    type ViewStyle,
} from "react-native";
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
    const resolvedBackgroundColor = backgroundColor ?? colors.card;
    const resolvedBackdropColor = backdropColor ?? colors.overlay;
    const sheetHeightStyle: ViewStyle = { height: sheetHeight };

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
            visible={visible}
            transparent
            animationType="slide"
            presentationStyle="overFullScreen"
            statusBarTranslucent
            onRequestClose={handleRequestClose}
        >
            <StatusBar translucent backgroundColor="transparent" barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
            <View style={styles.modalRoot}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="关闭弹层"
                    style={[StyleSheet.absoluteFill, { backgroundColor: resolvedBackdropColor }]}
                    onPress={handleRequestClose}
                />
                <View
                    style={[
                        styles.sheet,
                        sheetHeightStyle,
                        {
                            backgroundColor: resolvedBackgroundColor,
                            borderTopColor: colors.border,
                            paddingBottom: Math.max(insets.bottom, 20),
                        },
                    ]}
                >
                    <View className="rounded-pill" style={[styles.handle, { backgroundColor: colors.mutedForeground }]} />
                    {content}
                </View>
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
