import * as React from "react";
import { Badge, BadgeText } from "@/components/ui/badge";

type StatusBadgeProps = {
    label: string;
    color: string;
    backgroundColor: string;
    className?: string;
    textClassName?: string;
};

const StatusBadge = React.memo(function StatusBadge({
    label,
    color,
    backgroundColor,
    className = "rounded border-0 px-1 py-px",
    textClassName = "text-[9px] font-bold",
}: StatusBadgeProps) {
    return (
        <Badge className={className} style={{ backgroundColor }}>
            <BadgeText className={textClassName} style={{ color }}>
                {label}
            </BadgeText>
        </Badge>
    );
});

export { StatusBadge, type StatusBadgeProps };
