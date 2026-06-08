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
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View ref={ref} className={cn("flex-1 items-center justify-center px-5", className)} {...props}>
                <Pressable className={cn("absolute inset-0 bg-black/60", backdropClassName)} onPress={onClose} />
                <View className={cn("w-full rounded-bento-lg border border-border bg-card p-5", contentClassName)}>
                    {children}
                </View>
            </View>
        </Modal>
    )
);
Dialog.displayName = "Dialog";

export { Dialog, type DialogProps };
