import * as React from "react";
import { View, type ViewProps } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type SectionHeaderProps = ViewProps & {
    icon?: React.ReactNode;
    title: string;
    action?: React.ReactNode;
    titleClassName?: string;
};

const SectionHeader = React.forwardRef<React.ElementRef<typeof View>, SectionHeaderProps>(
    ({ className, icon, title, action, titleClassName, ...props }, ref) => (
        <View ref={ref} className={cn("flex-row items-center justify-between gap-3", className)} {...props}>
            <View className="flex-row items-center gap-2">
                {icon}
                <Text variant="label" className={cn("tracking-wide", titleClassName)}>
                    {title}
                </Text>
            </View>
            {action}
        </View>
    )
);
SectionHeader.displayName = "SectionHeader";

export { SectionHeader, type SectionHeaderProps };
