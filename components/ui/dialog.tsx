import * as React from "react";
import { Modal, Pressable, View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

type DialogProps = ViewProps & {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    contentClassName?: string;
    backdropClassName?: string;
};

const Dialog = React.forwardRef<React.ElementRef<typeof View>, DialogProps>(
    ({ visible, onClose, children, className, contentClassName, backdropClassName, ...props }, ref) => (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <View ref={ref} className={cn("flex-1 items-center justify-center px-6", className)} {...props}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="关闭弹窗"
                    className={cn("absolute inset-0 bg-background/80", backdropClassName)}
                    onPress={onClose}
                />
                <View
                    className={cn(
                        "w-full max-w-sm rounded-bento-lg border border-border bg-card p-6 shadow-sm shadow-black/10",
                        contentClassName
                    )}
                >
                    {children}
                </View>
            </View>
        </Modal>
    )
);
Dialog.displayName = "Dialog";

export { Dialog, type DialogProps };
