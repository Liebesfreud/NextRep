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
    title = "NextRep",
    subtitle = "本地优先的训练节奏管家",
    icon: Icon = Dumbbell,
    compact = false,
    className,
}: BrandMarkProps) {
    const { colors } = useTheme();

    return (
        <View className={cn("flex-row items-center gap-3", className)}>
            <View
                className={cn(
                    "items-center justify-center rounded-xl border border-border bg-card",
                    compact ? "h-9 w-9" : "h-11 w-11"
                )}
            >
                <Icon size={compact ? 17 : 20} color={colors.green} strokeWidth={2.35} />
                {!compact ? <View className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-primary/70" /> : null}
            </View>
            <View className="flex-1">
                <Text variant={compact ? "label" : "heading"} className="leading-none tracking-tight">
                    {title}
                </Text>
                <Text
                    variant="caption"
                    className={cn("mt-1 leading-4 text-muted-foreground", compact ? "text-[11px]" : "text-[12px]")}
                >
                    {subtitle}
                </Text>
            </View>
        </View>
    );
});

export { BrandMark, type BrandMarkProps };
