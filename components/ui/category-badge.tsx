import * as React from "react";
import { useTheme } from "@/hooks/useTheme";
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

const CategoryBadge = React.memo(function CategoryBadge({
    label,
    selected = false,
    accentColor,
    selectedBackgroundColor,
    backgroundColor,
    className,
    textClassName,
}: CategoryBadgeProps) {
    const { colors } = useTheme();
    const accent = accentColor ?? colors.blue;
    const resolvedBackgroundColor = selected
        ? selectedBackgroundColor ?? `${accent}1A`
        : backgroundColor ?? colors.gray2;

    return (
        <Badge
            variant={selected ? "default" : "secondary"}
            style={{
                backgroundColor: resolvedBackgroundColor,
                borderColor: selected ? accent : `${accent}40`,
                borderWidth: selected ? 1 : 0.75,
            }}
            className={cn("px-3 py-2", className)}
        >
            <BadgeText
                style={{ color: selected ? colors.white : colors.mutedForeground }}
                className={cn(selected ? "font-extrabold" : "font-bold", textClassName)}
            >
                {label}
            </BadgeText>
        </Badge>
    );
});

export { CategoryBadge, type CategoryBadgeProps };
