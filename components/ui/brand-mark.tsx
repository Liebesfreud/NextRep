import * as React from "react";
import { View } from "react-native";
import { Dumbbell, type LucideIcon } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
    title?: string;
    subtitle?: string;
    icon?: LucideIcon;
    compact?: boolean;
    className?: string;
};

const BrandMark = React.memo(function BrandMark({
    title,
    subtitle,
    icon: Icon = Dumbbell,
    compact = false,
    className,
}: BrandMarkProps) {
    const { colors } = useTheme();

    return (
        <View className={cn("flex-row items-center gap-3", className)}>
            <View
                className={cn(
                    "items-center justify-center rounded-lg border border-border bg-card",
                    compact ? "h-9 w-9" : "h-11 w-11"
                )}
            >
                <Icon size={compact ? 17 : 20} color={colors.foreground} strokeWidth={2.1} />
            </View>
            {(title || subtitle) ? (
                <View className="flex-1">
                    {title ? (
                        <Text variant={compact ? "label" : "heading"} className="leading-none">
                            {title}
                        </Text>
                    ) : null}
                    {subtitle ? (
                        <Text
                            variant="caption"
                            className={cn("mt-1 leading-4 text-muted-foreground", compact ? "text-[11px]" : "text-[12px]")}
                        >
                            {subtitle}
                        </Text>
                    ) : null}
                </View>
            ) : null}
        </View>
    );
});

export { BrandMark, type BrandMarkProps };
