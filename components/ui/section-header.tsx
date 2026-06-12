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
            <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
                {icon ? <View className="shrink-0">{icon}</View> : null}
                <Text numberOfLines={1} variant="label" className={cn("flex-1 text-foreground", titleClassName)}>
                    {title}
                </Text>
            </View>
            {action ? <View className="shrink-0">{action}</View> : null}
        </View>
    )
);
SectionHeader.displayName = "SectionHeader";

export { SectionHeader, type SectionHeaderProps };
