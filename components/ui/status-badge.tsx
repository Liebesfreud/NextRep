import * as React from "react";
import { Badge, BadgeText } from "@/components/ui/badge";

type StatusBadgeProps = {
    label: string;
    color: string;
    backgroundColor: string;
    className?: string;
    textClassName?: string;
};

function withAlpha(color: string, alphaHex: string) {
    return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color) ? `${color.slice(0, 7)}${alphaHex}` : color;
}

const StatusBadge = React.memo(function StatusBadge({
    label,
    color,
    backgroundColor,
    className = "rounded-full px-2 py-1",
    textClassName = "text-[10px] font-bold",
}: StatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={className}
            style={{ backgroundColor, borderColor: withAlpha(color, "33") }}
        >
            <BadgeText className={textClassName} style={{ color }}>
                {label}
            </BadgeText>
        </Badge>
    );
});

export { StatusBadge, type StatusBadgeProps };
