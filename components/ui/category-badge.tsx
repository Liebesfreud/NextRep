import * as React from "react";
import { type ViewStyle } from "react-native";
import { Badge, BadgeText } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CategoryBadgeProps = {
    label: string;
    selected?: boolean;
    accentColor?: string;
    selectedBackgroundColor?: string;
    backgroundColor?: string;
    className?: string;
    textClassName?: string;
};

function withAlpha(color: string, alphaHex: string) {
    return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color) ? `${color.slice(0, 7)}${alphaHex}` : undefined;
}

const CategoryBadge = React.memo(function CategoryBadge({
    label,
    selected = false,
    accentColor,
    selectedBackgroundColor,
    backgroundColor,
    className,
    textClassName,
}: CategoryBadgeProps) {
    const resolvedBackgroundColor = selected
        ? selectedBackgroundColor ?? (accentColor ? withAlpha(accentColor, "1A") : undefined)
        : backgroundColor ?? (accentColor ? withAlpha(accentColor, "12") : undefined);
    const badgeStyle: ViewStyle | undefined = accentColor || resolvedBackgroundColor
        ? {
            backgroundColor: resolvedBackgroundColor,
            borderColor: accentColor,
        }
        : undefined;

    return (
        <Badge
            variant={selected ? "default" : "secondary"}
            style={badgeStyle}
            className={cn("px-3 py-2", className)}
        >
            <BadgeText
                style={accentColor ? { color: accentColor } : undefined}
                className={cn(selected ? "font-black" : "font-bold", textClassName)}
            >
                {label}
            </BadgeText>
        </Badge>
    );
});

export { CategoryBadge, type CategoryBadgeProps };
