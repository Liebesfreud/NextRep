import * as React from "react";
import { View, type ViewStyle } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type CalendarDayCellProps = {
    day: number;
    onPress?: () => void;
    selected?: boolean;
    today?: boolean;
    marked?: boolean;
    disabled?: boolean;
    valueLabel?: string | number | null;
    width?: ViewStyle["width"];
    size?: number;
    className?: string;
};

const CalendarDayCell = React.memo(function CalendarDayCell({
    day,
    onPress,
    selected = false,
    today = false,
    marked = false,
    disabled = false,
    valueLabel,
    width,
    size = 34,
    className,
}: CalendarDayCellProps) {
    const hasValueLabel = valueLabel !== null && valueLabel !== undefined;
    const dayTextClassName = selected
        ? "text-primary-foreground"
        : marked || today || hasValueLabel
            ? "text-primary"
            : "text-foreground";
    const valueTextClassName = selected ? "text-primary-foreground/80" : "text-primary";

    return (
        <View style={width ? { width } : undefined} className={cn("items-center", className)}>
            <Button
                onPress={onPress}
                disabled={disabled}
                variant="ghost"
                className="h-auto rounded-none bg-transparent p-0"
                style={{ width: size, height: size }}
            >
                <View
                    style={{ width: size, height: size, borderRadius: size / 2 }}
                    className={cn(
                        "items-center justify-center border",
                        selected
                            ? "border-primary bg-primary"
                            : marked || hasValueLabel
                                ? "border-primary/20 bg-primary/10"
                                : today
                                    ? "border-primary/45 bg-transparent"
                                    : "border-transparent bg-transparent"
                    )}
                >
                    <Text className={cn("text-xs font-bold", dayTextClassName)}>
                        {day}
                    </Text>
                    {hasValueLabel ? (
                        <Text numberOfLines={1} className={cn("text-[8px] font-black leading-3", valueTextClassName)}>
                            {valueLabel}
                        </Text>
                    ) : null}
                </View>
            </Button>
        </View>
    );
});

export { CalendarDayCell, type CalendarDayCellProps };
