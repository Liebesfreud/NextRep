import * as React from "react";
import { View } from "react-native";
import { Dumbbell, Sparkles, type LucideIcon } from "lucide-react-native";
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
            <View className={cn("items-center justify-center rounded-2xl border border-accent/20 bg-accent/10", compact ? "h-9 w-9" : "h-11 w-11")}>
                <Icon size={compact ? 18 : 21} color={colors.green} strokeWidth={2.7} />
                {!compact ? (
                    <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-primary">
                        <Sparkles size={9} color={colors.primaryForeground} strokeWidth={3} />
                    </View>
                ) : null}
            </View>
            <View className="flex-1">
                <Text variant={compact ? "label" : "heading"} className="leading-none tracking-tight">
                    {title}
                </Text>
                <Text variant="caption" className="mt-1 text-[10px] font-extrabold uppercase tracking-[1.6px] text-accent">
                    {subtitle}
                </Text>
            </View>
        </View>
    );
});

export { BrandMark, type BrandMarkProps };
